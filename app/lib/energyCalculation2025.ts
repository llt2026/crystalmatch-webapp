/**
 * 2025新模型能量计算模块
 * 基于月相、节气和时辰变化计算五行能量变化
 */

import { Lunar, Solar } from 'lunar-javascript';
import { DiZhi, TianGan, getHiddenGanFiveElements } from './diZhiHiddenGan';
import { CRYSTAL_MAP } from './crystalMappings';

// 定义五行元素类型
export type Elem = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 五行向量类型定义
export interface FiveElementVector {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// 能量日历项目类型
export interface EnergyCalendarItem {
  month: string;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal: string;
  lowestElement?: Elem;
}

/**
 * 创建空的五行向量
 */
export function createEmptyVector(): FiveElementVector {
  return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
}

/**
 * 获取指定日期的八字信息
 * @param date 日期对象
 * @returns 八字干支信息
 */
export function getBaziFromDate(date: Date): {
  year: [TianGan, DiZhi],
  month: [TianGan, DiZhi],
  day: [TianGan, DiZhi],
  hour: [TianGan, DiZhi]
} {
  const solar = Solar.fromDate(date);
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

/**
 * 将天干映射到五行元素
 * @param gan 天干
 * @returns 对应的五行元素及权重1.0
 */
export function getTianGanElement(gan: TianGan): Record<Elem, number> {
  const result: Record<Elem, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  switch(gan) {
    case '甲':
    case '乙':
      result.wood = 1.0;
      break;
    case '丙':
    case '丁':
      result.fire = 1.0;
      break;
    case '戊':
    case '己':
      result.earth = 1.0;
      break;
    case '庚':
    case '辛':
      result.metal = 1.0;
      break;
    case '壬':
    case '癸':
      result.water = 1.0;
      break;
  }
  
  return result;
}

/**
 * 计算干支组合的五行向量，包含地支藏干
 * @param gan 天干
 * @param zhi 地支
 * @returns 五行向量
 */
export function getGanZhiFiveElements(gan: TianGan, zhi: DiZhi): FiveElementVector {
  // 天干五行，权重50%
  const ganElements = getTianGanElement(gan);
  
  // 地支本气五行，权重20%
  const zhiMainElement: Record<Elem, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  switch(zhi) {
    case '寅':
    case '卯':
      zhiMainElement.wood = 1.0;
      break;
    case '巳':
    case '午':
      zhiMainElement.fire = 1.0;
      break;
    case '丑':
    case '辰':
    case '未':
    case '戌':
      zhiMainElement.earth = 1.0;
      break;
    case '申':
    case '酉':
      zhiMainElement.metal = 1.0;
      break;
    case '子':
    case '亥':
      zhiMainElement.water = 1.0;
      break;
  }
  
  // 地支藏干五行，权重30%
  const hiddenElements = getHiddenGanFiveElements(zhi);
  
  // 合并三者，返回总的五行向量
  return {
    wood: ganElements.wood * 0.5 + zhiMainElement.wood * 0.2 + hiddenElements.wood * 0.3,
    fire: ganElements.fire * 0.5 + zhiMainElement.fire * 0.2 + hiddenElements.fire * 0.3,
    earth: ganElements.earth * 0.5 + zhiMainElement.earth * 0.2 + hiddenElements.earth * 0.3,
    metal: ganElements.metal * 0.5 + zhiMainElement.metal * 0.2 + hiddenElements.metal * 0.3,
    water: ganElements.water * 0.5 + zhiMainElement.water * 0.2 + hiddenElements.water * 0.3
  };
}

/**
 * 标准化五行向量为比例（总和为1）
 * @param vector 五行向量
 * @returns 标准化后的向量
 */
export function normalizeVector(vector: FiveElementVector): FiveElementVector {
  const total = vector.wood + vector.fire + vector.earth + vector.metal + vector.water;
  
  if (total === 0) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  return {
    wood: vector.wood / total,
    fire: vector.fire / total,
    earth: vector.earth / total,
    metal: vector.metal / total,
    water: vector.water / total
  };
}

/**
 * 应用权重到五行向量
 * @param vector 五行向量
 * @param weight 权重
 * @returns 应用权重后的向量
 */
export function applyWeight(vector: FiveElementVector, weight: number): FiveElementVector {
  return {
    wood: vector.wood * weight,
    fire: vector.fire * weight,
    earth: vector.earth * weight,
    metal: vector.metal * weight,
    water: vector.water * weight
  };
}

/**
 * 将五行向量缩放到指定总和
 * @param vector 五行向量
 * @param targetSum 目标总和
 * @returns 缩放后的向量
 */
export function scaleVectorToSum(vector: FiveElementVector, targetSum: number): FiveElementVector {
  const normalized = normalizeVector(vector);
  
  return {
    wood: normalized.wood * targetSum,
    fire: normalized.fire * targetSum,
    earth: normalized.earth * targetSum,
    metal: normalized.metal * targetSum,
    water: normalized.water * targetSum
  };
}

/**
 * 计算五行偏差（与理想值的总偏差）
 * @param vector 五行向量（总和为8）
 * @returns 偏差总和
 */
export function calculateDeviation(vector: FiveElementVector): number {
  // 理想值：8 / 5 = 1.6
  const ideal = 1.6;
  
  return Math.abs(vector.wood - ideal) +
         Math.abs(vector.fire - ideal) +
         Math.abs(vector.earth - ideal) +
         Math.abs(vector.metal - ideal) +
         Math.abs(vector.water - ideal);
}

/**
 * 计算五行能量得分（0-100）
 * @param vector 五行向量
 * @returns 能量得分
 */
export function calculateEnergyScore(vector: FiveElementVector): number {
  const deviation = calculateDeviation(vector);
  
  // 分数 = 100 - (偏差和 / 12.8 * 100)
  const score = 100 - (deviation / 12.8 * 100);
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 计算基础八字五行向量
 * @param birthDate 出生日期（YYYY-MM-DD格式）
 * @returns 基础八字五行向量
 */
export function getBaseBaziVector(birthDate: string): FiveElementVector {
  const birthDateObj = new Date(birthDate);
  const bazi = getBaziFromDate(birthDateObj);
  
  // 获取年月日时柱的五行向量
  const yearVector = getGanZhiFiveElements(bazi.year[0], bazi.year[1]);
  const monthVector = getGanZhiFiveElements(bazi.month[0], bazi.month[1]);
  const dayVector = getGanZhiFiveElements(bazi.day[0], bazi.day[1]);
  const hourVector = getGanZhiFiveElements(bazi.hour[0], bazi.hour[1]);
  
  // 计算总和
  const total = {
    wood: yearVector.wood + monthVector.wood + dayVector.wood + hourVector.wood,
    fire: yearVector.fire + monthVector.fire + dayVector.fire + hourVector.fire,
    earth: yearVector.earth + monthVector.earth + dayVector.earth + hourVector.earth,
    metal: yearVector.metal + monthVector.metal + dayVector.metal + hourVector.metal,
    water: yearVector.water + monthVector.water + dayVector.water + hourVector.water
  };
  
  // 标准化为总和为1
  return normalizeVector(total);
}

/**
 * 计算月能量值
 * @param baseBazi 基础八字五行向量（已标准化为总和为1）
 * @param date 日期对象
 * @returns 月能量向量和分数
 */
export function calculateMonthEnergy(baseBazi: FiveElementVector, date: Date): {
  vector: FiveElementVector,
  score: number,
  diff: number
} {
  // 获取日期的八字信息
  const bazi = getBaziFromDate(date);
  
  // 获取流年五行向量
  const flowYearVector = getGanZhiFiveElements(bazi.year[0], bazi.year[1]);
  const yearNormalized = normalizeVector(flowYearVector);
  
  // 获取流月五行向量
  const flowMonthVector = getGanZhiFiveElements(bazi.month[0], bazi.month[1]);
  const monthNormalized = normalizeVector(flowMonthVector);
  
  // 权重配置: 八字60% + 流年15% + 流月25%
  const combined = {
    wood: baseBazi.wood * 0.6 + yearNormalized.wood * 0.15 + monthNormalized.wood * 0.25,
    fire: baseBazi.fire * 0.6 + yearNormalized.fire * 0.15 + monthNormalized.fire * 0.25,
    earth: baseBazi.earth * 0.6 + yearNormalized.earth * 0.15 + monthNormalized.earth * 0.25,
    metal: baseBazi.metal * 0.6 + yearNormalized.metal * 0.15 + monthNormalized.metal * 0.25,
    water: baseBazi.water * 0.6 + yearNormalized.water * 0.15 + monthNormalized.water * 0.25
  };
  
  // 缩放到总和为8
  const scaledVector = scaleVectorToSum(combined, 8);
  
  // 计算月能量分数
  const score = calculateEnergyScore(scaledVector);
  
  // 计算基础八字分数
  const baseVector = scaleVectorToSum(baseBazi, 8); 
  const baseScore = calculateEnergyScore(baseVector);
  
  // 计算分数差异
  const diff = score - baseScore;
  
  return {
    vector: scaledVector,
    score,
    diff
  };
}

/**
 * 计算日能量值
 * @param baseBazi 基础八字五行向量（已标准化为总和为1）
 * @param date 日期对象
 * @returns 日能量向量和分数
 */
export function calculateDayEnergy(baseBazi: FiveElementVector, date: Date): {
  vector: FiveElementVector,
  score: number,
  diff: number
} {
  // 获取日期的八字信息
  const bazi = getBaziFromDate(date);
  
  // 获取并标准化流年、流月、流日五行向量
  const flowYearVector = normalizeVector(getGanZhiFiveElements(bazi.year[0], bazi.year[1]));
  const flowMonthVector = normalizeVector(getGanZhiFiveElements(bazi.month[0], bazi.month[1]));
  const flowDayVector = normalizeVector(getGanZhiFiveElements(bazi.day[0], bazi.day[1]));
  
  // 权重配置: 八字60% + 流年15% + 流月15% + 流日10%
  const combined = {
    wood: baseBazi.wood * 0.6 + flowYearVector.wood * 0.15 + flowMonthVector.wood * 0.15 + flowDayVector.wood * 0.1,
    fire: baseBazi.fire * 0.6 + flowYearVector.fire * 0.15 + flowMonthVector.fire * 0.15 + flowDayVector.fire * 0.1,
    earth: baseBazi.earth * 0.6 + flowYearVector.earth * 0.15 + flowMonthVector.earth * 0.15 + flowDayVector.earth * 0.1,
    metal: baseBazi.metal * 0.6 + flowYearVector.metal * 0.15 + flowMonthVector.metal * 0.15 + flowDayVector.metal * 0.1,
    water: baseBazi.water * 0.6 + flowYearVector.water * 0.15 + flowMonthVector.water * 0.15 + flowDayVector.water * 0.1
  };
  
  // 缩放到总和为8
  const scaledVector = scaleVectorToSum(combined, 8);
  
  // 计算日能量分数
  const score = calculateEnergyScore(scaledVector);
  
  // 计算基础八字分数
  const baseVector = scaleVectorToSum(baseBazi, 8); 
  const baseScore = calculateEnergyScore(baseVector);
  
  // 计算分数差异
  const diff = score - baseScore;
  
  return {
    vector: scaledVector,
    score,
    diff
  };
}

/**
 * 计算小时能量值
 * @param baseBazi 基础八字五行向量（已标准化为总和为1）
 * @param date 日期对象
 * @returns 小时能量向量和分数
 */
export function calculateHourEnergy(baseBazi: FiveElementVector, date: Date): {
  vector: FiveElementVector,
  score: number,
  diff: number
} {
  // 获取日期的八字信息
  const bazi = getBaziFromDate(date);
  
  // 获取并标准化流年、流月、流日、流时五行向量
  const flowYearVector = normalizeVector(getGanZhiFiveElements(bazi.year[0], bazi.year[1]));
  const flowMonthVector = normalizeVector(getGanZhiFiveElements(bazi.month[0], bazi.month[1]));
  const flowDayVector = normalizeVector(getGanZhiFiveElements(bazi.day[0], bazi.day[1]));
  const flowHourVector = normalizeVector(getGanZhiFiveElements(bazi.hour[0], bazi.hour[1]));
  
  // 权重配置: 八字60% + 流年15% + 流月10% + 流日10% + 流时5%
  const combined = {
    wood: baseBazi.wood * 0.6 + flowYearVector.wood * 0.15 + flowMonthVector.wood * 0.1 + flowDayVector.wood * 0.1 + flowHourVector.wood * 0.05,
    fire: baseBazi.fire * 0.6 + flowYearVector.fire * 0.15 + flowMonthVector.fire * 0.1 + flowDayVector.fire * 0.1 + flowHourVector.fire * 0.05,
    earth: baseBazi.earth * 0.6 + flowYearVector.earth * 0.15 + flowMonthVector.earth * 0.1 + flowDayVector.earth * 0.1 + flowHourVector.earth * 0.05,
    metal: baseBazi.metal * 0.6 + flowYearVector.metal * 0.15 + flowMonthVector.metal * 0.1 + flowDayVector.metal * 0.1 + flowHourVector.metal * 0.05,
    water: baseBazi.water * 0.6 + flowYearVector.water * 0.15 + flowMonthVector.water * 0.1 + flowDayVector.water * 0.1 + flowHourVector.water * 0.05
  };
  
  // 缩放到总和为8
  const scaledVector = scaleVectorToSum(combined, 8);
  
  // 计算小时能量分数
  const score = calculateEnergyScore(scaledVector);
  
  // 计算基础八字分数
  const baseVector = scaleVectorToSum(baseBazi, 8); 
  const baseScore = calculateEnergyScore(baseVector);
  
  // 计算分数差异
  const diff = score - baseScore;
  
  return {
    vector: scaledVector,
    score,
    diff
  };
}

/**
 * 缩放能量差异值到合理范围
 * @param diff 原始差异值
 * @returns 缩放后的差异值
 */
export function scaleDiff(diff: number): number {
  if (!Number.isFinite(diff)) return 0;
  
  // 保留小数点后一位
  const rounded = Math.round(diff * 10) / 10;
  
  // 限制在 -10 到 10 的范围内
  return Math.max(-10, Math.min(10, rounded));
}

/**
 * 判断能量变化趋势
 * @param energyChange 能量变化值
 * @returns 趋势: up | down | stable
 */
export function determineTrend(energyChange: number): 'up' | 'down' | 'stable' {
  if (energyChange >= 2) return 'up';
  if (energyChange <= -2) return 'down';
  return 'stable';
}

/**
 * 计算能量日历（基于节气变化）
 * @param birthDate 出生日期（YYYY-MM-DD格式）
 * @returns 能量日历数据
 */
export async function calculateEnergyCalendar(birthDate: string): Promise<EnergyCalendarItem[]> {
  // 计算基础八字五行向量
  const baseBazi = getBaseBaziVector(birthDate);
  
  // 存储每月节气段的能量变化
  const calendarData: EnergyCalendarItem[] = [];
  
  // 获取当前日期
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  
  // 存储前一个月柱
  let prevMonthPillar = '';
  let prevMonthScore = 0; // 存储上个月的能量分数，用于计算环比
  
  // 需要生成的节气段数量 - 确保显示12个
  const segments = 12;
  let segmentCount = 0;
  
  // 临时存储当前节气段
  let currentSegment: {
    startDate: Date;
    endDate: Date;
    monthPillar: string;
    score: number;
    energyChange: number;
    trend: 'up' | 'down' | 'stable';
    lowestElement: Elem;
    crystal: string;
  } | null = null;
  
  // 向后搜索360天以确保捕获所有12个节气
  for (let day = 0; day < 360 && segmentCount < segments; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    date.setHours(12, 0, 0, 0);
    
    // 获取日期的八字信息
    const bazi = getBaziFromDate(date);
    const monthPillar = `${bazi.month[0]}${bazi.month[1]}`;
    
    // 检测是否是新的节气段
    const isNewSegment = day === 0 || monthPillar !== prevMonthPillar;
    
    // 如果当前有节气段并且检测到新节气，则完成当前段
    if (isNewSegment && currentSegment) {
      currentSegment.endDate = new Date(date);
      currentSegment.endDate.setDate(currentSegment.endDate.getDate() - 1);
      
      // 格式化日期标签
      const startMonth = currentSegment.startDate.getMonth() + 1;
      const startDay = currentSegment.startDate.getDate();
      const endMonth = currentSegment.endDate.getMonth() + 1;
      const endDay = currentSegment.endDate.getDate();
      const startYear = currentSegment.startDate.getFullYear();
      const endYear = currentSegment.endDate.getFullYear();
      const label = `${startMonth}/${startDay}/${startYear}` +
        (startMonth !== endMonth || startDay !== endDay || startYear !== endYear
          ? ` - ${endMonth}/${endDay}/${endYear}`
          : '');
      
      // 添加到结果数组
      calendarData.push({
        month: label,
        energyChange: currentSegment.energyChange,
        trend: currentSegment.trend,
        crystal: currentSegment.crystal,
        lowestElement: currentSegment.lowestElement
      });
      
      segmentCount++;
      prevMonthScore = currentSegment.score;
    }
    
    // 开始新节气段
    if (isNewSegment) {
      // 计算月能量
      const monthEnergy = calculateMonthEnergy(baseBazi, date);
      const currentScore = monthEnergy.score;
      
      // 计算环比变化（与上个月相比的百分比变化）
      let energyChange = 0;
      if (prevMonthScore > 0 && segmentCount > 0) {
        energyChange = (currentScore - prevMonthScore) / prevMonthScore * 100;
        // 缩放到合理范围，限制在 -20 到 20 之间
        energyChange = Math.max(-20, Math.min(20, energyChange));
        // 精确到小数点后一位
        energyChange = Math.round(energyChange * 10) / 10;
      } else if (segmentCount === 0) {
        // 第一个月，与基础八字分数比较
        const baseVector = scaleVectorToSum(baseBazi, 8); 
        const baseScore = calculateEnergyScore(baseVector);
        energyChange = (currentScore - baseScore) / baseScore * 100;
        energyChange = Math.max(-20, Math.min(20, energyChange));
        energyChange = Math.round(energyChange * 10) / 10;
      }
      
      // 确定趋势
      const trend = energyChange > 2 ? 'up' : (energyChange < -2 ? 'down' : 'stable');
      
      // 查找最弱五行元素
      const vector = monthEnergy.vector;
      let lowestElement: Elem = 'water';
      let lowestValue = Infinity;
      
      (['wood', 'fire', 'earth', 'metal', 'water'] as Elem[]).forEach(elem => {
        if (vector[elem] < lowestValue) {
          lowestValue = vector[elem];
          lowestElement = elem;
        }
      });
      
      // 获取对应水晶
      const crystal = CRYSTAL_MAP[lowestElement];
      
      // 创建新节气段
      currentSegment = {
        startDate: new Date(date),
        endDate: new Date(date),
        monthPillar,
        score: currentScore,
        energyChange,
        trend,
        lowestElement,
        crystal
      };
    }
    
    prevMonthPillar = monthPillar;
  }
  
  // 处理最后一个节气段
  if (currentSegment && segmentCount < segments) {
    const startMonth = currentSegment.startDate.getMonth() + 1;
    const startDay = currentSegment.startDate.getDate();
    // 假设结束日期是30天后
    const endDate = new Date(currentSegment.startDate);
    endDate.setDate(endDate.getDate() + 30);
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();
    const startYear = currentSegment.startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const label = `${startMonth}/${startDay}/${startYear}` +
      (startMonth !== endMonth || startDay !== endDay || startYear !== endYear
        ? ` - ${endMonth}/${endDay}/${endYear}`
        : '');
    
    calendarData.push({
      month: label,
      energyChange: currentSegment.energyChange,
      trend: currentSegment.trend,
      crystal: currentSegment.crystal,
      lowestElement: currentSegment.lowestElement
    });
    
    segmentCount++;
    prevMonthScore = currentSegment.score;
  }
  
  // 如果收集的节气段不足12个，用预测值填充
  while (calendarData.length < segments) {
    // 获取最后一个节气段的结束日期
    const lastSegment = calendarData[calendarData.length - 1];
    const lastLabel = lastSegment.month.split(' - ')[1] || lastSegment.month;
    const [lastMonth, lastDay] = lastLabel.split('/').map(Number);
    
    // 计算下一个月的开始日期
    const nextStartDate = new Date(now.getFullYear(), lastMonth - 1, lastDay);
    nextStartDate.setDate(nextStartDate.getDate() + 1);
    
    // 计算下一个月的结束日期（约30天后）
    const nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextStartDate.getDate() + 30);
    
    // 格式化日期标签
    const startMonth = nextStartDate.getMonth() + 1;
    const startDay = nextStartDate.getDate();
    const endMonth = nextEndDate.getMonth() + 1;
    const endDay = nextEndDate.getDate();
    const startYear = nextStartDate.getFullYear();
    const endYear = nextEndDate.getFullYear();
    const label = `${startMonth}/${startDay}/${startYear}` +
      (startMonth !== endMonth || startDay !== endDay || startYear !== endYear
        ? ` - ${endMonth}/${endDay}/${endYear}`
        : '');
    
    // 生成一个随机能量变化（-5%到+5%之间）
    const randomChange = Math.round((Math.random() * 10 - 5) * 10) / 10;
    const trend = randomChange > 2 ? 'up' : (randomChange < -2 ? 'down' : 'stable');
    
    // 用模拟值填充
    calendarData.push({
      month: label,
      energyChange: randomChange,
      trend: trend,
      crystal: CRYSTAL_MAP.water // 默认水晶
    });
    
    segmentCount++;
  }
  
  return calendarData;
}

/**
 * 计算指定日期范围内的每日能量变化
 * @param birthDate 出生日期（YYYY-MM-DD格式）
 * @param startDate 开始日期
 * @param days 天数
 * @returns 每日能量变化数组
 */
export async function getDailyEnergyForRange(
  birthDate: string, 
  startDate: Date, 
  days: number
): Promise<Array<{date: Date, score: number, energyChange: number, trend: 'up' | 'down' | 'stable', element?: Elem, crystal?: string}>> {
  // 计算基础八字向量
  const baseBazi = getBaseBaziVector(birthDate);
  
  // 存储结果
  const result: Array<{date: Date, score: number, energyChange: number, trend: 'up' | 'down' | 'stable', element?: Elem, crystal?: string}> = [];
  
  // 水晶映射
  const CRYSTAL_MAP: Record<Elem, string> = {
    wood: 'Green Aventurine',
    fire: 'Carnelian',
    earth: 'Tiger\'s Eye',
    metal: 'Clear Quartz',
    water: 'Amethyst'
  };
  
  // 计算每一天的能量变化
  let prevScore: number | null = null;
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    date.setHours(12, 0, 0, 0); // 设为中午12点
    
    // 计算日能量
    const dayEnergy = calculateDayEnergy(baseBazi, date);
    
    // 缩放差异值
    const score = dayEnergy.score;
    const energyChange = prevScore === null ? 0 : score - prevScore;
    const trend = determineTrend(energyChange);
    prevScore = score;
    
    // 确定日期对应的元素 - 基于日柱
    const dayBazi = getBaziFromDate(date);
    const dayGan = dayBazi.day[0];
    const dayZhi = dayBazi.day[1];
    
    // 找出最弱的元素（最小值）
    const fiveElements = getGanZhiFiveElements(dayGan, dayZhi);
    let lowestElement: Elem = 'water';
    let lowestValue = Infinity;
    
    (['wood', 'fire', 'earth', 'metal', 'water'] as Elem[]).forEach(elem => {
      if (fiveElements[elem] < lowestValue) {
        lowestValue = fiveElements[elem];
        lowestElement = elem;
      }
    });
    
    result.push({
      date: new Date(date),
      score: dayEnergy.score,
      energyChange,
      trend,
      element: lowestElement,
      crystal: CRYSTAL_MAP[lowestElement]
    });
  }
  
  return result;
}

/**
 * 获取指定日期的24小时能量热力图数据
 * @param birthDate 出生日期（YYYY-MM-DD格式）
 * @param date 指定日期
 * @returns 24小时能量变化数据
 */
export async function getHourlyEnergyHeatmap(
  birthDate: string,
  date: Date
): Promise<Array<{hour: number, score: number, energyChange: number, trend: 'up' | 'down' | 'stable'}>> {
  // 计算基础八字向量
  const baseBazi = getBaseBaziVector(birthDate);
  
  // 存储结果
  const result: Array<{hour: number, score: number, energyChange: number, trend: 'up' | 'down' | 'stable'}> = [];
  
  // 计算每个小时的能量变化
  for (let hour = 0; hour < 24; hour++) {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    
    // 计算小时能量
    const hourlyEnergy = calculateHourEnergy(baseBazi, dateTime);
    
    // 缩放差异值
    const score = hourlyEnergy.score;
    const energyChange = score - 50;
    const trend = determineTrend(energyChange);
    
    result.push({
      hour,
      score: hourlyEnergy.score,
      energyChange,
      trend
    });
  }
  
  return result;
}

/**
 * Calculate section-specific energy scores
 * @param vector Five element vector 
 * @returns Object with scores for each life aspect
 */
export function calculateSectionScores(vector: FiveElementVector): {
  finance: number;  // Money Flow
  social: number;   // Social Vibes
  mood: number;     // Mood Balance
  health: number;   // Body Fuel
  growth: number;   // Growth Track
} {
  // Calculate base energy score from 0-100
  const baseScore = calculateEnergyScore(vector);
  
  // Calculate section scores based on element combinations
  // Finance (Money): Metal & Earth primarily
  const financeScore = Math.round(
    baseScore * 0.4 + 
    ((vector.metal * 0.35) + (vector.earth * 0.25) + (vector.water * 0.2) + (vector.wood * 0.15) + (vector.fire * 0.05)) * 20
  );
  
  // Social (Relationships): Fire & Earth primarily
  const socialScore = Math.round(
    baseScore * 0.4 + 
    ((vector.fire * 0.35) + (vector.earth * 0.25) + (vector.wood * 0.2) + (vector.water * 0.15) + (vector.metal * 0.05)) * 20
  );
  
  // Mood (Emotional Balance): Water & Fire primarily
  const moodScore = Math.round(
    baseScore * 0.4 + 
    ((vector.water * 0.35) + (vector.fire * 0.25) + (vector.earth * 0.2) + (vector.metal * 0.15) + (vector.wood * 0.05)) * 20
  );
  
  // Health (Physical Energy): Wood & Water primarily
  const healthScore = Math.round(
    baseScore * 0.4 + 
    ((vector.wood * 0.35) + (vector.water * 0.25) + (vector.fire * 0.2) + (vector.earth * 0.15) + (vector.metal * 0.05)) * 20
  );
  
  // Growth (Personal Development): Wood & Fire primarily
  const growthScore = Math.round(
    baseScore * 0.4 + 
    ((vector.wood * 0.35) + (vector.fire * 0.25) + (vector.metal * 0.2) + (vector.earth * 0.15) + (vector.water * 0.05)) * 20
  );
  
  // Ensure all scores are between 0-100
  return {
    finance: Math.max(0, Math.min(100, financeScore)),
    social: Math.max(0, Math.min(100, socialScore)),
    mood: Math.max(0, Math.min(100, moodScore)),
    health: Math.max(0, Math.min(100, healthScore)),
    growth: Math.max(0, Math.min(100, growthScore))
  };
} 