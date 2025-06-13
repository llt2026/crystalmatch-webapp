import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const config = {
    hasClientId: !!process.env.PAYPAL_CLIENT_ID,
    hasClientSecret: !!process.env.PAYPAL_CLIENT_SECRET,
    hasPublicClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    paypalEnv: process.env.PAYPAL_ENV
  };

  return NextResponse.json({
    message: 'PayPal Configuration Test',
    config,
    recommendations: {
      needsPublicClientId: !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      needsClientId: !process.env.PAYPAL_CLIENT_ID,
      needsClientSecret: !process.env.PAYPAL_CLIENT_SECRET
    }
  });
} 