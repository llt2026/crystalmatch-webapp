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
    // 解码JWT并尝试获取用户ID（可能以不同字段名存储）
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 尝试各种可能的ID字段名
    const userId = decoded.id || decoded.userId || decoded.sub;
    const email = decoded.email;
    
    if (!userId && !email) {
      console.error('Token中未找到用户ID或邮箱:', decoded);
      return null;
    }
    
    // 返回包含id和email的对象
    return { id: userId, email };
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取当前登录用户
    const userToken = await getUserFromCookie(request);

    if (!userToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 记录获取到的用户信息
    console.log('获取到的用户信息:', userToken);

    // 解析请求体
    const data = await request.json();
    const { name, birthdate, gender } = data;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // 构建查询条件
    const whereCondition: any = {};
    if (userToken.id) {
      whereCondition.id = userToken.id;
    } else if (userToken.email) {
      whereCondition.email = userToken.email;
    } else {
      return NextResponse.json(
        { error: '无法确定要更新的用户' },
        { status: 400 }
      );
    }
    
    // 打印查询条件
    console.log('更新条件:', whereCondition);

    // 更新用户信息
    const updateData: any = { name };
    
    // 将birthdate存入birthInfo JSON字段
    if (birthdate) {
      updateData.birthInfo = {
        birthdate: birthdate,
        birthDateObject: new Date(birthdate)
      };
    }
    
    // 添加性别信息
    if (gender) {
      updateData.birthInfo = {
        ...(updateData.birthInfo || {}),
        gender
      };
    }
    
    // 打印更新数据
    console.log('更新数据:', updateData);

    const updatedUser = await prisma.user.update({
      where: whereCondition,
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        birthInfo: updatedUser.birthInfo
      }
    });
  } catch (error) {
    console.error('用户信息更新失败:', error);
    return NextResponse.json(
      { error: '用户信息更新失败: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 