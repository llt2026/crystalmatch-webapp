/**
 * 能量值计算模块（2025新模型）
 * 实现月能量值、日能量值、小时能量值的计算
 */

import { Lunar, Solar } from 'lunar-javascript';
import { DiZhi, TianGan, getHiddenGanFiveElements } from './diZhiHiddenGan';

// 五行类型
export type FiveElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 五行向量类型
export interface FiveElementVector {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// 创建空的五行向量
export function createEmptyFiveElementVector(): FiveElementVector {
  return {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
}

// 标准化五行向量（总和为1）
export function normalizeFiveElementVector(vector: FiveElementVector): FiveElementVector {
  const total = vector.wood + vector.fire + vector.earth + vector.metal + vector.water;
  
  // 防止除以0
  if (total === 0) {
    return createEmptyFiveElementVector();
  }
  
  return {
    wood: vector.wood / total,
    fire: vector.fire / total,
    earth: vector.earth / total,
    metal: vector.metal / total,
    water: vector.water / total
  };
}

// 天干映射到五行
export function getTianGanElement(gan: TianGan): FiveElement {
  const ganToElement: Record<TianGan, FiveElement> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  
  return ganToElement[gan];
}

// 天干的五行向量（单一五行为1，其他为0）
export function getTianGanFiveElementVector(gan: TianGan): FiveElementVector {
  const vector = createEmptyFiveElementVector();
  const element = getTianGanElement(gan);
  
  if (element) {
    vector[element] = 1;
  }
  
  return vector;
}

// 地支的五行向量（考虑藏干权重）
export function getDiZhiFiveElementVector(zhi: DiZhi): FiveElementVector {
  // 直接使用之前创建的地支藏干五行函数
  return getHiddenGanFiveElements(zhi);
}

// 干支组合的五行向量
export function getGanZhiFiveElementVector(gan: TianGan, zhi: DiZhi): FiveElementVector {
  const ganVector = getTianGanFiveElementVector(gan);
  const zhiVector = getDiZhiFiveElementVector(zhi);
  
  // 天干地支权重配比 - 天干:地支 = 5:5
  return {
    wood: ganVector.wood * 0.5 + zhiVector.wood * 0.5,
    fire: ganVector.fire * 0.5 + zhiVector.fire * 0.5,
    earth: ganVector.earth * 0.5 + zhiVector.earth * 0.5,
    metal: ganVector.metal * 0.5 + zhiVector.metal * 0.5,
    water: ganVector.water * 0.5 + zhiVector.water * 0.5
  };
}

// 应用权重到五行向量
export function applyWeightToVector(vector: FiveElementVector, weight: number): FiveElementVector {
  return {
    wood: vector.wood * weight,
    fire: vector.fire * weight,
    earth: vector.earth * weight,
    metal: vector.metal * weight,
    water: vector.water * weight
  };
}

// 合并多个五行向量
export function combineFiveElementVectors(vectors: FiveElementVector[]): FiveElementVector {
  return vectors.reduce((acc, vector) => {
    return {
      wood: acc.wood + vector.wood,
      fire: acc.fire + vector.fire,
      earth: acc.earth + vector.earth,
      metal: acc.metal + vector.metal,
      water: acc.water + vector.water
    };
  }, createEmptyFiveElementVector());
}

// 缩放五行向量使总和为指定值
export function scaleFiveElementVector(vector: FiveElementVector, targetSum: number): FiveElementVector {
  const normalized = normalizeFiveElementVector(vector);
  
  return {
    wood: normalized.wood * targetSum,
    fire: normalized.fire * targetSum,
    earth: normalized.earth * targetSum,
    metal: normalized.metal * targetSum,
    water: normalized.water * targetSum
  };
}

// 计算五行偏差值（与理想值1.6的总偏差）
export function calculateFiveElementDeviation(vector: FiveElementVector): number {
  const idealValue = 1.6; // 理想每个五行值为1.6
  
  return Math.abs(vector.wood - idealValue) +
         Math.abs(vector.fire - idealValue) +
         Math.abs(vector.earth - idealValue) +
         Math.abs(vector.metal - idealValue) +
         Math.abs(vector.water - idealValue);
}

// 计算五行能量得分（0-100分）
export function calculateFiveElementScore(vector: FiveElementVector): number {
  const deviation = calculateFiveElementDeviation(vector);
  const score = 100 - (deviation * 12.5);
  
  // 确保分数在0-100范围内
  return Math.max(0, Math.min(100, score));
}

// 缩放差异值到合理范围
export function scaleDiff(raw: number): number {
  // 防止NaN
  if (!Number.isFinite(raw)) {
    console.warn('scaleDiff: raw is not a number:', raw);
    return 0;
  }

  // 先缩放，避免分差过大
  let valRaw: number;
  const absRaw = Math.abs(raw);
  if (absRaw <= 10) valRaw = raw;        // 小差异不缩放
  else if (absRaw <= 20) valRaw = raw / 1.5; // 中等差异缩小
  else valRaw = raw / 2;                   // 大差异减半

  let val = Math.round(valRaw * 10) / 10; // 保留1位小数
  
  // 如果绝对值小于1但不为0，则强制设为±1
  if (Math.abs(val) < 1 && val !== 0) val = val > 0 ? 1 : -1;
  
  // 限制在-15到15之间，而不是-25到25
  if (val > 15) val = 15;
  if (val < -15) val = -15;
  
  // 再次检查NaN
  if (!Number.isFinite(val)) {
    return 0;
  }
  return val;
}

/**
 * 计算月能量值
 * @param baseEightChar 基础八字（年月日时的天干地支）
 * @param flowYear 流年干支
 * @param flowMonth 当月干支
 * @returns 月能量五行向量和分数
 */
export function calculateMonthEnergy(
  baseEightChar: { year: [TianGan, DiZhi], month: [TianGan, DiZhi], day: [TianGan, DiZhi], hour: [TianGan, DiZhi] },
  flowYear: [TianGan, DiZhi],
  flowMonth: [TianGan, DiZhi]
): { vector: FiveElementVector, score: number } {
  // 获取基础八字的五行向量
  const yearVector = getGanZhiFiveElementVector(baseEightChar.year[0], baseEightChar.year[1]);
  const monthVector = getGanZhiFiveElementVector(baseEightChar.month[0], baseEightChar.month[1]);
  const dayVector = getGanZhiFiveElementVector(baseEightChar.day[0], baseEightChar.day[1]);
  const hourVector = getGanZhiFiveElementVector(baseEightChar.hour[0], baseEightChar.hour[1]);
  
  // 基础八字合并（均等权重）
  const baseVector = combineFiveElementVectors([
    applyWeightToVector(yearVector, 0.25),
    applyWeightToVector(monthVector, 0.25),
    applyWeightToVector(dayVector, 0.25),
    applyWeightToVector(hourVector, 0.25)
  ]);
  
  // 获取流年和流月的五行向量
  const flowYearVector = getGanZhiFiveElementVector(flowYear[0], flowYear[1]);
  const flowMonthVector = getGanZhiFiveElementVector(flowMonth[0], flowMonth[1]);
  
  // 权重分配: 八字60% + 流年15% + 流月25%
  const weightedVectors = [
    applyWeightToVector(baseVector, 0.6),
    applyWeightToVector(flowYearVector, 0.15),
    applyWeightToVector(flowMonthVector, 0.25)
  ];
  
  // 合并所有向量
  const combinedVector = combineFiveElementVectors(weightedVectors);
  
  // 缩放到总和为8
  const scaledVector = scaleFiveElementVector(combinedVector, 8);
  
  // 计算得分
  const score = calculateFiveElementScore(scaledVector);
  
  return { vector: scaledVector, score };
}

/**
 * 计算日能量值
 * @param baseEightChar 基础八字（年月日时的天干地支）
 * @param flowYear 流年干支
 * @param flowMonth 流月干支
 * @param flowDay 当日干支
 * @returns 日能量五行向量和分数
 */
export function calculateDayEnergy(
  baseEightChar: { year: [TianGan, DiZhi], month: [TianGan, DiZhi], day: [TianGan, DiZhi], hour: [TianGan, DiZhi] },
  flowYear: [TianGan, DiZhi],
  flowMonth: [TianGan, DiZhi],
  flowDay: [TianGan, DiZhi]
): { vector: FiveElementVector, score: number } {
  // 获取基础八字的五行向量
  const yearVector = getGanZhiFiveElementVector(baseEightChar.year[0], baseEightChar.year[1]);
  const monthVector = getGanZhiFiveElementVector(baseEightChar.month[0], baseEightChar.month[1]);
  const dayVector = getGanZhiFiveElementVector(baseEightChar.day[0], baseEightChar.day[1]);
  const hourVector = getGanZhiFiveElementVector(baseEightChar.hour[0], baseEightChar.hour[1]);
  
  // 基础八字合并（均等权重）
  const baseVector = combineFiveElementVectors([
    applyWeightToVector(yearVector, 0.25),
    applyWeightToVector(monthVector, 0.25),
    applyWeightToVector(dayVector, 0.25),
    applyWeightToVector(hourVector, 0.25)
  ]);
  
  // 获取流年、流月和流日的五行向量
  const flowYearVector = getGanZhiFiveElementVector(flowYear[0], flowYear[1]);
  const flowMonthVector = getGanZhiFiveElementVector(flowMonth[0], flowMonth[1]);
  const flowDayVector = getGanZhiFiveElementVector(flowDay[0], flowDay[1]);
  
  // 权重分配: 八字60% + 流年15% + 流月15% + 流日10%
  const weightedVectors = [
    applyWeightToVector(baseVector, 0.6),
    applyWeightToVector(flowYearVector, 0.15),
    applyWeightToVector(flowMonthVector, 0.15),
    applyWeightToVector(flowDayVector, 0.1)
  ];
  
  // 合并所有向量
  const combinedVector = combineFiveElementVectors(weightedVectors);
  
  // 缩放到总和为8
  const scaledVector = scaleFiveElementVector(combinedVector, 8);
  
  // 计算得分
  const score = calculateFiveElementScore(scaledVector);
  
  return { vector: scaledVector, score };
}

/**
 * 计算小时能量值
 * @param baseEightChar 基础八字（年月日时的天干地支）
 * @param flowYear 流年干支
 * @param flowMonth 流月干支
 * @param flowDay 流日干支
 * @param flowHour 当时干支
 * @returns 小时能量五行向量和分数
 */
export function calculateHourEnergy(
  baseEightChar: { year: [TianGan, DiZhi], month: [TianGan, DiZhi], day: [TianGan, DiZhi], hour: [TianGan, DiZhi] },
  flowYear: [TianGan, DiZhi],
  flowMonth: [TianGan, DiZhi],
  flowDay: [TianGan, DiZhi],
  flowHour: [TianGan, DiZhi]
): { vector: FiveElementVector, score: number } {
  // 获取基础八字的五行向量
  const yearVector = getGanZhiFiveElementVector(baseEightChar.year[0], baseEightChar.year[1]);
  const monthVector = getGanZhiFiveElementVector(baseEightChar.month[0], baseEightChar.month[1]);
  const dayVector = getGanZhiFiveElementVector(baseEightChar.day[0], baseEightChar.day[1]);
  const hourVector = getGanZhiFiveElementVector(baseEightChar.hour[0], baseEightChar.hour[1]);
  
  // 基础八字合并（均等权重）
  const baseVector = combineFiveElementVectors([
    applyWeightToVector(yearVector, 0.25),
    applyWeightToVector(monthVector, 0.25),
    applyWeightToVector(dayVector, 0.25),
    applyWeightToVector(hourVector, 0.25)
  ]);
  
  // 获取流年、流月、流日和流时的五行向量
  const flowYearVector = getGanZhiFiveElementVector(flowYear[0], flowYear[1]);
  const flowMonthVector = getGanZhiFiveElementVector(flowMonth[0], flowMonth[1]);
  const flowDayVector = getGanZhiFiveElementVector(flowDay[0], flowDay[1]);
  const flowHourVector = getGanZhiFiveElementVector(flowHour[0], flowHour[1]);
  
  // 权重分配: 八字60% + 流年15% + 流月10% + 流日10% + 流时5%
  const weightedVectors = [
    applyWeightToVector(baseVector, 0.6),
    applyWeightToVector(flowYearVector, 0.15),
    applyWeightToVector(flowMonthVector, 0.1),
    applyWeightToVector(flowDayVector, 0.1),
    applyWeightToVector(flowHourVector, 0.05)
  ];
  
  // 合并所有向量
  const combinedVector = combineFiveElementVectors(weightedVectors);
  
  // 缩放到总和为8
  const scaledVector = scaleFiveElementVector(combinedVector, 8);
  
  // 计算得分
  const score = calculateFiveElementScore(scaledVector);
  
  return { vector: scaledVector, score };
}

/**
 * 获取指定日期的八字干支
 * @param date 日期对象
 * @returns 八字干支
 */
export function getEightCharFromDate(date: Date): {
  year: [TianGan, DiZhi],
  month: [TianGan, DiZhi],
  day: [TianGan, DiZhi],
  hour: [TianGan, DiZhi]
} {
  // 创建Solar对象
  const solar = Solar.fromDate(date);
  // 转换为Lunar对象
  const lunar = Lunar.fromSolar(solar);
  
  // 获取年柱
  const yearPillar = lunar.getYearInGanZhi();
  const yearGan = yearPillar[0] as TianGan;
  const yearZhi = yearPillar[1] as DiZhi;
  
  // 获取月柱
  const monthPillar = lunar.getMonthInGanZhi();
  const monthGan = monthPillar[0] as TianGan;
  const monthZhi = monthPillar[1] as DiZhi;
  
  // 获取日柱
  const dayPillar = lunar.getDayInGanZhi();
  const dayGan = dayPillar[0] as TianGan;
  const dayZhi = dayPillar[1] as DiZhi;
  
  // 获取时柱
  const hourPillar = lunar.getTimeInGanZhi();
  const hourGan = hourPillar[0] as TianGan;
  const hourZhi = hourPillar[1] as DiZhi;
  
  return {
    year: [yearGan, yearZhi],
    month: [monthGan, monthZhi],
    day: [dayGan, dayZhi],
    hour: [hourGan, hourZhi]
  };
} 