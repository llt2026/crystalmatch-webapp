import React from 'react';
import { ENERGY_CONFIG } from '@/app/lib/energyCalculationConfig';

interface HighEnergyHoursListProps {
  hourlyData: Array<{ hour: number; score?: number; energyChange?: number }>;
  moodPeakDays: number[];
  title?: string;
  maxHours?: number;
}

export default function HighEnergyHoursList({ 
  hourlyData, 
  moodPeakDays, 
  title = "High Energy Hours", 
  maxHours = ENERGY_CONFIG.MAX_HIGH_ENERGY_HOURS 
}: HighEnergyHoursListProps) {
  const highEnergyHours = hourlyData
    .filter(hour => hour.score !== undefined && hour.score >= ENERGY_CONFIG.HOUR_THRESHOLD)
    .slice(0, maxHours);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <div className="space-y-2">
        {highEnergyHours.length > 0 ? (
          highEnergyHours.map((hour, index) => {
            const peakDays = moodPeakDays;
            const dayNum = peakDays[index] || (index + 1);
            const hourTime = `${hour.hour}:00`;
            
            return (
              <div key={index} className="bg-purple-900/30 p-2 rounded text-xs">
                <div className="font-medium">May {dayNum}, {hourTime}</div>
                <div className="text-purple-300">Energy Score: {hour.score || '--'}</div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-purple-300">No high-energy hours available</div>
        )}
      </div>
    </div>
  );
} 