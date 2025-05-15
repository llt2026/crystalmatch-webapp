import { connectDB } from '../db';
import type { Subscription, SubscriptionPlan } from '../../../generated/prisma';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionCreateInput {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  renewalDate?: Date;
}

export interface SubscriptionUpdateInput {
  status?: SubscriptionStatus;
  endDate?: Date;
  renewalDate?: Date;
  cancelledAt?: Date;
}

// 计划相关
/**
 * 获取所有订阅计划
 * @param onlyActive 是否只返回激活的计划
 * @returns 订阅计划列表
 */
export async function getAllPlans(onlyActive: boolean = true): Promise<SubscriptionPlan[]> {
  return connectDB(async (client) => {
    return client.subscriptionPlan.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { price: 'asc' }
    });
  });
}

/**
 * 根据ID获取订阅计划
 * @param id 计划ID
 * @returns 订阅计划或null
 */
export async function getPlanById(id: string): Promise<SubscriptionPlan | null> {
  return connectDB(async (client) => {
    return client.subscriptionPlan.findUnique({
      where: { id }
    });
  });
}

// 用户订阅相关
/**
 * 创建用户订阅
 * @param data 订阅数据
 * @returns 创建的订阅
 */
export async function createSubscription(data: SubscriptionCreateInput): Promise<Subscription> {
  return connectDB(async (client) => {
    return client.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status,
        startDate: data.startDate || new Date(),
        endDate: data.endDate,
        renewalDate: data.renewalDate,
      }
    });
  });
}

/**
 * 获取用户的所有订阅
 * @param userId 用户ID
 * @returns 订阅列表
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  return connectDB(async (client) => {
    return client.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  });
}

/**
 * 获取用户的活跃订阅
 * @param userId 用户ID
 * @returns 活跃订阅或null
 */
export async function getActiveSubscription(userId: string): Promise<(Subscription & { plan: SubscriptionPlan }) | null> {
  return connectDB(async (client) => {
    return client.subscription.findFirst({
      where: { 
        userId,
        status: { in: ['active', 'trial'] },
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
  });
}

/**
 * 更新订阅信息
 * @param id 订阅ID
 * @param data 更新数据
 * @returns 更新后的订阅
 */
export async function updateSubscription(id: string, data: SubscriptionUpdateInput): Promise<Subscription> {
  return connectDB(async (client) => {
    return client.subscription.update({
      where: { id },
      data
    });
  });
}

/**
 * 取消订阅
 * @param id 订阅ID
 * @param immediateEffect 是否立即生效
 * @returns 更新后的订阅
 */
export async function cancelSubscription(id: string, immediateEffect: boolean = false): Promise<Subscription> {
  return connectDB(async (client) => {
    const subscription = await client.subscription.findUnique({
      where: { id }
    });
    
    if (!subscription) {
      throw new Error('订阅不存在');
    }
    
    return client.subscription.update({
      where: { id },
      data: {
        status: immediateEffect ? 'cancelled' : 'active',
        cancelledAt: new Date(),
        endDate: immediateEffect ? new Date() : subscription.endDate,
      }
    });
  });
}

/**
 * 查找过期的订阅
 * @returns 过期的订阅列表
 */
export async function findExpiredSubscriptions(): Promise<Subscription[]> {
  return connectDB(async (client) => {
    const now = new Date();
    return client.subscription.findMany({
      where: {
        status: 'active',
        endDate: { lt: now }
      }
    });
  });
} 