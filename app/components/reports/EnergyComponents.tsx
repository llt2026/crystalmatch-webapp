/**
 * 能量报告共享组件
 * 提供可重用的能量报告UI组件，适配移动端和桌面端
 */
import React, { ReactNode } from 'react';

// 日期类型
type DateString = string; // 格式: "YYYY-MM-DD"

// 能量趋势类型
export type EnergyTrend = 'up' | 'down' | 'stable';

// 日能量数据类型
export interface DailyEnergyData {
  date: DateString;
  energyChange: number;
  trend: EnergyTrend;
}

// 推送通知数据类型
export interface NotificationData {
  date: DateString;
  title: string;
  message: string;
  type: 'peak' | 'low' | 'balanced';
}

// 小时能量数据类型
export interface HourlyEnergyData {
  hour: number;
  energyValue: number;
}

// 周预测数据类型
export interface WeeklyForecastData {
  weekNumber: number;
  startDate: DateString;
  endDate: DateString;
  forecast: string;
}

/**
 * 日能量表格组件
 */
export const DailyEnergyTable: React.FC<{
  data: DailyEnergyData[];
  month: string;
}> = ({ data, month }) => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="min-w-full px-4 sm:px-0">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Energy</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((day, i) => {
            const date = new Date(day.date);
            const displayDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            return (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-900/30'}>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{displayDate}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{day.energyChange}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    day.trend === 'up' ? 'bg-green-900/40 text-green-300' : 
                    day.trend === 'down' ? 'bg-red-900/40 text-red-300' : 
                    'bg-blue-900/40 text-blue-300'
                  }`}>
                    {day.trend === 'up' ? 'Up' : day.trend === 'down' ? 'Down' : 'Stable'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * 推送通知组件
 */
export const PushNotifications: React.FC<{
  data: NotificationData[];
}> = ({ data }) => (
  <div className="space-y-3">
    {data.map((notification, i) => {
      const date = new Date(notification.date);
      const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      return (
        <div key={i} className="bg-gray-800/60 p-3 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-purple-300">{displayDate}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              notification.type === 'peak' ? 'bg-purple-900/60 text-purple-200' :
              notification.type === 'low' ? 'bg-red-900/60 text-red-200' :
              'bg-blue-900/60 text-blue-200'
            }`}>
              {notification.title}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {notification.message}
          </p>
        </div>
      );
    })}
  </div>
);

/**
 * 小时能量高峰组件
 */
export const HourlyEnergyPeaks: React.FC<{
  data: HourlyEnergyData[];
  date?: DateString;
}> = ({ data, date }) => (
  <div className="flex flex-col space-y-4">
    {date && (
      <p className="text-xs text-center text-purple-200">
        Energy peaks for {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    )}
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full px-4 sm:px-0">
        <div className="grid grid-cols-12 gap-1 h-32">
          {data.map((hourData) => {
            // 将能量值归一化到20-80的范围内用于显示
            const height = Math.max(20, Math.min(80, Math.abs(hourData.energyValue) * 5 + 30));
            return (
              <div key={hourData.hour} className="flex flex-col items-center">
                <div className="flex-grow w-full flex items-end">
                  <div 
                    className={`w-full ${
                      hourData.energyValue > 5 ? 'bg-purple-600' : 
                      hourData.energyValue > 0 ? 'bg-purple-500' : 
                      hourData.energyValue > -5 ? 'bg-purple-400/60' :
                      'bg-purple-300/40'
                    } rounded-t`} 
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{hourData.hour}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <div className="text-xs text-center text-gray-400">Hour of day (0-23)</div>
  </div>
);

/**
 * 周预测组件
 */
export const WeeklyForecast: React.FC<{
  data: WeeklyForecastData[];
}> = ({ data }) => (
  <div className="space-y-4">
    {data.map((week) => (
      <div key={week.weekNumber} className="bg-gray-800/60 p-3 rounded-md">
        <h3 className="text-sm font-medium text-purple-300 mb-2">
          Week {week.weekNumber} ({new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
        </h3>
        <p className="text-sm text-gray-300">
          {week.forecast}
        </p>
      </div>
    ))}
  </div>
);

/**
 * 月概览组件
 */
export const MonthlyOverview: React.FC<{
  overview: string;
  phases: Array<{
    title: string;
    description: string;
  }>;
}> = ({ overview, phases }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-300">{overview}</p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {phases.map((phase, i) => (
        <div key={i} className="bg-purple-900/30 p-3 rounded-md">
          <h4 className="text-sm font-medium text-purple-300 mb-2">{phase.title}</h4>
          <p className="text-xs text-gray-300">{phase.description}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * 报告加载组件
 */
export const ReportLoading: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex flex-col items-center justify-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
    <p className="text-purple-300">Loading your energy report...</p>
  </div>
);

// 报告容器组件接口
interface ReportContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  isNew?: boolean; // 添加isNew可选属性
}

// 报告容器组件
export const ReportContainer = ({ title, subtitle, children, isNew = false }: ReportContainerProps) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center mb-6">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {isNew && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">NEW</span>
            )}
          </div>
          <p className="text-purple-300 mt-1">{subtitle}</p>
        </header>
        
        {children}
      </div>
    </main>
  );
};

// 添加MonthlyEnergyChart组件
export const MonthlyEnergyChart = ({ data, month }: { data: any; month: string }) => {
  // 模拟数据，实际项目中应使用传入的data
  const chartData = data || {
    days: [1, 5, 10, 15, 20, 25, 30],
    values: [65, 78, 92, 84, 70, 88, 75]
  };

  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-sm text-purple-300">{month} 2025</span>
        </div>
      </div>
      
      {/* 简单的图表可视化 */}
      <div className="relative h-40 mt-2">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between h-32">
          {chartData.values.map((value: number, index: number) => (
            <div key={index} className="group relative flex flex-col items-center">
              <div 
                className="w-3 md:w-4 bg-gradient-to-t from-purple-500 to-purple-700 rounded-t-sm transition-all"
                style={{ height: `${value * 0.3}%` }}
              ></div>
              <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-black/80 text-xs text-white px-2 py-1 rounded transition-opacity">
                {value}
              </div>
              <span className="text-xs mt-1 text-purple-300">{chartData.days[index]}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 图表说明 */}
      <div className="mt-3 text-xs text-purple-200">
        <p>Energy level throughout the month based on your birth chart.</p>
      </div>
    </div>
  );
}; 