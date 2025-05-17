import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { VerificationCode, MemoryVerificationCodes } from '@/app/lib/redis';

export const dynamic = 'force-dynamic'; // Mark as dynamic route

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

// Memory storage instance (fallback when Redis is unavailable)
const memoryStorage = MemoryVerificationCodes.getInstance();

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Define verification result type
type VerificationResult = {
  success: boolean;
  reason?: string;
};

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
      // Fallback to memory storage if Redis is unavailable
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

    // Generate verification code
    const code = generateCode();
    let codeExpirySeconds = 900; // Default 15 minutes

    try {
      console.log(`Preparing to send verification code ${code} to ${email}`);
      
      // Store code and get expiry time
      let saveResult;
      try {
        saveResult = await VerificationCode.saveCode(email, code);
        if (saveResult.success) {
          codeExpirySeconds = saveResult.expirySeconds;
        }
        await VerificationCode.setRateLimit(email);
      } catch (storageError) {
        // Fallback to memory storage
        console.warn('Redis storage failed, using memory storage:', storageError);
        saveResult = memoryStorage.saveCode(email, code);
        if (saveResult.success) {
          codeExpirySeconds = saveResult.expirySeconds;
        }
        memoryStorage.setRateLimit(email);
      }
      
      // Send verification code email
      if (!skipMailSending) {
        try {
          await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.MAIL_USER,
            to: email,
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
      
    } catch (error: any) {
      console.error('Verification code processing error:', error);
      // Return code in test mode even if error occurs
      if (skipMailSending || !hasMailConfig) {
        console.log(`======== Test mode (error): Code = ${code} ========`);
        return NextResponse.json({ 
          success: true,
          expirySeconds: codeExpirySeconds,
          testMode: true 
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
      testMode: skipMailSending || !hasMailConfig
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

  let verificationResult: VerificationResult = { success: false, reason: 'unknown_error' };
  
  // First try to verify from Redis
  try {
    verificationResult = await VerificationCode.verifyCode(email, code);
  } catch (error) {
    // If Redis is unavailable, fall back to memory storage
    verificationResult = memoryStorage.verifyCode(email, code);
  }
  
  if (!verificationResult.success) {
    const errorMessages: Record<string, string> = {
      'code_not_found': 'Verification code not found or expired',
      'code_mismatch': 'Incorrect verification code',
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