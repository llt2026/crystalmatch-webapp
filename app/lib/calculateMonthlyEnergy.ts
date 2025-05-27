import { getBaziFromLunar } from './getBaziFromLunar';

// Define element types
export type Elem = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type ElementRecord = Record<Elem, number>;

// Define the type for getBaziFromLunar result
interface BaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  fiveElements?: {
    year: string[];
    month: string[];
    day: string[];
  };
  zodiac?: {
    year: string;
    month: string;
    day: string;
  };
}

export interface MonthlyEnergyInput {
  birthday: string;          // YYYY-MM-DD format
  dateRef?: Date;            // defaults to today
  prevMonthScores?: ElementRecord | null;  // previous month's scores
}

export interface MonthlyEnergyOutput {
  monthScores: ElementRecord;  // Current month's element scores
  baseScores: ElementRecord;   // Base eight characters scores (calculated in 12-char ratio)
  diffScores: ElementRecord;   // Difference from previous month
  trend: 'up' | 'down' | 'stable';  // Overall trend
  trendMsg: string;            // Trend description
}

/**
 * Calculate a user's monthly energy scores
 * @param params Calculation parameters
 * @returns Energy score results
 */
export function calculateMonthlyEnergy(params: MonthlyEnergyInput): MonthlyEnergyOutput {
  const { birthday, dateRef = new Date(), prevMonthScores = null } = params;
  
  // 1. Get base eight characters five elements distribution
  const birthdayDate = new Date(birthday);
  const baseResult = getBaziFromLunar(birthdayDate);
  if (!baseResult || !baseResult.fiveElements) {
    throw new Error('Failed to calculate base eight characters data');
  }
  
  // Calculate base five element counts
  const base: ElementRecord = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // Count five elements from year, month, and day pillars
  // Using type assertion to avoid TypeScript errors
  const baseFiveElements = baseResult.fiveElements as any;
  ['year', 'month', 'day'].forEach(pillar => {
    baseFiveElements[pillar].forEach((element: string) => {
      const elemKey = element.toLowerCase() as Elem;
      if (elemKey in base) {
        base[elemKey]++;
      }
    });
  });
  
  // 2. Get current year and month's heavenly stems and earthly branches
  const nowResult = getBaziFromLunar(dateRef);
  if (!nowResult || !nowResult.fiveElements) {
    throw new Error('Failed to calculate current date eight characters data');
  }
  
  // Year and month pillars' five elements
  const yearMonthElements: ElementRecord = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // Count five elements from year and month pillars
  // Using type assertion to avoid TypeScript errors
  const nowFiveElements = nowResult.fiveElements as any;
  ['year', 'month'].forEach(pillar => {
    nowFiveElements[pillar].forEach((element: string) => {
      const elemKey = element.toLowerCase() as Elem;
      if (elemKey in yearMonthElements) {
        yearMonthElements[elemKey]++;
      }
    });
  });
  
  // 3. Combine to calculate total five elements distribution
  const totalCounts: ElementRecord = {
    wood: base.wood + yearMonthElements.wood,
    fire: base.fire + yearMonthElements.fire,
    earth: base.earth + yearMonthElements.earth,
    metal: base.metal + yearMonthElements.metal,
    water: base.water + yearMonthElements.water
  };
  
  // 4. Calculate the difference between ideal and actual distributions, convert to scores
  const ideal = 12 / 5; // 12 characters, 5 elements, ideally 2.4 elements each
  
  // Calculate monthly scores
  const monthScores: ElementRecord = {
    wood: calculateScore(totalCounts.wood, ideal),
    fire: calculateScore(totalCounts.fire, ideal),
    earth: calculateScore(totalCounts.earth, ideal),
    metal: calculateScore(totalCounts.metal, ideal),
    water: calculateScore(totalCounts.water, ideal)
  };
  
  // Calculate base scores (8 characters recalculated in 12-character ratio)
  const baseIdeal = 8 / 5; // 8 characters, 5 elements
  const baseScores: ElementRecord = {
    wood: calculateScore(base.wood, baseIdeal),
    fire: calculateScore(base.fire, baseIdeal),
    earth: calculateScore(base.earth, baseIdeal),
    metal: calculateScore(base.metal, baseIdeal),
    water: calculateScore(base.water, baseIdeal)
  };
  
  // 5. Calculate differences from previous month
  const diffScores: ElementRecord = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  if (prevMonthScores) {
    Object.keys(monthScores).forEach(key => {
      const elem = key as Elem;
      diffScores[elem] = monthScores[elem] - prevMonthScores[elem];
    });
  }
  
  // 6. Calculate overall trend
  const avgDiff = Object.values(diffScores).reduce((sum, val) => sum + val, 0) / 5;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  
  if (avgDiff >= 3) {
    trend = 'up';
  } else if (avgDiff <= -3) {
    trend = 'down';
  }
  
  // Generate trend description
  const trendMsg = generateTrendMessage(trend, diffScores);
  
  return {
    monthScores,
    baseScores,
    diffScores,
    trend,
    trendMsg
  };
}

/**
 * Calculate five element score
 * @param count Element count
 * @param ideal Ideal count
 * @returns Score from 0-100
 */
function calculateScore(count: number, ideal: number): number {
  const score = 100 * (1 - Math.abs(count - ideal) / ideal);
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Generate trend description text
 */
function generateTrendMessage(trend: 'up' | 'down' | 'stable', diffScores: ElementRecord): string {
  const maxElem = Object.entries(diffScores).reduce(
    (max, [elem, score]) => (score > max.score ? { elem, score } : max),
    { elem: '', score: -Infinity }
  );
  
  const minElem = Object.entries(diffScores).reduce(
    (min, [elem, score]) => (score < min.score ? { elem, score } : min),
    { elem: '', score: Infinity }
  );
  
  const elemNameMap: Record<string, string> = {
    'wood': 'Wood',
    'fire': 'Fire',
    'earth': 'Earth',
    'metal': 'Metal',
    'water': 'Water'
  };
  
  switch (trend) {
    case 'up':
      return `Your overall energy is rising this month, with ${elemNameMap[maxElem.elem]} element increasing by ${Math.abs(maxElem.score).toFixed(1)} points.`;
    case 'down':
      return `Your overall energy is decreasing this month, with ${elemNameMap[minElem.elem]} element dropping by ${Math.abs(minElem.score).toFixed(1)} points.`;
    default:
      return `Your five elements energy remains relatively stable this month.`;
  }
} 