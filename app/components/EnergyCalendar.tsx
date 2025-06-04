"use client";

import React, { useEffect, useState } from 'react';
import { calculateEnergyCalendar } from '../lib/energyCalculation2025';
import LoadingSpinner from './LoadingSpinner';

interface EnergyCalendarProps {
  birthDate: string;
}

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ birthDate }) => {
  const [calendarData, setCalendarData] = useState<any[]>([]);
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

  useEffect(() => {
    async function loadCalendarData() {
      if (!birthDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 使用能量计算函数获取真实数据 - 从用户查询日开始
        const data = await calculateEnergyCalendar(birthDate);
        
        // 格式化日期显示
        const formattedData = data.map(item => ({
          ...item,
          originalMonth: item.month, // 保留原始格式，以防后续需要
          month: formatDateRange(item.month)
        }));
        
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
              <th className="py-3 px-4 text-left text-white font-semibold">Monthly Report</th>
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
                  <span>View detailed guidance</span>
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