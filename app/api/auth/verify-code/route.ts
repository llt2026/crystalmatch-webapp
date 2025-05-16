import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/prisma';
import { VerificationCode, MemoryVerificationCodes } from '@/app/lib/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// 获取内存存储实例（Redis不可用时的回退方案）
const memoryStorage = MemoryVerificationCodes.getInstance();

export const dynamic = 'force-dynamic'; // 明确标记为动态路由

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // 验证码验证
    let verified = false;
    
    // 首先尝试从Redis验证
    try {
      verified = await VerificationCode.verifyCode(email, code);
    } catch (error) {
      console.warn('Redis验证失败，尝试内存验证:', error);
      // 如果Redis不可用，回退到内存存储
      verified = memoryStorage.verifyCode(email, code);
    }
    
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    // 验证成功，查找或创建用户
    let user;
    try {
      user = await prisma.user.upsert({
        where: { email },
        update: { 
          lastLoginAt: new Date() 
        },
        create: {
          email,
          name: email.split('@')[0], // 默认使用邮箱前缀作为用户名
          lastLoginAt: new Date()
        }
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      return NextResponse.json(
        { error: 'Failed to process user information' },
        { status: 500 }
      );
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 设置HTTP Cookie
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });

    return response;
  } catch (error) {
    console.error('验证码验证错误:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 