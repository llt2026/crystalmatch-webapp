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

// -------------------- Monthly Report Types --------------------

// Scores used for each life aspect
export interface SectionScores {
  finance: number;   // Money Flow
  social: number;    // Social Vibes
  mood: number;      // Mood Balance
  health: number;    // Body Fuel
  growth: number;    // Growth Track
}

// Overview object that GPT prompt will read
export interface MonthlyOverview {
  periodStart: string;       // YYYY-MM-DD
  title: string;             // e.g. "Growth Energy 🌱"
  energyScore: number;       // 0-100 overall
  sectionScores: SectionScores;
}

// Context passed into buildMonthlyReportPrompt
export interface MonthlyContext {
  overview: MonthlyOverview;
  daily: any[];   // For prompt only need length; keep any
  hourly: any[];
} 