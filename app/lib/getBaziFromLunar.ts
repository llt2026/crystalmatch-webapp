import { Lunar, Solar } from 'lunar-javascript';

/**
 * 使用lunar-javascript库计算八字（年柱、月柱、日柱）
 * @param date 公历日期对象
 * @returns 年柱、月柱、日柱及相关信息
 */
export function getBaziFromLunar(date: Date): {
  yearPillar: string,
  monthPillar: string,
  dayPillar: string,
  zodiac?: {
    year: string,
    month: string,
    day: string
  },
  fiveElements?: {
    year: string[],
    month: string[],
    day: string[]
  }
} | null {
  try {
    // 确保日期有效
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('输入的日期无效');
    }

    console.log(`开始计算八字，输入日期: ${date.toISOString()}`);

    // 五行对应表
    const FIVE_ELEMENTS: Record<string, string> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '丑': '土', '辰': '土', '未': '土', '戌': '土'
    };
    
    // 创建Solar对象，默认为北京时间中午12点
    // 使用中午时间可避免因时区问题导致的天干地支计算误差
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript月份从0开始
    const day = date.getDate();
    
    console.log(`转换为阳历: ${year}年${month}月${day}日`);
    
    try {
      const solar = Solar.fromYmd(year, month, day);
      console.log(`成功创建Solar对象: ${solar.toString()}`);
      
      const lunar = Lunar.fromSolar(solar);
      console.log(`成功创建Lunar对象: ${lunar.toString()}`);
      
      // 从lunar对象获取八字信息
      const yearPillar = lunar.getYearInGanZhi();
      const monthPillar = lunar.getMonthInGanZhi();
      const dayPillar = lunar.getDayInGanZhi();
      
      console.log(`获取八字信息成功: 年柱=${yearPillar}, 月柱=${monthPillar}, 日柱=${dayPillar}`);
      
      // 获取年、月、日柱的天干地支
      const yearGan = yearPillar[0];
      const yearZhi = yearPillar[1];
      const monthGan = monthPillar[0];
      const monthZhi = monthPillar[1];
      const dayGan = dayPillar[0];
      const dayZhi = dayPillar[1];
      
      // 打印调试信息
      console.log('使用lunar-javascript库计算八字:');
      console.log(`日期: ${year}年${month}月${day}日`);
      console.log(`年柱: ${yearPillar}, 月柱: ${monthPillar}, 日柱: ${dayPillar}`);
      console.log(`天干: ${yearGan}${monthGan}${dayGan}, 地支: ${yearZhi}${monthZhi}${dayZhi}`);
      
      // 获取生肖信息
      const yearZodiac = getZodiacFromDiZhi(yearZhi);
      const monthZodiac = getZodiacFromDiZhi(monthZhi);
      const dayZodiac = getZodiacFromDiZhi(dayZhi);
      
      console.log(`生肖: 年-${yearZodiac}, 月-${monthZodiac}, 日-${dayZodiac}`);
      
      // 获取五行信息
      const yearElements = [FIVE_ELEMENTS[yearGan] || '未知', FIVE_ELEMENTS[yearZhi] || '未知'];
      const monthElements = [FIVE_ELEMENTS[monthGan] || '未知', FIVE_ELEMENTS[monthZhi] || '未知'];
      const dayElements = [FIVE_ELEMENTS[dayGan] || '未知', FIVE_ELEMENTS[dayZhi] || '未知'];
      
      console.log(`五行: 年-${yearElements.join(',')}, 月-${monthElements.join(',')}, 日-${dayElements.join(',')}`);
      
      return {
        yearPillar,
        monthPillar,
        dayPillar,
        zodiac: {
          year: yearZodiac,
          month: monthZodiac,
          day: dayZodiac
        },
        fiveElements: {
          year: yearElements,
          month: monthElements,
          day: dayElements
        }
      };
    } catch (innerError) {
      console.error(`lunar-javascript库计算出错:`, innerError);
      throw new Error(`八字计算库错误: ${(innerError as Error).message}`);
    }
  } catch (error) {
    console.error('八字计算错误:', error);
    return null;
  }
}

/**
 * 辅助函数：从地支获取对应的生肖
 */
function getZodiacFromDiZhi(diZhi: string): string {
  const zodiacMap: Record<string, string> = {
    '子': '鼠',
    '丑': '牛',
    '寅': '虎',
    '卯': '兔',
    '辰': '龙',
    '巳': '蛇',
    '午': '马',
    '未': '羊',
    '申': '猴',
    '酉': '鸡',
    '戌': '狗',
    '亥': '猪'
  };
  
  return zodiacMap[diZhi] || '';
}

/**
 * 辅助方法，从字符串日期计算八字
 * @param dateString 日期字符串，如 "1984-10-08"
 * @returns 八字结果或null
 */
export function getBaziFromLunarString(dateString: string): ReturnType<typeof getBaziFromLunar> {
  try {
    const date = new Date(dateString);
    return getBaziFromLunar(date);
  } catch (error) {
    console.error('八字计算错误:', error);
    return null;
  }
}

/**
 * 辅助方法，从年月日数字计算八字
 * @param year 年份，如 1984
 * @param month 月份，如 10（原始月份，不需要-1）
 * @param day 日期，如 8
 * @returns 八字结果或null
 */
export function getBaziFromLunarNumbers(year: number, month: number, day: number): ReturnType<typeof getBaziFromLunar> {
  try {
    // 创建日期对象，注意月份需要-1
    const date = new Date(year, month - 1, day);
    return getBaziFromLunar(date);
  } catch (error) {
    console.error('八字计算错误:', error);
    return null;
  }
} 