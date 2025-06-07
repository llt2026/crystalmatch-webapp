/**
 * 月度深度报告配置文件
 * 定义报告范围、时间参数和内容设置
 */

// 报告基准日期和范围配置
export interface ReportTimeConfig {
  baseDate: Date;  // 报告基准日期
  daysRange: number;  // 报告覆盖天数
  title: string;  // 报告标题
  requiresPlan: 'plus' | 'pro';  // 所需订阅等级
}

// 不同月份报告配置
export const monthlyReports: Record<string, ReportTimeConfig> = {
  'may-2025': {
    baseDate: new Date('2025-06-10'),  // 初始设置为6月10日
    daysRange: 30,
    title: 'May 2025 Monthly Energy Report',
    requiresPlan: 'pro'
  },
  'apr-2025': {
    baseDate: new Date('2025-05-10'),  // 初始设置为5月10日
    daysRange: 30,
    title: 'April 2025 Monthly Energy Report',
    requiresPlan: 'plus'
  }
};

// 根据用户订阅时间计算报告基准日期
export function calculateReportBaseDate(
  subscriptionDate: Date | null,
  reportKey: string
): Date {
  // 如果有订阅日期，使用订阅日期作为基础计算
  // 否则使用默认配置的日期
  if (subscriptionDate) {
    // 从订阅日期开始计算
    // 此逻辑可根据实际需求调整
    return subscriptionDate;
  }
  
  return monthlyReports[reportKey]?.baseDate || new Date();
}

// 获取报告配置
export function getReportConfig(reportKey: string): ReportTimeConfig | null {
  return monthlyReports[reportKey] || null;
}

// 报告内容模块配置
export const reportModules = {
  'may-2025': [
    'dailyEnergyTable',
    'pushNotifications',
    'hourlyEnergyPeaks',
    'weeklyForecast',
    'monthlyOverview'
  ],
  'apr-2025': [
    'dailyEnergyTable',
    'pushNotifications',
    'hourlyEnergyPeaks'
  ]
};