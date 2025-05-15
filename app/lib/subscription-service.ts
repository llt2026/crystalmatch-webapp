import { SubscriptionTier, SUBSCRIPTION_PLANS } from "../types/subscription";
import { generateMonthlyUserPrompt } from "./monthly_user_energy_prompt_v2";
import { generateAnnualUserPrompt } from "./annual_user_yearly_prompt";

// 定义各种订阅层级的API限制
const TIER_LIMITS = {
  free: {
    requestsPerMonth: 3,
    modelType: "gpt-4.1-mini",
    maxTokens: 1000,
    allowPDF: false,
    allowFullReport: false,
    allowFuturePredictions: false
  },
  monthly: {
    requestsPerMonth: Infinity,
    modelType: "gpt-4.1",
    maxTokens: 2500,
    allowPDF: true,
    allowFullReport: true,
    allowFuturePredictions: true
  },
  yearly: {
    requestsPerMonth: Infinity,
    modelType: "gpt-4o",
    maxTokens: 4500,
    allowPDF: true,
    allowFullReport: true,
    allowFuturePredictions: true
  }
};

/**
 * 获取用户订阅层级的模型类型
 * @param tier 用户订阅层级
 * @returns GPT模型名称
 */
export function getModelForTier(tier: SubscriptionTier): string {
  return TIER_LIMITS[tier].modelType;
}

/**
 * 获取用户订阅层级的最大令牌数
 * @param tier 用户订阅层级
 * @returns 最大令牌数
 */
export function getMaxTokensForTier(tier: SubscriptionTier): number {
  return TIER_LIMITS[tier].maxTokens;
}

/**
 * 检查用户是否可以生成PDF报告
 * @param tier 用户订阅层级
 * @returns 是否可以生成PDF
 */
export function canGeneratePDF(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].allowPDF;
}

/**
 * 检查用户是否可以查看完整报告
 * @param tier 用户订阅层级
 * @returns 是否可以查看完整报告
 */
export function canViewFullReport(tier: SubscriptionTier): boolean {
  return TIER_LIMITS[tier].allowFullReport;
}

/**
 * 检查用户是否还有剩余请求次数
 * @param tier 用户订阅层级
 * @param usedRequests 已使用的请求次数
 * @returns 是否还有剩余请求次数
 */
export function hasRemainingRequests(tier: SubscriptionTier, usedRequests: number): boolean {
  return usedRequests < TIER_LIMITS[tier].requestsPerMonth;
}

/**
 * 获取订阅计划的价格（带货币符号）
 * @param tier 订阅层级
 * @returns 格式化的价格
 */
export function getFormattedPrice(tier: SubscriptionTier): string {
  const plan = SUBSCRIPTION_PLANS[tier];
  if (tier === 'free') return '免费';
  
  return `$${plan.price}/${plan.interval === 'month' ? '月' : '年'}`;
}

/**
 * 生成报告提示词模板（根据订阅层级差异化）
 * @param tier 用户订阅层级
 * @param energyContext 能量上下文数据
 * @returns 适用于不同订阅层级的提示词
 */
export function generatePromptTemplate(tier: SubscriptionTier, energyContext: any): string {
  // 基础提示词（免费版）
  let prompt = `
  ✨ This personalized energy forecast combines:
  - The Five Elements from your Chinese birth chart
  - Your Western Zodiac and elemental alignment
  - Monthly seasonal energy and emotional resonance
  
  Our goal: clarity, alignment, and inner growth.
  
  ---
  
  User constants (DO NOT recalculate):
  • Birthdate: ${new Date(energyContext.birthDate).toLocaleDateString('en-US')}
  • Dominant Element: ${energyContext.dominantElement || energyContext.currentMonth.element}
  • Missing Element: ${energyContext.missingElement || '(None identified)'}
  
  Generate the FREE report body:
  1. One paragraph explaining how the dominant and missing energies shape ${energyContext.currentYear.year}.
  2. One balancing-crystal recommendation (name + 1-sentence benefit).
  3. A 12-month table with columns: Month | Energy Type | Score (0-100). No extra commentary.
  
  ---
  
  📝 Note:
  Each person's core energy is influenced by the yearly and monthly elemental changes.  
  Your energy may rise or dip depending on how these cycles interact with your birth chart.
  
  👉 That's why it's essential to adjust monthly—with the right focus, crystals, and small rituals—to stay balanced and empowered.
  `;
  
  // 月度订阅版 - 使用新的提示词模板
  if (tier === 'monthly') {
    return generateMonthlyUserPrompt(energyContext);
  }
  
  // 年度订阅版 - 使用新的提示词模板
  if (tier === 'yearly') {
    return generateAnnualUserPrompt(energyContext);
  }
  
  return prompt;
} 