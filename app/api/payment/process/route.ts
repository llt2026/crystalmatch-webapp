import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { processPayment, PaymentMethod } from '@/app/lib/payment/service';

/**
 * 处理支付请求
 * POST /api/payment/process
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // 验证JWT
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
      );
      
      // 获取请求数据
      const { 
        orderId,
        paymentMethod,
        cardInfo,
        amount,
        currency = 'USD'
      } = await request.json();
      
      // 验证必要字段
      if (!orderId || !paymentMethod || !amount) {
        return NextResponse.json(
          { error: 'Missing required fields' }, 
          { status: 400 }
        );
      }

      // 验证支付方式是否有效
      if (!Object.values(PaymentMethod).includes(paymentMethod)) {
        return NextResponse.json(
          { error: 'Invalid payment method' }, 
          { status: 400 }
        );
      }

      // 验证信用卡信息（如果是信用卡支付）
      if (paymentMethod === PaymentMethod.CREDIT_CARD && !cardInfo) {
        return NextResponse.json(
          { error: 'Credit card information is required' }, 
          { status: 400 }
        );
      }

      // 设置回调URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const returnUrl = `${baseUrl}/payment/success?orderId=${orderId}`;
      const cancelUrl = `${baseUrl}/payment/cancel?orderId=${orderId}`;
      
      // 处理支付
      const result = await processPayment({
        orderId,
        amount,
        currency,
        method: paymentMethod as PaymentMethod,
        cardInfo,
        returnUrl,
        cancelUrl
      });

      // 返回结果
      return NextResponse.json(result);
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 