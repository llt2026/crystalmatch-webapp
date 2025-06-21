'use client';

import React, { Suspense, useState } from 'react';
import EnergyOverview from './EnergyOverview';
import AspectTabs, { AspectKey } from './AspectTabs';
import DailyCalendar from './DailyCalendar';
import FeedbackModal from './FeedbackModal';

interface OverviewData {
  title?: string;
  energyScore?: number;
  strongestElement?: 'water' | 'fire' | 'earth' | 'metal' | 'wood';
  weakestElement?: 'water' | 'fire' | 'earth' | 'metal' | 'wood';
  periodStart?: string;
  periodEnd?: string;
}

interface HourlyDataItem {
  hour: number;
  score?: number;
  energyChange?: number;
}

export interface MonthlyReportTemplateProps {
  overview: OverviewData;
  sections: Record<AspectKey, string>;
  daily: Array<{ date: string; energyChange: number; trend: 'up' | 'down' | 'stable'; crystal?: string }>;
  hourly: HourlyDataItem[];
  crystals: Array<{ name: string; benefit: string }>;
  tier: 'plus' | 'pro';
}

const Skeleton = () => <div className="text-center py-10 text-purple-300">Loading…</div>;

const MonthlyReportTemplate: React.FC<MonthlyReportTemplateProps> = ({ overview, sections, daily, hourly, crystals, tier }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative'>('positive');

  const openFeedback = (type: 'positive' | 'negative') => {
    setFeedbackType(type);
    setShowFeedback(true);
  };

  const dateLabel = overview.periodStart && overview.periodEnd
    ? `${new Date(overview.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${new Date(overview.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">CrystalMatch Monthly Energy Report</h1>
        {dateLabel && <p className="text-purple-300 text-sm sm:text-base">{dateLabel}</p>}
        <div>
          {tier === 'pro' ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-xs sm:text-sm">PRO</span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs sm:text-sm">PLUS</span>
          )}
        </div>
      </header>

      {/* Energy Overview */}
      <EnergyOverview
        title={overview.title}
        energyScore={overview.energyScore}
        strongestElement={overview.strongestElement as any}
        weakestElement={overview.weakestElement as any}
      />

      {/* Aspect Tabs */}
      <AspectTabs sections={sections} tier={tier} hourlyData={hourly} />

      {/* Daily Calendar */}
      <DailyCalendar data={daily} />

      {/* Informational paragraph */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-purple-300 bg-black/20 rounded-xl p-3 sm:p-4 leading-relaxed">
          This report weaves together almost 4,000 years of evolving Chinese Five-Element Feng Shui, evidence-backed
          modern science, and the freshest AI intelligence—ancient wisdom, updated for your everyday life.
        </p>
        
        <p className="text-xs sm:text-sm text-purple-300 bg-black/20 rounded-xl p-3 sm:p-4 leading-relaxed">
          Your personal energy patterns are calculated using authentic Bazi (Four Pillars of Destiny) methodology,
          cross-referenced with contemporary chronobiology research and enhanced by AI analysis of thousands of
          energy correlations. Each recommendation is tailored specifically to your birth chart and current cosmic influences.
        </p>
        
        <p className="text-xs sm:text-sm text-purple-300 bg-black/20 rounded-xl p-3 sm:p-4 leading-relaxed">
          The crystal suggestions combine traditional Chinese mineral therapy with modern crystal healing principles,
          selected to harmonize with your dominant and deficient elements during this specific time period.
          These insights evolve monthly as celestial patterns shift and your personal energy cycles progress.
        </p>
      </div>

      {/* Footer */}
      <footer className="text-center space-y-3 pb-8 sm:pb-12">
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <button
            onClick={() => openFeedback('positive')}
            className="flex items-center px-3 sm:px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors text-sm sm:text-base"
          >
            <span className="mr-2 text-base sm:text-lg">👍</span>
            Useful
          </button>
          <button
            onClick={() => openFeedback('negative')}
            className="flex items-center px-3 sm:px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors text-sm sm:text-base"
          >
            <span className="mr-2 text-base sm:text-lg">👎</span>
            Not really
          </button>
        </div>
        <p className="text-xs text-purple-400">© {new Date().getFullYear()} CrystalMatch</p>
      </footer>

      {/* Feedback Modal */}
      <Suspense fallback={<Skeleton />}>
        <FeedbackModal open={showFeedback} type={feedbackType} onClose={() => setShowFeedback(false)} />
      </Suspense>
    </div>
  );
};

export default MonthlyReportTemplate; 