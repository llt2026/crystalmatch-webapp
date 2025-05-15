import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken } from '../../../middleware/adminAuth';
import { getAllOrders, getOrderById, updateOrderStatus } from '@/app/lib/payment/service';
import { OrderStatus } from '@/app/lib/subscription/types';

/**
 * 获取订单列表
 * GET /api/admin/orders
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const isAdmin = await validateAdminToken(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') as OrderStatus | undefined;
    
    // 获取订单列表
    const orders = getAllOrders(page, limit, status);
    
    // 计算订单统计
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => {
      if (order.status === OrderStatus.COMPLETED) {
        return sum + order.amount;
      }
      return sum;
    }, 0);
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total: totalOrders
      },
      stats: {
        totalAmount,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * 更新订单状态
 * PATCH /api/admin/orders/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证管理员权限
    const isAdmin = await validateAdminToken(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 获取路径参数中的订单ID
    const orderId = params.id;
    
    // 获取请求数据
    const { status, metadata } = await request.json();
    
    // 验证状态是否有效
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // 获取订单
    const order = getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // 更新订单状态
    const success = updateOrderStatus(orderId, status, metadata);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }
    
    // 获取更新后的订单
    const updatedOrder = getOrderById(orderId);
    
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 