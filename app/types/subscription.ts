export type SubscriptionTier = 'free' | 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'one-time';
  features: string[];
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  planId: string;
}

// 预定义的订阅计划
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    id: 'free-plan',
    name: '免费版',
    description: '基础能量分析',
    price: 0,
    currency: 'USD',
    interval: 'one-time',
    features: [
      '基础能量报告',
      '每月3次查询',
      '基础水晶推荐'
    ]
  },
  monthly: {
    id: 'monthly-plan',
    name: '月度订阅',
    description: '全面能量分析与建议，按月订阅',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      '高级能量报告',
      '无限查询次数',
      '详细水晶推荐',
      '个性化能量仪式',
      '月度能量预测',
      '优先客户支持'
    ]
  },
  yearly: {
    id: 'yearly-plan',
    name: '年度订阅',
    description: '完整能量解析系统，按年订阅更优惠',
    price: 49.9,
    currency: 'USD',
    interval: 'year',
    features: [
      '专业能量报告',
      '无限查询次数',
      '详细水晶推荐',
      '个性化能量仪式',
      '年度能量走势图',
      '季度能量预测',
      'PDF报告下载',
      '24/7专属客户支持',
      '两个月免费赠送'
    ]
  }
}; 