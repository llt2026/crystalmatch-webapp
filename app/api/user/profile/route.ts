import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // 确保 API 路由始终动态执行，避免构建期缓存
import { jwtVerify } from 'jose';
import { prisma } from '@/app/lib/prisma';

type JwtPayload = Record<string, any>;

async function getJwtPayload(request: NextRequest): Promise<JwtPayload | null> {
  try {
    let token = request.cookies.get('token')?.value;
    console.log('从cookie获取token:', token ? '存在' : '不存在');
    
    // 允许使用 Authorization: Bearer <token>
    if (!token) {
      const auth = request.headers.get('authorization');
      console.log('Authorization头:', auth);
      if (auth?.startsWith('Bearer ')) {
        token = auth.slice(7);
      }
    }

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );
    return payload as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Mock user data for development/build
const getMockUser = (userId: string) => ({
  id: userId,
  email: 'user@example.com',
  name: 'Test User',
  location: {
    country: 'United States',
    timezone: 'America/New_York'
  },
  birthInfo: {
    date: '1990-01-01T00:00:00.000Z',
    time: '12:00:00'
  },
  preferences: {
    notifications: true,
    language: 'en',
    theme: 'dark'
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
});

/**
 * Get user profile - mock implementation for build
 * GET /api/user/profile
 */
export async function GET(request: NextRequest) {
  try {
    // 记录请求信息
    console.log('收到profile请求:', {
      cookies: request.cookies.getAll().map(c => c.name),
      hasAuthHeader: !!request.headers.get('authorization'),
      url: request.url
    });

    // 尝试解析 JWT payload 以获取真实用户信息
    const jwtPayload = await getJwtPayload(request);

    if (!jwtPayload) {
      console.log('未登录或token无效，返回访客用户数据');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询数据库获取完整用户信息
    const userId = (jwtPayload.userId || jwtPayload.sub || '') as string;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const birthInfo = user.birthInfo as any || {};
      const birthDateIso = birthInfo.birthdate || birthInfo.date || undefined;

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
          status: (user as any).subscriptionStatus ?? 'free',
          expiresAt: (user as any).subscriptionExpiresAt?.toISOString() ?? undefined,
        },
        joinedAt: user.createdAt.toISOString(),
      };

      return NextResponse.json(userProfile);
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
 * Update user profile - mock implementation for build
 * PUT /api/user/profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Validate user identity
    const jwtPayload = await getJwtPayload(request);
    if (!jwtPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = jwtPayload.sub || jwtPayload.userId || jwtPayload.email || 'unknown';

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

    // Get mock user and merge updates
    const mockUser = getMockUser(userId);
    const updatedUser = {
      ...mockUser,
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    };

    // Return updated profile
    const { id, ...updatedProfile } = updatedUser;
    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 