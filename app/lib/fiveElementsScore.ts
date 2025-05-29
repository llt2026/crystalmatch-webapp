/**
 * 五行元素分数计算模块
 * 基于元素的均衡偏差计算五行分数
 */

import { FIVE_ELEMENT_MAPPINGS, getMoonPhaseVector, getSeasonVector } from './fiveElementsEnergy';

// 定义五行类型
export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type ElementValues = Record<ElementType, number>;

/**
 * 计算五行元素均衡分数
 * @param elements 五行元素出现次数对象或数组
 * @param totalCount 可选，指定总数量，若不指定则自动计算
 * @returns 0-100之间的均衡分数
 */
export function calculateElementsScore(
  elements: ElementValues | number[],
  totalCount?: number
): number {
  // 将输入转换为数组形式
  const elementsArray = Array.isArray(elements)
    ? elements
    : Object.values(elements);

  // 确保有5个元素值
  if (elementsArray.length !== 5) {
    throw new Error('必须提供5个五行元素的数值');
  }

  // 计算总数量（如果未指定）
  const total = totalCount || elementsArray.reduce((sum, val) => sum + val, 0);
  
  // 理想均衡值：总数除以5
  const idealValue = total / 5;
  
  // 计算总偏差：每个元素与理想值的差的绝对值之和
  const totalDeviation = elementsArray.reduce(
    (sum, val) => sum + Math.abs(val - idealValue),
    0
  );
  
  // 计算最大可能偏差
  // 最大偏差出现在：一个元素占据所有格子，其他元素为0
  // 公式：4个元素的理想值之和 + |总数-理想值|
  const maxDeviation = 4 * idealValue + Math.abs(total - idealValue);
  
  // 计算分数：100 - (总偏差/最大偏差)*100，确保不小于0
  const score = 100 - (totalDeviation / maxDeviation) * 100;
  
  // 返回不小于0的分数
  return Math.max(0, score);
}

/**
 * 计算单个月份的五行能量变化
 * @param currentElements 当前月五行分布
 * @param baseElements 基础八字五行分布
 * @returns 能量变化指数 (-25 到 25之间)
 */
export function calculateEnergyChange(
  currentElements: ElementValues | number[],
  baseElements: ElementValues | number[]
): number {
  // 计算当前月和基础八字的分数
  const currentScore = calculateElementsScore(currentElements);
  const baseScore = calculateElementsScore(baseElements);
  
  // 计算分数差异，并映射到-25到25的范围
  const rawDiff = currentScore - baseScore;
  
  // 将差异映射到-25到25的范围
  // 最大理论差异是100分，我们将它压缩到25
  const scaledChange = Math.round(rawDiff / 4);
  
  // 确保在-25到25的范围内
  return Math.max(-25, Math.min(25, scaledChange));
}

/**
 * 决定能量变化趋势
 * @param energyChange 能量变化值
 * @returns 趋势：'up'|'down'|'stable'
 */
export function determineTrend(energyChange: number): 'up' | 'down' | 'stable' {
  if (energyChange >= 3) {
    return 'up';
  } else if (energyChange <= -3) {
    return 'down';
  } else {
    return 'stable';
  }
}

/**
 * 完整示例：计算一个月的能量状态
 * @param current 当前月五行分布
 * @param base 基础八字五行分布
 * @returns 包含分数、变化和趋势的完整结果
 */
export function calculateMonthlyElementEnergy(
  current: ElementValues,
  base: ElementValues
) {
  const currentScore = calculateElementsScore(current);
  const baseScore = calculateElementsScore(base);
  const energyChange = calculateEnergyChange(current, base);
  const trend = determineTrend(energyChange);
  
  return {
    currentScore,
    baseScore,
    energyChange,
    trend,
    detail: {
      current,
      base
    }
  };
}

/**
 * 示例：如何使用这个函数
 */
