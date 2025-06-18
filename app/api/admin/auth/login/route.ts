import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// In a production environment, admin credentials should be stored in a database
// with properly hashed passwords
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'default-password-change-me';
const JWT_SECRET = process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate admin credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login processing failed' },
      { status: 500 }
    );
  }
} 