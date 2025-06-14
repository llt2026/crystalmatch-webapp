// 生肖对应表
const zodiacMap: Record<string, string> = {
  '子': 'Rat',
  '丑': 'Ox', 
  '寅': 'Tiger', 
  '卯': 'Rabbit', 
  '辰': 'Dragon', 
  '巳': 'Snake',
  '午': 'Horse', 
  '未': 'Goat', 
  '申': 'Monkey', 
  '酉': 'Rooster', 
  '戌': 'Dog', 
  '亥': 'Pig'
};

// 年柱数据
export const yearPillars = [
  {
    start: "2023-02-04", // 2023年立春
    end: "2024-02-03",   // 2024年立春前一天
    year: 2023,
    pillar: "癸卯",
    zodiac: "Rabbit"
  },
  {
    start: "2024-02-04", // 2024年立春
    end: "2025-02-03",   // 2025年立春前一天
    year: 2024,
    pillar: "甲辰",
    zodiac: "Dragon"     // 辰 = Dragon
  },
  {
    start: "2025-02-04", // 2025年立春
    end: "2026-02-03",   // 2026年立春前一天
    year: 2025,
    pillar: "乙巳",
    zodiac: "Snake"      // 巳 = Snake
  },
  {
    start: "2026-02-04", // 2026年立春
    end: "2027-02-03",   // 2027年立春前一天
    year: 2026,
    pillar: "丙午",
    zodiac: "Horse"      // 午 = Horse
  },
  {
    start: "2027-02-04", // 2027年立春
    end: "2028-02-03",   // 2028年立春前一天
    year: 2027,
    pillar: "丁未",
    zodiac: "Goat"       // 未 = Goat
  },
  {
    start: "2028-02-04", // 2028年立春
    end: "2029-02-03",   // 2029年立春前一天
    year: 2028,
    pillar: "戊申",
    zodiac: "Monkey"     // 申 = Monkey
  }
];

/**
 * 根据日期获取对应的年柱信息
 * @param date 日期对象
 * @returns 对应的年柱信息
 */
export function getYearPillarByDate(date: Date): {
  year: number,
  pillar: string,
  zodiac: string
} {
  // 转换为字符串格式 YYYY-MM-DD
  const dateStr = date.toISOString().slice(0, 10);
  
  // 查找该日期所在的年柱区间
  const pillarInfo = yearPillars.find(
    pillar => dateStr >= pillar.start && dateStr <= pillar.end
  );
  
  // 如果找不到对应区间，抛出错误（此处也可以返回默认值或null）
  if (!pillarInfo) {
    throw new Error(`No year pillar found for date ${dateStr}`);
  }
  
  return {
    year: pillarInfo.year,
    pillar: pillarInfo.pillar,
    zodiac: pillarInfo.zodiac
  };
} 