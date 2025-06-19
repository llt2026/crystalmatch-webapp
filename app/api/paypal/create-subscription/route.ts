import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const IS_SANDBOX = (process.env.PAYPAL_ENV || '').toLowerCase() === 'sandbox';
const PAYPAL_BASE_URL = IS_SANDBOX 
  ? 'https://api.sandbox.paypal.com' 
  : 'https://api.paypal.com';

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
    
    // 映射到实际的 PayPal 计划 ID
    const PAYPAL_PLAN_PLUS = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS;
    const PAYPAL_PLAN_PRO  = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PRO;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!planId || !['plus', 'pro'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid planId, must be "plus" or "pro"' }, { status: 400 });
    }

    // 根据 planId 取出 PayPal plan_id
    const paypalPlanId = planId === 'plus' ? PAYPAL_PLAN_PLUS : PAYPAL_PLAN_PRO;

    if (!paypalPlanId) {
      return NextResponse.json({
        error: 'Missing PayPal plan_id in environment variables',
        details: {
          expectedVar: planId === 'plus' ? 'NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS' : 'NEXT_PUBLIC_P_PAYPAL_PLAN_PRO'
        }
      }, { status: 500 });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    // Create subscription
    const subscriptionData = {
      plan_id: paypalPlanId,
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