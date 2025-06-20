import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // always dynamic execution to avoid build-time cache
import { jwtVerify } from 'jose';
import { prisma } from '@/app/lib/prisma';

type JwtPayload = Record<string, any>;

async function getJwtPayload(request: NextRequest): Promise<JwtPayload | null> {
  try {
    let token = request.cookies.get('token')?.value;
    console.log('Token in cookies:', token ? 'yes' : 'no');
    
    // 允许使用 Authorization: Bearer <token>
    if (!token) {
      const auth = request.headers.get('authorization');
      console.log('Authorization header:', auth);
      if (auth?.startsWith('Bearer ')) {
        token = auth.slice(7);
      }
    }

    if (!token) {
      return null;
    }

    // 尝试使用jose库验证
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
      );
      return payload as JwtPayload;
    } catch (joseError) {
      console.log('JOSE verification failed, trying jsonwebtoken...');
      
      // 如果jose失败，尝试使用jsonwebtoken库
      const jwt = require('jsonwebtoken');
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key');
      return payload as JwtPayload;
    }
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// no mock data allowed

/**
 * Get user profile - mock implementation for build
 * GET /api/user/profile
 */
export async function GET(request: NextRequest) {
  try {
    // 记录请求信息
    console.log('Profile request:', {
      cookies: request.cookies.getAll().map(c => c.name),
      hasAuthHeader: !!request.headers.get('authorization'),
      url: request.url
    });

    // 尝试解析 JWT payload 以获取真实用户信息
    const jwtPayload = await getJwtPayload(request);

    if (!jwtPayload) {
      console.log('Unauthorized or invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询数据库获取完整用户信息
    const userId = (jwtPayload.userId || jwtPayload.sub || '') as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: {
          subscriptions: {
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
          }
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // 完整显示birthInfo内容
      console.log('Raw birthInfo:', JSON.stringify(user.birthInfo));
      let birthInfo;
      try {
        birthInfo = (typeof user.birthInfo === 'string') 
          ? JSON.parse(user.birthInfo as string) 
          : (user.birthInfo || {});
      } catch (e) {
        console.error('解析birthInfo失败:', e);
        birthInfo = {};
      }
      
      const birthDateIso = birthInfo.birthdate || birthInfo.date || undefined;
      console.log('提取到的birthDateIso:', birthDateIso);

      // 确定订阅状态
      let subscriptionStatus = 'free';
      let subscriptionExpiresAt = undefined;
      
      if (user.subscriptions && user.subscriptions.length > 0) {
        const latestSubscription = user.subscriptions[0];
        if (latestSubscription.status === 'active' && 
            (!latestSubscription.endDate || new Date(latestSubscription.endDate) > new Date())) {
          // 从订阅计划名称中推断订阅类型
          const planName = (await prisma.subscriptionPlan.findUnique({
            where: { id: latestSubscription.planId }
          }))?.name?.toLowerCase() || '';
          
          if (planName.includes('pro')) {
            subscriptionStatus = 'pro';
          } else if (planName.includes('plus')) {
            subscriptionStatus = 'plus';
          } else {
            subscriptionStatus = 'plus'; // 默认为plus
          }
          
          subscriptionExpiresAt = latestSubscription.endDate;
        }
      }

      const userProfile = {
        // 唯一ID，供前端逻辑使用
        id: user.id,
        // 如果数据库未存储name，则回退使用邮箱前缀，避免出现"Unknown User"
        name: user.name || (user.email?.split('@')[0] ?? 'User'),
        email: user.email,
        // 如果未设置头像则使用默认头像保持一致
        avatar: user.avatar && user.avatar.trim() !== '' ? user.avatar : '/default-avatar.png',
        // 供前端兼容：既提供扁平birthDate，也提供birthInfo对象
        birthDate: birthDateIso,
        birthInfo: {
          date: birthDateIso,
          gender: birthInfo.gender,
        },
        subscription: {
          status: subscriptionStatus,
          expiresAt: subscriptionExpiresAt?.toISOString() ?? undefined,
        },
        joinedAt: user.createdAt?.toISOString() || new Date().toISOString(),
      };

      return NextResponse.json(userProfile, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, private'
        }
      });
    } catch (err) {
      console.error('DB error:', err);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * Update user profile - real database implementation
 * PUT /api/user/profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Validate user identity
    const jwtPayload = await getJwtPayload(request);
    if (!jwtPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (jwtPayload.userId || jwtPayload.sub || '') as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request data
    const updates = await request.json();
    
    // Filter allowed fields
    const allowedUpdates = ['name', 'location', 'birthInfo', 'preferences'];
    const filteredUpdates: Record<string, any> = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: filteredUpdates.name,
        birthInfo: filteredUpdates.birthInfo,
        // location and preferences can be stored as JSON if needed
        ...(filteredUpdates.location && { location: filteredUpdates.location }),
        ...(filteredUpdates.preferences && { preferences: filteredUpdates.preferences }),
      },
    });

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 