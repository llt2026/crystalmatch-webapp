/**
 * 八字信息结构
 */
export interface BaziInfo {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar?: string;
}

/**
 * 月份信息结构
 */
export interface MonthInfo {
  name: string;
  year: number;
  energyType: string;
  element: string;
  pillar?: string;
  start?: string;
  end?: string;
}

/**
 * 用户五行元素分布
 */
export interface UserElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/**
 * 预测上下文信息
 */
export interface ForecastContext {
  bazi: BaziInfo;
  currentMonth: MonthInfo;
  userElements: UserElements;
  currentYear?: {
    pillar: string;
    zodiac: string;
  };
} 