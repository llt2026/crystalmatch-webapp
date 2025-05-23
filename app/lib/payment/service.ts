import { Order, OrderStatus } from "../subscription/types";

// 模拟数据库中的订单数据
// 在实际应用中，这些数据应该存储在数据库中
let orders: Order[] = [];

// 支付方式类型
export enum PaymentMethod {
  PAYPAL = 'paypal',
}

// 信用卡信息接口
export interface CreditCardInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

// 支付请求接口
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  cardInfo?: CreditCardInfo;
  returnUrl: string;
  cancelUrl: string;
}

// 支付响应接口
export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string;
}

/**
 * 处理支付请求
 * @param request 支付请求
 * @returns 支付响应
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    // 检查订单是否存在
    const order = orders.find(o => o.id === request.orderId);
    
    if (!order) {
      return {
        success: false,
        error: 'Order not found'
      };
    }

    // 检查订单状态
    if (order.status !== OrderStatus.PENDING) {
      return {
        success: false,
        error: `Invalid order status: ${order.status}`
      };
    }

    // 在实际应用中，这里会调用支付网关API

    // 模拟支付处理
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // 随机判断支付成功或需要重定向到支付网关
    const needsRedirect = Math.random() > 0.3;

    if (needsRedirect) {
      // 需要重定向到支付网关
      const redirectUrl = `https://mockpaymentgateway.com/pay?orderId=${order.id}&amount=${order.amount}&returnUrl=${encodeURIComponent(request.returnUrl)}&cancelUrl=${encodeURIComponent(request.cancelUrl)}`;
      
      return {
        success: true,
        transactionId,
        redirectUrl
      };
    }

    // 更新订单状态为完成
    updateOrderStatus(order.id, OrderStatus.COMPLETED, {
      transactionId,
      paymentMethod: request.method
    });

    return {
      success: true,
      transactionId
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'Payment processing failed'
    };
  }
}

/**
 * 创建新订单
 * @param userId 用户ID
 * @param planId 订阅计划ID
 * @param amount 金额
 * @param currency 币种
 * @returns 创建的订单
 */
export function createOrder(
  userId: string,
  planId: string,
  amount: number,
  currency: string = 'USD'
): Order {
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  const order: Order = {
    id: orderId,
    userId,
    planId,
    amount,
    currency,
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 存储订单
  orders.push(order);
  
  return order;
}

/**
 * 更新订单状态
 * @param orderId 订单ID
 * @param status 新状态
 * @param metadata 元数据
 * @returns 是否更新成功
 */
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  metadata?: Record<string, any>
): boolean {
  const orderIndex = orders.findIndex(o => o.id === orderId);
  
  if (orderIndex === -1) {
    return false;
  }
  
  // 更新订单
  orders[orderIndex] = {
    ...orders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
    metadata: {
      ...orders[orderIndex].metadata,
      ...metadata
    }
  };
  
  return true;
}

/**
 * 获取用户订单历史
 * @param userId 用户ID
 * @returns 用户的订单列表
 */
export function getUserOrders(userId: string): Order[] {
  return orders.filter(o => o.userId === userId);
}

/**
 * 获取所有订单
 * @param page 页码
 * @param limit 每页数量
 * @param status 筛选状态
 * @returns 订单列表
 */
export function getAllOrders(
  page: number = 1,
  limit: number = 10,
  status?: OrderStatus
): Order[] {
  let filteredOrders = orders;
  
  // 筛选状态
  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }
  
  // 按创建时间排序
  filteredOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // 分页
  const startIndex = (page - 1) * limit;
  return filteredOrders.slice(startIndex, startIndex + limit);
}

/**
 * 获取订单详情
 * @param orderId 订单ID
 * @returns 订单详情或null
 */
export function getOrderById(orderId: string): Order | null {
  return orders.find(o => o.id === orderId) || null;
}

/**
 * 为测试创建一些模拟订单数据
 */
export function createMockOrders() {
  if (orders.length > 0) return; // 避免重复创建
  
  // 创建一些测试订单
  const mockOrders: Order[] = [
    {
      id: 'order_001',
      userId: 'user_001',
      planId: 'premium',
      amount: 99,
      currency: 'USD',
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.PAYPAL,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { transactionId: 'txn_00123456' }
    },
    {
      id: 'order_002',
      userId: 'user_002',
      planId: 'premium-yearly',
      amount: 999,
      currency: 'USD',
      status: OrderStatus.COMPLETED,
      paymentMethod: PaymentMethod.PAYPAL,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { transactionId: 'txn_00123457' }
    },
    {
      id: 'order_003',
      userId: 'user_003',
      planId: 'premium',
      amount: 99,
      currency: 'USD',
      status: OrderStatus.FAILED,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { error: 'Card declined' }
    },
    {
      id: 'order_004',
      userId: 'user_001',
      planId: 'premium-yearly',
      amount: 999,
      currency: 'USD',
      status: OrderStatus.PENDING,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order_005',
      userId: 'user_004',
      planId: 'premium',
      amount: 99,
      currency: 'USD',
      status: OrderStatus.REFUNDED,
      paymentMethod: PaymentMethod.PAYPAL,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { 
        transactionId: 'txn_00123460',
        refundReason: 'Customer request'
      }
    }
  ];
  
  orders = mockOrders;
}

// 初始化一些测试数据
createMockOrders(); 