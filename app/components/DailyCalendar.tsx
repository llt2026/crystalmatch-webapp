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
    ? { color: 'text-green-400', label: '🟢 Rising' }
    : t === 'down'
    ? { color: 'text-red-400', label: '🔴 Declining' }
    : { color: 'text-yellow-400', label: '🟡 Stable' };

const DailyCalendar: React.FC<Props> = ({ data }) => {
  const [full, setFull] = useState(false);
  const list = full ? data : data.slice(0, 5);

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
      <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>

      {list.map((d, idx) => {
        const { color, label } = trendInfo(d.trend);
        const crystalObj = getCrystalForElement(d.element || 'water');
        const scoreText = typeof d.score === 'number' ? `${d.score}/100` : '--';
        const deltaText = d.energyChange > 0 ? `+${d.energyChange}` : d.energyChange;

        return (
          <div key={idx} className="mb-4 last:mb-0">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium">
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm hidden sm:block">{scoreText}</div>
              <div className={`text-sm ${color}`}>{label}</div>
            </div>
            <p className="text-xs text-purple-200">
              {d.trend === 'up'
                ? `Energy rising day, suitable for new plans and creative work (energy value: ${deltaText})`
                : d.trend === 'down'
                ? `Energy declining day, suitable for rest and reflection (energy value: ${deltaText})`
                : `Energy stable day, suitable for steady progress (energy value: ${deltaText})`}
            </p>
            <div className="mt-1 flex items-center">
              <span className="text-xs text-purple-300 mr-2">Crystal:</span>
              <span
                className={`text-xs px-2 py-0.5 ${crystalObj.bgColor} rounded-full text-white ${crystalObj.color}`}
              >
                {d.crystal || crystalObj.name}
              </span>
            </div>
          </div>
        );
      })}

      {data.length > 5 && (
        <button
          onClick={() => setFull(!full)}
          className="w-full mt-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
        >
          {full ? 'Show Less ↑' : 'View Full Month Calendar ↓'}
        </button>
      )}
    </div>
  );
};

export default DailyCalendar; 