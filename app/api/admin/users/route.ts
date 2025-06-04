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
            planId: true,
          },
          where: {
            OR: [
              { status: 'active' },
              { 
                status: 'active',
                endDate: { gt: new Date() }
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
      },
    });

    // 转换数据结构供前端使用
    const serializedUsers = await Promise.all(users.map(async (u: any) => {
      // 根据用户的subscription记录确定订阅状态
      let subscriptionStatus = 'free';
      if (u.subscriptions && u.subscriptions.length > 0) {
        const latestSubscription = u.subscriptions[0];
        if (latestSubscription.status === 'active' && 
            (!latestSubscription.endDate || new Date(latestSubscription.endDate) > new Date())) {
          
          // 从订阅计划名称中推断订阅类型
          const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: latestSubscription.planId }
          });
          
          const planName = plan?.name?.toLowerCase() || '';
          if (planName.includes('pro')) {
            subscriptionStatus = 'pro';
          } else if (planName.includes('plus')) {
            subscriptionStatus = 'plus';
          } else {
            subscriptionStatus = 'plus'; // 默认为plus
          }
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
    }));

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