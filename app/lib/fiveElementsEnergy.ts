/**
 * 五行能量计算模块
 * 提供统一的五行能量映射和计算逻辑
 */

import { format, addMonths } from 'date-fns';
import SunCalc from 'suncalc';
import { Solar } from 'lunar-javascript';
import { getBaziFromLunar } from './getBaziFromLunar';
import { calculateElementsScore } from './fiveElementsScore';
import { CRYSTAL_MAP } from './crystalMappings';

// 添加suncalc模块声明
declare module 'suncalc';

// 定义五行元素类型
export type Elem = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type FiveElementVector = Record<Elem, number>;

/**
 * 五行能量影响映射表 - 统一配置
 * 所有值已按比例压缩到±1范围内
 */
export const FIVE_ELEMENT_MAPPINGS = {
  // 月相影响映射
  moonPhase: {
    // 新月 (0-0.125)
    newMoon: { wood: 0.5, fire: -0.5, earth: 0, metal: -0.5, water: 1 },
    // 蜡月初期 (0.125-0.25)
    waxingCrescent: { wood: 1, fire: 0, earth: 0, metal: -0.5, water: 0.5 },
    // 上弦月 (0.25-0.375)
    firstQuarter: { wood: 1, fire: 0.5, earth: 0, metal: -0.5, water: 0 },
    // 盈凸月 (0.375-0.5)
    waxingGibbous: { wood: 0.5, fire: 1, earth: 0.5, metal: 0, water: -0.5 },
    // 满月 (0.5-0.625)
    fullMoon: { wood: 0, fire: 1, earth: 0.5, metal: 0.5, water: -0.5 },
    // 亏凸月 (0.625-0.75)
    waningGibbous: { wood: -0.5, fire: 0.5, earth: 1, metal: 0.5, water: 0 },
    // 下弦月 (0.75-0.875)
    lastQuarter: { wood: -0.5, fire: 0, earth: 0.5, metal: 1, water: 0 },
    // 残月 (0.875-1)
    waningCrescent: { wood: -0.5, fire: -0.5, earth: 0, metal: 0.5, water: 1 }
  },
  
  // 季节/节气影响映射
  season: {
    // 春季 (2-4月)
    spring: { wood: 1, fire: 0.33, earth: 0, metal: -0.33, water: 0 },
    // 夏季 (5-7月)
    summer: { wood: 0, fire: 1, earth: 0.33, metal: -0.33, water: -0.33 },
    // 长夏 (8月)
    lateSummer: { wood: 0, fire: 0.33, earth: 1, metal: 0, water: -0.33 },
    // 秋季 (9-11月)
    autumn: { wood: -0.33, fire: -0.33, earth: 0, metal: 1, water: 0.33 },
    // 冬季 (12-1月)
    winter: { wood: 0.33, fire: -0.67, earth: -0.33, metal: 0, water: 1 }
  },
  
  // 日照时段影响映射
  dayTime: {
    // 日出前 (5-7点)
    dawn: { wood: 1, fire: 0, earth: 0, metal: 0, water: 0.5 },
    // 上午 (7-11点)
    morning: { wood: 0.5, fire: 1, earth: 0, metal: 0, water: 0 },
    // 正午 (11-13点)
    noon: { wood: 0, fire: 1, earth: 0.5, metal: 0, water: -0.5 },
    // 下午 (13-17点)
    afternoon: { wood: 0, fire: 0.5, earth: 1, metal: 0.5, water: 0 },
    // 日落 (17-19点)
    dusk: { wood: -0.5, fire: 0, earth: 0.5, metal: 1, water: 0 },
    // 夜晚 (19-23点)
    evening: { wood: 0, fire: -0.5, earth: 0, metal: 0.5, water: 1 },
    // 深夜 (23-3点)
    midnight: { wood: 0, fire: -1, earth: 0, metal: 0, water: 1 },
    // 凌晨 (3-5点)
    predawn: { wood: 0.5, fire: -0.5, earth: 0, metal: -0.5, water: 0.5 }
  }
};

// 缓存月度能量向量计算结果
const monthlyEnergyCache = new Map<string, FiveElementVector>();

/**
 * 获取月相影响向量
 * @param moonPhase 月相位置(0-1)
 * @returns 五行影响向量
 */
