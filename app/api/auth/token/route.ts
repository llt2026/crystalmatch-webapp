import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { checkCode } from '@/utils/upstash';
import { prisma } from '@/app/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 验证验证码
    const valid = await checkCode(normalizedEmail, code);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // 查询用户
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return NextResponse.json({ error: 'User not found', unregistered: true }, { status: 404 });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ message: 'Login success' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Failed to generate token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 