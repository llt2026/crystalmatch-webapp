import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/app/middleware/adminAuth';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify admin token
  const authError = await verifyAdminToken(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const pageSize = 10;

    // Prisma 查询条件
    const whereCondition = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const totalUsers = await prisma.user.count({ where: whereCondition });
    const totalPages = Math.ceil(totalUsers / pageSize);

    const users = await prisma.user.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subscriptions: {
          select: {
            status: true,
            endDate: true,
          },
        },
      },
    });

    // 转换数据结构供前端使用
    const serializedUsers = users.map((u: any) => {
      // 根据用户的subscription记录确定订阅状态
      let subscriptionStatus = 'free';
      if (u.subscriptions && u.subscriptions.length > 0) {
        const activeSubscription = u.subscriptions.find((s: any) => 
          s.status === 'active' && (!s.endDate || new Date(s.endDate) > new Date())
        );
        if (activeSubscription) {
          subscriptionStatus = activeSubscription.planType || 'plus';
        }
      }
      
      return {
        id: u.id,
        email: u.email,
        name: u.name || '',
        createdAt: u.createdAt,
        lastLogin: u.lastLoginAt,
        subscriptionStatus: subscriptionStatus,
      };
    });

    return NextResponse.json({
      users: serializedUsers,
      totalPages,
    });
  } catch (error) {
    console.error('Failed to retrieve user list:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user list' },
      { status: 500 }
    );
  }
} 