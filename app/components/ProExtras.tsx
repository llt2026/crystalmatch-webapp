'use client';

import React, { useMemo, useState } from 'react';
import { ENERGY_CONFIG } from '@/app/lib/energyCalculationConfig';

type HourData = {
  hour: number;
  score?: number;
  energyChange?: number;
};

export interface ProExtrasProps {
  aspect?: string;
  hourlyData: HourData[];
}

const ProExtras: React.FC<ProExtrasProps> = ({ aspect, hourlyData }) => {
  // Determine peaks (top 3 by score or energyChange)
  const peaks = useMemo(() => {
    const sorted = [...hourlyData].sort((a, b) => (b.score ?? b.energyChange ?? 0) - (a.score ?? a.energyChange ?? 0));
    return sorted.slice(0, ENERGY_CONFIG.MAX_HIGH_ENERGY_HOURS);
  }, [hourlyData]);

  const [notifications, setNotifications] = useState<Record<number, boolean>>({});

  const toggle = async (hour: number) => {
    try {
      // Request permission lazily
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      setNotifications((prev) => ({ ...prev, [hour]: !prev[hour] }));
      // In production, schedule/cancel notifications here (omitted)
    } catch (e) {
      console.error('Notification error', e);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium flex items-center gap-2">
        <span>⚡ Hourly Peaks</span>
        {aspect && <span className="text-xs text-purple-300">({aspect})</span>}
      </h4>

      {peaks.length === 0 ? (
        <p className="text-xs text-purple-300">No peak data available</p>
      ) : (
        <ul className="space-y-2">
          {peaks.map((p) => (
            <li key={p.hour} className="flex items-center justify-between text-sm">
              <span>
                {p.hour}:00 – {p.hour + 1}:00
              </span>
              <button
                onClick={() => toggle(p.hour)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${notifications[p.hour] ? 'bg-green-700' : 'bg-purple-700/40 hover:bg-purple-700'}`}
              >
                {notifications[p.hour] ? '✔ Notified' : 'Notify'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProExtras; 