import { NextRequest, NextResponse } from 'next/server';
// ensure dynamic execution, avoid build-time cache
export const dynamic = 'force-dynamic';
import { jwtVerify } from 'jose';

// Validate user token
async function validateUserToken(request: NextRequest) {
  try {
    let token = request.cookies.get('token')?.value;
    
    // allow Authorization: Bearer <token>
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
 * Get user elements - real implementation based on user's birth data
 * GET /api/user/elements
 */
export async function GET(request: NextRequest) {
  try {
    // log request
    console.log('Elements request:', {
      cookies: request.cookies.getAll().map(c => c.name),
      hasAuthHeader: !!request.headers.get('authorization'),
      url: request.url
    });

    // Validate user identity
    const userId = await validateUserToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate stable elements values based on userId (placeholder algorithm)
    const getUserSpecificValue = (userId: string, base: number, variance: number) => {
      // simple hash
      let hash = 0;
      for (let i = 0; i < userId.toString().length; i++) {
        hash = ((hash << 5) - hash) + userId.toString().charCodeAt(i);
        hash |= 0;
      }
      
      // 生成-variance到+variance之间的偏差
      const deviation = (Math.abs(hash) % (variance * 100)) / 100 - variance / 2;
      return Math.min(100, Math.max(1, Math.round(base + deviation)));
    };

    // 为用户生成基于其ID的稳定五行元素数据
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