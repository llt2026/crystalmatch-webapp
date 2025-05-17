import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { saveCode } from '@/utils/verify-code';

export const dynamic = 'force-dynamic'; // Mark as dynamic route

// 启用详细日志
const DEBUG = true;

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Define verification result type
type VerificationResult = {
  success: boolean;
  reason?: string;
};

// 定义率限制的接口，确保类型一致性
interface RateLimit {
  allowed: boolean;
  remainingTime?: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Processing verification code request');
    console.log('SKIP_REDIS is set to:', process.env.SKIP_REDIS);
    
    const { email } = await request.json();

    if (!email) {
      console.log('Error: Email address is empty');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 标准化邮箱地址
    const normalizedEmail = email.toLowerCase().trim();
    
    if (DEBUG) {
      console.log(`处理邮箱: ${normalizedEmail}`);
    }

    // Log mail configuration for debugging
    console.log(`Mail configuration: ${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`);
    console.log(`From: ${process.env.MAIL_FROM || process.env.MAIL_USER}`);
    
    // Check if environment variables exist
    const skipMailSending = process.env.SKIP_MAIL_SENDING === 'true';
    const hasMailConfig = process.env.MAIL_HOST && process.env.MAIL_PORT && 
                         process.env.MAIL_USER && process.env.MAIL_PASS;
    
    if (!hasMailConfig && !skipMailSending) {
      console.error('Mail environment variables incomplete', {
        host: !!process.env.MAIL_HOST,
        port: !!process.env.MAIL_PORT,
        user: !!process.env.MAIL_USER,
        pass: !!process.env.MAIL_PASS
      });
      return NextResponse.json({ error: 'Mail configuration incomplete' }, { status: 500 });
    }

    // Check if code was already sent within the last 60 seconds
    let rateLimit: RateLimit = { allowed: true };
    
    try {
      rateLimit = await VerificationCode.checkRateLimit(normalizedEmail);
    } catch (error) {
      console.log('Redis错误，使用内存存储检查频率限制');
      // Fallback to memory storage if Redis is unavailable
      rateLimit = memoryStorage.checkRateLimit(normalizedEmail);
    }
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.', 
          remainingTime: rateLimit.remainingTime 
        },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = generateCode();
    let codeExpirySeconds = 900; // Default 15 minutes

    try {
      console.log(`Preparing to send verification code ${code} to ${normalizedEmail}`);
      
      // Store code using the new unified storage system (Redis or memory)
      await saveCode(normalizedEmail, code);
      
      // Send verification code email
      if (!skipMailSending) {
        try {
          await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: normalizedEmail,
            subject: 'CrystalMatch Verification Code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>CrystalMatch Verification Code</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #8A2BE2; font-size: 32px; letter-spacing: 5px;">${code}</h1>
                <p>This code will expire in ${Math.floor(codeExpirySeconds / 60)} minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
            `
          });
          console.log('Email sent successfully');
        } catch (mailError: any) {
          // Email sending failed but code was stored, log error but don't interrupt
          console.error('Email sending failed, but verification code was saved:', mailError);
          console.log(`======== Test mode: Code = ${code} ========`);
        }
      } else {
        // Skip email sending, output code for testing
        console.log(`======== Test mode: Code = ${code} ========`);
      }
      
      // For debugging in test mode
      if (DEBUG) {
        console.log(`使用${useMemoryStorage ? '内存存储' : 'Redis'}存储验证码: ${normalizedEmail} -> ${code}`);
        
        // 检查验证码是否已正确存储
        try {
          if (useMemoryStorage) {
            const codeInfo = memoryStorage.getCodeInfo(normalizedEmail);
            console.log('内存存储中的验证码信息:', codeInfo);
          } else {
            const codeInfo = await VerificationCode.getCodeInfo(normalizedEmail);
            console.log('Redis中的验证码信息:', codeInfo);
          }
        } catch (infoError) {
          console.error('获取验证码信息失败:', infoError);
        }
      }
      
    } catch (error: any) {
      console.error('Verification code processing error:', error);
      // Return code in test mode even if error occurs
      if (skipMailSending || !hasMailConfig) {
        console.log(`======== Test mode (error): Code = ${code} ========`);
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

    return NextResponse.json({ 
      success: true,
      expirySeconds: codeExpirySeconds,
      testMode: skipMailSending || !hasMailConfig,
      code: process.env.NODE_ENV !== 'production' ? code : undefined // 仅在非生产环境返回验证码
    });
  } catch (error: any) {
    console.error('Verification code processing error:', error);
    return NextResponse.json(
      { error: `Processing error: ${error.message}` },
      { status: 500 }
    );
  }
}

// Legacy verification code validation method, kept for compatibility
// but it's recommended to use /api/auth/verify-code instead
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

  // 标准化邮箱
  const normalizedEmail = email.toLowerCase().trim();
  
  let verificationResult: VerificationResult = { success: false, reason: 'unknown_error' };
  
  // First try to verify from Redis
  try {
    verificationResult = await VerificationCode.verifyCode(normalizedEmail, code);
  } catch (error) {
    // If Redis is unavailable, fall back to memory storage
    verificationResult = memoryStorage.verifyCode(normalizedEmail, code);
  }
  
  if (!verificationResult.success) {
    const errorMessages: Record<string, string> = {
      'code_not_found': 'Verification code not found or expired',
      'code_mismatch': 'Incorrect verification code',
      'code_expired': 'Verification code expired',
      'server_error': 'Server verification failed',
      'unknown_error': 'Unknown error'
    };
    
    const reason = verificationResult.reason || 'unknown_error';
    const errorMessage = errorMessages[reason] || 'Invalid verification code';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        reason: reason 
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ verified: true });
} 