'use client';

import React, { useState } from 'react';
import { getCrystalForElement } from '@/app/lib/elementHelpers';

type Trend = 'up' | 'down' | 'stable';
export interface DailyEnergyItem {
  date: string;
  energyChange: number;
  trend: Trend;
  crystal?: string;
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  score?: number;
}

interface Props {
  data: DailyEnergyItem[];
}

const trendInfo = (t: Trend) =>
  t === 'up'
    ? { color: 'text-green-400', icon: '📈', label: 'Rising' }
    : t === 'down'
    ? { color: 'text-red-400', icon: '📉', label: 'Declining' }
    : { color: 'text-yellow-400', icon: '➡️', label: 'Stable' };

const DailyCalendar: React.FC<Props> = ({ data }) => {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const displayData = showFullCalendar ? data : data.slice(0, 5);

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Daily Energy Calendar</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {displayData.map((dayData, index) => {
          const { color, icon, label } = trendInfo(dayData.trend);
          const crystalObj = getCrystalForElement(dayData.element || 'water');
          const displayCrystal = dayData.crystal || crystalObj.name;
          
          // Format full date display
          const dateObj = new Date(dayData.date);
          const fullDateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          });
          
          // Mobile-friendly shorter date format
          const shortDateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          
          const scoreDisplay = typeof dayData.score === 'number' ? dayData.score : '--';
          
          return (
            <div 
              key={index} 
              className="bg-black/20 rounded-lg p-3 sm:p-4 border border-purple-800/30 hover:border-purple-600/50 transition-colors"
            >
              {/* Date and Score Row */}
              <div className="flex justify-between items-start sm:items-center mb-2 sm:mb-3">
                <div className="text-base sm:text-lg font-medium text-white">
                  {/* Show full date on desktop, short on mobile */}
                  <span className="hidden sm:block">{fullDateStr}</span>
                  <span className="block sm:hidden">{shortDateStr}</span>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-bold text-purple-300">
                    {scoreDisplay}/100
                  </div>
                </div>
              </div>
              
              {/* Trend Status Row */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 flex-wrap gap-2">
                <div className={`flex items-center gap-2 ${color}`}>
                  <span className="text-base sm:text-lg">{icon}</span>
                  <span className="font-medium text-sm sm:text-base">{label}</span>
                </div>
                <div className="text-xs sm:text-sm text-purple-300">
                  Energy: {dayData.energyChange > 0 ? '+' : ''}{dayData.energyChange}
                </div>
              </div>
              
              {/* Description Text */}
              <div className="mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
                  {dayData.trend === 'up' 
                    ? 'A high-energy day perfect for launching new projects, tackling challenges, and embracing creative endeavors. Your vitality is peaked for ambitious pursuits.'
                    : dayData.trend === 'down'
                    ? 'A reflective day ideal for rest, introspection, and gentle activities. Honor your need for restoration and avoid overwhelming commitments.'
                    : 'A balanced day offering steady energy for consistent progress. Perfect for maintaining routines and making gradual advancement toward your goals.'
                  }
                </p>
              </div>
              
              {/* Crystal Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-purple-400 font-medium whitespace-nowrap">Recommended Crystal:</span>
                <span 
                  className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${crystalObj.bgColor} ${crystalObj.color} border border-current/30`}
                >
                  ✨ {displayCrystal}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse Button */}
      {data.length > 5 && (
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
          >
            {showFullCalendar ? (
              <>
                <span className="hidden sm:inline">📅 Show Preview (5 days) ↑</span>
                <span className="inline sm:hidden">📅 Show Less ↑</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">📅 View Full Month Calendar ↓</span>
                <span className="inline sm:hidden">📅 Full Month ↓</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyCalendar; 