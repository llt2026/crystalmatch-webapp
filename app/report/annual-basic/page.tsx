"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateEnergyCalendar, EnergyCalendarItem } from '../../lib/energyCalculation2025';
import LoadingScreen from '../../components/LoadingScreen';

// 扩展EnergyCalendarItem接口，添加我们需要的额外字段
interface ExtendedEnergyCalendarItem extends EnergyCalendarItem {
  formattedMonth: string;
}

export default function AnnualBasicReport() {
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
        
        // 格式化日期显示
        const formattedData = data.map((item) => {
          return {
            ...item,
            formattedMonth: formatDateRange(item.month)
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
        <h1 className="text-3xl font-bold mb-6 text-center">2025年度基础能量报告</h1>
        
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead className="bg-purple-800">
              <tr>
                <th className="py-3 px-4 text-left text-white font-semibold">月份</th>
                <th className="py-3 px-4 text-left text-white font-semibold">能量变化</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 升级提示 */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">解锁更多个性化内容</h2>
          <p className="mb-6">升级到Plus计划，获取每月水晶推荐及更详细指导</p>
          <Link href="/subscription" className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
            立即升级
          </Link>
        </div>
      </div>
    </main>
  );
} 