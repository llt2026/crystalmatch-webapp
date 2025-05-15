import {
  Plan,
  SubscriptionStatus,
  Subscription,
  OrderStatus,
  Order,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  WebhookEventType
} from './types';
import { 
  createSubscription as createDbSubscription, 
  getPlanById, 
  getAllPlans as getDbPlans,
  updateSubscription, 
  getActiveSubscription 
} from '../repositories/subscriptionRepository';
import { createOrder } from '../repositories/orderRepository';
import { findUserById } from '../repositories/userRepository';

// 模拟的订阅计划数据
export const SUBSCRIPTION_PLANS: Record<string, Plan> = {
  'basic': {
    id: 'basic',
    name: 'Basic Plan',
    price: 0,
    period: 'forever',
    features: [
      { name: 'Basic Energy Reading', included: true },
      { name: 'Limited to 3 reports per month', included: true },
      { name: 'Basic Crystal Recommendations', included: true },
      { name: 'Advanced Energy Analysis', included: false },
      { name: 'Unlimited Report Generation', included: false },
      { name: 'Professional Crystal Matching', included: false },
      { name: 'Personalized Energy Rituals', included: false },
      { name: 'Priority Customer Support', included: false }
    ]
  },
  'premium': {
    id: 'premium',
    name: 'Premium Monthly',
    price: 99,
    period: 'month',
    recommended: true,
    features: [
      { name: 'Basic Energy Reading', included: true },
      { name: 'Limited to 3 reports per month', included: true },
      { name: 'Basic Crystal Recommendations', included: true },
      { name: 'Advanced Energy Analysis', included: true },
      { name: 'Unlimited Report Generation', included: true },
      { name: 'Professional Crystal Matching', included: true },
      { name: 'Personalized Energy Rituals', included: true },
      { name: 'Priority Customer Support', included: true }
    ]
  },
  'premium-yearly': {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    price: 999,
    period: 'year',
    features: [
      { name: 'Basic Energy Reading', included: true },
      { name: 'Limited to 3 reports per month', included: true },
      { name: 'Basic Crystal Recommendations', included: true },
      { name: 'Advanced Energy Analysis', included: true },
      { name: 'Unlimited Report Generation', included: true },
      { name: 'Professional Crystal Matching', included: true },
      { name: 'Personalized Energy Rituals', included: true },
      { name: 'Priority Customer Support', included: true }
    ]
  }
};

/**
 * 模拟数据库中的订阅数据
 * 在实际应用中，这些数据应该存储在数据库中
 */
const subscriptions: Subscription[] = [];
const orders: Order[] = [];

/**
 * 获取订阅计划信息
 */
export async function getPlan(planId: string) {
  const plan = await getPlanById(planId);
  
  if (!plan) {
    throw new Error('Invalid subscription plan');
  }
  
  return {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    features: plan.features as any
  };
}

/**
 * 获取所有订阅计划
 */
export async function getAllPlans() {
  const plans = await getDbPlans();
  
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    features: plan.features as any,
    isActive: plan.isActive
  }));
}

/**
 * 创建订阅
 */
export async function createSubscription(
  userId: string,
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  // 验证用户和计划是否存在
  const [user, plan] = await Promise.all([
    findUserById(userId),
    getPlanById(request.planId)
  ]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!plan) {
    throw new Error('Invalid subscription plan');
  }
  
  // 创建订阅记录 (先设为pending状态)
  const subscription = await createDbSubscription({
    userId,
    planId: plan.id,
    status: 'trial',
    startDate: new Date(),
    // 添加计算好的结束日期
    endDate: calculateEndDate(plan.period as string),
    renewalDate: calculateRenewalDate(plan.period as string)
  });
  
  // 创建订单
  const order = await createOrder({
    userId,
    subscriptionId: subscription.id,
    amount: plan.price,
    status: 'pending',
    currency: 'USD'
  });
  
  // 构建支付URL参数
  const params = new URLSearchParams({
    orderId: order.id,
    userId,
    planId: plan.id,
    amount: plan.price.toString(),
    currency: 'USD',
    description: `Subscription to ${plan.name}`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription/cancel`,
  });

  // 模拟的支付URL (实际应用中应集成支付网关)
  const paymentUrl = `https://mockpayment.com/pay?${params.toString()}`;
  
  return {
    success: true,
    paymentUrl,
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      period: plan.period as string
    }
  };
}

/**
 * 获取用户当前订阅
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const subscription = await getActiveSubscription(userId);
  return subscription as unknown as Subscription || null;
}

/**
 * 更新订阅状态
 */
export async function updateSubscriptionStatus(
  userId: string,
  planId: string,
  status: SubscriptionStatus
): Promise<Subscription> {
  // 查找用户现有的订阅
  const userSubscription = await getActiveSubscription(userId);
  
  if (userSubscription) {
    // 更新现有订阅
    return await updateSubscription(userSubscription.id, {
      status: status
    }) as unknown as Subscription;
  } else {
    // 创建新订阅
    return await createDbSubscription({
      userId,
      planId,
      status,
      startDate: new Date(),
      renewalDate: calculateRenewalDate(planId as string)
    }) as unknown as Subscription;
  }
}

/**
 * 取消订阅
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  // 查找用户活跃的订阅
  const subscription = await getActiveSubscription(userId);
  
  if (!subscription) {
    return false;
  }
  
  // 更新订阅状态
  await updateSubscription(subscription.id, {
    status: 'cancelled',
    cancelledAt: new Date()
  });
  
  return true;
}

/**
 * 获取下一个续费日期
 * 基于订阅计划的周期计算
 */
async function getNextRenewalDate(planId: string): Promise<string> {
  const plan = await getPlanById(planId);
  const now = new Date();
  
  if (!plan) {
    return now.toISOString();
  }
  
  const period = plan.period as string;
  
  switch (period) {
    case 'monthly':
    case 'month':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
    case 'year':
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      // 对于永久计划，使用远期日期
      now.setFullYear(now.getFullYear() + 100);
  }
  
  return now.toISOString();
}

// 计算下一个续费日期
function calculateRenewalDate(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case 'monthly':
    case 'month':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
    case 'year':
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      // 对于永久计划，使用远期日期
      now.setFullYear(now.getFullYear() + 100);
  }
  
  return now;
}

// 计算订阅结束日期
function calculateEndDate(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case 'monthly':
    case 'month':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'yearly':
    case 'year':
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      // 对于永久计划，使用远期日期
      now.setFullYear(now.getFullYear() + 100);
  }
  
  return now;
}

// 处理订阅Webhook
export async function handleSubscriptionWebhook(
  event: WebhookEventType,
  orderId: string,
  userId: string,
  planId: string,
  status: string
) {
  switch (event) {
    case WebhookEventType.PAYMENT_COMPLETED:
      // 更新订阅状态为激活
      const subscription = await getActiveSubscription(userId);
      if (subscription) {
        await updateSubscription(subscription.id, {
          status: 'active'
        });
      }
      break;
      
    case WebhookEventType.PAYMENT_FAILED:
      // 处理支付失败
      break;
      
    case WebhookEventType.SUBSCRIPTION_CANCELLED:
      // 取消订阅
      const activeSub = await getActiveSubscription(userId);
      if (activeSub) {
        await updateSubscription(activeSub.id, {
          status: 'cancelled',
          cancelledAt: new Date()
        });
      }
      break;
      
    default:
      console.log(`未处理的webhook事件: ${event}`);
  }
} 