export function getMoonPhaseInfluence(moonPhase: number): FiveElementVector {
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
export function getSeasonInfluence(sunlight: number): FiveElementVector {
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

/**
 * 生成趋势描述文本
 */
function generateTrendMessage(trend: 'up' | 'down' | 'stable', diffValue: number): string {
  switch (trend) {
    case 'up':
      return `Your overall energy is rising this month, with all elements increasing by ${Math.abs(diffValue).toFixed(1)} points.`;
    case 'down':
      return `Your overall energy is decreasing this month, with all elements dropping by ${Math.abs(diffValue).toFixed(1)} points.`;
    default:
      return `Your five elements energy remains relatively stable this month.`;
  }
}

/**
 * 确定趋势方向
 * @param energyChange 能量变化值
 * @returns 趋势类型
 */
function determineTrend(energyChange: number): 'up' | 'down' | 'stable' {
  if (energyChange >= 3) return 'up';
  if (energyChange <= -3) return 'down';
  return 'stable';
}

/**
 * 获取月相五行影响向量
 * @param date 日期时间
 * @returns 五行影响向量
 */
export function getMoonPhaseVector(date: Date): FiveElementVector {
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const moonPhase = moonIllumination.phase;
  
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
  
  // 返回对应影响向量
  return { ...FIVE_ELEMENT_MAPPINGS.moonPhase[phaseKey] };
}

/**
 * 获取季节五行影响向量
 * @param date 日期时间
 * @returns 五行影响向量
 */
export function getSeasonVector(date: Date): FiveElementVector {
  const month = date.getMonth() + 1; // 转为1-12月表示
  
  // 确定季节
  let seasonKey: keyof typeof FIVE_ELEMENT_MAPPINGS.season;
  
  if (month >= 2 && month <= 4) seasonKey = 'spring';
  else if (month >= 5 && month <= 7) seasonKey = 'summer';
  else if (month === 8) seasonKey = 'lateSummer';
  else if (month >= 9 && month <= 11) seasonKey = 'autumn';
  else seasonKey = 'winter'; // 12,1月
  
  // 返回对应影响向量
  return { ...FIVE_ELEMENT_MAPPINGS.season[seasonKey] };
}

/**
 * 获取日照时段五行影响向量
 * @param date 日期时间
 * @returns 五行影响向量
 */
export function getDayTimeVector(date: Date): FiveElementVector {
  const hour = date.getHours();
  
  // 确定日照时段
  let timeKey: keyof typeof FIVE_ELEMENT_MAPPINGS.dayTime;
  
  if (hour >= 5 && hour < 7) timeKey = 'dawn';
  else if (hour >= 7 && hour < 11) timeKey = 'morning';
  else if (hour >= 11 && hour < 13) timeKey = 'noon';
  else if (hour >= 13 && hour < 17) timeKey = 'afternoon';
  else if (hour >= 17 && hour < 19) timeKey = 'dusk';
  else if (hour >= 19 && hour < 23) timeKey = 'evening';
  else if (hour >= 23 || hour < 3) timeKey = 'midnight';
  else timeKey = 'predawn'; // 3-5点
  
  // 返回对应影响向量
  return { ...FIVE_ELEMENT_MAPPINGS.dayTime[timeKey] };
}

/**
 * 获取当前时间点的综合五行影响向量
 * @param date 日期时间对象
 * @returns 五行能量向量
 */
export function getCelestialEnergyVectorAt(date: Date): FiveElementVector {
  // 获取月相影响
  const moonPhaseVector = getMoonPhaseVector(date);
  
  // 获取节气影响
  const seasonVector = getSeasonVector(date);
  
  // 获取日照时段影响
  const dayTimeVector = getDayTimeVector(date);
  
  // 合并三个向量，得到综合影响
  return {
    wood: moonPhaseVector.wood + seasonVector.wood + dayTimeVector.wood,
    fire: moonPhaseVector.fire + seasonVector.fire + dayTimeVector.fire,
    earth: moonPhaseVector.earth + seasonVector.earth + dayTimeVector.earth,
    metal: moonPhaseVector.metal + seasonVector.metal + dayTimeVector.metal,
    water: moonPhaseVector.water + seasonVector.water + dayTimeVector.water
  };
}

/**
 * 获取月度五行能量向量（使用5点采样）
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 五行能量向量Promise
 */
export async function getMonthlyEnergyVector(year: number, month: number): Promise<FiveElementVector> {
  const cacheKey = `${year}-${month}`;
  
  // 检查缓存
  if (monthlyEnergyCache.has(cacheKey)) {
    return monthlyEnergyCache.get(cacheKey)!;
  }
  
  // 获取该月的天数
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 选择5个采样点（1号、8号、15号、22号和月末）
  const sampleDays = [1, 8, 15, 22, daysInMonth];
  
  // 计算采样点的能量向量
  const vectors = await Promise.all(sampleDays.map(async day => {
    const sampleDate = new Date(year, month - 1, day, 12, 0, 0);
    
    // 获取月相影响
    const moonVector = getMoonPhaseVector(sampleDate);
    
    // 获取节气影响
    const seasonVector = getSeasonVector(sampleDate);
    
    // 合并向量
    return {
      wood: moonVector.wood + seasonVector.wood,
      fire: moonVector.fire + seasonVector.fire,
      earth: moonVector.earth + seasonVector.earth,
      metal: moonVector.metal + seasonVector.metal,
      water: moonVector.water + seasonVector.water
    };
  }));
  
  // 计算平均向量
  const result: FiveElementVector = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // 计算平均值
  vectors.forEach(vector => {
    result.wood += vector.wood / vectors.length;
    result.fire += vector.fire / vectors.length;
    result.earth += vector.earth / vectors.length;
    result.metal += vector.metal / vectors.length;
    result.water += vector.water / vectors.length;
  });
  
  // 四舍五入到整数
  const roundedResult: FiveElementVector = {
    wood: Math.round(result.wood),
    fire: Math.round(result.fire),
    earth: Math.round(result.earth),
    metal: Math.round(result.metal),
    water: Math.round(result.water)
  };
  
  // 缓存结果
  monthlyEnergyCache.set(cacheKey, roundedResult);
  
  return roundedResult;
}

/**
 * 将八字结果转换为五行向量
 * @param baziResult 八字结果对象
 * @returns 五行能量向量
 */
export function convertBaziToFiveElementVector(baziResult: any): FiveElementVector {
  // 初始化五行计数
  const counts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  // 计数所有五行
  if (baziResult && baziResult.fiveElements) {
    ['year', 'month', 'day'].forEach(pillar => {
      if (baziResult.fiveElements[pillar]) {
        baziResult.fiveElements[pillar].forEach((element: string) => {
          const elemKey = element.toLowerCase() as Elem;
          if (elemKey in counts) {
            counts[elemKey]++;
          }
        });
      }
    });
  }
  
  // 理想值（以8个字符平均分布）
  const ideal = 8 / 5; // 五行平均应该各有1.6个
  
  // 计算得分（与理想分布的接近程度）
  const vector: FiveElementVector = {
    wood: calculateScore(counts.wood, ideal),
    fire: calculateScore(counts.fire, ideal),
    earth: calculateScore(counts.earth, ideal),
    metal: calculateScore(counts.metal, ideal),
    water: calculateScore(counts.water, ideal)
  };
  
  return vector;
}

/**
 * 计算五行得分
 * @param count 元素计数
 * @param ideal 理想计数
 * @returns 0-100之间的分数
 */
function calculateScore(count: number, ideal: number): number {
  // 分数计算公式: 100 * (1 - |actual - ideal| / ideal)
  const score = 100 * (1 - Math.abs(count - ideal) / ideal);
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * 根据五行向量计算平衡评分
 * @param vector 五行能量向量
 * @returns 0-100之间的平衡分数
 */
export function scoreFiveElementBalance(vector: FiveElementVector): number {
  // 计算向量总值
  const totalValue = vector.wood + vector.fire + vector.earth + vector.metal + vector.water;
  
  // 避免除以 0 或负值导致 NaN/Infinity
  if (totalValue <= 0) {
    return 0;
  }
  
  // 计算每个元素的理想比例（均衡状态）
  const idealRatio = 1 / 5; // 20%
  
  // 计算各元素实际比例
  const woodRatio = vector.wood / totalValue;
  const fireRatio = vector.fire / totalValue;
  const earthRatio = vector.earth / totalValue;
  const metalRatio = vector.metal / totalValue;
  const waterRatio = vector.water / totalValue;
  
  // 计算各元素与理想比例的偏差
  const woodDeviation = Math.abs(woodRatio - idealRatio);
  const fireDeviation = Math.abs(fireRatio - idealRatio);
  const earthDeviation = Math.abs(earthRatio - idealRatio);
  const metalDeviation = Math.abs(metalRatio - idealRatio);
  const waterDeviation = Math.abs(waterRatio - idealRatio);
  
  // 计算总偏差
  const totalDeviation = woodDeviation + fireDeviation + earthDeviation + metalDeviation + waterDeviation;
  
  // 最大可能偏差（理论上是1.6，但我们用2作为安全值）
  const maxDeviation = 2;
  
  // 计算平衡得分 (100为完全平衡，0为完全不平衡)
  const score = 100 * (1 - totalDeviation / maxDeviation);
  
  // 确保分数在0-100范围内
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * 计算在某时刻用户的实际五行向量
 * @param date 日期时间对象
 * @param userBazi 用户八字基础五行向量
 * @returns 五行能量向量
 */
export function getEnergyVectorAt(date: Date, userBazi: FiveElementVector): FiveElementVector {
  // 获取天象能量影响
  const celestialVector = getCelestialEnergyVectorAt(date);
  
  // 合并用户基础五行和天象影响
  return {
    wood: userBazi.wood + celestialVector.wood,
    fire: userBazi.fire + celestialVector.fire,
    earth: userBazi.earth + celestialVector.earth,
    metal: userBazi.metal + celestialVector.metal,
    water: userBazi.water + celestialVector.water
  };
}

/**
 * 计算能量变化值
 * @param date 日期时间对象
 * @param userBazi 用户八字基础五行向量
 * @returns 能量变化值（当前分数 - 基础分数）
 */
export function getEnergyChange(date: Date, userBazi: FiveElementVector): number {
  // 获取当前五行向量
  const currentVector = getEnergyVectorAt(date, userBazi);
  
  // 计算当前五行平衡分数
  const currentScore = scoreFiveElementBalance(currentVector);
  
  // 计算基础五行平衡分数
  const baseScore = scoreFiveElementBalance(userBazi);
  
  // 计算变化值
  return currentScore - baseScore;
}

/**
 * 获取用户八字基础五行向量
 * @param birthday 生日字符串（YYYY-MM-DD格式）
 * @returns 用户八字基础五行向量
 */
export async function getUserBaziVector(birthday: string): Promise<FiveElementVector> {
  const birthdayDate = new Date(birthday);
  const baziResult = getBaziFromLunar(birthdayDate);
  return convertBaziToFiveElementVector(baziResult);
}

/**
 * 计算月度能量变化值
 * @param year 年份
 * @param month 月份（1-12）
 * @param userBazi 用户八字基础五行向量
 * @returns 月度能量变化值Promise
 */
export async function getMonthlyEnergyChange(year: number, month: number, userBazi: FiveElementVector): Promise<number> {
  // 获取该月的五行能量向量
  const monthlyVector = await getMonthlyEnergyVector(year, month);
  
  // 合并用户基础五行和月度影响
  const combinedVector = {
    wood: userBazi.wood + monthlyVector.wood,
    fire: userBazi.fire + monthlyVector.fire,
    earth: userBazi.earth + monthlyVector.earth,
    metal: userBazi.metal + monthlyVector.metal,
    water: userBazi.water + monthlyVector.water
  };
  
  // 计算基础五行和合并后五行的总数
  const baseCount = Object.values(userBazi).reduce((sum, val) => sum + val, 0);
  const combinedCount = Object.values(combinedVector).reduce((sum, val) => sum + val, 0);
  
  // 计算基础分数和合并后分数
  const baseScore = calculateElementsScore(userBazi, baseCount);
  const combinedScore = calculateElementsScore(combinedVector, combinedCount);
  
  // 计算变化值并映射到-25到25范围
  const rawDiff = combinedScore - baseScore;
  return Math.max(-25, Math.min(25, Math.round(rawDiff / 4)));
}

/**
 * 计算月度能量日历数据
 * @param birthday 用户生日（YYYY-MM-DD格式）
 * @returns 12个月的能量日历数据Promise
 */
export async function calculateEnergyCalendar(birthday: string): Promise<Array<{
  month: string;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal: string;
  lowestElement: Elem;
}>> {
  const today = new Date();
  const months = [];
  
  try {
    // 获取用户八字基础五行向量
    const userBazi = await getUserBaziVector(birthday);
    
    // 计算12个月的能量变化
    for (let i = 0; i < 12; i++) {
      const currentDate = addMonths(today, i);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript月份从0开始
      const monthName = format(currentDate, 'MMM');
      
      // 获取该月采样点的能量计算结果
      const sampleDates = getSampleDatesForMonth(year, month);
      const sampleResults = await Promise.all(sampleDates.map(async (date) => {
        // 获取日期的月相和日照因素
        const monthIndex = date.getMonth();
        
        // 计算月相
        const monthOffset = (monthIndex * 0.0833) % 1; // 每月偏移约1/12个周期
        const dayOffset = (date.getDate() / 30) % 1; // 日期在月内的位置
        const moonPhase = (monthOffset + dayOffset) % 1; // 合成后的月相位置(0-1)
        
        // 计算日照/季节因素
        const yearProgress = (monthIndex / 12) * 2 * Math.PI;
        const seasonAngle = yearProgress - Math.PI/2; // 6月达到峰值
        const sunlight = 0.5 + 0.3 * Math.sin(seasonAngle);
        
        // 获取月相和季节影响
        const moonPhaseVector = getMoonPhaseInfluence(moonPhase);
        const seasonVector = getSeasonInfluence(sunlight);
        
        // 基础八字向量
        const baseVector = { ...userBazi };
        
        // 合并影响因素
        const combinedVector = {
          wood: baseVector.wood + moonPhaseVector.wood + seasonVector.wood,
          fire: baseVector.fire + moonPhaseVector.fire + seasonVector.fire,
          earth: baseVector.earth + moonPhaseVector.earth + seasonVector.earth,
          metal: baseVector.metal + moonPhaseVector.metal + seasonVector.metal,
          water: baseVector.water + moonPhaseVector.water + seasonVector.water
        };
        
        // 计算基础分数和合并分数
        const baseScore = scoreFiveElementBalance(baseVector);
        const combinedScore = scoreFiveElementBalance(combinedVector);
        
        // 返回能量变化
        return {
          date,
          energyChange: combinedScore - baseScore
        };
      }));
      
      // 计算平均能量变化
      const avgEnergyChange = sampleResults.reduce((sum, result) => sum + result.energyChange, 0) / sampleResults.length;
      
      // 映射到-25到25范围
      const scaledEnergyChange = Math.max(-25, Math.min(25, Math.round(avgEnergyChange / 4)));
      
      // 确定趋势
      const trend = determineTrend(scaledEnergyChange);
      
      // 获取最终计算日期的五行向量（用月末日期）
      const finalDate = sampleDates[sampleDates.length - 1];
      const monthPhaseVector = getMoonPhaseInfluence(
        (finalDate.getMonth() * 0.0833 + finalDate.getDate() / 30) % 1
      );
      const monthSeasonVector = getSeasonInfluence(
        0.5 + 0.3 * Math.sin((finalDate.getMonth() / 12) * 2 * Math.PI - Math.PI/2)
      );
      
      // 合并最终的五行向量
      const finalVector = {
        wood: userBazi.wood + monthPhaseVector.wood + monthSeasonVector.wood,
        fire: userBazi.fire + monthPhaseVector.fire + monthSeasonVector.fire,
        earth: userBazi.earth + monthPhaseVector.earth + monthSeasonVector.earth,
        metal: userBazi.metal + monthPhaseVector.metal + monthSeasonVector.metal,
        water: userBazi.water + monthPhaseVector.water + monthSeasonVector.water
      };
      
      // 找出最弱的元素
      const lowestElement = Object.entries(finalVector).reduce(
        (lowest, [elem, score]) => {
          const elemKey = elem as Elem;
          return score < lowest.score ? { elem: elemKey, score } : lowest;
        },
        { elem: 'earth' as Elem, score: Number.MAX_VALUE }
      ).elem;
      
      // 根据最弱元素推荐水晶
      const crystal = CRYSTAL_MAP[lowestElement];
      
      months.push({
        month: monthName,
        energyChange: scaledEnergyChange,
        trend,
        crystal,
        lowestElement
      });
    }
  } catch (error) {
    console.error(`能量日历计算失败: ${error}`);
    // 返回至少一个默认月份数据，避免UI显示完全空白
    months.push({
      month: format(today, 'MMM'),
      energyChange: 0,
      trend: 'stable' as const,
      crystal: 'Clear Quartz',
      lowestElement: 'metal' as Elem
    });
  }
  
  return months;
}

/**
 * 获取一个月的采样日期
 * @param year 年份
 * @param month 月份(1-12)
 * @returns 采样日期数组
 */
function getSampleDatesForMonth(year: number, month: number): Date[] {
  const sampleDates = [];
  
  // 一号
  sampleDates.push(new Date(year, month - 1, 1));
  
  // 8号
  sampleDates.push(new Date(year, month - 1, 8));
  
  // 15号
  sampleDates.push(new Date(year, month - 1, 15));
  
  // 22号
  sampleDates.push(new Date(year, month - 1, 22));
  
  // 月末（需要计算当月天数）
  const lastDay = new Date(year, month, 0).getDate();
  sampleDates.push(new Date(year, month - 1, lastDay));
  
  return sampleDates;
}

/**
 * 获取日平均能量变化（为Plus用户）
 * @param date 日期对象
 * @param userBazi 用户八字基础五行向量
 * @returns 日平均能量变化值
 */
export function getDailyAverageEnergy(date: Date, userBazi: FiveElementVector): number {
  const results = [];
  
  // 对一天中的每个小时进行采样
  for (let hour = 0; hour < 24; hour++) {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    
    // 获取日照时段影响
    const dayTimeVector = getDayTimeVector(dateTime);
    
    // 获取月相影响
    const monthIndex = dateTime.getMonth();
    const monthOffset = (monthIndex * 0.0833) % 1;
    const dayOffset = (dateTime.getDate() / 30) % 1;
    const moonPhase = (monthOffset + dayOffset) % 1;
    const moonPhaseVector = getMoonPhaseInfluence(moonPhase);
    
    // 获取季节影响
    const yearProgress = (monthIndex / 12) * 2 * Math.PI;
    const seasonAngle = yearProgress - Math.PI/2;
    const sunlight = 0.5 + 0.3 * Math.sin(seasonAngle);
    const seasonVector = getSeasonInfluence(sunlight);
    
    // 合并向量
    const combinedVector = {
      wood: userBazi.wood + dayTimeVector.wood + moonPhaseVector.wood + seasonVector.wood,
      fire: userBazi.fire + dayTimeVector.fire + moonPhaseVector.fire + seasonVector.fire,
      earth: userBazi.earth + dayTimeVector.earth + moonPhaseVector.earth + seasonVector.earth,
      metal: userBazi.metal + dayTimeVector.metal + moonPhaseVector.metal + seasonVector.metal,
      water: userBazi.water + dayTimeVector.water + moonPhaseVector.water + seasonVector.water
    };
    
    // 计算基础分数和合并分数
    const baseScore = scoreFiveElementBalance(userBazi);
    const combinedScore = scoreFiveElementBalance(combinedVector);
    
    // 添加到结果中
    results.push(combinedScore - baseScore);
  }
  
  // 计算平均值
  const average = results.reduce((sum, val) => sum + val, 0) / results.length;
  
  // 映射到-25到25范围
  return Math.max(-25, Math.min(25, Math.round(average / 4)));
}

/**
 * 生成能量热力图数据（为Pro用户）
 * @param date 指定日期（不含时间）
 * @param userBazi 用户八字基础五行向量
 * @returns 24小时能量变化热力图数据
 */
export function getEnergyHeatmapData(date: Date, userBazi: FiveElementVector): Array<{hour: number, energy: number}> {
  const result = [];
  
  // 计算指定日期的每个小时的能量变化
  for (let hour = 0; hour < 24; hour++) {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    
    const energyChange = getEnergyChange(dateTime, userBazi);
    
    result.push({
      hour,
      energy: energyChange
    });
  }
  
  return result;
} 