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

// 中文/英文到 Elem 映射
const CHN_TO_ENG: Record<string, Elem> = {
  '木': 'wood',
  '火': 'fire',
  '土': 'earth',
  '金': 'metal',
  '水': 'water'
};

function mapElement(raw: string): Elem | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === 'wood' || lower === 'fire' || lower === 'earth' || lower === 'metal' || lower === 'water') {
    return lower as Elem;
  }
  if (CHN_TO_ENG[raw]) return CHN_TO_ENG[raw];
  return null;
}

/**
 * 提取指定柱组合的五行元素向量
 * @param date 日期对象
 * @param includeYear 是否包含年柱
 * @param includeDay 是否包含日柱
 * @param includeHour 是否包含时柱
 */
function getPillarElementsVector(date: Date, includeYear: boolean, includeDay: boolean, includeHour: boolean): FiveElementVector {
  const bazi = getBaziFromLunar(date);
  if (!bazi || !bazi.fiveElements) return { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = bazi.fiveElements as any;
  const vector: FiveElementVector = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 必要柱
  const pillarsToInclude: string[] = ['month'];
  if (includeYear) pillarsToInclude.unshift('year');

  pillarsToInclude.forEach(p => {
    pillars[p].forEach((el: string) => {
      const map = mapElement(el);
      if (map) vector[map]++;
    });
  });
  if (includeDay) {
    pillars['day'].forEach((el: string) => {
      const map = mapElement(el);
      if (map) vector[map]++;
    });
  }
  if (includeHour) {
    pillars['hour'].forEach((el: string) => {
      const map = mapElement(el);
      if (map) vector[map]++;
    });
  }
  return vector;
}

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
  
  // 直接返回计数向量（使用旧算法在 calculateElementsScore 中评分）
  return {
    wood: counts.wood,
    fire: counts.fire,
    earth: counts.earth,
    metal: counts.metal,
    water: counts.water
  } as FiveElementVector;
}

/**
 * 计算五行得分
 * @param count 元素计数
 * @param ideal 理想计数
 * @returns 0-100之间的分数
 */
