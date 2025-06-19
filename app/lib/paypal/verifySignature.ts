// 移除 node-fetch，Next.js 自带全局 fetch
import crypto from 'crypto'; // 保留以符合约束，可不直接使用

/**
 * 验证PayPal Webhook签名
 * @param headers 请求头对象
 * @param body 请求体原始字符串
 * @param webhookId 钩子ID
 * @returns 验证结果，true表示验证通过
 */
export async function verifyPaypalSignature(
  headers: Record<string, string>,
  body: string,
  webhookId: string,
): Promise<boolean> {
  try {
    // 开发 / 沙箱环境直接跳过
    const isSandbox = process.env.PAYPAL_ENV?.toLowerCase() === 'sandbox' || process.env.NODE_ENV === 'development';
    if (isSandbox) {
      console.log('Sandbox 或开发环境，跳过 PayPal Webhook 验签');
      return true;
    }

    // 必需 Header 列表
    const required = [
      'paypal-transmission-id',
      'paypal-transmission-time',
      'paypal-transmission-sig',
      'paypal-cert-url',
      'paypal-auth-algo',
    ];
    if (required.some((h) => !headers[h])) {
      console.error('缺失必要的 PayPal Webhook Header', headers);
      return false;
    }

    // 构建官方验证请求体
    const verificationPayload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    // 根据 cert_url 判断 API 基础地址
    const baseUrl = headers['paypal-cert-url'].includes('sandbox')
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    if (!clientId || !clientSecret) {
      console.error('缺失 PayPal Client 凭据');
      return false;
    }

    // 获取 access_token
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) {
      console.error('获取 PayPal access_token 失败');
      return false;
    }

    // 调用官方验签接口
    const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify(verificationPayload),
    });
    const verifyJson = (await verifyRes.json()) as { verification_status?: string };

    const ok = verifyJson.verification_status === 'SUCCESS';
    if (!ok) {
      console.error('PayPal Webhook 验签失败', verifyJson);
    }
    return ok;
  } catch (err) {
    console.error('执行 PayPal Webhook 验签时发生异常', err);
    return false;
  }
}

// 底部旧 getPayPalAccessToken 已移除，改由内联 token 请求逻辑实现 