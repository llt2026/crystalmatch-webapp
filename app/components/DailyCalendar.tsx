'use client';

import React, { useState } from 'react';

export interface DailyEnergyItem {
  date: string; // ISO
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  crystal?: string;
}

interface DailyCalendarProps {
  data: DailyEnergyItem[];
}

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return 'text-green-300';
    case 'down':
      return 'text-red-300';
    default:
      return 'text-yellow-300';
  }
};

const DailyCalendar: React.FC<DailyCalendarProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const displayData = expanded ? data : data.slice(0, 7);

  return (
    <section className="bg-black/30 backdrop-blur-sm rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Daily Energy Calendar</h2>
        {data.length > 7 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-purple-300 hover:text-white transition-colors"
          >
            {expanded ? 'Collapse' : 'View Full Month'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 divide-y divide-purple-800/40">
        {displayData.map((d) => {
          const dateLabel = new Date(d.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          return (
            <div key={d.date} className="flex justify-between py-2 text-sm">
              <span>{dateLabel}</span>
              <span className={getTrendColor(d.trend)}>
                {d.energyChange > 0 ? `+${d.energyChange}` : d.energyChange}
              </span>
              {d.crystal && (
                <span className="px-2 py-0.5 bg-purple-700/40 rounded-full text-xs">{d.crystal}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DailyCalendar; 