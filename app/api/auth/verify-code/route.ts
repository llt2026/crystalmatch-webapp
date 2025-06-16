import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/prisma';
import { checkCode } from '@/utils/upstash';

const JWT_SECRET = process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code, verificationToken } = await request.json();
    
    // 记录请求信息用于调试
    console.log(`Verification request: email=${email}, code=${code}, time=${new Date().toISOString()}`);
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // 规范化邮箱
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Verify code for: ${normalizedEmail}, code=${code}`);

    // 使用Upstash验证验证码
    let isValid = await checkCode(normalizedEmail, code);
    
    // 如果redis检查失败，并且处于测试模式，尝试使用verificationToken回退验证
    if (!isValid && (process.env.SKIP_MAIL_SENDING === 'true' || process.env.NODE_ENV !== 'production')) {
      if (verificationToken) {
        try {
          const decoded: any = jwt.verify(verificationToken, JWT_SECRET);
          if (decoded.email === normalizedEmail && String(decoded.code) === String(code)) {
            isValid = true;
            console.log('测试模式下通过verificationToken验证成功');
          }
        } catch(err) {
          console.log('verificationToken 无效');
        }
      }
    }
    
    // 如果验证失败，返回错误
    if (!isValid) {
      console.log(`Verification failed: email=${normalizedEmail}, reason=invalid_code`);
      
      return NextResponse.json(
        { 
          error: 'Verification code not found or expired',
          reason: 'invalid_code' 
        },
        { status: 400 }
      );
    }
    
    console.log(`Verification success: email=${normalizedEmail}`);
    
    // 验证成功，查找或创建用户
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      
      if (!user) {
        // 如果用户不存在则创建
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            emailVerified: new Date(),
          },
        });
        console.log(`New user created: ${normalizedEmail}`);
      } else {
        // 更新现有用户的emailVerified字段
        user = await prisma.user.update({
          where: { email: normalizedEmail },
          data: { emailVerified: new Date() },
        });
        console.log(`Existing user updated: ${normalizedEmail}`);
      }
    } catch (error) {
      console.error('Database access error:', error);
      // 即使数据库操作失败也继续 - 允许登录即使Prisma/数据库不可用
    }
    
    // 生成JWT令牌用于身份验证
    const token = jwt.sign(
      { 
        email: normalizedEmail,
        userId: user?.id || 'temp-id',
        timestamp: Date.now() 
      },
      JWT_SECRET,
      { expiresIn: '180d' }
    );
    
    // 返回成功响应
    const response = NextResponse.json({
      success: true,
      token,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      } : {
        email: normalizedEmail,
        emailVerified: new Date()
      }
    });

    // set token cookie for 180 days (~6 months)
    response.headers.set('Set-Cookie', `token=${token}; Path=/; Max-Age=${60*60*24*180}; HttpOnly; SameSite=Lax${process.env.NODE_ENV==='production' ? '; Secure' : ''}`);
    return response;
  } catch (error: any) {
    console.error('验证过程错误:', error);
    return NextResponse.json(
      { error: `Verification failed: ${error.message}` },
      { status: 500 }
    );
  }
} 