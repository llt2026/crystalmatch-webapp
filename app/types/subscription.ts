export type SubscriptionTier = 'free' | 'plus' | 'pro';

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
    name: 'FREE',
    description: 'Basic Energy Analysis',
    price: 0,
    currency: 'USD',
    interval: 'one-time',
    features: [
      'Basic Energy Report',
      '3 Queries Per Month',
      'Basic Crystal Recommendations'
    ]
  },
  plus: {
    id: 'plus-plan',
    name: 'PLUS',
    description: 'Comprehensive Energy Analysis & Recommendations',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Advanced Energy Report',
      'Unlimited Queries',
      'Detailed Crystal Recommendations',
      'Personalized Energy Rituals',
      'Monthly Energy Forecast',
      'Priority Customer Support'
    ]
  },
  pro: {
    id: 'pro-plan',
    name: 'PRO',
    description: 'Complete Energy Analysis System with Premium Benefits',
    price: 49.9,
    currency: 'USD',
    interval: 'year',
    features: [
      'Professional Energy Report',
      'Unlimited Queries',
      'Detailed Crystal Recommendations',
      'Personalized Energy Rituals',
      'Annual Energy Trend Chart',
      'Quarterly Energy Forecasts',
      'PDF Report Download',
      '24/7 Dedicated Customer Support',
      'Two Months Free'
    ]
  }
}; 