function example() {
  // 示例1：均衡的五行 [2,1.5,1.6,1.7,1.2]
  const example1 = [2, 1.5, 1.6, 1.7, 1.2];
  const score1 = calculateElementsScore(example1);
  console.log(`示例1分数: ${score1.toFixed(2)}`); // 约92.19分
  
  // 示例2：极端不均衡 [8,0,0,0,0]
  const example2 = [8, 0, 0, 0, 0];
  const score2 = calculateElementsScore(example2);
  console.log(`示例2分数: ${score2.toFixed(2)}`); // 应为0分
  
  // 示例3：使用对象形式
  const example3: ElementValues = {
    wood: 2,
    fire: 1.5,
    earth: 1.6,
    metal: 1.7,
    water: 1.2
  };
  const score3 = calculateElementsScore(example3);
  console.log(`示例3分数: ${score3.toFixed(2)}`); // 约92.19分
  
  // 示例4：测试能量变化
  const base = {
    wood: 1.6,
    fire: 1.6, 
    earth: 1.6,
    metal: 1.6,
    water: 1.6
  };
  const current = {
    wood: 2.5,
    fire: 3,
    earth: 1,
    metal: 1,
    water: 0.5
  };
  const energy = calculateMonthlyElementEnergy(current, base);
  console.log(`能量变化: ${energy.energyChange}, 趋势: ${energy.trend}`);
}

// 导出用于测试的示例函数
export { example as testElementScores };

/**
 * 考虑月相和日照因素后计算五行均衡分数
 * @param baseElements 基础五行元素分布
 * @param moonPhase 月相位置(0-1)
 * @param sunlight 日照强度(0-1)
 * @param totalCount 可选，指定总数量
 * @returns 考虑外部因素后的五行均衡分数(0-100)
 */
export function calculateExtendedElementsScore(
  baseElements: ElementValues | number[],
  moonPhase: number = 0,
  sunlight: number = 0,
  totalCount?: number
): number {
  // 将输入转换为对象形式(如果是数组)
  const elementsObj: ElementValues = Array.isArray(baseElements)
    ? {
        wood: baseElements[0],
        fire: baseElements[1],
        earth: baseElements[2],
        metal: baseElements[3],
        water: baseElements[4]
      }
    : {...baseElements};

  // 添加月相和日照影响的五行修正值
  const moonPhaseInfluence = getMoonPhaseInfluence(moonPhase);
  const seasonInfluence = getSeasonInfluence(sunlight);
  
  // 直接添加影响值，不需要额外的缩放因子
  elementsObj.wood += moonPhaseInfluence.wood + seasonInfluence.wood;
  elementsObj.fire += moonPhaseInfluence.fire + seasonInfluence.fire;
  elementsObj.earth += moonPhaseInfluence.earth + seasonInfluence.earth;
  elementsObj.metal += moonPhaseInfluence.metal + seasonInfluence.metal;
  elementsObj.water += moonPhaseInfluence.water + seasonInfluence.water;
  
  // 确保没有负值
  Object.keys(elementsObj).forEach(key => {
    const elem = key as ElementType;
    elementsObj[elem] = Math.max(0, elementsObj[elem]);
  });
  
  // 使用基础计算函数计算调整后的分数
  return calculateElementsScore(elementsObj, totalCount);
}

/**
 * 获取月相影响向量
 * @param moonPhase 月相位置(0-1)
 * @returns 五行影响向量
 */
function getMoonPhaseInfluence(moonPhase: number): ElementValues {
  // 确定月相阶段
  let phaseKey: keyof typeof FIVE_ELEMENT_MAPPINGS.moonPhase;
  
  if (moonPhase < 0.125) phaseKey = 'newMoon';
  else if (moonPhase < 0.25) phaseKey = 'waxingCrescent';
  else if (moonPhase < 0.375) phaseKey = 'firstQuarter';
  else if (moonPhase < 0.5) phaseKey = 'waxingGibbous';
  else if (moonPhase < 0.625) phaseKey = 'fullMoon';
  else if (moonPhase < 0.75) phaseKey = 'waningGibbous';
  else if (moonPhase < 0.875) phaseKey = 'lastQuarter';
  else phaseKey = 'waningCrescent';
  
  // 直接返回映射表中的值，不再额外缩放
  return { ...FIVE_ELEMENT_MAPPINGS.moonPhase[phaseKey] };
}

/**
 * 获取季节/日照影响向量
 * @param sunlight 日照强度(0-1)
 * @returns 五行影响向量
 */
function getSeasonInfluence(sunlight: number): ElementValues {
  // 根据日照强度确定季节
  let seasonKey: keyof typeof FIVE_ELEMENT_MAPPINGS.season;
  
  if (sunlight < 0.2) seasonKey = 'winter';
  else if (sunlight < 0.4) seasonKey = 'spring';
  else if (sunlight < 0.6) seasonKey = 'summer';
  else if (sunlight < 0.8) seasonKey = 'lateSummer';
  else seasonKey = 'autumn';
  
  // 直接返回映射表中的值，不再额外缩放
  return { ...FIVE_ELEMENT_MAPPINGS.season[seasonKey] };
} 