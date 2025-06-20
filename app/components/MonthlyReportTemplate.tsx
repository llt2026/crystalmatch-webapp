'use client';

import React, { Suspense, useState } from 'react';
import EnergyOverview from './EnergyOverview';
import AspectTabs, { AspectKey } from './AspectTabs';
import DailyCalendar from './DailyCalendar';
import CrystalGrid from './CrystalGrid';
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
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">CrystalMatch Monthly Energy Report</h1>
        {dateLabel && <p className="text-purple-300">{dateLabel}</p>}
        <div>
          {tier === 'pro' ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-sm">PRO</span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-sm">PLUS</span>
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

      {/* Crystal Grid */}
      <CrystalGrid crystals={crystals} />

      {/* Footer */}
      <footer className="text-center space-y-3 pb-12">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => openFeedback('positive')}
            className="flex items-center px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors"
          >
            <span className="mr-2 text-lg">👍</span>
            Useful
          </button>
          <button
            onClick={() => openFeedback('negative')}
            className="flex items-center px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors"
          >
            <span className="mr-2 text-lg">👎</span>
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