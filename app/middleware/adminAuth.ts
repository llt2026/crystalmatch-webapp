import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Validate admin token
export async function validateAdminToken(request: NextRequest) {
  try {
    // Get admin token from cookies
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return false;
    }

    // Verify token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );

    // Verify admin role
    return payload.role === 'admin';
  } catch (error) {
    console.error('Admin token validation failed:', error);
    return false;
  }
}

// Verify admin token and return error response if invalid
export async function verifyAdminToken(request: NextRequest) {
  const isAdmin = await validateAdminToken(request);
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }
  
  return null;
} 