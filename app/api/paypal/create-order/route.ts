import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  console.log('Getting PayPal access token from:', PAYPAL_BASE_URL);
  
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
  
  console.log('PayPal access token obtained successfully');
  return data.access_token;
}

/**
 * 创建 PayPal 订单
 * POST /api/paypal/create-order
 */
export async function POST(request: NextRequest) {
  try {
    const { planId, amount, currency = 'USD' } = await request.json();
    
    console.log('Creating PayPal order:', { planId, amount, currency });
    
    if (!planId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
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
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/cancel`
      }
    };

    console.log('Sending order data to PayPal:', JSON.stringify(orderData, null, 2));

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
      console.error('PayPal order creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: order
      });
      return NextResponse.json({ 
        error: `PayPal order creation failed: ${order.message || order.error_description || 'Unknown error'}` 
      }, { status: 400 });
    }

    console.log('PayPal order created successfully:', order.id);
    return NextResponse.json({ id: order.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 