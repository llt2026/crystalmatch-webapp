/**
 * 报告服务层
 * 处理报告数据的API调用和数据处理
 */

import { DailyEnergyData, NotificationData, HourlyEnergyData, WeeklyForecastData } from '../components/reports/EnergyComponents';

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
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not set. Cannot fetch real data.');
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
        'Cache-Control': 'no-cache, no-store'
      },
      credentials: 'include', // 包含认证cookie
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching monthly report data:', error);
    throw error; // 向上传播错误，不使用模拟数据
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
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not set. Cannot fetch real data.');
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
        'Cache-Control': 'no-cache, no-store'
      },
      credentials: 'include', // 包含认证cookie
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching hourly energy data:', error);
    throw error; // 向上传播错误，不使用模拟数据
  }
} 