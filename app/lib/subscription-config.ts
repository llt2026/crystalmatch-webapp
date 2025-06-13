/**
 * 订阅级别定义
 */
export type SubscriptionTier = 'free' | 'plus' | 'pro';

/**
 * 订阅功能配置
 */
export const SUBSCRIPTION_FEATURES = {
  // 五行能量密码 - 所有级别都可用
  fiveElementsCode: {
    free: true,
    plus: true,
    pro: true,
    description: "Five Elements Energy Code"
  },
  
  // 人生优缺点分析 - 所有级别都可用
  personalityAnalysis: {
    free: true,
    plus: true,
    pro: true,
    description: "Personality Strengths & Weaknesses"
  },
  
  // 水晶推荐 - 不同级别有不同限制
  crystalRecommendation: {
    free: "current year only",
    plus: "all 12 months",
    pro: "all 12 months",
    description: "Crystal Recommendations"
  },
  
  // 12个月能量变化 - 免费用户也可以看到
  monthlyEnergyChanges: {
    free: true,
    plus: true,
    pro: true,
    description: "12-Month Energy Changes"
  },
  
  // 月度深度报告 - 免费无此功能
  monthlyReport: {
    free: false,
    plus: true,
    pro: true,
    description: "Monthly Detailed Reports"
  },
  
  // 每日能量分数和水晶推荐 - Plus及以上
  dailyEnergyScore: {
    free: false,
    plus: true,
    pro: true,
    description: "Daily Energy Scores & Crystal Tips"
  },
  
  // 月能量分 - Plus及以上
  monthlyEnergyScore: {
    free: false,
    plus: true,
    pro: true,
    description: "Monthly Energy Scores"
  },
  
  // 5大板块能量报告 - Plus及以上
  fiveAspectReports: {
    free: false,
    plus: true,
    pro: true,
    description: "5-Aspect Energy Reports (Money, Social, Mood, Body, Growth)"
  },
  
  // 幸运色推荐 - 仅Pro用户
  luckyColors: {
    free: false,
    plus: false,
    pro: true,
    description: "12-Month Lucky Colors"
  },
  
  // 能量提醒频率
  energyReminders: {
    free: false,
    plus: "daily reminders",
    pro: "hourly notifications",
    description: "Energy Reminders & Notifications"
  },
  
  // 价格
  price: {
    free: "$0",
    plus: "$4.99/month",
    pro: "$9.99/month",
    description: "Pricing"
  }
};

/**
 * 检查用户是否可以访问指定功能
 * @param feature 功能名称
 * @param tier 用户订阅级别
 * @returns 是否可访问
 */
export function canAccessFeature(
  feature: keyof typeof SUBSCRIPTION_FEATURES, 
  tier: SubscriptionTier
): boolean {
  const featureConfig = SUBSCRIPTION_FEATURES[feature];
  return !!featureConfig[tier];
}

/**
 * 获取用户在Energy Calendar中可见的月份数量
 * @param tier 用户订阅级别
 * @returns 可见月份数量
 */
export function getVisibleEnergyMonths(tier: SubscriptionTier): number {
  switch (tier) {
    case 'free':
    case 'plus':
    case 'pro':
      return 12; // 所有用户都可以看到12个月能量变化
    default:
      return 12;
  }
}

/**
 * 获取用户在Crystal Calendar中可见的月份数量
 * @param tier 用户订阅级别
 * @returns 可见月份数量或特殊规则
 */
export function getVisibleCrystalMonths(tier: SubscriptionTier): number | 'current' | 'none' {
  switch (tier) {
    case 'free':
      return 'current'; // 只显示当年水晶推荐
    case 'plus':
    case 'pro':
      return 12; // 显示所有12个月
    default:
      return 'none';
  }
}

/**
 * 订阅类型价格和功能比较
 */
export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free Explorer',
    price: '$0',
    period: 'forever',
    features: [
      'Five Elements Energy Code',
      'Personality Strengths & Weaknesses',
      'Current Year Crystal Recommendation',
      '12-Month Energy Changes Overview'
    ],
    limitations: [
      'No daily energy scores',
      'No monthly reports',
      'No personalized reminders',
      'Limited crystal recommendations'
    ],
    buttonText: 'Get Started Free',
    recommended: false,
    gradient: 'from-gray-600 to-gray-800'
  },
  {
    id: 'plus',
    name: 'Plus Insider',
    price: '$4.99',
    period: 'per month',
    features: [
      'Everything in Free +',
      'All 12-Month Crystal Recommendations',
      'Monthly Detailed Energy Reports',
      'Daily Energy Scores & Crystal Tips',
      '5-Aspect Reports (Money, Social, Mood, Body, Growth)',
      'Daily Energy Reminders'
    ],
    limitations: [
      'No lucky color recommendations',
      'No hourly notifications'
    ],
    buttonText: 'Start Plus Plan',
    recommended: true,
    gradient: 'from-purple-600 to-indigo-700'
  },
  {
    id: 'pro',
    name: 'Pro Master',
    price: '$9.99',
    period: 'per month',
    features: [
      'Everything in Plus +',
      '12-Month Lucky Colors',
      'Hourly Energy Notifications',
      'Priority Customer Support',
      'Advanced Energy Insights'
    ],
    limitations: [],
    buttonText: 'Unlock Pro Features',
    recommended: false,
    gradient: 'from-yellow-500 to-orange-600'
  }
]; 