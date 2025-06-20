'use client';

import React from 'react';
import { getElementColorClass, getElementDescription, getElementIcon } from '@/app/lib/elementHelpers';
import type { ElementType } from '@/app/lib/energyCalculationConfig';

export interface EnergyOverviewProps {
  title?: string;
  energyScore?: number; // 0-100
  strongestElement?: ElementType;
  weakestElement?: ElementType;
}

const EnergyOverview: React.FC<EnergyOverviewProps> = ({ title, energyScore = 0, strongestElement, weakestElement }) => {
  // Clamp score between 0-100
  const safeScore = Math.max(0, Math.min(100, energyScore));

  return (
    <section className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-center">Energy Overview</h2>

      {/* Score & title */}
      <div className="text-center space-y-1">
        <div className="text-3xl font-bold">{safeScore} / 100</div>
        {title && <div className="text-purple-300">{title} ✨</div>}
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
          style={{ width: `${safeScore}%` }}
        />
      </div>

      {/* Strongest / Weakest */}
      <div className="flex justify-around mt-4">
        <div className="text-center">
          <div className="font-medium">Strongest</div>
          {strongestElement ? (
            <>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getElementColorClass(strongestElement).bg
                  } ${getElementColorClass(strongestElement).text}`}
                >
                  {getElementIcon(strongestElement)}{' '}
                  {strongestElement.charAt(0).toUpperCase() + strongestElement.slice(1)}
                </span>
              </div>
              <div className={`text-xs mt-1 font-medium ${getElementColorClass(strongestElement).text}`}>
                {getElementDescription(strongestElement)}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 mt-1">--</div>
          )}
        </div>

        <div className="text-center">
          <div className="font-medium">Weakest</div>
          {weakestElement ? (
            <>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getElementColorClass(weakestElement).bg
                  } ${getElementColorClass(weakestElement).text}`}
                >
                  {getElementIcon(weakestElement)}{' '}
                  {weakestElement.charAt(0).toUpperCase() + weakestElement.slice(1)}
                </span>
              </div>
              <div className={`text-xs mt-1 font-medium ${getElementColorClass(weakestElement).text}`}>
                {getElementDescription(weakestElement)}
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-400 mt-1">--</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EnergyOverview; 