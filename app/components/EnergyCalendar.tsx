"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import Link from 'next/link';
import { SubscriptionTier } from '@/app/lib/subscription-config';
import { FadeInContainer } from './animations/FadeInContainer';
import { calculateMonthlyEnergy, MonthlyEnergyOutput } from '../lib/calculateMonthlyEnergy';

interface MonthData {
  month: string;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal: string;
  date: Date;
}

// 生成12个月的模拟数据
const generateMockData = (): MonthData[] => {
  const today = new Date();
  const mockData: MonthData[] = [];
  
  for (let i = 0; i < 12; i++) {
    const currentDate = addMonths(today, i);
    const monthName = format(currentDate, 'MMM');
    
    // 生成-25到+25之间的随机能量变化值
    const randomChange = Math.floor(Math.random() * 51) - 25;
    const trendValue: 'up' | 'down' | 'stable' = randomChange > 0 ? 'up' : randomChange < 0 ? 'down' : 'stable';
    
    mockData.push({
      month: monthName,
      energyChange: randomChange,
      trend: trendValue,
      crystal: ['Clear Quartz', 'Amethyst', 'Rose Quartz', 'Citrine', 'Tiger\'s Eye'][Math.floor(Math.random() * 5)],
      date: currentDate
    });
  }
  
  return mockData;
};

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
  const [monthlyData, setMonthlyData] = useState<MonthData[]>(generateMockData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);
  
  useEffect(() => {
    // 尝试计算真实的能量变化
    const calculateRealEnergyChanges = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!birthday) {
          throw new Error('出生日期不能为空');
        }
        
        console.log(`计算用户 ${userId} 的能量变化，生日: ${birthday}`);
        
        const today = new Date();
        const realData: MonthData[] = [];
        let prevMonthResult = null;
        
        // 为12个月计算能量变化
        for (let i = 0; i < 12; i++) {
          const currentDate = addMonths(today, i);
          const monthName = format(currentDate, 'MMM');
          
          try {
            // 调用calculateMonthlyEnergy计算能量变化
            const result = calculateMonthlyEnergy({
              birthday,
              dateRef: currentDate,
              prevMonthScores: prevMonthResult?.monthScores || null
            });
            
            // 计算平均能量变化值，放大到-25到25的范围
            const avgChange = Object.values(result.diffScores).reduce((sum, val) => sum + val, 0) / 5;
            const scaledChange = Math.round(avgChange * 8); // 放大比例
            
            realData.push({
              month: monthName,
              energyChange: scaledChange,
              trend: result.trend,
              crystal: ['Clear Quartz', 'Amethyst', 'Rose Quartz', 'Citrine', 'Tiger\'s Eye'][Math.floor(Math.random() * 5)],
              date: currentDate
            });
            
            prevMonthResult = result;
            console.log(`${monthName} 能量变化: ${scaledChange}, 趋势: ${result.trend}`);
          } catch (monthError) {
            console.error(`计算 ${monthName} 能量变化失败:`, monthError);
            throw new Error(`计算 ${monthName} 能量变化失败: ${(monthError as Error).message}`);
          }
        }
        
        setMonthlyData(realData);
        setUseMockData(false);
        console.log('能量变化计算完成', realData);
      } catch (err) {
        console.error('计算能量变化失败:', err);
        setError(`计算能量变化失败: ${(err as Error).message}`);
        // 失败时使用模拟数据
        setMonthlyData(generateMockData());
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    // 尝试计算真实数据
    calculateRealEnergyChanges();
  }, [birthday, userId]);
  
  return (
    <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-5 bg-purple-900 bg-opacity-30">
        <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
        <p className="text-gray-200 text-sm">
          {useMockData 
            ? "These are sample energy values. Upgrade to see your personalized energy forecast."
            : "Your personal energy forecast based on your birth chart."}
          {error && <span className="text-rose-300 ml-2">({error})</span>}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-purple-200">Loading energy values...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-purple-900 bg-opacity-40 text-purple-100">
              <tr>
                <th className="py-3 px-4 font-medium">Month</th>
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
      )}
    </FadeInContainer>
  );
};

export default EnergyCalendar; 