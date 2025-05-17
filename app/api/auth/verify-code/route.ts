import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/app/lib/prisma';
import { checkCode } from '@/utils/verify-code';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const dynamic = 'force-dynamic';

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

    // 标准化邮箱
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`验证码验证请求: ${normalizedEmail}, code=${code}`);

    // Verify verification code using the new system
    const isValid = await checkCode(normalizedEmail, code);
    
    // If verification fails, return error
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
    
    console.log(`Verification successful: email=${normalizedEmail}`);
    
    // Verification successful, find or create user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      
      if (!user) {
        // Create new user if doesn't exist
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            emailVerified: new Date(),
          },
        });
        console.log(`New user created: ${normalizedEmail}`);
      } else {
        // Update existing user's emailVerified field
        user = await prisma.user.update({
          where: { email: normalizedEmail },
          data: { emailVerified: new Date() },
        });
        console.log(`Existing user updated: ${normalizedEmail}`);
      }
    } catch (error) {
      console.error('Error accessing database:', error);
      // Continue even if database operations fail - this allows login to work 
      // even if Prisma/database is not available
    }
    
    // Generate JWT token for authentication
    const token = jwt.sign(
      { 
        email: normalizedEmail,
        id: user?.id || 'temp-id', 
        timestamp: Date.now() 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return success response
    return NextResponse.json({
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
  } catch (error: any) {
    console.error('Verification process error:', error);
    return NextResponse.json(
      { error: `Verification failed: ${error.message}` },
      { status: 500 }
    );
  }
} 