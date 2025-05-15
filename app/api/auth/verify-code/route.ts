import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // 获取存储的验证码
    const storedData = global.verificationCodes?.get(email);
    
    if (!storedData) {
      return NextResponse.json(
        { error: 'Verification code not found' },
        { status: 400 }
      );
    }

    // 验证码5分钟有效期
    const isExpired = Date.now() - storedData.timestamp > 5 * 60 * 1000;
    
    if (isExpired) {
      global.verificationCodes.delete(email);
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // 验证成功，删除验证码
    global.verificationCodes.delete(email);

    // 生成JWT令牌
    const token = jwt.sign(
      { email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 设置cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });

    return response;
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 