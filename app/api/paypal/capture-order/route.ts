import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

async function getPayPalAccessToken() {
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
  return data.access_token;
}

/**
 * 捕获 PayPal 订单
 * POST /api/paypal/capture-order
 */
export async function POST(request: NextRequest) {
  try {
    const { orderID } = await request.json();
    
    const accessToken = await getPayPalAccessToken();
    
    // Capture order
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random()}`
      }
    });

    const capture = await response.json();
    
    if (!response.ok) {
      console.error('PayPal order capture failed:', capture);
      return NextResponse.json({ error: 'Failed to capture order' }, { status: 400 });
    }

    // Here you would typically:
    // 1. Save payment details to your database
    // 2. Update user's subscription status
    // 3. Send confirmation email
    
    console.log('Payment captured:', {
      id: capture.id,
      status: capture.status,
      amount: capture.purchase_units[0]?.payments?.captures[0]?.amount
    });

    return NextResponse.json({ 
      success: true, 
      capture: {
        id: capture.id,
        status: capture.status
      }
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 