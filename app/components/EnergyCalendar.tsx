"use client";

import React, { useEffect, useState } from 'react';
import { calculateEnergyCalendar, EnergyCalendarItem, Elem } from '../lib/energyCalculation2025';
import LoadingSpinner from './LoadingSpinner';

interface EnergyCalendarProps {
  birthDate: string;
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

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ birthDate }) => {
  const [calendarData, setCalendarData] = useState<ExtendedEnergyCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    
    // 处理格式如"6/3 - 6/4"的日期字符串
    const parts = dateStr.split(' - ');
    
    if (parts.length === 1) {
      // 单日期，例如"6/3"
      const [month, day] = parts[0].split('/').map(Number);
      const currentYear = new Date().getFullYear();
      return `${getMonthName(month)} ${day}, ${currentYear}`;
    } else {
      // 日期范围，例如"6/3 - 6/4"
      const [startMonth, startDay] = parts[0].split('/').map(Number);
      const [endMonth, endDay] = parts[1].split('/').map(Number);
      const currentYear = new Date().getFullYear();
      
      if (startMonth === endMonth) {
        // 同月份，例如"June 3-4, 2025"
        return `${getMonthName(startMonth)} ${startDay}-${endDay}, ${currentYear}`;
      } else {
        // 跨月份，例如"June 28 - July 4, 2025"
        return `${getMonthName(startMonth)} ${startDay} - ${getMonthName(endMonth)} ${endDay}, ${currentYear}`;
      }
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
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Energy Calendar</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-purple-800">
            <tr>
              <th className="py-3 px-4 text-left text-white font-semibold">Month</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Energy Change</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Crystal</th>
              <th className="py-3 px-4 text-left text-white font-semibold">Lucky Colors</th>
            </tr>
          </thead>
          <tbody>
            {calendarData.map((item, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? 'bg-purple-900' : 'bg-purple-800/70'}
              >
                <td className="py-3 px-4 text-white font-medium">{item.month}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${getEnergyColor(item.energyChange)}`}>
                    {item.energyChange > 0 ? `+${item.energyChange}` : item.energyChange === 0 ? '—' : item.energyChange}
                    {' '}{getTrendIcon(item.trend)}
                  </span>
                </td>
                <td className="py-3 px-4 text-yellow-300">
                  {item.crystal}
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {item.luckyColor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnergyCalendar; 