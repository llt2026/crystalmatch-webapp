/** Monthly APR-2025 report (Pro, UI-only) */
'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { marked } from 'marked';

import { ENERGY_CONFIG, type ElementType } from '@/app/lib/energyCalculationConfig';
import {
  getCrystalForElement,
  getElementDescription,
  getElementIcon,
  getElementColorClass,
} from '@/app/lib/elementHelpers';
import { FiveElementVector } from '@/app/lib/energyCalculation2025';

const {
  HOUR_THRESHOLD,
  MAX_PEAK_DAYS,
  MAX_LOW_DAYS,
  MAX_HIGH_ENERGY_HOURS,
  ELEMENT_ACTIVITIES,
  ELEMENT_EXERCISES,
  ELEMENT_CHALLENGES,
} = ENERGY_CONFIG;

interface GPTReport {
  title?: string;
  energyScore?: number;
  strongestElement?: ElementType;
  weakestElement?: ElementType;
  deficientElements?: ElementType[];
  periodStart?: string;
  periodEnd?: string;
  loading: boolean;
  error?: string;
}

interface DailyEnergyData {
  date: Date;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  element?: ElementType;
  crystal?: string;
  score?: number;
}

interface HourlyEnergyData {
  hour: number;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  score?: number;
}

const Skeleton = () => <div className="text-purple-300 p-10">Loading…</div>;

function ReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate');
  
  if (!birthDate) {
    redirect('/profile');
  }

  const [gpt, setGpt] = useState<GPTReport>({ loading: true });
  const [daily, setDaily] = useState<DailyEnergyData[]>([]);
  const [hourly, setHourly] = useState<HourlyEnergyData[]>([]);
  const [reportHTML, setReportHTML] = useState('');
  const [sections, setSections] = useState<Record<string,string>>({});
  const [tab, setTab] = useState<'finance'|'relationship'|'mood'|'health'|'growth'>('relationship');
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const slug = window.location.pathname.match(/(\w+)-(\d{4})/)![0];
        const [month, year] = slug.split('-');
        const monthMap: Record<string, string> = {
          'january': '01', 'jan': '01', 'february': '02', 'feb': '02',
          'march': '03', 'mar': '03', 'april': '04', 'apr': '04',
          'may': '05', 'june': '06', 'jun': '06', 'july': '07', 'jul': '07',
          'august': '08', 'aug': '08', 'september': '09', 'sep': '09',
          'october': '10', 'oct': '10', 'november': '11', 'nov': '11',
          'december': '12', 'dec': '12'
        };
        const apiSlug = `${year}-${monthMap[month.toLowerCase()]}`;
        
        const res = await fetch(`/api/report/${apiSlug}?birthDate=${encodeURIComponent(birthDate as string)}`, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        
        const { overview, daily: dailyData, hourly: hourlyData, report } = data;
        
        setGpt({ ...overview, loading: false });
        setDaily(dailyData || []);
        setHourly(hourlyData || []);
        
        if (report) {
          const mdString = report.toString();
          // 解析 markdown 二级标题 ## Section
          const regex = /^##\s*(.+?)\s*$/gm;
          const lines = mdString.split(/\r?\n/);
          const tmp: Record<string,string[]> = {};
          let currentKey = 'overview';
          lines.forEach((line: string) => {
            const match = line.match(/^##\s*(.+?)\s*$/);
            if (match) {
              currentKey = match[1].toLowerCase();
              tmp[currentKey] = [];
            } else {
              if (!tmp[currentKey]) tmp[currentKey] = [];
              tmp[currentKey].push(line);
            }
          });
          const htmlSections: Record<string,string> = {};
          Object.entries(tmp).forEach(([k, arr]) => {
            htmlSections[k] = marked.parse(arr.join('\n')) as string;
          });
          setSections(htmlSections);
          setReportHTML(marked.parse(mdString) as string);
        }
      } catch (error) {
        setGpt({
          loading: false,
          error: error instanceof Error ? error.message : 'Loading failed'
        });
      }
    }
    
    fetchData();
  }, [birthDate]);

  const peakDays = useMemo(() => {
    if (!daily.length) return [];
    return daily
      .filter(day => day.score !== undefined)
      .map((day, index) => ({ index: index + 1, score: day.score! }))
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PEAK_DAYS)
      .map(item => item.index);
  }, [daily]);

  const lowDays = useMemo(() => {
    if (!daily.length) return [];
    return daily
      .filter(day => day.score !== undefined)
      .map((day, index) => ({ index: index + 1, score: day.score! }))
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_LOW_DAYS)
      .map(item => item.index);
  }, [daily]);

  const deficient = useMemo((): ElementType[] => {
    if (gpt.deficientElements && Array.isArray(gpt.deficientElements)) {
      return gpt.deficientElements;
    }
    return [];
  }, [gpt.deficientElements]);

  if (gpt.loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-t-2 border-purple-500 border-r-2 rounded-full mb-4"></div>
            <p>Loading your personalized energy report...</p>
          </div>
        </div>
      </main>
    );
  }

  if (gpt.error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl">🔧</div>
            <h2 className="text-xl font-semibold">Report Temporarily Unavailable</h2>
            <p className="text-sm text-red-200">{gpt.error}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Try Again
              </button>
              <Link 
                href="/profile"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Pro)</h1>
          <p className="text-purple-300 mt-1">
            {gpt.periodStart && gpt.periodEnd 
              ? `${gpt.periodStart} - ${gpt.periodEnd}` 
              : "Loading..."}
          </p>
        </header>
        
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">{gpt.energyScore ? `${gpt.energyScore} / 100` : '--'}</div>
            <div className="mt-1 text-purple-300">{gpt.title || "Loading..."} ✨</div>
          </div>
          
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: `${gpt.energyScore || 0}%` }}
              />
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              {gpt.strongestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gpt.strongestElement).bg} ${getElementColorClass(gpt.strongestElement).text}`}>
                      {getElementIcon(gpt.strongestElement)} {gpt.strongestElement.charAt(0).toUpperCase() + gpt.strongestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gpt.strongestElement).text}`}>
                    {getElementDescription(gpt.strongestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              {gpt.weakestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gpt.weakestElement).bg} ${getElementColorClass(gpt.weakestElement).text}`}>
                      {getElementIcon(gpt.weakestElement)} {gpt.weakestElement.charAt(0).toUpperCase() + gpt.weakestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gpt.weakestElement).text}`}>
                    {getElementDescription(gpt.weakestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Daily Energy Calendar</h3>
            <button 
              onClick={() => setShowFull(!showFull)}
              className="text-purple-300 hover:text-white text-sm"
            >
              {showFull ? 'Show Less' : 'Show All'}
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-xs">
            {daily.slice(0, showFull ? daily.length : 5).map((day, index) => (
              <div key={index} className="text-center p-2 rounded bg-purple-900/20">
                <div className="font-medium">{index + 1}</div>
                <div className={`text-xs ${day.score && day.score >= 70 ? 'text-green-400' : day.score && day.score <= 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {day.score || '--'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl">
          <div className="flex border-b border-purple-900/30">
            {[
              { key: 'finance', icon: '💰', label: 'Money Flow' },
              { key: 'relationship', icon: '👥', label: 'Social Vibes' },
              { key: 'mood', icon: '🌙', label: 'Mood Balance' },
              { key: 'health', icon: '🔥', label: 'Body Fuel' },
              { key: 'growth', icon: '🚀', label: 'Growth Track' }
            ].map(({ key, icon, label }) => (
              <button 
                key={key}
                onClick={() => setTab(key as any)}
                className={`flex flex-col items-center justify-center py-3 flex-1 ${tab === key ? 'bg-purple-900/30' : ''}`}
              >
                <span className="text-lg">{icon}</span>
                <span className="text-xs mt-1">{label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-5">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">
                {tab === 'finance' && '💼'}
                {tab === 'relationship' && '👥'}
                {tab === 'mood' && '🌙'}
                {tab === 'health' && '🔥'}
                {tab === 'growth' && '🚀'}
              </span>
              <h3 className="text-lg font-medium">
                {tab === 'finance' && 'Finance & Career'}
                {tab === 'relationship' && 'Social Vibes'}
                {tab === 'mood' && 'Mood Balance'}
                {tab === 'health' && 'Body Fuel'}
                {tab === 'growth' && 'Growth Track'}
              </h3>
            </div>
            
            <div className="text-sm text-purple-200 mb-4">
              {reportHTML ? (
                <div dangerouslySetInnerHTML={{ __html: (() => {
                  const keyMap: Record<string,string[]> = {
                    finance: ['finance', 'money'],
                    relationship: ['social', 'relationship'],
                    mood: ['mood', 'balance'],
                    health: ['body', 'fuel', 'health'],
                    growth: ['growth', 'track']
                  };
                  const keys = keyMap[tab] || [];
                  for (const k of keys) {
                    const matchedKey = Object.keys(sections).find(title => title.includes(k));
                    if (matchedKey && sections[matchedKey]) return sections[matchedKey];
                  }
                  return reportHTML; // fallback
                })() }} />
              ) : (
                <p className="text-purple-300">Loading insights...</p>
              )}
            </div>
            
            <div className="mt-5 pt-4 border-t border-purple-900/30">
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <h4 className="font-medium">Pro Exclusive</h4>
              </div>
              
              <h5 className="text-sm mb-2">Top Energy Hours</h5>
              <div className="space-y-3">
                {hourly
                  .filter(hour => hour.score && hour.score >= HOUR_THRESHOLD)
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .slice(0, MAX_HIGH_ENERGY_HOURS)
                  .map((hour, index) => (
                    <div key={hour.hour}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </span>
                          <span className="text-xs">{hour.hour}:00–{hour.hour + 2}:00</span>
                        </div>
                        <span className="text-xs font-medium">Score {hour.score}</span>
                      </div>
                      <p className="text-xs text-purple-200 pl-6">
                        Best for {gpt.strongestElement && ELEMENT_ACTIVITIES[gpt.strongestElement]?.[index] || 'high-energy tasks'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MonthlyReportApr25() {
  return (
    <Suspense fallback={<Skeleton />}>
      <ReportContent />
    </Suspense>
  );
}
