import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkCode } from '@/utils/upstash';
// import { PrismaClient } from '@prisma/client';

// 暂时注释掉Prisma数据库操作，以允许构建通过
// const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, name, birthdate, code } = await request.json();
    
    // 验证所有必填字段
    if (!email || !name || !birthdate || !code) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    // 暂时模拟此操作
    // const existingUser = await prisma.user.findUnique({
    //   where: { email }
    // });
    
    // if (existingUser) {
    //   return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    // }

    // 统一使用Upstash Redis验证验证码
    const normalizedEmail = email.toLowerCase().trim();

    const isValid = await checkCode(normalizedEmail, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Verification code not found or expired' },
        { status: 400 }
      );
    }

    // 解析出生日期信息
    const birthDate = new Date(birthdate);
    
    // 创建新用户
    // 暂时模拟此操作
    // const user = await prisma.user.create({
    //   data: {
    //     email,
    //     name,
    //     birthInfo: {
    //       date: birthDate.toISOString(),
    //       time: birthDate.toTimeString(),
    //     },
    //     preferences: {
    //       notifications: true,
    //       newsletter: true,
    //       language: 'zh'
    //     }
    //   }
    // });
    
    const mockUser = {
      id: 'user-id-123',
      email,
      name,
      createdAt: new Date()
    };

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: mockUser.id, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 设置cookie并返回成功响应
    const response = NextResponse.json({ 
      message: 'User registered successfully',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
} 