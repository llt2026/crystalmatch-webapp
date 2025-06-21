import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 获取token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return new NextResponse(null, { status: 401 });
    }

    // 验证token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );
    
    // 返回用户信息
    return NextResponse.json({
      email: payload.email,
      isLoggedIn: true
    });
  } catch (error) {
    console.error('验证登录状态失败:', error);
    return new NextResponse(null, { status: 401 });
  }
} 