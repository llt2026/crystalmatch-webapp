/**
 * 订阅工具函数
 * 用于检查用户订阅状态、权限等
 */

import { Session } from "next-auth";

// 订阅计划类型
export type SubscriptionTier = 'free' | 'plus' | 'pro';

interface Session {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    subscription?: {
      type?: string;
      status?: string;
      expiresAt?: string;
    };
  };
}

/**
 * 检查用户是否具有所需的订阅级别
 * @param session 用户会话对象
 * @param requiredType 所需的订阅类型 ('plus', 'pro')
 * @returns 是否有权限访问
 */
export function hasRequiredSubscription(session: Session | null, requiredType: 'plus' | 'pro'): boolean {
  if (!session || !session.user || !session.user.subscription) {
    return false;
  }
  
  const { type, status, expiresAt } = session.user.subscription;
  
  // 检查订阅状态是否有效
  if (status !== 'active') {
    return false;
  }
  
  // 检查是否过期
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return false;
  }
  
  // 检查订阅类型
  if (requiredType === 'plus') {
    // Plus 或 Pro 会员可以访问 Plus 内容
    return type === 'plus' || type === 'pro';
  } else if (requiredType === 'pro') {
    // 仅 Pro 会员可以访问 Pro 内容
    return type === 'pro';
  }
  
  return false;
}

/**
 * 检查当前日期是否在用户订阅有效期内
 * @param expiresAt 订阅到期日期
 * @returns 是否在有效期内
 */
export function isSubscriptionActive(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  
  const expirationDate = new Date(expiresAt);
  const now = new Date();
  
  return expirationDate > now;
}

/**
 * 获取用户的订阅等级
 * @param session 用户会话对象
 * @returns 用户订阅等级
 */
export function getUserSubscriptionTier(session: Session | null): SubscriptionTier {
  if (!session || !session.user) {
    return 'free';
  }
  
  // 从会话中获取订阅信息
  const subscription = (session.user as any).subscription;
  
  if (!subscription) {
    return 'free';
  }
  
  // 检查订阅状态和类型
  if (subscription.status === 'active') {
    if (subscription.plan?.includes('pro')) {
      return 'pro';
    } else if (subscription.plan?.includes('plus')) {
      return 'plus';
    }
  }
  
  return 'free';
} 