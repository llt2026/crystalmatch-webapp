import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

// 确保在非生产环境使用
export const dynamic = 'force-dynamic';

// 所有可能使用的JWT密钥
const JWT_KEYS = {
  'profile': process.env.JWT_SECRET || 'your-secret-key',
  'verify-code': process.env.JWT_SECRET || 'your-secret-key',
  'send-code': process.env.JWT_SECRET || 'your-secret-key',
  'crystalmatch': 'crystalmatch-secure-jwt-secret-key'
};

// 定义验证结果类型
interface VerificationResult {
  success: boolean;
  payload?: any;
  error?: string;
}

interface VerificationResults {
  [key: string]: VerificationResult;
}

export async function GET(request: NextRequest) {
  // 仅限开发环境
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'info';
  
  // 生成测试token
  if (action === 'generate-token') {
    const email = searchParams.get('email') || 'test@example.com';
    const id = searchParams.get('id') || 'test-user-123';
    const keyType = searchParams.get('keyType') || 'verify-code';
    
    const payload = {
      email,
      id,
      sub: id,
      userId: id,
      timestamp: Date.now()
    };
    
    const secret = JWT_KEYS[keyType as keyof typeof JWT_KEYS] || JWT_KEYS['verify-code'];
    
    const token = jwt.sign(payload, secret, { expiresIn: '30d' });
    
    // 返回token信息及如何使用它的指导
    return NextResponse.json({
      token,
      usage: {
        localStorage: `在浏览器控制台执行: localStorage.setItem('authToken', '${token}')`,
        httpRequest: `请求附带header: 'Authorization: Bearer ${token}'`,
        cookie: `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict`
      },
      decodedPayload: jwt.decode(token)
    });
  }
  
  // 验证提供的token
  if (action === 'verify') {
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }
    
    const results: VerificationResults = {};
    
    // 尝试使用所有可能的密钥验证
    for (const [name, secret] of Object.entries(JWT_KEYS)) {
      try {
        const result = jwt.verify(token, secret);
        results[name] = { success: true, payload: result };
      } catch (error) {
        results[name] = { success: false, error: (error as Error).message };
      }
      
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        results[`${name}_jose`] = { success: true, payload };
      } catch (error) {
        results[`${name}_jose`] = { success: false, error: (error as Error).message };
      }
    }
    
    return NextResponse.json({
      token,
      decodedPayload: jwt.decode(token),
      verificationResults: results
    });
  }
  
  // 默认返回配置信息
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    jwtKeys: Object.keys(JWT_KEYS),
    authUsage: {
      generateToken: `/api/debug/auth?action=generate-token&email=yourname@example.com&id=user123`,
      verifyToken: `/api/debug/auth?action=verify&token=your-token-here`
    },
    note: "只在开发环境可用，用于解决认证问题"
  });
} 