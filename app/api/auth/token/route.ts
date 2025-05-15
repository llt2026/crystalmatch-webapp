import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 在这里应该查询数据库获取用户信息
    // 如果用户不存在，则创建新用户
    const user = {
      id: `user-${Date.now()}`, // 示例ID
      email,
      subscription: {
        status: 'free'
      }
    };

    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        subscription: user.subscription
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to generate token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 