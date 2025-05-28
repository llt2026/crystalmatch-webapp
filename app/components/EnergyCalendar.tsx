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

// 常用水晶列表，根据月份和元素特性分配
const CRYSTALS_BY_TREND: Record<string, string[]> = {
  'up': ['Clear Quartz', 'Citrine', 'Tiger\'s Eye', 'Pyrite', 'Carnelian'],
  'down': ['Amethyst', 'Rose Quartz', 'Blue Lace Agate', 'Smoky Quartz', 'Labradorite'],
  'stable': ['Green Aventurine', 'Amazonite', 'Malachite', 'Moss Agate', 'Jade']
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
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 计算真实的能量变化
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
            console.log(`开始计算 ${monthName} 月的能量变化...`);
            console.log(`参数: birthday=${birthday}, dateRef=${currentDate.toISOString()}`);
            
            // 调用calculateMonthlyEnergy计算能量变化
            const result = calculateMonthlyEnergy({
              birthday,
              dateRef: currentDate,
              prevMonthScores: prevMonthResult?.monthScores || null
            });
            
            console.log(`计算结果:`, JSON.stringify(result, null, 2));
            
            // 计算平均能量变化值，放大到-25到25的范围
            const avgChange = Object.values(result.diffScores).reduce((sum, val) => sum + val, 0) / 5;
            // 将平均变化映射到-25~25范围：avgChange 范围大约 -100~100
            let scaledChange = Math.round(avgChange / 4); // 约等于 -25~25
            // clamp
            if (scaledChange > 25) scaledChange = 25;
            if (scaledChange < -25) scaledChange = -25;
            
            console.log(`平均变化: ${avgChange}, 放大后: ${scaledChange}`);
            
            // 根据趋势选择合适的水晶
            const trendCrystals = CRYSTALS_BY_TREND[result.trend] || CRYSTALS_BY_TREND['stable'];
            const recommendedCrystal = trendCrystals[Math.floor(Math.random() * trendCrystals.length)];
            
            realData.push({
              month: monthName,
              energyChange: scaledChange,
              trend: result.trend,
              crystal: recommendedCrystal,
              date: currentDate
            });
            
            prevMonthResult = result;
            console.log(`${monthName} 能量变化: ${scaledChange}, 趋势: ${result.trend}, 水晶: ${recommendedCrystal}`);
          } catch (monthError) {
            console.error(`计算 ${monthName} 能量变化失败:`, monthError);
            // 记录详细错误信息
            console.error(`错误详情:`, (monthError as Error).message);
            console.error(`错误堆栈:`, (monthError as Error).stack);
            
            // 即使单个月份计算失败，我们也继续处理其他月份
            realData.push({
              month: monthName,
              energyChange: 0,
              trend: 'stable',
              crystal: 'Clear Quartz', // 默认水晶
              date: currentDate
            });
          }
        }
        
        if (realData.length === 0) {
          throw new Error('无法计算任何月份的能量变化');
        }
        
        setMonthlyData(realData);
        console.log('能量变化计算完成', realData);
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
        <p className="text-gray-200 text-sm">Your personal energy forecast</p>
      </div>

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
    </FadeInContainer>
  );
};

export default EnergyCalendar; 