import React, { useState } from 'react';
import { marked } from 'marked';

interface Section {
  title: string;
  content: string;
}

interface Crystal {
  name: string;
  purpose: string;
}

interface DailyEnergy {
  date: string;   // ISO string
  score: number;  // 0-100
  trend: 'rising' | 'falling' | 'stable';
  crystal?: string;
}

interface ReportJson {
  basicInfo?: {
    birthDate?: string;
    energySignature?: string;
  };
  sections?: Section[];
  crystals?: Crystal[];
  dailyEnergy?: DailyEnergy[];
}

export interface MonthlyReportProps {
  report: ReportJson;
  tier: 'plus' | 'pro';
  generatedAt: string;
}

// 简单颜色映射 – 可按需扩展
const trendColor: Record<string, string> = {
  rising: 'text-green-400',
  falling: 'text-red-400',
  stable: 'text-yellow-400'
};

const MonthlyReportTemplate: React.FC<MonthlyReportProps> = ({ report, tier, generatedAt }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const dateLabel = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">CrystalMatch Monthly Energy Report</h1>
        <p className="text-purple-300">{dateLabel}</p>
        <div>
          {tier === 'pro' ? (
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-sm">PRO</span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-sm">PLUS</span>
          )}
        </div>
      </header>

      {/* Basic Info */}
      {report.basicInfo && (
        <section className="bg-black/30 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-purple-300 text-sm mb-1">Birth Date</h3>
            <p>{report.basicInfo.birthDate}</p>
          </div>
          <div>
            <h3 className="text-purple-300 text-sm mb-1">Energy Signature</h3>
            <p>{report.basicInfo.energySignature}</p>
          </div>
        </section>
      )}

      {/* Section Tabs */}
      {report.sections && report.sections.length > 0 && (
        <section className="bg-black/30 rounded-xl">
          {/* tabs */}
          <div className="flex border-b border-purple-800/40">
            {report.sections.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`flex-1 py-3 text-xs sm:text-sm ${activeIdx === idx ? 'bg-purple-900/40' : ''}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          {/* content */}
          <div className="p-6 text-sm text-purple-200">
            <div dangerouslySetInnerHTML={{ __html: marked.parse(report.sections[activeIdx].content) }} />
          </div>
        </section>
      )}

      {/* Daily Calendar */}
      {report.dailyEnergy && report.dailyEnergy.length > 0 && (
        <section className="bg-black/30 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Daily Energy Calendar</h2>
          {report.dailyEnergy.slice(0, 5).map((day) => (
            <div key={day.date} className="flex justify-between text-sm border-b border-purple-800/40 pb-2">
              <span>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>{day.score}/100</span>
              <span className={`${trendColor[day.trend]} capitalize`}>{day.trend}</span>
              {day.crystal && (
                <span className="px-2 py-0.5 text-xs bg-purple-700/50 rounded-full">{day.crystal}</span>
              )}
            </div>
          ))}
          {report.dailyEnergy.length > 5 && (
            <p className="text-center text-xs text-purple-400">View Full Month Calendar ↓</p>
          )}
        </section>
      )}

      {/* Crystals */}
      {report.crystals && (
        <section className="bg-black/30 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Crystal Recommendations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {report.crystals.map((c, idx) => (
              <div key={idx} className="bg-black/20 p-4 rounded-lg">
                <h4 className="font-medium mb-1">{c.name}</h4>
                <p className="text-xs text-purple-200">{c.purpose}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center text-xs text-purple-400 pb-12">
        Generated on {dateLabel}
      </footer>
    </div>
  );
};

export default MonthlyReportTemplate; 