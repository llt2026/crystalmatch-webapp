import { NextRequest, NextResponse } from 'next/server';
import { updateSubscriptionStatus } from '@/app/lib/subscription/service';
import { OrderStatus, SubscriptionStatus } from '@/app/lib/subscription/types';
import { verifyPaypalSignature } from '@/app/lib/paypal/verifySignature';

/**
 * PayPal Webhook 处理 - 订阅更新
 * POST /api/public/paypal/webhook-update
 */
export async function POST(request: NextRequest) {
  try {
    // 获取原始请求体（字符串形式）
    const bodyText = await request.text();
    
    // 将请求头转换为普通对象
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    
    // 验证签名
    const isValid = await verifyPaypalSignature(headers, bodyText);
    
    if (!isValid) {
      console.error('Invalid PayPal signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // 解析请求体
    const data = JSON.parse(bodyText);
    const { userId, planId, transactionId, status, amount } = data;
    
    // 验证必要参数
    if (!userId || !planId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    console.log('Processing PayPal webhook:', { userId, planId, status, transactionId });
    
    // 根据状态更新订阅
    let subscriptionStatus: SubscriptionStatus;
    
    switch (status.toLowerCase()) {
      case 'completed':
      case 'active':
        subscriptionStatus = SubscriptionStatus.ACTIVE;
        break;
      case 'cancelled':
      case 'suspended':
        subscriptionStatus = SubscriptionStatus.CANCELLED;
        break;
      case 'expired':
        subscriptionStatus = SubscriptionStatus.EXPIRED;
        break;
      default:
        subscriptionStatus = SubscriptionStatus.ACTIVE; // 默认为激活状态
    }
    
    // 更新订阅状态
    await updateSubscriptionStatus(userId, planId, subscriptionStatus);
    
    console.log(`Subscription updated: ${userId}, ${planId}, ${subscriptionStatus}`);
    
    // 返回成功响应
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 