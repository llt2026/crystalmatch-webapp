import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { VerificationCode, MemoryVerificationCodes } from '@/app/lib/redis';

export const dynamic = 'force-dynamic'; // 明确标记为动态路由

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 内存存储验证码实例（Redis不可用时的回退方案）
const memoryStorage = MemoryVerificationCodes.getInstance();

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理发送验证码请求');
    const { email } = await request.json();

    if (!email) {
      console.log('错误: 邮箱地址为空');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`邮件配置: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`);
    
    // 检查环境变量是否存在
    if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error('邮件环境变量不完整', {
        host: !!process.env.MAIL_HOST,
        port: !!process.env.MAIL_PORT,
        user: !!process.env.MAIL_USER,
        pass: !!process.env.MAIL_PASS
      });
      return NextResponse.json({ error: 'Mail configuration incomplete' }, { status: 500 });
    }

    // 检查60秒内是否已发送验证码
    try {
      const rateLimit = await VerificationCode.checkRateLimit(email);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Too many requests. Please try again later.', 
            remainingTime: rateLimit.remainingTime 
          },
          { status: 429 }
        );
      }
    } catch (error) {
      // 如果Redis不可用，回退到内存存储
      const memoryLimit = memoryStorage.checkRateLimit(email);
      if (!memoryLimit.allowed) {
        return NextResponse.json(
          { 
            error: 'Too many requests. Please try again later.', 
            remainingTime: memoryLimit.remainingTime 
          },
          { status: 429 }
        );
      }
    }

    // 生成验证码
    const code = generateCode();

    try {
      console.log(`准备发送验证码 ${code} 到 ${email}`);
      // 发送验证码邮件
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: 'CrystalMatch Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>CrystalMatch Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #8A2BE2; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `
      });
      console.log('邮件发送成功');
      
      // 存储验证码
      try {
        await VerificationCode.saveCode(email, code);
        await VerificationCode.setRateLimit(email);
      } catch (storageError) {
        // 回退到内存存储
        console.warn('Redis存储失败，使用内存存储:', storageError);
        memoryStorage.saveCode(email, code);
        memoryStorage.setRateLimit(email);
      }
      
    } catch (emailError: any) {
      console.error('邮件发送失败:', emailError);
      return NextResponse.json(
        { error: `Failed to send email: ${emailError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('验证码处理错误:', error);
    return NextResponse.json(
      { error: `Processing error: ${error.message}` },
      { status: 500 }
    );
  }
}

// 旧的验证码验证方法，保留兼容性，但建议使用 /api/auth/verify-code
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const code = searchParams.get('code');

  if (!email || !code) {
    return NextResponse.json(
      { error: 'Email and code are required' },
      { status: 400 }
    );
  }

  let verified = false;
  
  // 首先尝试从Redis验证
  try {
    verified = await VerificationCode.verifyCode(email, code);
  } catch (error) {
    // 如果Redis不可用，回退到内存存储
    verified = memoryStorage.verifyCode(email, code);
  }
  
  if (!verified) {
    return NextResponse.json(
      { error: 'Invalid or expired verification code' },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true });
} 