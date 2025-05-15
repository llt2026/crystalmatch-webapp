import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 存储验证码（在生产环境中应该使用Redis或数据库）
const verificationCodes = new Map<string, {
  code: string;
  expiry: number;
}>();

// 生成6位数字验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 生成验证码
    const code = generateCode();
    // 设置5分钟过期
    const expiry = Date.now() + 5 * 60 * 1000;

    // 存储验证码
    verificationCodes.set(email, { code, expiry });

    // 发送验证码邮件
    await transporter.sendMail({
      from: process.env.SMTP_USER,
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
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

  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return NextResponse.json(
      { error: 'No verification code found' },
      { status: 400 }
    );
  }

  if (Date.now() > storedData.expiry) {
    verificationCodes.delete(email);
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

  // 验证成功后删除验证码
  verificationCodes.delete(email);

  return NextResponse.json({ verified: true });
} 