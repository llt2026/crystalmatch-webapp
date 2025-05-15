import { getBaziFromLunar } from "./getBaziFromLunar";
import { getYearPillarByDate } from "./year-pillar";
import { getMonthEnergyByDate } from "./energy-calendar";

/**
 * 获取完整能量分析上下文
 * 整合用户出生日期和当前日期的八字、年柱和月能量信息
 * 用于为GPT报告生成提供统一格式的输入数据
 */
export function getFullEnergyContext(birthday: Date, currentDate: Date): {
  bazi: {
    yearPillar: string,
    monthPillar: string,
    dayPillar: string
  },
  currentYear: {
    pillar: string,
    zodiac: string,
    year: number
  },
  currentMonth: {
    pillar: string,
    element: string,
    energyType: string,
    start: string,
    end: string
  }
} | null {
  try {
    // 获取用户八字信息
    const baziResult = getBaziFromLunar(birthday);
    if (!baziResult) {
      throw new Error("Failed to calculate Bazi from birthday");
    }
    
    // 获取当前年柱信息
    let yearPillarResult;
    try {
      yearPillarResult = getYearPillarByDate(currentDate);
    } catch (error) {
      console.error("Error getting year pillar:", error);
      throw new Error("Failed to get current year pillar");
    }
    
    // 获取当前月能量信息
    const monthEnergyResult = getMonthEnergyByDate(currentDate);
    if (!monthEnergyResult) {
      throw new Error("Failed to get current month energy");
    }
    
    // 组装结果
    return {
      bazi: {
        yearPillar: baziResult.yearPillar,
        monthPillar: baziResult.monthPillar,
        dayPillar: baziResult.dayPillar
      },
      currentYear: {
        pillar: yearPillarResult.pillar,
        zodiac: yearPillarResult.zodiac,
        year: yearPillarResult.year
      },
      currentMonth: {
        pillar: monthEnergyResult.pillar,
        element: monthEnergyResult.element,
        energyType: monthEnergyResult.energyType,
        start: monthEnergyResult.period.start,
        end: monthEnergyResult.period.end
      }
    };
  } catch (error) {
    console.error("Error in getFullEnergyContext:", error);
    return null;
  }
} 