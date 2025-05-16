import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

// 动态路由
export const dynamic = 'force-dynamic';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 从cookie中获取用户信息
async function getUserFromCookie(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return decoded;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取当前登录用户
    const user = await getUserFromCookie(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 解析请求体
    const data = await request.json();
    const { name, birthdate, gender } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        ...(birthdate && { birthdate: new Date(birthdate) }),
        ...(gender && { gender })
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error) {
    console.error('用户信息更新失败:', error);
    return NextResponse.json(
      { error: 'Failed to update user information' },
      { status: 500 }
    );
  }
} 