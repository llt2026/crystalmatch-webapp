import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/prisma';
import { VerificationCode, MemoryVerificationCodes } from '@/app/lib/redis';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Get memory storage instance (fallback when Redis is unavailable)
const memoryStorage = MemoryVerificationCodes.getInstance();

export const dynamic = 'force-dynamic'; // Mark as dynamic route

// Define verification result type
type VerificationResult = {
  success: boolean;
  reason?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    // Log request info for debugging
    console.log(`Verification request: email=${email}, code=${code}, time=${new Date().toISOString()}`);
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Verify verification code
    let verificationResult: VerificationResult = { success: false, reason: 'unknown_error' };
    
    // First try to verify with Redis
    try {
      verificationResult = await VerificationCode.verifyCode(email, code);
    } catch (error) {
      console.warn('Redis verification failed, trying memory storage:', error);
      // If Redis is unavailable, fall back to memory storage
      verificationResult = memoryStorage.verifyCode(email, code);
    }
    
    // If verification fails, return specific error reason
    if (!verificationResult.success) {
      const errorMessages: Record<string, string> = {
        'code_not_found': 'Verification code not found or expired',
        'code_mismatch': 'Incorrect verification code',
        'server_error': 'Server verification failed',
        'unknown_error': 'Unknown error'
      };
      
      const reason = verificationResult.reason || 'unknown_error';
      const errorMessage = errorMessages[reason] || 'Invalid verification code';
      
      console.log(`Verification failed: email=${email}, reason=${reason}`);
      
      return NextResponse.json(
        { 
          error: errorMessage,
          reason: reason 
        },
        { status: 400 }
      );
    }
    
    console.log(`Verification successful: email=${email}`);
    
    // Verification successful, find or create user
    let user;
    try {
      user = await prisma.user.upsert({
        where: { email },
        update: { 
          lastLoginAt: new Date() 
        },
        create: {
          email,
          name: email.split('@')[0], // Default to using email prefix as username
          lastLoginAt: new Date()
        }
      });
      
      console.log(`User information processed successfully: userID=${user.id}`);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { error: 'Failed to process user information', reason: 'database_error' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP Cookie
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
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Verification code error:', error);
    return NextResponse.json(
      { error: 'Verification failed', reason: 'server_error' },
      { status: 500 }
    );
  }
} 