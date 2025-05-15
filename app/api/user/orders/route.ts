import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserOrders } from '@/app/lib/payment/service';

/**
 * 获取用户订单历史
 * GET /api/user/orders
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // 验证JWT
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
      );
      
      const userId = payload.userId || payload.sub;
      
      if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      // 获取用户订单历史
      const orders = getUserOrders(userId.toString());
      
      // 按时间排序
      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return NextResponse.json({ orders: sortedOrders });
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 