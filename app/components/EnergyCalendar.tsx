"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { calculateMonthlyEnergy, Elem, ElementRecord } from '@/app/lib/calculateMonthlyEnergy';
import { SubscriptionTier, getVisibleEnergyMonths } from '@/app/lib/subscription-config';
import { getUserBaziVector, calculateEnergyCalendar } from '../lib/fiveElementsEnergy';
import { FadeInContainer } from './animations/FadeInContainer';

// Crystal mapping for lowest element
const CRYSTAL_MAP: Record<Elem, string> = {
  wood: 'Jade',
  fire: 'Ruby',
  earth: 'Citrine',
  metal: 'Clear Quartz',
  water: 'Sodalite'
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
  const [monthlyData, setMonthlyData] = useState<Array<{
    month: string;
    energyChange: number;
    trend: 'up' | 'down' | 'stable';
    crystal: string;
    lowestElement: Elem;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取基于八字的总体水晶推荐（为免费用户准备）
  const [overallCrystal, setOverallCrystal] = useState<{
    name: string;
    element: Elem;
  }>({ name: 'Unknown', element: 'earth' });

  const isPremium = subscriptionTier === 'monthly' || subscriptionTier === 'yearly';
  const isYearly = subscriptionTier === 'yearly';
  const visibleMonths = getVisibleEnergyMonths(subscriptionTier);

  useEffect(() => {
    async function loadEnergyCalendarData() {
      setIsLoading(true);
      try {
        console.log("开始计算能量日历，生日:", birthday);
        
        // 使用新的五行能量计算模块
        const calendarData = await calculateEnergyCalendar(birthday);
        console.log("月度能量数据:", calendarData.map(m => `${m.month}: ${m.energyChange}`).join(', '));
        
        setMonthlyData(calendarData);
      } catch (error) {
        console.error("计算能量日历失败:", error);
        // 出错时设置空数据
        setMonthlyData([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEnergyCalendarData();
  }, [birthday]);

  return (
    <FadeInContainer className="mb-10 bg-opacity-25 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="p-5 bg-purple-900 bg-opacity-30">
        <h3 className="text-xl font-semibold text-white">Energy Calendar</h3>
        <p className="text-gray-200 text-sm">
          Monthly energy fluctuations and recommended crystals for the next 12 months
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-purple-200">Calculating energy values...</span>
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
                    {/* 能量值显示逻辑: 
                      - 免费用户: 只有首月可见
                      - 月订阅: 能量值全年可见
                      - 年订阅: 能量值全年可见
                    */}
                    {(index === 0 || subscriptionTier === 'monthly' || subscriptionTier === 'yearly') ? (
                      <>
                        {month.energyChange === 0 ? (
                          <span className="text-gray-300">—</span>
                        ) : month.energyChange > 0 ? (
                          <span className="text-green-300 font-medium">▲ +{month.energyChange}</span>
                        ) : (
                          <span className="text-rose-300 font-medium">▼ {month.energyChange}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">
                        <span className="mr-1">🔒</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-purple-700">
                    {/* 水晶显示逻辑:
                      - 免费用户: 只有首月可见
                      - 月订阅: 只有首月可见
                      - 年订阅: 全年可见
                    */}
                    {(index === 0 || subscriptionTier === 'yearly') ? (
                      <div className="flex items-center">
                        <span className="mr-2">💎</span>
                        <span>{month.crystal}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        <span className="mr-1">🔒</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-purple-700">
                    {/* 深度报告按钮逻辑:
                      - 免费用户: 只有首月可点击，其他显示锁定
                      - 月订阅: 只有首月可点击，其他显示锁定
                      - 年订阅: 全年可点击
                    */}
                    {(index === 0 || subscriptionTier === 'yearly') ? (
                      <button className="text-purple-300 hover:text-white transition-colors text-sm px-3 py-1 rounded-full border border-purple-400 hover:border-purple-300">
                        View Report
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
      
      {!isLoading && subscriptionTier === 'free' && (
        <div className="bg-purple-900 bg-opacity-30 p-4 text-center">
          <p className="text-purple-200 mb-2">Upgrade to view all months energy forecasts</p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
            Upgrade Now
          </button>
        </div>
      )}
    </FadeInContainer>
  );
};

export default EnergyCalendar; 