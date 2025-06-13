import { NextRequest, NextResponse } from 'next/server';

// 使用PayPal沙盒测试凭据
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AYiPC9BjuuLNzjHHACtpRF6OqtnWdkzREDhHEGGN6zzDd4BG4biAqmbXVELegUP5DO27HAkS5cnP5nKz';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EHLohxQ9Y4BvXtVTmjjEJnWyQRjjrF7_gX9cVp2F8UXjdqY8K8dKmtKJVtKJVtKJ';
const PAYPAL_BASE_URL = 'https://api.sandbox.paypal.com'; // 强制使用沙盒环境

async function getPayPalAccessToken() {
  try {
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
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
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
      return NextResponse.json({ error: 'Missing required parameters: planId and amount' }, { status: 400 });
    }

    // 验证金额
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    
    const accessToken = await getPayPalAccessToken();
    
    // Create order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: numAmount.toFixed(2)
          },
          description: `${planId === 'plus' ? 'Plus Insider' : 'Pro Master'} Monthly Subscription`
        }
      ],
      application_context: {
        brand_name: 'Energy Crystal App',
        locale: 'en-US',
        landing_page: 'BILLING',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      }
    };

    console.log('Sending order data to PayPal:', JSON.stringify(orderData, null, 2));

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
      
      let errorMessage = 'Failed to create PayPal order';
      if (order.details && order.details.length > 0) {
        errorMessage = order.details[0].description || order.details[0].issue;
      } else if (order.message) {
        errorMessage = order.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: order
      }, { status: 400 });
    }

    console.log('PayPal order created successfully:', order.id);
    return NextResponse.json({ 
      id: order.id,
      status: order.status 
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json({ 
      error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 