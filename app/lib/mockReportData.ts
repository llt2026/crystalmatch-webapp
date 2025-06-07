/**
 * 模拟能量报告数据生成器
 * 提供测试用的模拟数据
 */

import {
  DailyEnergyData,
  NotificationData,
  HourlyEnergyData,
  WeeklyForecastData,
  EnergyTrend
} from '../components/reports/EnergyComponents';

/**
 * 生成模拟的日能量数据
 * @param year 年份
 * @param month 月份
 * @param days 天数
 * @returns 日能量数据数组
 */
export function generateDailyEnergyData(year: number, month: number, days: number): DailyEnergyData[] {
  const result: DailyEnergyData[] = [];
  
  for (let day = 1; day <= days; day++) {
    // 生成-10到+10之间的随机能量值
    const energyChange = Math.round((Math.random() * 20 - 10) * 10) / 10;
    
    // 根据能量值确定趋势
    let trend: EnergyTrend;
    if (energyChange > 3) trend = 'up';
    else if (energyChange < -3) trend = 'down';
    else trend = 'stable';
    
    // 格式化日期
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 格式
    
    result.push({
      date: dateStr,
      energyChange,
      trend
    });
  }
  
  return result;
}

/**
 * 生成模拟的推送通知数据
 * @param year 年份
 * @param month 月份
 * @param count 通知数量
 * @returns 推送通知数据数组
 */
export function generateNotificationData(year: number, month: number, count: number): NotificationData[] {
  const result: NotificationData[] = [];
  const types: Array<'peak' | 'low' | 'balanced'> = ['peak', 'low', 'balanced'];
  const titles = {
    peak: 'Energy Peak',
    low: 'Energy Dip',
    balanced: 'Balance Point'
  };
  
  const messages = {
    peak: [
      'Your energy will peak during this period. Schedule important tasks and decisions.',
      'High energy day. Great for challenging work and physical activities.',
      'Energy levels will be optimal. Focus on your most important projects.'
    ],
    low: [
      'Energy levels will be lower. Take breaks and focus on lighter tasks.',
      'Low energy period. Practice self-care and avoid major decisions.',
      'Energy dip expected. Rest and recharge when possible.'
    ],
    balanced: [
      'Your energy will be well-balanced. Good for a variety of activities.',
      'Energy balance optimal for social activities and creative work.',
      'Stable energy flow. Ideal for steady progress on ongoing projects.'
    ]
  };
  
  // 生成随机的天数，避免重复
  const days = new Set<number>();
  while (days.size < count) {
    days.add(Math.floor(Math.random() * 28) + 1);
  }
  
  // 为每个选中的天生成通知
  for (const day of days) {
    const type = types[Math.floor(Math.random() * types.length)];
    const messageIndex = Math.floor(Math.random() * messages[type].length);
    
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 格式
    
    result.push({
      date: dateStr,
      title: titles[type],
      message: messages[type][messageIndex],
      type
    });
  }
  
  // 按日期排序
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 生成模拟的小时能量数据
 * @returns 小时能量数据数组
 */
export function generateHourlyEnergyData(): HourlyEnergyData[] {
  const result: HourlyEnergyData[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // 生成-10到+10之间的随机能量值
    const base = Math.sin(hour / 24 * Math.PI * 2) * 5; // 创建一个波浪曲线作为基础
    const random = Math.random() * 5 - 2.5; // 添加一些随机性
    const energyValue = Math.round((base + random) * 10) / 10;
    
    result.push({
      hour,
      energyValue
    });
  }
  
  return result;
}

/**
 * 生成模拟的周预测数据
 * @param year 年份
 * @param month 月份
 * @returns 周预测数据数组
 */
export function generateWeeklyForecastData(year: number, month: number): WeeklyForecastData[] {
  const result: WeeklyForecastData[] = [];
  const forecasts = [
    'High energy week. Focus on starting new projects and taking initiative.',
    'Balancing week. Good for maintaining projects and relationships.',
    'Challenging energy patterns. Practice self-care and avoid major decisions.',
    'Rejuvenating week. Energy will increase toward the end of the period.',
    'Productive week for mental tasks. Focus on planning and strategy.'
  ];
  
  // 计算月初是一周的第几天 (0 = 周日, 6 = 周六)
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  
  // 计算月中有几周
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7);
  
  for (let week = 0; week < weeks; week++) {
    // 计算周的起止日期
    let startDay = week * 7 + 1 - firstDayOfWeek;
    if (startDay < 1) startDay = 1;
    
    let endDay = startDay + 6;
    if (endDay > daysInMonth) endDay = daysInMonth;
    
    const startDate = new Date(year, month - 1, startDay);
    const endDate = new Date(year, month - 1, endDay);
    
    // 选择一个随机的预测文本
    const forecastIndex = Math.floor(Math.random() * forecasts.length);
    
    result.push({
      weekNumber: week + 1,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      forecast: forecasts[forecastIndex]
    });
  }
  
  return result;
}

/**
 * 生成模拟的月概览数据
 * @param month 月份名称
 * @param year 年份
 * @returns 月概览数据
 */
export function generateMonthlyOverview(month: string, year: number): {
  overview: string;
  phases: Array<{ title: string; description: string }>;
} {
  const overviews = [
    `${month} ${year} brings a progressive energy pattern that starts with high initiative energy and gradually shifts to more reflective energy by month end. Your energy cycles suggest three distinct phases throughout the month.`,
    `${month} ${year} presents fluctuating energy patterns with clear peaks and valleys. Pay attention to the rhythm of your energy to maximize productivity and wellness.`,
    `${month} ${year} shows stable energy with occasional spikes. This is a good month for consistent progress on long-term projects.`
  ];
  
  const earlyDescriptions = [
    'High productivity period. Focus on demanding tasks and initiatives.',
    'Active energy phase. Great time for starting new projects.',
    'Dynamic period with increasing energy. Take advantage of motivation.'
  ];
  
  const midDescriptions = [
    'Balancing period. Good for social activities and collaboration.',
    'Transitional phase. Reassess priorities and adjust as needed.',
    'Steady energy flow. Maintain momentum on important tasks.'
  ];
  
  const lateDescriptions = [
    'Reflective period. Ideal for planning and strategic thinking.',
    'Energy begins to decline. Focus on completion rather than new starts.',
    'Integration phase. Connect the dots and synthesize learnings.'
  ];
  
  return {
    overview: overviews[Math.floor(Math.random() * overviews.length)],
    phases: [
      {
        title: `Early ${month} (1-10)`,
        description: earlyDescriptions[Math.floor(Math.random() * earlyDescriptions.length)]
      },
      {
        title: `Mid ${month} (11-20)`,
        description: midDescriptions[Math.floor(Math.random() * midDescriptions.length)]
      },
      {
        title: `Late ${month} (21-31)`,
        description: lateDescriptions[Math.floor(Math.random() * lateDescriptions.length)]
      }
    ]
  };
}

/**
 * 生成完整的月度报告模拟数据
 * @param year 年份
 * @param month 月份 (1-12)
 * @param days 天数
 * @returns 完整的报告数据
 */
export function generateMonthlyReportData(year: number, month: number, days: number) {
  const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  
  return {
    dailyEnergy: generateDailyEnergyData(year, month, days),
    notifications: generateNotificationData(year, month, Math.min(days / 5, 5)),
    hourlyEnergy: generateHourlyEnergyData(),
    weeklyForecast: generateWeeklyForecastData(year, month),
    monthlyOverview: generateMonthlyOverview(monthName, year),
    month: monthName,
    year
  };
} 