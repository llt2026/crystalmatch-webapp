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

export async function POST(request: NextRequest) {
  try {
    const { planId, amount, userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    // Create subscription
    const subscriptionData = {
      plan_id: planId === 'plus' ? process.env.P_PAYPAL_PLAN_PLUS : process.env.P_PAYPAL_PLAN_PRO,
      start_time: new Date(Date.now() + 60000).toISOString(), // Start 1 minute from now
      quantity: '1',
      custom_id: userId,
      shipping_amount: {
        currency_code: 'USD',
        value: '0.00'
      },
      subscriber: {
        name: {
          given_name: 'Subscriber',
          surname: 'Name'
        },
        email_address: 'subscriber@example.com'
      },
      application_context: {
        brand_name: 'Energy Crystal App',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData),
    });

    const subscription = await response.json();
    
    if (!response.ok) {
      console.error('PayPal subscription creation failed:', subscription);
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 400 });
    }

    return NextResponse.json({ id: subscription.id });
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 