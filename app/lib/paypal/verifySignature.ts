import fetch from 'node-fetch';

/**
 * 验证PayPal Webhook签名
 * @param headers 请求头对象
 * @param body 请求体原始字符串
 * @returns 验证结果，true表示验证通过
 */
export async function verifyPaypalSignature(
  headers: Record<string, string>,
  body: string
): Promise<boolean> {
  try {
    // 如果是sandbox环境，可以跳过验签
    if (process.env.PAYPAL_ENV?.toLowerCase() === 'sandbox') {
      console.log('Sandbox environment detected, skipping signature verification');
      return true;
    }

    // 获取必要的请求头信息
    const transmissionId = headers['paypal-transmission-id'];
    const transmissionTime = headers['paypal-transmission-time'];
    const certUrl = headers['paypal-cert-url'];
    const authAlgo = headers['paypal-auth-algo'];
    const transmissionSig = headers['paypal-transmission-sig'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // 检查必要参数是否存在
    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig || !webhookId) {
      console.error('Missing required PayPal webhook headers', {
        transmissionId: !!transmissionId,
        transmissionTime: !!transmissionTime,
        certUrl: !!certUrl,
        authAlgo: !!authAlgo,
        transmissionSig: !!transmissionSig,
        webhookId: !!webhookId
      });
      return false;
    }

    // 获取PayPal API访问令牌
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      console.error('Failed to get PayPal access token');
      return false;
    }

    // 构建验证请求体
    const verificationBody = {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body) // 将请求体字符串解析为JSON对象
    };

    // 确定API基础URL
    const baseUrl = process.env.PAYPAL_ENV?.toLowerCase() === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // 发送验证请求
    const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(verificationBody)
    });

    // 解析响应
    const data = await response.json() as { verification_status?: string };
    
    // 检查验证状态
    const isValid = data.verification_status === 'SUCCESS';
    
    if (!isValid) {
      console.error('PayPal signature verification failed', data);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

/**
 * 获取PayPal API访问令牌
 * @returns 访问令牌
 */
async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing PayPal client credentials');
      return null;
    }

    // 确定API基础URL
    const baseUrl = process.env.PAYPAL_ENV?.toLowerCase() === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    // 构建认证字符串
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 发送令牌请求
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    // 解析响应
    const data = await response.json() as { access_token?: string };
    
    if (!data.access_token) {
      console.error('Failed to get PayPal access token', data);
      return null;
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    return null;
  }
} 