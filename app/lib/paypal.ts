import paypal from '@paypal/checkout-server-sdk';

// 创建并导出 PayPal HTTP 客户端
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

  const isLive = process.env.PAYPAL_ENV?.toLowerCase() === 'live' || process.env.NODE_ENV === 'production';

  if (isLive) {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  // 默认使用 Sandbox
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

const paypalClient = new paypal.core.PayPalHttpClient(environment());

export { paypalClient, paypal }; 