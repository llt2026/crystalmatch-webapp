"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelForTier = getModelForTier;
exports.getMaxTokensForTier = getMaxTokensForTier;
exports.canGeneratePDF = canGeneratePDF;
exports.canViewFullReport = canViewFullReport;
exports.hasRemainingRequests = hasRemainingRequests;
exports.getFormattedPrice = getFormattedPrice;
exports.generatePromptTemplate = generatePromptTemplate;
const subscription_1 = require("../types/subscription");
// 定义各种订阅层级的API限制
const TIER_LIMITS = {
    free: {
        requestsPerMonth: 3,
        modelType: "gpt-3.5-turbo",
        maxTokens: 1000,
        allowPDF: false,
        allowFullReport: false,
        allowFuturePredictions: false
    },
    monthly: {
        requestsPerMonth: Infinity,
        modelType: "gpt-4.1-nano",
        maxTokens: 2000,
        allowPDF: true,
        allowFullReport: true,
        allowFuturePredictions: true
    },
    yearly: {
        requestsPerMonth: Infinity,
        modelType: "gpt-4.1-nano",
        maxTokens: 4000,
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
function getModelForTier(tier) {
    return TIER_LIMITS[tier].modelType;
}
/**
 * 获取用户订阅层级的最大令牌数
 * @param tier 用户订阅层级
 * @returns 最大令牌数
 */
function getMaxTokensForTier(tier) {
    return TIER_LIMITS[tier].maxTokens;
}
/**
 * 检查用户是否可以生成PDF报告
 * @param tier 用户订阅层级
 * @returns 是否可以生成PDF
 */
function canGeneratePDF(tier) {
    return TIER_LIMITS[tier].allowPDF;
}
/**
 * 检查用户是否可以查看完整报告
 * @param tier 用户订阅层级
 * @returns 是否可以查看完整报告
 */
function canViewFullReport(tier) {
    return TIER_LIMITS[tier].allowFullReport;
}
/**
 * 检查用户是否还有剩余请求次数
 * @param tier 用户订阅层级
 * @param usedRequests 已使用的请求次数
 * @returns 是否还有剩余请求次数
 */
function hasRemainingRequests(tier, usedRequests) {
    return usedRequests < TIER_LIMITS[tier].requestsPerMonth;
}
/**
 * 获取订阅计划的价格（带货币符号）
 * @param tier 订阅层级
 * @returns 格式化的价格
 */
function getFormattedPrice(tier) {
    const plan = subscription_1.SUBSCRIPTION_PLANS[tier];
    if (tier === 'free')
        return '免费';
    return `$${plan.price}/${plan.interval === 'month' ? '月' : '年'}`;
}
/**
 * 生成报告提示词模板（根据订阅层级差异化）
 * @param tier 用户订阅层级
 * @param energyContext 能量上下文数据
 * @returns 适用于不同订阅层级的提示词
 */
function generatePromptTemplate(tier, energyContext) {
    // 基础提示词（免费版）
    let prompt = `
  我需要为一位用户生成一份个性化的能量报告。请基于以下信息生成具体的分析和建议：
  
  用户出生信息：
  - 八字：年柱 ${energyContext.bazi.yearPillar}，月柱 ${energyContext.bazi.monthPillar}，日柱 ${energyContext.bazi.dayPillar}
  
  当前能量信息：
  - 当前年柱：${energyContext.currentYear.pillar}（${energyContext.currentYear.zodiac}年）
  - 当前月能量：${energyContext.currentMonth.pillar}
  - 主导元素：${energyContext.currentMonth.element}
  - 能量类型：${energyContext.currentMonth.energyType}
  
  请生成以下内容：
  1. 整体能量分析（100字以内）
  2. 本月能量建议（2-3条简短建议）
  
  全部内容请用简体中文回答，务必确保简洁明了。
  `;
    // 月度订阅版
    if (tier === 'monthly') {
        prompt = `
    我需要为一位用户生成一份个性化的能量报告。请基于以下信息生成具体的分析和建议：
    
    用户出生信息：
    - 八字：年柱 ${energyContext.bazi.yearPillar}，月柱 ${energyContext.bazi.monthPillar}，日柱 ${energyContext.bazi.dayPillar}
    
    当前能量信息：
    - 当前年柱：${energyContext.currentYear.pillar}（${energyContext.currentYear.zodiac}年）
    - 当前月能量：${energyContext.currentMonth.pillar}
    - 主导元素：${energyContext.currentMonth.element}
    - 能量类型：${energyContext.currentMonth.energyType}
    - 时段：${energyContext.currentMonth.start} 至 ${energyContext.currentMonth.end}
    
    请生成以下内容：
    1. 整体能量分析（200字以内）
    2. 本月能量建议（3-5条简短建议）
    3. 个人能量提升方法（3条）
    4. 推荐的日常能量仪式（2个简单实用的方法）
    
    全部内容请用简体中文回答，务必确保简洁明了，重点突出，实用性强。
    `;
    }
    // 年度订阅版
    if (tier === 'yearly') {
        prompt = `
    我需要为一位年度高级会员生成一份详尽的个性化能量报告。请基于以下信息生成全面的分析和建议：
    
    用户出生信息：
    - 八字：年柱 ${energyContext.bazi.yearPillar}，月柱 ${energyContext.bazi.monthPillar}，日柱 ${energyContext.bazi.dayPillar}
    
    当前能量信息：
    - 当前年柱：${energyContext.currentYear.pillar}（${energyContext.currentYear.zodiac}年）
    - 当前月能量：${energyContext.currentMonth.pillar}
    - 主导元素：${energyContext.currentMonth.element}
    - 能量类型：${energyContext.currentMonth.energyType}
    - 时段：${energyContext.currentMonth.start} 至 ${energyContext.currentMonth.end}
    
    请生成以下内容：
    1. 全面能量分析（300字左右，包含八字与当前能量的互动关系）
    2. 本月能量走势及关键日期（包含3个关键日期及其能量特点）
    3. 个人能量优势与弱点分析（各2-3点）
    4. 本季度能量趋势预测（100字左右）
    5. 个人能量平衡与提升建议（4-5条具体方法）
    6. 推荐能量仪式（3个详细的仪式，包含步骤）
    7. 适合的水晶与能量物品推荐（3-4种，附带具体使用方法）
    
    全部内容请用简体中文回答，务必确保专业、详细、个性化，并具有很强的实用性和可操作性。
    `;
    }
    return prompt;
}
