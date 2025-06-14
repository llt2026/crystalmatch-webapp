"use client";

import React, { useEffect, useState } from 'react';
import { calculateEnergyCalendar, EnergyCalendarItem, Elem } from '../lib/energyCalculation2025';
import LoadingSpinner from './LoadingSpinner';

// Add custom CSS for hiding scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none; /* Safari and Chrome */
  }
`;

interface EnergyCalendarProps {
  birthDate: string;
  subscriptionTier?: 'free' | 'plus' | 'pro';
}

// 扩展EnergyCalendarItem接口，添加我们需要的额外字段
interface ExtendedEnergyCalendarItem extends EnergyCalendarItem {
  originalMonth?: string;
  luckyColor?: string;
  highestElement?: Elem;
}

// 五行元素对应的水晶列表 - 每个元素对应4种水晶
const elementCrystals: Record<Elem, string[]> = {
  "wood": [
    "Green Aventurine", "Malachite", "Nephrite Jade", "Amazonite"
  ],
  "fire": [
    "Carnelian", "Sunstone", "Garnet", "Ruby"
  ],
  "earth": [
    "Tiger's Eye", "Smoky Quartz", "Moss Agate", "Picture Jasper"
  ],
  "metal": [
    "Clear Quartz", "Hematite", "Pyrite", "Howlite"
  ],
  "water": [
    "Sodalite", "Aquamarine", "Blue Lace Agate", "Labradorite"
  ]
};

// 五行元素对应的幸运颜色
const elementLuckyColors: Record<Elem, string> = {
  "wood": "Green + Brown",
  "fire": "Red + Orange",
  "earth": "Yellow + Beige",
  "metal": "White + Silver/Gray",
  "water": "Blue + Black"
};

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ birthDate, subscriptionTier = 'free' }) => {
  const [calendarData, setCalendarData] = useState<ExtendedEnergyCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 判断用户是否可以查看水晶列
  const canViewCrystal = subscriptionTier === 'plus' || subscriptionTier === 'pro';
  
  // 判断用户是否可以查看幸运颜色列
  const canViewLuckyColors = subscriptionTier === 'pro';

  // 将数字月份转换为英文月份名称
  const getMonthName = (month: number): string => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  // 格式化日期为"June 3-4, 2025"格式
  const formatDateRange = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // 处理格式如"6/3/2025" 或 "6/3/2025 - 7/4/2025"
    const parts = dateStr.split(' - ');

    const parsePart = (part: string) => {
      const [m, d, y] = part.split('/').map(Number);
      return { month: m, day: d, year: y };
    };

    if (parts.length === 1) {
      const { month, day, year } = parsePart(parts[0]);
      return `${getMonthName(month)} ${day}, ${year}`;
    } else {
      const start = parsePart(parts[0]);
      const end = parsePart(parts[1]);

      if (start.month === end.month && start.year === end.year) {
        // 同月同年
        return `${getMonthName(start.month)} ${start.day}-${end.day}, ${start.year}`;
      }
      // 跨月或跨年
      return `${getMonthName(start.month)} ${start.day}, ${start.year} - ${getMonthName(end.month)} ${end.day}, ${end.year}`;
    }
  };

  // 为同一元素的月份轮换推荐不同水晶
  const getRotatedCrystal = (element: Elem | undefined, index: number): string => {
    if (!element || !elementCrystals[element]) return 'Unknown Crystal';
    
    // 获取该元素的水晶列表
    const crystalList = elementCrystals[element];
    
    // 基于月份索引轮换推荐水晶
    return crystalList[index % crystalList.length];
  };

  useEffect(() => {
    async function loadCalendarData() {
      if (!birthDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 使用能量计算函数获取真实数据 - 从用户查询日开始
        const data = await calculateEnergyCalendar(birthDate);
        
        // 处理水晶轮换推荐
        // 先统计每个元素出现的次数和索引位置
        const elementOccurrences: Record<string, number[]> = {};
        
        // 首先记录每个元素出现的索引位置
        data.forEach((item, index) => {
          if (item.lowestElement) {
            const element = item.lowestElement;
            if (!elementOccurrences[element]) {
              elementOccurrences[element] = [];
            }
            elementOccurrences[element].push(index);
          }
        });
        
        // 找出每月最高元素（作为幸运颜色的基础）
        // 由于API没有直接提供最高元素，我们假设为所有元素中与最低元素相反的元素
        // 实际应用中应该使用真实计算的最高元素
        const oppositeElement: Record<Elem, Elem> = {
          "wood": "metal",
          "fire": "water",
          "earth": "wood",
          "metal": "fire",
          "water": "earth"
        };
        
        // 格式化日期显示并轮换水晶推荐
        const formattedData = data.map((item, index) => {
          // 查找当前元素的出现位置
          const element = item.lowestElement;
          let elementIndex = 0;
          
          if (element && elementOccurrences[element]) {
            const elementIndices = elementOccurrences[element];
            elementIndex = elementIndices.indexOf(index);
          }
          
          // 轮换推荐水晶
          const rotatedCrystal = getRotatedCrystal(element, elementIndex);
          
          // 找出当月最高元素（这里使用了假设，实际应用中应该使用真实数据）
          const highestElement = element ? oppositeElement[element] : "fire";
          
          return {
            ...item,
            originalMonth: item.month, // 保留原始格式，以防后续需要
            month: formatDateRange(item.month),
            crystal: rotatedCrystal, 
            // 找出当月最高元素对应的幸运颜色
            luckyColor: elementLuckyColors[highestElement],
            highestElement
          };
        });
        
        setCalendarData(formattedData);
      } catch (error) {
        console.error('Error loading energy calendar:', error);
        setError('Failed to load energy calendar. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadCalendarData();
  }, [birthDate]);

  // 获取能量变化级别的颜色
  const getEnergyColor = (energyChange: number): string => {
    if (energyChange >= 5) return 'text-red-500';
    if (energyChange >= 2) return 'text-red-400';
    if (energyChange > 0) return 'text-red-300';
    if (energyChange === 0) return 'text-white';
    if (energyChange >= -2) return 'text-blue-300';
    if (energyChange >= -5) return 'text-blue-400';
    return 'text-blue-500';
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '—';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Energy Calendar</h2>
      
      {/* Mobile horizontal scroll container */}
      <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="min-w-max">
                  <table className="w-full border-collapse bg-purple-900/60 rounded-lg overflow-hidden">
            <thead className="bg-purple-800">
              <tr>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white font-semibold text-xs sm:text-sm">Month</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white font-semibold text-xs sm:text-sm">Energy</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white font-semibold text-xs sm:text-sm">Crystal</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 text-left text-white font-semibold text-xs sm:text-sm">Colors</th>
              </tr>
            </thead>
          <tbody>
            {calendarData.map((item, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? 'bg-purple-900/80' : 'bg-purple-800/60'}
              >
                <td className="py-2 px-2 sm:py-3 sm:px-4 text-white font-medium text-xs sm:text-sm min-w-[120px]">
                  {item.month}
                </td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 min-w-[80px]">
                  <span className={`font-medium text-xs sm:text-sm ${getEnergyColor(item.energyChange)}`}>
                    {item.energyChange > 0 ? `+${item.energyChange}` : item.energyChange === 0 ? '—' : item.energyChange}
                    {' '}{getTrendIcon(item.trend)}
                  </span>
                </td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 min-w-[100px]">
                  {canViewCrystal ? (
                    <span className="text-yellow-300 text-xs sm:text-sm">{item.crystal}</span>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-500 text-xs">PLUS</span>
                    </div>
                  )}
                </td>
                <td className="py-2 px-2 sm:py-3 sm:px-4 min-w-[100px]">
                  {canViewLuckyColors ? (
                    <span className="text-yellow-300 text-xs sm:text-sm">{item.luckyColor}</span>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-500 text-xs">PRO</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      
      {/* Scroll hint for mobile */}
      <div className="mt-2 text-center sm:hidden">
        <span className="text-purple-300 text-xs">← Swipe to see more →</span>
      </div>
    </div>
    </>
  );
};

export default EnergyCalendar; 