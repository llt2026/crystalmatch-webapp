import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/app/middleware/adminAuth';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authError = await verifyAdminToken(request);
    if (authError) return authError;

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

    // 基础用户查询
    const users = await prisma.user.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      }
    });

    // 分批查询每个用户的订阅信息，避免嵌套查询导致的500错误
    const serializedUsers = await Promise.all(
      users.map(async (user: any) => {
        let subscriptionStatus = 'free';
        
        try {
          // 单独查询每个用户的活跃订阅
          const activeSubscription = await prisma.subscription.findFirst({
            where: {
              userId: user.id,
              status: 'active',
              endDate: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' },
            include: { 
              plan: {
                select: { name: true }
              } 
            }
          });

          // 根据订阅计划名称确定会员类型
          if (activeSubscription?.plan?.name) {
            const planName = activeSubscription.plan.name.toLowerCase();
            if (planName.includes('pro')) {
              subscriptionStatus = 'pro';
            } else if (planName.includes('plus')) {
              subscriptionStatus = 'plus';
            }
          }
        } catch (err) {
          console.error(`Error fetching subscription for user ${user.id}:`, err);
          // 如果查询出错，默认为free
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          createdAt: user.createdAt,
          lastLogin: user.lastLoginAt,
          subscriptionStatus: subscriptionStatus,
        };
      })
    );

    return NextResponse.json({
      users: serializedUsers,
      totalPages,
    });
  } catch (error) {
    console.error('Failed to retrieve user list:', error);
    // 出错时返回空列表而不是500错误
    return NextResponse.json({
      users: [],
      totalPages: 1,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 