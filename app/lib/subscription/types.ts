// 订阅类型定义

/**
 * 订阅计划类型
 */
export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: PlanFeature[];
  recommended?: boolean;
}

/**
 * 订阅状态枚举
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

/**
 * 订阅信息
 */
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * 订单信息
 */
export interface Order {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * 创建订阅请求
 */
export interface CreateSubscriptionRequest {
  planId: string;
}

/**
 * 创建订阅响应
 */
export interface CreateSubscriptionResponse {
  success: boolean;
  paymentUrl: string;
  plan: {
    id: string;
    name: string;
    price: number;
    period: string;
  };
}

/**
 * Webhook事件类型
 */
export enum WebhookEventType {
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_CANCELLED = 'subscription.cancelled',
  SUBSCRIPTION_RENEWED = 'subscription.renewed',
}

/**
 * Webhook事件
 */
export interface WebhookEvent {
  id: string;
  event: WebhookEventType;
  orderId?: string;
  userId: string;
  planId?: string;
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
} 