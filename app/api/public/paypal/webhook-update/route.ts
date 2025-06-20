export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionStatus } from '@/app/lib/subscription/service';
import { SubscriptionStatus } from '@/app/lib/subscription/types';
import { verifyPaypalSignature } from '@/app/lib/paypal/verifySignature';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

/**
 * 获取PayPal API访问令牌
 */
async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing PayPal client credentials');
      return null;
    }

    // 确定API基础URL
    const isTestMode = process.env.PAYPAL_ENV?.toLowerCase() === 'sandbox' || process.env.NODE_ENV === 'development';
    const baseUrl = isTestMode 
      ? 'https://api.sandbox.paypal.com' 
      : 'https://api.paypal.com';

    // 构建认证字符串
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 发送令牌请求
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    // 解析响应
    const data = await response.json() as { access_token?: string };
    
    if (!data.access_token) {
      console.error('Failed to get PayPal access token', data);
      return null;
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    return null;
  }
}

/**
 * PayPal Webhook 处理 - 订阅更新
 * POST /api/public/paypal/webhook-update
 */
export async function POST(request: NextRequest) {
  try {
    console.log('PayPal Webhook received');
    
    // 获取原始请求体 (保持 Buffer 供签名验证)
    const bodyBuffer = Buffer.from(await request.arrayBuffer());
    const bodyText   = bodyBuffer.toString('utf8');
    console.log('Webhook body:', bodyText);
    
    // 将 Headers 转为小写键值对象，便于 verify 函数使用
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    console.log('Webhook headers:', headers);
    
    // 验证签名 (沙箱环境下简化处理)
    const isTestMode = process.env.PAYPAL_ENV?.toLowerCase() === 'sandbox' || process.env.NODE_ENV === 'development';
    console.log('Test mode:', isTestMode);
    
    if (!isTestMode) {
      const isValid = await verifyPaypalSignature(headers, bodyText, PAYPAL_WEBHOOK_ID);
      if (!isValid) {
        console.error('Invalid PayPal signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('Skipping signature verification in test mode');
    }
    
    // 解析 PayPal Webhook 事件
    const data = JSON.parse(bodyText);
    console.log('Parsed webhook event:', data.event_type);

    // 仅处理订阅相关事件
    const SUBSCRIPTION_EVENTS = [
      'BILLING.SUBSCRIPTION.ACTIVATED',
      'BILLING.SUBSCRIPTION.RENEWED',
      'BILLING.SUBSCRIPTION.UPGRADED',
      'BILLING.SUBSCRIPTION.UPDATED',
      'PAYMENT.SALE.COMPLETED',
    ];

    if (!SUBSCRIPTION_EVENTS.includes(data.event_type)) {
      console.log('Ignored event type:', data.event_type);
      return NextResponse.json({ ok: true, ignored: true });
    }

    // 根据事件类型确定订阅ID
    let subscriptionId: string | undefined;
    if (data.event_type === 'PAYMENT.SALE.COMPLETED') {
      subscriptionId = data.resource?.billing_agreement_id;
    } else {
      subscriptionId = data.resource?.id;
    }

    if (!subscriptionId) {
      console.error('Missing subscription id in webhook resource');
      return NextResponse.json({ error: 'Missing subscription id' }, { status: 400 });
    }

    let userId: string | undefined;
    let planId: string | undefined;
    let status: string | undefined;

    // 检测是否为测试模式
    const isTestSubscription = subscriptionId.startsWith('I-TEST-');
    
    if (isTestSubscription || isTestMode) {
      // 测试模式：从webhook数据中提取信息
      console.log('🧪 测试模式：使用webhook中的数据');
      userId = data.resource?.custom;
      
      if (subscriptionId.includes('PLUS')) {
        planId = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS || 'P-plus-plan-default';
      } else if (subscriptionId.includes('PRO')) {
        planId = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PRO || 'P-pro-plan-default';
      } else {
        planId = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS || 'P-plus-plan-default'; // 默认为plus
      }
      
      status = 'ACTIVE';
    } else {
      // 生产模式：调用PayPal API
      const accessToken = await getPayPalAccessToken();
      if (!accessToken) {
        return NextResponse.json({ error: 'Failed to get PayPal access token' }, { status: 500 });
      }

      // 查询订阅详情，获取 custom_id(userId) 与 plan_id
      const baseUrl = isTestMode ? 'https://api.sandbox.paypal.com' : 'https://api.paypal.com';
      const subRes = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const subData = await subRes.json();
      if (!subRes.ok) {
        console.error('Failed to fetch subscription details:', subData);
        return NextResponse.json({ error: 'Failed to fetch subscription details' }, { status: 500 });
      }

      userId = subData.custom_id as string | undefined;
      planId = subData.plan_id as string | undefined;
      status = subData.status as string | undefined;
    }

    console.log('Subscription details:', { userId, planId, status });

    if (!userId || !planId) {
      console.error('custom_id(userId) or plan_id missing in subscription');
      return NextResponse.json({ error: 'User identification not found in subscription' }, { status: 400 });
    }

    // 仅处理已激活或续费成功的状态
    const activeStatuses = ['ACTIVE', 'APPROVAL_PENDING', 'APPROVED'];
    if (!activeStatuses.includes(status || '')) {
      console.log('Subscription status not active, ignored:', status);
      return NextResponse.json({ ok: true, ignored: true });
    }

    // 映射 planId 到 tier
    const tier = planId.toLowerCase().includes('pro') ? 'pro' : 'plus';

    // 更新订阅状态 + 生成报告
    try {
      const { handleSubscriptionChange } = await import('@/app/lib/services/report-generation');
      const { ensureSubscriptionPlans } = await import('@/app/lib/subscription/fix-planid-issue');

      // 确保订阅计划存在
      await ensureSubscriptionPlans();

      await updateSubscriptionStatus(userId, planId, SubscriptionStatus.ACTIVE);
      await handleSubscriptionChange(userId, tier as 'plus' | 'pro');
      console.log(`Subscription & report updated for user ${userId}`);
    } catch (err) {
      console.error('Error updating subscription / generating report:', err);
      return NextResponse.json({ error: 'Internal update error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 