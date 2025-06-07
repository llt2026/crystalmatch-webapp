/**
 * 月度报告配置文件
 * 定义不同月份报告的配置信息
 */

interface MonthlyReportConfig {
  title: string;
  description: string;
  subscriptionLevel: 'plus' | 'pro';
  baseDate: Date;
  enabled: boolean;
}

// 月度报告配置
const monthlyReports: Record<string, MonthlyReportConfig> = {
  // 即将推出的报告
  'jun-2025': {
    title: 'June 2025 Energy Report',
    description: 'Complete energy analysis for June 2025',
    subscriptionLevel: 'pro',
    baseDate: new Date('2025-06-10'),  // 初始设置为6月10日
    enabled: false, // 尚未启用
  },
  
  // 当前可用的报告
  'may-2025': {
    title: 'May 2025 Energy Report',
    description: 'Pro level monthly energy forecast for May 2025',
    subscriptionLevel: 'pro',
    baseDate: new Date('2025-05-10'),  // 初始设置为5月10日
    enabled: true,
  },
  
  'apr-2025': {
    title: 'April 2025 Energy Report',
    description: 'Plus level monthly energy forecast for April 2025',
    subscriptionLevel: 'plus',
    baseDate: new Date('2025-04-10'),  // 初始设置为4月10日
    enabled: true,
  },
};

/**
 * 获取月度报告配置
 * @param reportKey 报告键名
 * @returns 报告配置对象
 */
export function getReportConfig(reportKey: string): MonthlyReportConfig | null {
  return monthlyReports[reportKey] || null;
}

/**
 * 获取报告基准日期
 * @param reportKey 报告键名
 * @returns 报告基准日期
 */
export function getReportBaseDate(reportKey: string): Date {
  return monthlyReports[reportKey]?.baseDate || new Date();
}

/**
 * 获取所有可用的报告列表
 * @returns 可用报告配置列表
 */
export function getAvailableReports(): Array<{ key: string; config: MonthlyReportConfig }> {
  return Object.entries(monthlyReports)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({ key, config }));
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