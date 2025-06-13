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
    const { subscriptionID } = await request.json();
    
    const accessToken = await getPayPalAccessToken();
    
    // Get subscription details
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const subscription = await response.json();
    
    if (!response.ok) {
      console.error('PayPal subscription verification failed:', subscription);
      return NextResponse.json({ error: 'Failed to verify subscription' }, { status: 400 });
    }

    // Here you would typically:
    // 1. Save subscription details to your database
    // 2. Update user's subscription status
    // 3. Send confirmation email
    
    console.log('Subscription activated:', {
      id: subscription.id,
      status: subscription.status,
      plan_id: subscription.plan_id
    });

    return NextResponse.json({ 
      success: true, 
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan_id: subscription.plan_id
      }
    });
  } catch (error) {
    console.error('Error activating PayPal subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 