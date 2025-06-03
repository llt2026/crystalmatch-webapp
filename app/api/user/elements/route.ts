import { NextRequest, NextResponse } from 'next/server';
// 确保 API 路由始终动态执行，避免构建期缓存
export const dynamic = 'force-dynamic';
import { jwtVerify } from 'jose';

// Validate user token
async function validateUserToken(request: NextRequest) {
  try {
    let token = request.cookies.get('token')?.value;
    
    // 允许使用 Authorization: Bearer <token>
    if (!token) {
      const auth = request.headers.get('authorization');
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
    
    return payload.userId || payload.sub;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get user elements - mock implementation
 * GET /api/user/elements
 */
export async function GET(request: NextRequest) {
  try {
    // Validate user identity
    const userId = await validateUserToken(request);
    
    // 为了构建阶段，如果没有userId，使用模拟数据
    const effectiveUserId = userId || 'anonymous-user';

    // 根据用户ID生成一些随机但稳定的数值
    const getUserSpecificValue = (userId: string, base: number, variance: number) => {
      // 简单的哈希函数，根据用户ID生成稳定的随机数
      let hash = 0;
      for (let i = 0; i < userId.toString().length; i++) {
        hash = ((hash << 5) - hash) + userId.toString().charCodeAt(i);
        hash |= 0; // 转换为32位整数
      }
      
      // 生成-variance到+variance之间的偏差
      const deviation = (Math.abs(hash) % (variance * 100)) / 100 - variance / 2;
      return Math.min(100, Math.max(1, Math.round(base + deviation)));
    };

    // 为用户生成五行元素数据
    const userElements = {
      wood: getUserSpecificValue(effectiveUserId.toString(), 65, 40),
      fire: getUserSpecificValue(effectiveUserId.toString() + "fire", 60, 40),
      earth: getUserSpecificValue(effectiveUserId.toString() + "earth", 70, 40),
      metal: getUserSpecificValue(effectiveUserId.toString() + "metal", 50, 40),
      water: getUserSpecificValue(effectiveUserId.toString() + "water", 55, 40),
    };

    return NextResponse.json(userElements);
  } catch (error) {
    console.error('Error fetching user elements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch elements' },
      { status: 500 }
    );
  }
} 