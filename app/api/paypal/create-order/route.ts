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
 * 创建 PayPal 订单
 * POST /api/paypal/create-order
 */
export async function POST(request: NextRequest) {
  try {
    const { planId, amount, currency = 'USD' } = await request.json();
    
    const accessToken = await getPayPalAccessToken();
    
    // Create order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          description: `${planId === 'plus' ? 'Plus Insider' : 'Pro Master'} Subscription - Monthly Plan`
        }
      ],
      application_context: {
        brand_name: 'Energy Crystal App',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random()}`
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();
    
    if (!response.ok) {
      console.error('PayPal order creation failed:', order);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
    }

    return NextResponse.json({ id: order.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 