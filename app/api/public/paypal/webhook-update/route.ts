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
    console.log('PayPal Webhook received');
    
    // 获取原始请求体（字符串形式）
    const bodyText = await request.text();
    console.log('Webhook body:', bodyText);
    
    // 将请求头转换为普通对象
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    console.log('Webhook headers:', headers);
    
    // 验证签名 (沙箱环境下简化处理)
    const isTestMode = process.env.PAYPAL_ENV?.toLowerCase() === 'sandbox' || process.env.NODE_ENV === 'development';
    console.log('Test mode:', isTestMode);
    
    if (!isTestMode) {
      const isValid = await verifyPaypalSignature(headers, bodyText);
      if (!isValid) {
        console.error('Invalid PayPal signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('Skipping signature verification in test mode');
    }
    
    // 解析请求体
    const data = JSON.parse(bodyText);
    const { userId, planId, transactionId, status, amount } = data;
    
    console.log('Parsed webhook data:', { userId, planId, transactionId, status, amount });
    
    // 验证必要参数
    if (!userId || !planId || !status) {
      console.error('Missing required parameters:', { userId: !!userId, planId: !!planId, status: !!status });
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
    
    console.log('Mapped subscription status:', subscriptionStatus);
    
    // 更新订阅状态 (暂时跳过数据库操作以测试基本功能)
    try {
      if (isTestMode) {
        console.log('Test mode: Skipping database operation');
        console.log(`Would update subscription: ${userId}, ${planId}, ${subscriptionStatus}`);
      } else {
        await updateSubscriptionStatus(userId, planId, subscriptionStatus);
        console.log(`Subscription updated: ${userId}, ${planId}, ${subscriptionStatus}`);
      }
    } catch (dbError) {
      console.error('Database update error:', dbError);
      // 在测试模式下不阻止流程
      if (!isTestMode) {
        throw dbError;
      }
    }
    
    // 返回成功响应
    console.log('Webhook processed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      data: {
        userId,
        planId,
        status: subscriptionStatus,
        transactionId,
        testMode: isTestMode
      }
    });
    
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