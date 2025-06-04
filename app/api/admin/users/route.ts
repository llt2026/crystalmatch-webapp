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
    });

    // 将所有用户数据中简单假设为free会员，避免复杂查询
    const serializedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: user.createdAt,
      lastLogin: user.lastLoginAt,
      subscriptionStatus: 'free',
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