"use client";

import React, { useEffect, useState } from 'react';
import { calculateEnergyCalendar } from '../lib/energyCalculation2025';
import LoadingSpinner from './LoadingSpinner';

interface EnergyCalendarProps {
  birthDate: string;
  onSelectMonth?: (month: string) => void;
}

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ birthDate, onSelectMonth }) => {
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendarData() {
      if (!birthDate) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // 使用能量计算函数获取真实数据
        const data = await calculateEnergyCalendar(birthDate);
        setCalendarData(data);
        
        // 默认选择第一个月
        if (data.length > 0 && !selectedMonth) {
          setSelectedMonth(data[0].month);
          // 移到客户端事件中处理
        }
      } catch (error) {
        console.error('Error loading energy calendar:', error);
        setError('加载能量日历失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    }

    loadCalendarData();
  }, [birthDate, selectedMonth]);

  // 客户端副作用中处理回调
  useEffect(() => {
    if (selectedMonth && onSelectMonth) {
      onSelectMonth(selectedMonth);
    }
  }, [selectedMonth, onSelectMonth]);

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
    // 不在这里直接调用onSelectMonth，通过上面的useEffect处理
  };

  // 获取能量变化级别的颜色
  const getEnergyColor = (energyChange: number): string => {
    if (energyChange >= 5) return 'bg-red-500';
    if (energyChange >= 2) return 'bg-red-400';
    if (energyChange > 0) return 'bg-red-300';
    if (energyChange === 0) return 'bg-gray-300';
    if (energyChange >= -2) return 'bg-blue-300';
    if (energyChange >= -5) return 'bg-blue-400';
    return 'bg-blue-500';
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">能量变化日历</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {calendarData.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
              selectedMonth === item.month
                ? 'bg-gray-100 border-2 border-blue-500'
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => handleMonthClick(item.month)}
          >
            <div className="flex justify-between items-center">
              <div className="font-medium">{item.month}</div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-white ${getEnergyColor(
                    item.energyChange
                  )}`}
                >
                  {item.energyChange > 0 ? '+' : ''}
                  {item.energyChange.toFixed(1)}
                </span>
                <span className="text-lg font-bold">{getTrendIcon(item.trend)}</span>
                {item.crystal && (
                  <span className="text-sm text-gray-600">
                    {item.crystal}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnergyCalendar; 