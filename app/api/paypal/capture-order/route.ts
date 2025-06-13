import { NextRequest, NextResponse } from 'next/server';

// 使用PayPal沙盒测试凭据
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AYiPC9BjuuLNzjHHACtpRF6OqtnWdkzREDhHEGGN6zzDd4BG4biAqmbXVELegUP5DO27HAkS5cnP5nKz';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EHLohxQ9Y4BvXtVTmjjEJnWyQRjjrF7_gX9cVp2F8UXjdqY8K8dKmtKJVtKJVtKJ';
const PAYPAL_BASE_URL = 'https://api.sandbox.paypal.com'; // 强制使用沙盒环境

async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('PayPal token error:', data);
      throw new Error(`PayPal authentication failed: ${data.error_description || data.error}`);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

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
    
    console.log('Capturing PayPal order:', orderID);
    
    const accessToken = await getPayPalAccessToken();
    
    // Capture order
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });

    const capture = await response.json();
    
    if (!response.ok) {
      console.error('PayPal order capture failed:', capture);
      
      let errorMessage = 'Failed to capture PayPal payment';
      if (capture.details && capture.details.length > 0) {
        errorMessage = capture.details[0].description || capture.details[0].issue;
      } else if (capture.message) {
        errorMessage = capture.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: capture 
      }, { status: 400 });
    }

    // 检查支付状态
    const paymentStatus = capture.status;
    const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];
    
    console.log('Payment captured successfully:', {
      id: capture.id,
      status: paymentStatus,
      captureId: captureDetails?.id,
      amount: captureDetails?.amount
    });

    return NextResponse.json({ 
      success: true, 
      capture: {
        id: capture.id,
        status: paymentStatus,
        captureId: captureDetails?.id,
        amount: captureDetails?.amount
      }
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 