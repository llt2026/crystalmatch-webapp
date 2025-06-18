import { NextRequest, NextResponse } from 'next/server';
import type { Transporter } from 'nodemailer';
import { saveCode, checkCode, checkRateLimit } from '@/utils/upstash';

export const dynamic = 'force-dynamic'; // 明确标记为动态路由

// nodemailer 仅在需要发送邮件时动态导入，避免在Serverless只读文件系统触发写操作
let transporter: Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;
  const nodemailer = await import('nodemailer');
  transporter = nodemailer.default.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === 'true' || Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
  return transporter;
}

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    console.log('Processing verification code request');
    const { email } = await request.json();

    if (!email) {
      console.log('Error: Email address is empty');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 规范化邮箱地址
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Processing email: ${normalizedEmail}`);

    // 检查环境变量是否存在
    const skipMailSending = process.env.SKIP_MAIL_SENDING === 'true';
    const hasMailConfig = process.env.MAIL_HOST && process.env.MAIL_PORT && 
                         process.env.MAIL_USER && process.env.MAIL_PASS;
    
    if (!hasMailConfig && !skipMailSending) {
      console.error('Mail configuration incomplete', {
        host: !!process.env.MAIL_HOST,
        port: !!process.env.MAIL_PORT,
        user: !!process.env.MAIL_USER,
        pass: !!process.env.MAIL_PASS
      });
      return NextResponse.json({ error: 'Mail configuration incomplete' }, { status: 500 });
    }

    // 检查是否在60秒内发送过验证码
    const rateLimit = await checkRateLimit(normalizedEmail, 60);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.', 
          remainingTime: rateLimit.remainingTime 
        },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateCode();
    const codeExpirySeconds = 600; // 10分钟过期

    try {
      console.log(`Preparing to send verification code ${code} to ${normalizedEmail}`);
      
      // 存储验证码到Redis或内存
      await saveCode(normalizedEmail, code, codeExpirySeconds);
      
      // 发送验证码邮件
      if (!skipMailSending) {
        try {
          // 获取 transporter
          const tx = await getTransporter();
          await tx.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: normalizedEmail,
            subject: 'Your CrystalMatch verification code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>CrystalMatch Verification</h2>
                <p>Your verification code is: <b>${code}</b></p>
                <p>This code will expire in ${Math.floor(codeExpirySeconds / 60)} minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
            `
          });
          console.log('Email sent successfully');
        } catch (mailError: any) {
          // 邮件发送失败但验证码已存储，记录错误但不中断
          console.error('Failed to send email, but verification code has been saved:', mailError);
        }
      }
      
    } catch (error: any) {
      console.error('Verification code processing error:', error);
      // 测试模式下即使出错也返回验证码
      if (skipMailSending || !hasMailConfig) {
        console.log(`======== Test Mode: Code = ${code} ========`);
        return NextResponse.json({ 
          success: true,
          expirySeconds: codeExpirySeconds,
          testMode: true,
          code: process.env.NODE_ENV !== 'production' ? code : undefined // 仅在非生产环境返回验证码
        });
      }
      return NextResponse.json(
        { error: `Failed to process verification code: ${error.message}` },
        { status: 500 }
      );
    }

    // 生成一份只在测试模式下用的 verificationToken，包含email + code
    const jwt = await import('jsonwebtoken').then(m=>m.default);
    const JWT_SECRET = process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key';
    const verificationToken = jwt.sign({ email: normalizedEmail, code }, JWT_SECRET, { expiresIn: codeExpirySeconds });

    return NextResponse.json({ 
      success: true,
      expirySeconds: codeExpirySeconds,
      testMode: skipMailSending || !hasMailConfig,
      verificationToken,
      code: process.env.NODE_ENV !== 'production' && (skipMailSending || !hasMailConfig) ? code : undefined
    });
  } catch (error: any) {
    console.error('Verification code processing error:', error);
    return NextResponse.json(
      { error: `Processing error: ${error.message}` },
      { status: 500 }
    );
  }
}

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

  // 规范化邮箱
  const normalizedEmail = email.toLowerCase().trim();
  
  // 使用Upstash验证验证码
  const isValid = await checkCode(normalizedEmail, code);
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Verification code not found or expired' },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true });
} 