"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import Link from 'next/link';
import { SubscriptionTier } from '@/app/lib/subscription-config';
import { FadeInContainer } from './animations/FadeInContainer';

// 生成12个月的模拟数据
const generateMockData = () => {
  const today = new Date();
  const mockData = [];
  
  for (let i = 0; i < 12; i++) {
    const currentDate = addMonths(today, i);
    const monthName = format(currentDate, 'MMM');
    
    // 生成-25到+25之间的随机能量变化值
    const randomChange = Math.floor(Math.random() * 51) - 25;
    
    mockData.push({
      month: monthName,
      energyChange: randomChange,
      trend: randomChange > 0 ? 'up' : randomChange < 0 ? 'down' : 'stable',
      crystal: ['Clear Quartz', 'Amethyst', 'Rose Quartz', 'Citrine', 'Tiger\'s Eye'][Math.floor(Math.random() * 5)]
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
  const [monthlyData, setMonthlyData] = useState(generateMockData());
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-5 bg-purple-900 bg-opacity-30">
        <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
        <p className="text-gray-200 text-sm">
          These are sample energy values. Upgrade to see your personalized energy forecast based on your birth chart.
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
                    {/* 水晶列显示锁定状态 */}
                    <span className="text-gray-400">
                      <span className="mr-1">🔒</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b border-purple-700">
                    {/* Action列显示锁定状态 */}
                    <button disabled className="text-gray-500 cursor-not-allowed text-sm px-3 py-1 rounded-full border border-gray-700 flex items-center">
                      <span className="mr-1">🔒</span> Locked
                    </button>
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