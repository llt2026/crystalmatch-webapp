import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // 确保 API 路由始终动态执行，避免构建期缓存
import { jwtVerify } from 'jose';

// Validate user token
async function validateUserToken(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      wood: getUserSpecificValue(userId.toString(), 65, 40),
      fire: getUserSpecificValue(userId.toString() + "fire", 60, 40),
      earth: getUserSpecificValue(userId.toString() + "earth", 70, 40),
      metal: getUserSpecificValue(userId.toString() + "metal", 50, 40),
      water: getUserSpecificValue(userId.toString() + "water", 55, 40),
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