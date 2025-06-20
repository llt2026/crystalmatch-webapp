'use client';

import React, { useState } from 'react';
import { marked } from 'marked';
import ProExtras from './ProExtras';

export type AspectKey = 'finance' | 'relationship' | 'mood' | 'health' | 'growth';

export interface AspectTabsProps {
  sections: Record<AspectKey, string>; // markdown content per section
  tier: 'plus' | 'pro';
  hourlyData?: Array<{ hour: number; score?: number; energyChange?: number }>;
}

const TAB_LABELS: Record<AspectKey, string> = {
  finance: '💰 Money Flow',
  relationship: '👥 Social Vibes',
  mood: '🌙 Mood Balance',
  health: '🔥 Body Fuel',
  growth: '🚀 Growth Track'
};

const AspectTabs: React.FC<AspectTabsProps> = ({ sections, tier, hourlyData }) => {
  const [active, setActive] = useState<AspectKey>('finance');

  return (
    <section className="bg-black/30 backdrop-blur-sm rounded-xl">
      {/* Nav */}
      <div className="flex border-b border-purple-900/30 overflow-x-auto">
        {(Object.keys(TAB_LABELS) as AspectKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 py-3 whitespace-nowrap text-xs sm:text-sm ${
              active === key ? 'bg-purple-900/40 font-medium' : 'hover:bg-purple-800/40'
            }`}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 text-sm text-purple-200 space-y-6">
        {/* Markdown section */}
        <div dangerouslySetInnerHTML={{ __html: marked.parse(sections[active] || '*No insights available*') }} />

        {/* Pro extras - visible only for pro tier */}
        {tier === 'pro' ? (
          <ProExtras aspect={active} hourlyData={hourlyData || []} />
        ) : (
          <div className="mt-6 pt-4 border-t border-purple-900/30">
            <div className="text-center py-8 px-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
              <div className="text-4xl mb-2">🔒</div>
              <h4 className="text-sm font-medium mb-2">Pro Exclusive</h4>
              <p className="text-xs text-purple-300 mb-4">Upgrade to unlock in-depth timing tips and personalized hourly peaks for this life area.</p>
              <a
                href="/subscription"
                className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AspectTabs; 