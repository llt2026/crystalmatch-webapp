import { connectDB, prisma } from '../db';
import type { Order, Prisma } from '../../../generated/prisma';

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderCreateInput {
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency?: string;
  status: OrderStatus;
  paymentMethod?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export interface OrderUpdateInput {
  status?: OrderStatus;
  paymentMethod?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}

/**
 * 创建新订单
 * @param data 订单数据
 * @returns 创建的订单
 */
export async function createOrder(data: OrderCreateInput): Promise<Order> {
  return connectDB(async (client) => {
    return client.order.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: data.status,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        metadata: data.metadata,
      }
    });
  });
}

/**
 * 根据ID获取订单
 * @param id 订单ID
 * @returns 订单信息或null
 */
export async function getOrderById(id: string): Promise<Order | null> {
  return connectDB(async (client) => {
    return client.order.findUnique({
      where: { id }
    });
  });
}

/**
 * 更新订单信息
 * @param id 订单ID
 * @param data 更新数据
 * @returns 更新后的订单
 */
export async function updateOrder(id: string, data: OrderUpdateInput): Promise<Order> {
  return connectDB(async (client) => {
    return client.order.update({
      where: { id },
      data
    });
  });
}

/**
 * 获取用户的所有订单
 * @param userId 用户ID
 * @returns 订单列表
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  return connectDB(async (client) => {
    return client.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  });
}

/**
 * 获取所有订单，支持分页和筛选
 * @param page 页码
 * @param limit 每页数量
 * @param status 筛选状态
 * @returns 订单列表和总数
 */
export async function getAllOrders(
  page: number = 1, 
  limit: number = 10, 
  status?: OrderStatus
): Promise<{ orders: Order[], total: number }> {
  return connectDB(async (client) => {
    const skip = (page - 1) * limit;
    
    const where: Prisma.OrderWhereInput = {};
    if (status) {
      where.status = status;
    }
    
    const [orders, total] = await Promise.all([
      client.order.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      client.order.count({ where })
    ]);
    
    return { orders, total };
  });
}

/**
 * 获取某个时间段内的订单统计
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 订单统计信息
 */
export async function getOrderStats(
  startDate: Date,
  endDate: Date = new Date()
): Promise<{ 
  totalOrders: number, 
  completedOrders: number, 
  totalAmount: number, 
  ordersByStatus: Record<string, number> 
}> {
  return connectDB(async (client) => {
    const dateFilter = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };
    
    const [allOrders, completedOrders, pendingOrders, failedOrders, refundedOrders] = await Promise.all([
      client.order.findMany({ where: dateFilter }),
      client.order.findMany({ where: { ...dateFilter, status: 'completed' } }),
      client.order.count({ where: { ...dateFilter, status: 'pending' } }),
      client.order.count({ where: { ...dateFilter, status: 'failed' } }),
      client.order.count({ where: { ...dateFilter, status: 'refunded' } })
    ]);
    
    const totalAmount = completedOrders.reduce((sum: number, order: Order) => sum + order.amount, 0);
    
    return {
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      totalAmount,
      ordersByStatus: {
        pending: pendingOrders,
        completed: completedOrders.length,
        failed: failedOrders,
        refunded: refundedOrders
      }
    };
  });
} 