import { NextRequest, NextResponse } from 'next/server';
import { paypal, paypalClient } from '@/app/lib/paypal';

/**
 * 创建 PayPal 订单
 * POST /api/paypal/create-order
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency = 'USD' } = await request.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 });
    }

    const createRequest = new paypal.orders.OrdersCreateRequest();
    createRequest.prefer('return=representation');
    createRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId || `ref_${Date.now()}`,
          amount: {
            currency_code: currency,
            value: amount.toString(),
          },
        },
      ],
    });

    const response = await paypalClient.execute(createRequest);

    return NextResponse.json({ id: response.result.id });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
  }
} 