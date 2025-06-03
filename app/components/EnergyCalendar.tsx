"use client";

import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '@/app/lib/subscription-config';
import { FadeInContainer } from './animations/FadeInContainer';
import { calculateEnergyCalendar } from '../lib/fiveElementsEnergy';

interface MonthData {
  month: string;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal: string;
  date?: Date;
  monthPillar?: string;
}

interface EnergyCalendarProps {
  birthday: string;
  subscriptionTier: SubscriptionTier;
  userId: string;
}

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ 
  birthday, 
  subscriptionTier,
  userId 
}) => {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const calculateRealEnergyChanges = async () => {
      try {
        if (!birthday) {
          throw new Error('缺少出生日期信息');
        }
        
        console.log(`计算用户 ${userId} 的能量变化，生日: ${birthday}`);
        
        // 使用 fiveElementsEnergy.ts 中的函数计算能量日历
        try {
          const calendarData = await calculateEnergyCalendar(birthday);
          console.log('能量日历计算完成', calendarData);
          
          // 转换为 MonthData 格式
          const realData = calendarData.map((monthData) => {
            return {
              month: monthData.month,
              energyChange: monthData.energyChange,
              trend: monthData.trend,
              crystal: monthData.crystal,
              date: new Date()
            };
          });
          
          setMonthlyData(realData);
        } catch (err) {
          console.error('计算能量日历失败:', err);
          throw new Error(`计算能量日历失败: ${(err as Error).message}`);
        }
      } catch (err) {
        console.error('计算能量变化失败:', err);
        setError(`计算能量变化失败: ${(err as Error).message}`);
        // 错误时显示空数据
        setMonthlyData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // 计算真实数据
    calculateRealEnergyChanges();
  }, [birthday, userId]);
  
  // 如果加载中显示加载状态
  if (isLoading) {
    return (
      <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="p-5 bg-purple-900 bg-opacity-30">
          <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
          <p className="text-gray-200 text-sm">Loading your personal energy forecast...</p>
        </div>
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-purple-200">Calculating energy values...</span>
        </div>
      </FadeInContainer>
    );
  }
  
  // 如果出错或没有数据
  if (error || monthlyData.length === 0) {
    return (
      <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="p-5 bg-purple-900 bg-opacity-30">
          <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
          <p className="text-gray-200 text-sm">
            <span className="text-rose-300">Unable to calculate energy values. {error}</span>
          </p>
        </div>
        <div className="p-10 text-center">
          <p className="text-lg text-purple-200 mb-4">We encountered an issue calculating your energy calendar.</p>
          <p className="text-sm text-purple-300">Please try again later or contact support if the issue persists.</p>
        </div>
      </FadeInContainer>
    );
  }
  
  return (
    <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-5 bg-purple-900 bg-opacity-30">
        <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
        <p className="text-gray-200 text-sm">Your personal energy forecast by solar terms</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-purple-900 bg-opacity-40 text-purple-100">
            <tr>
              <th className="py-3 px-4 font-medium">Date Range</th>
              <th className="py-3 px-4 font-medium">Energy Change</th>
              <th className="py-3 px-4 font-medium">Crystal</th>
              <th className="py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, index) => (
              <tr key={month.month} className="border-t border-purple-800 bg-opacity-20 hover:bg-purple-800 hover:bg-opacity-40 transition-colors">
                <td className="py-3 px-4 border-b border-purple-700">{month.month}</td>
                <td className="py-3 px-4 border-b border-purple-700">
                  {/* 根据能量变化正负值显示不同样式 */}
                  {month.energyChange === 0 ? (
                    <span className="text-gray-300">—</span>
                  ) : month.energyChange > 0 ? (
                    <span className="text-green-300 font-medium">▲ +{month.energyChange}</span>
                  ) : (
                    <span className="text-rose-300 font-medium">▼ {month.energyChange}</span>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-purple-700">
                  {/* 根据订阅类型显示水晶推荐或锁定状态 */}
                  {subscriptionTier === 'yearly' ? (
                    <span className="text-white">{month.crystal}</span>
                  ) : (
                    <span className="text-gray-400">
                      <span className="mr-1">🔒</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-purple-700">
                  {/* 根据订阅类型显示操作按钮或锁定状态 */}
                  {subscriptionTier === 'yearly' ? (
                    <button className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full hover:bg-purple-500 transition-colors">
                      View Details
                    </button>
                  ) : (
                    <button disabled className="text-gray-500 cursor-not-allowed text-sm px-3 py-1 rounded-full border border-gray-700 flex items-center">
                      <span className="mr-1">🔒</span> Locked
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeInContainer>
  );
};

export default EnergyCalendar; 