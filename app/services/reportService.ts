/**
 * 报告服务层
 * 处理报告数据的API调用和数据处理
 */

import { DailyEnergyData, NotificationData, HourlyEnergyData, WeeklyForecastData } from '../components/reports/EnergyComponents';
import { generateMonthlyReportData } from '../lib/mockReportData';

// 接口定义
export interface MonthlyReportData {
  dailyEnergy: DailyEnergyData[];
  notifications: NotificationData[];
  hourlyEnergy: HourlyEnergyData[];
  weeklyForecast: WeeklyForecastData[];
  monthlyOverview: {
    overview: string;
    phases: Array<{
      title: string;
      description: string;
    }>;
  };
  month: string;
  year: number;
}

// 环境变量
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * 获取月度报告数据
 * @param reportKey 报告键名
 * @param birthDate 出生日期
 * @returns 月度报告数据
 */
export async function fetchMonthlyReportData(
  reportKey: string,
  birthDate?: string
): Promise<MonthlyReportData> {
  // 如果使用模拟数据或者API基础URL未设置
  if (USE_MOCK_DATA || !API_BASE_URL) {
    let year = 2025;
    let month = 5; // 默认May 2025
    
    // 根据reportKey设置年月
    if (reportKey === 'apr-2025') {
      month = 4;
    } else if (reportKey === 'may-2025') {
      month = 5;
    }
    
    console.log(`Using mock data for ${month}/${year}`);
    // 使用模拟数据
    return generateMonthlyReportData(year, month, 30);
  }
  
  try {
    // 准备请求参数
    const params = new URLSearchParams();
    if (birthDate) {
      params.append('birthDate', birthDate);
    }
    params.append('reportKey', reportKey);
    
    // 发起API请求
    const response = await fetch(`${API_BASE_URL}/api/reports/monthly?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include' // 包含认证cookie
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching monthly report data:', error);
    
    // 出错时回退到模拟数据
    let year = 2025;
    let month = 5; // 默认May 2025
    
    if (reportKey === 'apr-2025') {
      month = 4;
    } else if (reportKey === 'may-2025') {
      month = 5;
    }
    
    console.log(`Falling back to mock data for ${month}/${year}`);
    return generateMonthlyReportData(year, month, 30);
  }
}

/**
 * 获取特定日期的小时能量数据
 * @param date 日期
 * @param birthDate 出生日期
 * @returns 小时能量数据
 */
export async function fetchHourlyEnergyData(
  date: string,
  birthDate?: string
): Promise<HourlyEnergyData[]> {
  // 如果使用模拟数据或者API基础URL未设置
  if (USE_MOCK_DATA || !API_BASE_URL) {
    // 使用模拟数据
    return generateMonthlyReportData(2025, 5, 30).hourlyEnergy;
  }
  
  try {
    // 准备请求参数
    const params = new URLSearchParams();
    if (birthDate) {
      params.append('birthDate', birthDate);
    }
    params.append('date', date);
    
    // 发起API请求
    const response = await fetch(`${API_BASE_URL}/api/energy/hourly?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include' // 包含认证cookie
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hourly energy data:', error);
    
    // 出错时回退到模拟数据
    return generateMonthlyReportData(2025, 5, 30).hourlyEnergy;
  }
} 