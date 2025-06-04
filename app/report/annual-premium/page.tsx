"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateEnergyCalendar, EnergyCalendarItem, Elem } from '../../lib/energyCalculation2025';
import LoadingScreen from '../../components/LoadingScreen';

// 扩展EnergyCalendarItem接口，添加我们需要的额外字段
interface ExtendedEnergyCalendarItem extends EnergyCalendarItem {
  formattedMonth: string;
  crystal: string;
  luckyColor: string;
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

export default function AnnualPremiumReport() {
  const [calendarData, setCalendarData] = useState<ExtendedEnergyCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);

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
    // 客户端加载时读取URL参数
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const birthDateParam = urlParams.get('birthDate');
      console.log('URL中的birthDate参数:', birthDateParam || '未提供');
      setBirthDate(birthDateParam);
    }
  }, []);

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
            formattedMonth: formatDateRange(item.month),
            crystal: rotatedCrystal, 
            luckyColor: elementLuckyColors[highestElement],
            highestElement
          };
        });
        
        setCalendarData(formattedData);
      } catch (error) {
        console.error('Error loading energy calendar:', error);
        setError('加载能量日历失败。请稍后再试。');
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
    return <LoadingScreen />;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-purple-900 text-white p-4">
      <Link href="/profile" className="inline-flex items-center text-purple-300 hover:text-white transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        返回个人中心
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">2025年度尊享能量报告 <span className="text-yellow-300">PREMIUM</span></h1>
        
        {/* Premium用户额外福利介绍 */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 p-4 rounded-lg text-center mb-8">
          <p className="text-sm text-purple-200">感谢您的高级订阅！以下是您的完整个人化年度能量计划</p>
        </div>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead className="bg-purple-800">
              <tr>
                <th className="py-3 px-4 text-left text-white font-semibold">月份</th>
                <th className="py-3 px-4 text-left text-white font-semibold">能量变化</th>
                <th className="py-3 px-4 text-left text-white font-semibold">推荐水晶</th>
                <th className="py-3 px-4 text-left text-white font-semibold">幸运颜色</th>
              </tr>
            </thead>
            <tbody>
              {calendarData.map((item, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-purple-900' : 'bg-purple-800/70'}
                >
                  <td className="py-3 px-4 text-white font-medium">{item.formattedMonth}</td>
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
        
        {/* 订阅优势介绍 */}
        <div className="bg-black/40 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4 text-yellow-300">探索更多Premium专属功能</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            <li>每月详细的个人能量指导</li>
            <li>个性化水晶与颜色建议</li>
            <li>重要日期的专属提醒</li>
            <li>优先访问新功能</li>
          </ul>
        </div>
      </div>
    </main>
  );
}