"use client";

import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { calculateMonthlyEnergy, Elem, ElementRecord } from '@/app/lib/calculateMonthlyEnergy';
import { SubscriptionTier, getVisibleEnergyMonths } from '@/app/lib/subscription-config';

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
  
  // 获取基于八字的总体水晶推荐（为免费用户准备）
  const [overallCrystal, setOverallCrystal] = useState<{
    name: string;
    element: Elem;
  }>({ name: 'Unknown', element: 'earth' });

  const isPremium = subscriptionTier === 'monthly' || subscriptionTier === 'yearly';
  const isYearly = subscriptionTier === 'yearly';
  const visibleMonths = getVisibleEnergyMonths(subscriptionTier);

  useEffect(() => {
    // Calculate energy calendar data for 12 months
    const today = new Date();
    const months: Array<{
      month: string;
      energyChange: number;
      trend: 'up' | 'down' | 'stable';
      crystal: string;
      lowestElement: Elem;
    }> = [];
    let prevMonthScores: ElementRecord | null = null;
    let weakestOverallElement: { elem: Elem, score: number } = { elem: 'earth', score: 100 };
    let baseScores: ElementRecord | null = null; // 存储八字基础分数

    console.log("开始计算能量日历，生日:", birthday);

    // Always calculate all 12 months data, but display according to subscription tier
    for (let i = 0; i < 12; i++) {
      const currentDate = addMonths(today, i);
      const monthName = format(currentDate, 'MMM');
      
      try {
        // Calculate energy for this month
        const energyData = calculateMonthlyEnergy({
          birthday,
          dateRef: currentDate,
          prevMonthScores
        });

        // 保存八字基础分数(首月)
        if (i === 0) {
          baseScores = { ...energyData.baseScores };
          console.log("首月八字基础分数:", baseScores);
          console.log("首月当前分数:", energyData.monthScores);
        }
        
        // Find the lowest element for this month
        const lowestElement = Object.entries(energyData.monthScores).reduce(
          (lowest, [elem, score]) => {
            const elemKey = elem as Elem;
            return score < lowest.score ? { elem: elemKey, score } : lowest;
          },
          { elem: 'earth' as Elem, score: 100 }
        );
        
        // For the first month, also update the overall weakest element for free users
        if (i === 0) {
          // 使用baseScores而不是monthScores来找出基于八字的最弱元素
          weakestOverallElement = Object.entries(energyData.baseScores).reduce(
            (lowest, [elem, score]) => {
              const elemKey = elem as Elem;
              return score < lowest.score ? { elem: elemKey, score } : lowest;
            },
            { elem: 'earth' as Elem, score: 100 }
          );
          
          // 设置总体水晶推荐
          setOverallCrystal({
            name: CRYSTAL_MAP[weakestOverallElement.elem],
            element: weakestOverallElement.elem
          });
        }
        
        // 计算能量变化值
        let roundedChange: number;
        
        if (i === 0) {
          // 首月：与八字基础值比较
          // 计算当月分数与八字基础分数的平均差异
          const diffs = Object.keys(energyData.monthScores).map(elemKey => {
            const elem = elemKey as Elem;
            const diff = energyData.monthScores[elem] - energyData.baseScores[elem];
            return { elem, diff };
          });
          
          console.log("首月各元素差异:", diffs);
          
          const avgDiff = diffs.reduce((sum, item) => sum + item.diff, 0) / 5;
          console.log("首月平均差异:", avgDiff);
          
          roundedChange = Math.round(avgDiff);

          // 防止首月显示为0，确保有可见的变化
          if (roundedChange === 0) {
            // 查找变化最大的元素
            const maxDiff = diffs.reduce((max, item) => 
              Math.abs(item.diff) > Math.abs(max.diff) ? item : max, 
              { elem: 'earth', diff: 0 }
            );
            
            // 如果有任何元素有非零变化，使用该变化的符号
            if (maxDiff.diff !== 0) {
              roundedChange = maxDiff.diff > 0 ? 1 : -1;
            } else {
              // 如果所有元素变化都是0，使用最弱元素决定方向
              roundedChange = weakestOverallElement.score < 50 ? -1 : 1;
            }
            
            console.log("首月修正后变化值:", roundedChange);
          }
        } else {
          // 非首月：与上月比较(使用diffScores)
          const avgChange = Object.values(energyData.diffScores).reduce((sum, val) => sum + val, 0) / 5;
          roundedChange = Math.round(avgChange);
        }
        
        // Get crystal recommendation based on lowest element
        const crystal = CRYSTAL_MAP[lowestElement.elem];
        
        months.push({
          month: monthName,
          energyChange: roundedChange,
          trend: energyData.trend,
          crystal,
          lowestElement: lowestElement.elem
        });
        
        // Save this month's scores for the next iteration
        prevMonthScores = energyData.monthScores;
      } catch (error) {
        console.error(`Error calculating energy for ${monthName}:`, error);
        months.push({
          month: monthName,
          energyChange: i === 0 ? 1 : 0, // 确保首月有值
          trend: 'stable' as const,
          crystal: 'Unknown',
          lowestElement: 'earth'
        });
      }
    }
    
    console.log("月度能量数据:", months.map(m => `${m.month}: ${m.energyChange}`).join(', '));
    setMonthlyData(months);
  }, [birthday]);

  return (
    <div className="w-full mt-6 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Energy Calendar</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-purple-900/60 border border-purple-800 rounded-lg">
          <thead>
            <tr className="bg-purple-800/80">
              <th className="py-3 px-4 text-left text-white font-medium">Month</th>
              <th className="py-3 px-4 text-left text-white font-medium">Energy Change</th>
              <th className="py-3 px-4 text-left text-white font-medium">Crystal</th>
              <th className="py-3 px-4 text-left text-white font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* 显示所有12个月 */}
            {monthlyData.slice(0, 12).map((month, index) => {
              return (
                <tr key={month.month} className={index % 2 === 0 ? 'bg-purple-900/60' : 'bg-purple-800/40'}>
                  <td className="py-3 px-4 border-b border-purple-700 text-white">{month.month}</td>
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
                  <td className="py-3 px-4 border-b border-purple-700 text-white">
                    {/* 水晶显示逻辑: 
                      - 免费用户: 所有月份锁定
                      - 月订阅: 当月可见，其他锁定
                      - 年订阅: 所有月份可见
                    */}
                    {(subscriptionTier === 'yearly' || (subscriptionTier === 'monthly' && index === 0)) ? (
                      <div className="flex items-center">
                        <span className="mr-1">
                          <Image 
                            src={`/images/crystals/${month.lowestElement}.png`} 
                            alt={month.crystal}
                            width={16}
                            height={16}
                            className="inline-block"
                          />
                        </span>
                        {month.crystal}
                      </div>
                    ) : (
                      <span className="text-gray-400">
                        <span className="mr-1">🔒</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-purple-700">
                    {/* 操作显示逻辑: 
                      - 免费用户: 只有当月可用
                      - 月订阅: 只有当月可用
                      - 年订阅: 所有月份可用
                    */}
                    {(index === 0 || subscriptionTier === 'yearly') ? (
                      <Link 
                        href={`/monthly-rituals/${month.month.toLowerCase()}`}
                        className="text-purple-300 hover:text-purple-100 font-medium"
                      >
                        ✓ View Rituals
                      </Link>
                    ) : (
                      <span className="text-gray-400">
                        <span className="mr-1">🔒</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Remaining months locked indicator */}
      {subscriptionTier === 'free' && (
        <div className="mt-3 text-center text-gray-400">
          <span className="mr-1">🔒</span> Remaining 11 months locked
        </div>
      )}
    </div>
  );
};

export default EnergyCalendar; 