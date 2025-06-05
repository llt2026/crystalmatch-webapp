/**
 * 订阅级别定义
 */
export type SubscriptionTier = 'free' | 'plus' | 'pro';

/**
 * 订阅功能配置
 */
export const SUBSCRIPTION_FEATURES = {
  // 五行雷达图 - 所有级别都可用
  fiveElementsRadar: {
    free: true,
    plus: true,
    pro: true,
    description: "Five Elements Radar"
  },
  
  // 优势特质 x 4 - 所有级别都可用
  strengthChips: {
    free: true,
    plus: true,
    pro: true,
    count: 4,
    description: "Strength Traits"
  },
  
  // 劣势特质 x 4 - 所有级别都可用
  weaknessChips: {
    free: true,
    plus: true,
    pro: true,
    count: 4,
    description: "Weakness Traits"
  },
  
  // 补缺水晶 - 不同级别有不同限制
  crystalRecommendation: {
    free: "overall birth chart crystal only",
    plus: "current month's weakest element",
    pro: "all months' weakest elements",
    description: "Crystal Recommendation"
  },
  
  // 12个月能量表 - 免费仅显示当月
  energyCalendar: {
    free: "current month only",
    plus: "all 12 months",
    pro: "all 12 months",
    description: "12-Month Energy Table"
  },
  
  // 12个月水晶表 - 不同级别有不同限制
  crystalCalendar: {
    free: "overall birth chart crystal only",
    plus: "current month visible, future months locked",
    pro: "all months visible",
    description: "12-Month Crystal Table"
  },
  
  // 月度深度报告 - 免费无此功能
  monthlyReport: {
    free: false,
    plus: "current month only",
    pro: "generated on 1st of each month",
    description: "Monthly Detailed Report"
  },
  
  // 月末注意事件 - 免费无此功能
  monthEndAlerts: {
    free: false,
    plus: true,
    pro: true,
    description: "Month-End Reminders"
  },
  
  // 退款窗口
  refundWindow: {
    free: "N/A",
    plus: "Within 14 days",
    pro: "Within 14 days (not after monthly report generation)",
    description: "Refund Window"
  },
  
  // 价格
  price: {
    free: "$0",
    plus: "$4.99/month",
    pro: "$49.99/year",
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
      return 1; // 只显示当前月
    case 'plus':
    case 'pro':
      return 12; // 显示所有12个月
    default:
      return 1;
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
      return 'none'; // 只显示总体水晶推荐，不显示月度水晶
    case 'plus':
      return 'current'; // 只显示当前月
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
    name: 'Free Snapshot',
    price: '$0',
    features: [
      '5-Element Radar Chart',
      '4 Strength & 4 Weakness Traits',
      'Overall Birth Chart Crystal',
      'Current Month Energy Score'
    ],
    limitations: [
      'Only current month visible',
      'No monthly crystal recommendations',
      'No monthly reports',
      'No alerts or reminders'
    ],
    buttonText: 'Current Plan',
    recommended: false
  },
  {
    id: 'plus',
    name: 'Plus Plan',
    price: '$4.99',
    period: 'per month',
    features: [
      'Everything in Free +',
      'Full 12-Month Energy Calendar',
      'Current Month Crystal Recommendation',
      'Detailed Monthly Energy Report',
      'Month-End Reminders & Alerts'
    ],
    limitations: [
      'Future months crystal recommendations locked',
      'Reports generated for current month only'
    ],
    buttonText: 'Subscribe Plus',
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$49.99',
    period: 'per year',
    features: [
      'Everything in Plus +',
      'All 12 Months Crystal Recommendations',
      'Monthly Reports Generated on 1st',
      'Save over 16% compared to monthly'
    ],
    limitations: [
      'Annual commitment'
    ],
    buttonText: 'Subscribe Pro',
    recommended: true
  }
]; 