function calculateScore(count: number, ideal: number): number {
  const score = 100 * (1 - Math.abs(count - ideal) / ideal);
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * 根据五行向量计算平衡评分
 * @param vector 五行能量向量
 * @returns 0-100之间的平衡分数
 */
export function scoreFiveElementBalance(vector: FiveElementVector): number {
  // 使用旧版 calculateElementsScore 计算平衡分数
  return calculateElementsScore(vector);
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
  const baseImbalance = 100 - baseScore;
  const currImbalance = 100 - currentScore;
  const diff = baseImbalance - currImbalance;
  return scaleDiff(diff);
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
  // 取当月年+月柱向量，与用户基础八字比较
  const sampleDate = new Date(year, month - 1, 1);
  const pillarVector = getPillarElementsVector(sampleDate, false, false, false); // 只年+月柱

  // 合并向量
  const combinedVector: FiveElementVector = {
    wood: userBazi.wood + pillarVector.wood,
    fire: userBazi.fire + pillarVector.fire,
    earth: userBazi.earth + pillarVector.earth,
    metal: userBazi.metal + pillarVector.metal,
    water: userBazi.water + pillarVector.water
  };

  const baseScore = scoreFiveElementBalance(userBazi);
  const combinedScore = scoreFiveElementBalance(combinedVector);

  const baseImbalance = 100 - baseScore;
  const currImbalance = 100 - combinedScore;
  const diffRaw = baseImbalance - currImbalance;

  return scaleDiff(diffRaw);
}

/**
 * 计算月度能量日历数据
 * @param birthday 用户生日（YYYY-MM-DD格式）
 * @returns 12个月的能量日历数据Promise
 */
export async function calculateEnergyCalendar(birthday: string): Promise<Array<{
  month: string; // 形如 "4/1-4/4"
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal: string;
  lowestElement: Elem;
}>> {
  const months: any[] = [];
  try {
    const baseVector = await getUserBaziVector(birthday);
    const baseBalance = scoreFiveElementBalance(baseVector);

    // 起始日期 = 今天
    let cursor = new Date();
    // 生成最多 12 个阶段
    for (let stage = 0; stage < 12; stage++) {
      const startDate = new Date(cursor);
      // 当前月柱
      const startBazi = getBaziFromLunar(startDate);
      if (!startBazi || !startBazi.fiveElements) break;
      const startMonthPillar = startBazi.fiveElements.month.join('');

      // 前进到月柱变化的前一天
      let endDate = new Date(startDate);
      while (true) {
        const next = new Date(endDate);
        next.setDate(next.getDate() + 1);
        const nextBazi = getBaziFromLunar(next);
        if (!nextBazi || !nextBazi.fiveElements) break;
        const nextMonthPillar = nextBazi.fiveElements.month.join('');
        if (nextMonthPillar !== startMonthPillar) break; // 月柱变更
        endDate = next;
      }

      // 计算阶段能量分数：年+月柱元素 + 基础八字
      const pillarVec = getPillarElementsVector(startDate, false, false, false); // 只年+月
      const combined = {
        wood: baseVector.wood + pillarVec.wood,
        fire: baseVector.fire + pillarVec.fire,
        earth: baseVector.earth + pillarVec.earth,
        metal: baseVector.metal + pillarVec.metal,
        water: baseVector.water + pillarVec.water
      } as FiveElementVector;
      const balance = scoreFiveElementBalance(combined);

      // 与基础八字比较
      const baseImbalance = 100 - baseBalance;
      const currImbalance = 100 - balance;
      const diffRaw = baseImbalance - currImbalance;

      const energyChange = scaleDiff(diffRaw);
      const trend = determineTrend(energyChange);

      // 最弱元素 & 水晶
      const lowestElement = (Object.entries(combined) as [Elem, number][]).reduce((a,b)=> a[1]<b[1]?a:b)[0];
      const crystal = CRYSTAL_MAP[lowestElement];

      const label = `${startDate.getMonth()+1}/${startDate.getDate()}-${endDate.getMonth()+1}/${endDate.getDate()}`;
      months.push({ month: label, energyChange, trend, crystal, lowestElement });

      // 移动光标到下一天
      cursor = new Date(endDate);
      cursor.setDate(cursor.getDate() + 1);
    }
  } catch (e) {
    console.error('calculateEnergyCalendar error', e);
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
  // 使用年+月+日柱向量
  const pillarVector = getPillarElementsVector(date, true, true, false);
  const combined = {
    wood: userBazi.wood + pillarVector.wood,
    fire: userBazi.fire + pillarVector.fire,
    earth: userBazi.earth + pillarVector.earth,
    metal: userBazi.metal + pillarVector.metal,
    water: userBazi.water + pillarVector.water
  } as FiveElementVector;

  const baseScore = scoreFiveElementBalance(userBazi);
  const dayScore = scoreFiveElementBalance(combined);
  const diff = (100 - baseScore) - (100 - dayScore);
  return scaleDiff(diff);
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
    
    // 计算柱向量（包含时柱）
    const pillarVector = getPillarElementsVector(dateTime, true, false, true);
    const combined = {
      wood: userBazi.wood + pillarVector.wood,
      fire: userBazi.fire + pillarVector.fire,
      earth: userBazi.earth + pillarVector.earth,
      metal: userBazi.metal + pillarVector.metal,
      water: userBazi.water + pillarVector.water
    } as FiveElementVector;
    const baseScore = scoreFiveElementBalance(userBazi);
    const hourScore = scoreFiveElementBalance(combined);
    const diff = (100 - baseScore) - (100 - hourScore);
    const energyChange = scaleDiff(diff);

    result.push({
      hour,
      energy: energyChange
    });
  }
  
  return result;
}

/**
 * 根据原始分差计算显示用能量变化值
 * 1. 保留1位小数
 * 2. 若绝对值<1 强制设为 ±1
 * 3. 限制在 -25 ~ 25
 */
function scaleDiff(raw: number): number {
  // 先缩放，避免分差过大
  let valRaw: number;
  const absRaw = Math.abs(raw);
  if (absRaw <= 50) valRaw = raw;        // 小差异不缩放
  else if (absRaw <= 100) valRaw = raw / 2; // 中等差异减半
  else valRaw = raw / 4;                    // 大于100再÷4

  let val = Math.round(valRaw * 10) / 10; // 保留1位小数
  if (Math.abs(val) < 1) val = val >= 0 ? 1 : -1;
  if (val > 25) val = 25;
  if (val < -25) val = -25;
  return val;
} 