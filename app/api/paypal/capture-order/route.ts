import { NextRequest, NextResponse } from 'next/server';
import { paypal, paypalClient } from '@/app/lib/paypal';

/**
 * 捕获 PayPal 订单
 * POST /api/paypal/capture-order
 */
export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
    }

    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({});

    const response = await paypalClient.execute(captureRequest);

    return NextResponse.json({ success: true, details: response.result });
  } catch (error) {
    console.error('PayPal capture order error:', error);
    return NextResponse.json({ error: 'Failed to capture PayPal order' }, { status: 500 });
  }
} 