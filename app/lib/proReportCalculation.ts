/**
 * Pro报告能量计算模块
 * 实现Pro报告Energy Overview的计算逻辑
 */

import { FiveElementVector } from './energyCalculation2025';
import { calculateMonthEnergy } from './energyCalculation2025';

// 元素到显示名称和模式的映射
const elementDisplayInfo: Record<string, { name: string; mode: string; emoji: string }> = {
  wood: { name: 'Wood', mode: 'Growth Mode', emoji: '✨' },
  fire: { name: 'Fire', mode: 'Passion Mode', emoji: '🔥' },
  earth: { name: 'Earth', mode: 'Stability Mode', emoji: '⚖️' },
  metal: { name: 'Metal', mode: 'Clarity Mode', emoji: '✨' },
  water: { name: 'Water', mode: 'Fluid Mode', emoji: '💧' }
};

/**
 * 计算Pro报告的Energy Overview得分
 * 基于用户订阅日期第二天的月能量值
 * 
 * @param birthDate 用户出生日期
 * @param subscriptionDate 订阅日期
 * @param baseBazi 用户基础八字五行向量
 * @returns 计算后的能量得分和相关信息
 */
export function calculateProReportEnergy(
  subscriptionDate: Date,
  baseBazi: FiveElementVector
): {
  score: number;
  dominantElement: string;
  weakestElement: string;
  energyMode: string;
  energyEmoji: string;
} {
  // 计算订阅日期的第二天
  const nextDay = new Date(subscriptionDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // 计算月能量值
  const monthEnergyResult = calculateMonthEnergy(baseBazi, nextDay);
  
  // 四舍五入能量分数
  const score = Math.round(monthEnergyResult.score);
  
  // 分析五行分布，确定最强和最弱元素
  const elementVector = monthEnergyResult.vector;
  const dominantElement = getDominantElement(elementVector);
  const weakestElement = getWeakestElement(elementVector);
  
  // 根据主导元素确定能量模式
  const energyInfo = elementDisplayInfo[dominantElement] || elementDisplayInfo.earth;
  
  return {
    score,
    dominantElement: energyInfo.name,
    weakestElement: elementDisplayInfo[weakestElement]?.name || 'Earth',
    energyMode: energyInfo.mode,
    energyEmoji: energyInfo.emoji
  };
}

/**
 * 获取五行向量中最强的元素
 * @param vector 五行向量
 * @returns 最强元素名称
 */
function getDominantElement(vector: FiveElementVector): string {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
  let max = -1;
  let dominant = 'wood';
  
  elements.forEach(elem => {
    if (vector[elem as keyof FiveElementVector] > max) {
      max = vector[elem as keyof FiveElementVector];
      dominant = elem;
    }
  });
  
  return dominant;
}

/**
 * 获取五行向量中最弱的元素
 * @param vector 五行向量
 * @returns 最弱元素名称
 */
function getWeakestElement(vector: FiveElementVector): string {
  const elements = ['wood', 'fire', 'earth', 'metal', 'water'];
  let min = Infinity;
  let weakest = 'fire';
  
  elements.forEach(elem => {
    if (vector[elem as keyof FiveElementVector] < min) {
      min = vector[elem as keyof FiveElementVector];
      weakest = elem;
    }
  });
  
  return weakest;
} 