/**
 * 简化版八字计算工具
 * 仅计算年柱、月柱、日柱，不计算时柱
 */

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 干支对应的五行
export const FIVE_ELEMENTS_MAP: Record<string, string> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
  '子': 'water', '午': 'fire',
  '丑': 'earth', '未': 'earth',
  '寅': 'wood', '申': 'metal',
  '卯': 'wood', '酉': 'metal',
  '辰': 'earth', '戌': 'earth',
  '巳': 'fire', '亥': 'water'
};

// 地支对应的生肖
export const ZODIAC_MAP: Record<string, string> = {
  '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
  '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
  '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
};

/**
 * 计算农历年的天干地支
 * @param year 公历年份
 * @returns 天干地支索引
 */
function getLunarYearGanZhi(year: number): { gan: number; zhi: number } {
  // 1900年为庚子年，天干为庚(6)，地支为子(0)
  const baseYear = 1900;
  const ganBase = 6; // 1900年天干为庚(6)
  const zhiBase = 0; // 1900年地支为子(0)
  
  // 计算与1900年相差的年数
  const offset = year - baseYear;
  
  // 计算天干和地支的索引
  let ganIndex = (ganBase + offset) % 10;
  let zhiIndex = (zhiBase + offset) % 12;
  
  // 处理负数情况
  if (ganIndex < 0) ganIndex += 10;
  if (zhiIndex < 0) zhiIndex += 12;
  
  return { gan: ganIndex, zhi: zhiIndex };
}

/**
 * 计算农历月的天干地支
 * @param yearGan 年的天干索引
 * @param month 农历月份(1-12)
 * @returns 天干地支索引
 */
function getLunarMonthGanZhi(yearGan: number, month: number): { gan: number; zhi: number } {
  // 计算月干的起始值(以寅月为正月)
  // 甲己年: 丙寅 -> 2
  // 乙庚年: 戊寅 -> 4
  // 丙辛年: 庚寅 -> 6
  // 丁壬年: 壬寅 -> 8
  // 戊癸年: 甲寅 -> 0
  const monthGanBase = [2, 4, 6, 8, 0];
  const ganGroup = Math.floor(yearGan / 2); // 0-4
  
  // 月干的起始值
  const ganBase = monthGanBase[ganGroup];
  
  // 计算月干
  let ganIndex = (ganBase + (month - 1)) % 10;
  
  // 月支从寅开始(寅为正月)
  let zhiIndex = (month + 1) % 12;
  
  // 处理负数情况
  if (ganIndex < 0) ganIndex += 10;
  if (zhiIndex < 0) zhiIndex += 12;
  
  return { gan: ganIndex, zhi: zhiIndex };
}

/**
 * 计算阳历日的天干地支(简化算法)
 * @param year 阳历年
 * @param month 阳历月
 * @param day 阳历日
 * @returns 天干地支索引
 */
function getSolarDayGanZhi(year: number, month: number, day: number): { gan: number; zhi: number } {
  // 这是一个简化算法，不够准确，但适用于简单应用场景
  
  // 1900年1月1日为庚子日，天干为庚(6)，地支为子(0)
  const baseYear = 1900;
  const baseMonth = 1;
  const baseDay = 1;
  const baseDayGanIndex = 6; // 1900年1月1日天干为庚(6)
  const baseDayZhiIndex = 0; // 1900年1月1日地支为子(0)
  
  // 计算相差的天数
  const date = new Date(year, month - 1, day);
  const baseDate = new Date(baseYear, baseMonth - 1, baseDay);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // 计算日干支索引
  let ganIndex = (baseDayGanIndex + diffDays) % 10;
  let zhiIndex = (baseDayZhiIndex + diffDays) % 12;
  
  // 处理负数情况
  if (ganIndex < 0) ganIndex += 10;
  if (zhiIndex < 0) zhiIndex += 12;
  
  return { gan: ganIndex, zhi: zhiIndex };
}

/**
 * 将公历日期转换为简化八字
 * @param year 公历年
 * @param month 公历月(1-12)
 * @param day 公历日
 * @returns 八字信息
 */
export function calculateSimpleBazi(year: number, month: number, day: number) {
  // 计算年柱
  const yearGanZhi = getLunarYearGanZhi(year);
  const yearGan = TIAN_GAN[yearGanZhi.gan];
  const yearZhi = DI_ZHI[yearGanZhi.zhi];
  
  // 计算月柱(简化，以阳历月份近似代替)
  const monthGanZhi = getLunarMonthGanZhi(yearGanZhi.gan, month);
  const monthGan = TIAN_GAN[monthGanZhi.gan];
  const monthZhi = DI_ZHI[monthGanZhi.zhi];
  
  // 计算日柱
  const dayGanZhi = getSolarDayGanZhi(year, month, day);
  const dayGan = TIAN_GAN[dayGanZhi.gan];
  const dayZhi = DI_ZHI[dayGanZhi.zhi];
  
  // 获取生肖
  const zodiac = ZODIAC_MAP[yearZhi];
  
  return {
    tianGan: {
      year: yearGan,
      month: monthGan,
      day: dayGan
    },
    diZhi: {
      year: yearZhi,
      month: monthZhi,
      day: dayZhi
    },
    zodiac
  };
} 