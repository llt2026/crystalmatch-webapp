/** 
 * Monthly APR-2025 report - Plus Version
 * 注意：此报告使用与May 2025相同的API调用，作为Plus会员模板
 * 原有的Apr 2025特定API调用已废弃
 */
'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { marked } from 'marked';
import { parseISO, addDays, format as formatDate } from 'date-fns';

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

// GPT Report interface
interface GPTReport {
  title?: string;
  insight?: string;
  challenges?: string[];
  crystals?: Array<{name: string, benefit: string}>;
  ritual?: string;
  guidance?: string[];
  loading: boolean;
  error?: string;
  errorDetails?: any;
  energyScore?: number;
  strongestElement?: ElementType;
  weakestElement?: ElementType;
  deficientElements?: ElementType[];
  periodStart?: string;
  periodEnd?: string;
  generatedTime?: string;
}

// Real energy data interfaces
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
  
  // Redirect to profile if no birthDate
  useEffect(() => {
    if (!birthDate) {
      window.location.href = '/profile';
      return;
    }
  }, [birthDate]);
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for active aspect tab
  const [activeAspect, setActiveAspect] = useState<string>('relationship');

  // State for GPT generated report content
  const [gptReport, setGptReport] = useState<GPTReport>({
    loading: true,
  });
  
  // Add state for parsed report sections
  const [reportSections, setReportSections] = useState<{[key: string]: string}>({
    finance: '',
    relationship: '',
    mood: '',
    health: '',
    growth: ''
  });
  
  // State for real energy data
  const [dailyEnergyData, setDailyEnergyData] = useState<DailyEnergyData[]>([]);
  const [hourlyEnergyData, setHourlyEnergyData] = useState<HourlyEnergyData[]>([]);
  const [energyDataLoading, setEnergyDataLoading] = useState(true);
  
  // State for user's element deficiencies
  const [userElements, setUserElements] = useState<FiveElementVector | null>(null);

  // Fetch all data from a single API endpoint
  useEffect(() => {
    async function fetchAllData() {
      try {
        setEnergyDataLoading(true);
        console.log('🔄 Fetching Apr 2025 report data...');
        
        // Use dynamic API path based on URL slug
        const pathMatch = window.location.pathname.match(/\/monthly-reports\/([a-z]+-\d{4})/i);
        const slug = pathMatch ? pathMatch[1] : 'apr-2025';
        console.log('📌 Detected slug from URL:', slug);
        
        // Convert month-year format to year-month format for API
        let apiSlug = slug;
        if (/^([a-z]+)-(\d{4})$/i.test(slug)) {
          const [month, year] = slug.split('-');
          const monthMap: Record<string, string> = {
            'january': '01', 'jan': '01',
            'february': '02', 'feb': '02',
            'march': '03', 'mar': '03',
            'april': '04', 'apr': '04',
            'may': '05',
            'june': '06', 'jun': '06',
            'july': '07', 'jul': '07',
            'august': '08', 'aug': '08',
            'september': '09', 'sep': '09',
            'october': '10', 'oct': '10',
            'november': '11', 'nov': '11',
            'december': '12', 'dec': '12'
          };
          const monthNum = monthMap[month.toLowerCase()];
          if (monthNum) {
            apiSlug = `${year}-${monthNum}`;
            console.log('📌 Converted slug for API:', apiSlug);
          }
        }
        
        const apiUrl = `/api/report/${apiSlug}${birthDate ? `?birthDate=${encodeURIComponent(birthDate)}` : ''}`;
        console.log('📌 API URL:', apiUrl);
        
        const res = await fetch(apiUrl, { 
          cache: 'no-store'
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `API request failed: ${res.status}`;
          console.error('API Error Details:', errorData);
          throw new Error(errorMessage);
        }
        
        // Parse all data returned from the API
        const data = await res.json();
        console.log('📊 API returned data structure:', Object.keys(data));
        
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        
        // Extract various parts of data returned from the API
        const { overview, daily, hourly, report: reportText } = data;
        
        // Update component state
        setGptReport({ ...overview, loading: false });
        setDailyEnergyData(daily || []);
        setHourlyEnergyData(hourly || []);
        setUserElements(overview?.vector || null);
        
        // Convert Markdown report to HTML
        if (reportText) {
          try {
            // Parse and divide the report into sections
            const sectionHeaders = {
              finance: '## 💰 Money Flow',
              relationship: '## 👥 Social Vibes',
              mood: '## 🌙 Mood Balance',
              health: '## 🔥 Body Fuel',
              growth: '## 🚀 Growth Track'
            };
            
            const parsedSections: {[key: string]: string} = {
              finance: '',
              relationship: '',
              mood: '',
              health: '',
              growth: ''
            };
            
            // Function to extract section content between headers
            const extractSection = (text: string, startHeader: string, endHeaders: string[]): string => {
              const startIndex = text.indexOf(startHeader);
              if (startIndex === -1) return '';
              
              let endIndex = text.length;
              for (const header of endHeaders) {
                const idx = text.indexOf(header, startIndex + startHeader.length);
                if (idx !== -1 && idx < endIndex) {
                  endIndex = idx;
                }
              }
              
              return text.substring(startIndex + startHeader.length, endIndex).trim();
            };
            
            // Extract each section
            const remainingHeaders = Object.values(sectionHeaders);
            Object.entries(sectionHeaders).forEach(([key, header], index) => {
              const endHeaders = remainingHeaders.slice(index + 1);
              const sectionContent = extractSection(reportText, header, endHeaders);
              parsedSections[key] = sectionContent;
              console.log(`Extracted ${key} section, length: ${sectionContent.length}`);
            });
            
            // Set the parsed sections
            setReportSections(parsedSections);
            
            console.log('📄 Markdown report parsed and sections extracted');
          } catch (error) {
            console.error('Markdown parsing failed:', error);
          }
        }
        
        console.log('✅ Data loading complete');
        
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        setGptReport({
          loading: false,
          error: error instanceof Error ? error.message : 'Loading failed'
        });
      } finally {
        setEnergyDataLoading(false);
      }
    }
    
    fetchAllData();
  }, [birthDate]);

  const dayNumberToDate = (day:number):string => {
    if (!gptReport.periodStart) return `Day ${day}`;
    const base = parseISO(gptReport.periodStart);
    const dateObj = addDays(base, day-1);
    return formatDate(dateObj, 'MMM d');
  };

  if (gptReport.loading) {
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

  if (gptReport.error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl">🔧</div>
            <h2 className="text-xl font-semibold">Report Temporarily Unavailable</h2>
            <p className="text-sm text-red-200">{gptReport.error}</p>
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
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report</h1>
          <p className="text-purple-300 mt-1">{
            gptReport.periodStart && gptReport.periodEnd ?
              `${formatDate(parseISO(gptReport.periodStart),'MMM d, yyyy')} - ${formatDate(parseISO(gptReport.periodEnd),'MMM d, yyyy')}` : 'Loading...'
          }</p>
        </header>
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">{gptReport.energyScore ? `${gptReport.energyScore} / 100` : '--'}</div>
            <div className="mt-1 text-purple-300">{gptReport.title || "Loading..."} ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: `${gptReport.energyScore || 0}%` }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              {gptReport.strongestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gptReport.strongestElement).bg} ${getElementColorClass(gptReport.strongestElement).text}`}>
                      {getElementIcon(gptReport.strongestElement)} {gptReport.strongestElement.charAt(0).toUpperCase() + gptReport.strongestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gptReport.strongestElement).text}`}>
                    {getElementDescription(gptReport.strongestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              {gptReport.weakestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gptReport.weakestElement).bg} ${getElementColorClass(gptReport.weakestElement).text}`}>
                      {getElementIcon(gptReport.weakestElement)} {gptReport.weakestElement.charAt(0).toUpperCase() + gptReport.weakestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gptReport.weakestElement).text}`}>
                    {getElementDescription(gptReport.weakestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Energy Calendar */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Daily Energy Calendar</h3>
            <button 
              onClick={() => setShowFullCalendar(!showFullCalendar)}
              className="text-purple-300 hover:text-white text-sm"
            >
              {showFullCalendar ? 'Show Less' : 'Show All'}
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Show first 7 days or all days based on state */}
            {dailyEnergyData.slice(0, showFullCalendar ? dailyEnergyData.length : 7).map((day, index) => {
              const dayNumber = index + 1;
              const score = day.score || 0;
              const dateLabel = dayNumberToDate(dayNumber);
              
              return (
                <div key={index} className="text-center p-2 rounded bg-purple-900/20 hover:bg-purple-800/30 transition-colors">
                  <div className="font-medium text-xs">{dayNumber}</div>
                  <div className="text-xs text-purple-400 mb-1">{dateLabel}</div>
                  <div className={`text-xs font-medium ${
                    score >= 70 ? 'text-green-400' : 
                    score <= 40 ? 'text-red-400' : 
                    'text-yellow-400'
                  }`}>
                    {score.toFixed(0) || '--'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Five Life Aspects Section - Navigation Tabs */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl">
          {/* Aspect Navigation Tabs */}
          <div className="flex border-b border-purple-900/30">
            <button 
              onClick={() => setActiveAspect('finance')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'finance' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">💰</span>
              <span className="text-xs mt-1">Money Flow</span>
            </button>
            <button 
              onClick={() => setActiveAspect('relationship')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'relationship' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">👥</span>
              <span className="text-xs mt-1">Social Vibes</span>
            </button>
            <button 
              onClick={() => setActiveAspect('mood')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'mood' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🌙</span>
              <span className="text-xs mt-1">Mood Balance</span>
            </button>
            <button 
              onClick={() => setActiveAspect('health')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'health' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🔥</span>
              <span className="text-xs mt-1">Body Fuel</span>
            </button>
            <button 
              onClick={() => setActiveAspect('growth')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'growth' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🚀</span>
              <span className="text-xs mt-1">Growth Track</span>
            </button>
          </div>
          
          {/* Finance & Career Content */}
          {activeAspect === 'finance' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">💼</span>
                <h3 className="text-lg font-medium">Finance & Career</h3>
              </div>
              
              {/* Render GPT-generated finance content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.finance ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.finance) as string }} />
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating financial insights...</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Unable to load financial insights</p>
                )}
              </div>
              
              {/* Pro Exclusive Section - LOCKED for Plus users */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                {/* LOCKED CONTENT for Plus users */}
                <div className="text-center py-8 px-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                  <div className="text-4xl mb-2">🔒</div>
                  <h4 className="text-sm font-medium mb-2">Hourly Peaks - Pro Feature</h4>
                  <p className="text-xs text-purple-300 mb-4">
                    Unlock detailed hourly energy peaks for strategic planning and optimal timing for financial decisions.
                  </p>
                  <Link 
                    href="/subscription" 
                    className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Social Vibes Content */}
          {activeAspect === 'relationship' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">👥</span>
                <h3 className="text-lg font-medium">Social Vibes</h3>
              </div>
              
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.relationship ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.relationship) as string }} />
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating relationship insights...</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Unable to load relationship insights</p>
                )}
              </div>
              
              {/* Pro Exclusive Section - LOCKED for Plus users */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                {/* LOCKED CONTENT for Plus users */}
                <div className="text-center py-8 px-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                  <div className="text-4xl mb-2">🔒</div>
                  <h4 className="text-sm font-medium mb-2">Best Connection Windows - Pro Feature</h4>
                  <p className="text-xs text-purple-300 mb-4">
                    Discover optimal times for deep conversations, relationship building, and social gatherings.
                  </p>
                  <Link 
                    href="/subscription" 
                    className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mood Balance Content */}
          {activeAspect === 'mood' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🌙</span>
                <h3 className="text-lg font-medium">Mood Balance</h3>
              </div>
              
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.mood ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.mood) as string }} />
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating mood insights...</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Unable to load mood insights</p>
                )}
              </div>
              
              {/* Pro Exclusive Section - LOCKED for Plus users */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                {/* LOCKED CONTENT for Plus users */}
                <div className="text-center py-8 px-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
                  <div className="text-4xl mb-2">🔒</div>
                  <h4 className="text-sm font-medium mb-2">Mind-Body Alignment & Sleep Aid - Pro Features</h4>
                  <p className="text-xs text-purple-300 mb-4">
                    Access personalized meditation reminders and sleep optimization recommendations based on your energy patterns.
                  </p>
                  <Link 
                    href="/subscription" 
                    className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Body Fuel Content */}
          {activeAspect === 'health' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🔥</span>
                <h3 className="text-lg font-medium">Body Fuel</h3>
              </div>
              
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.health ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.health) as string }} />
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating health insights...</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Unable to load health insights</p>
                )}
              </div>
            </div>
          )}

          {/* Growth Track Content */}
          {activeAspect === 'growth' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="text-lg font-medium">Growth Track</h3>
              </div>
              
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.growth ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.growth) as string }} />
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating growth insights...</p>
                  </div>
                ) : (
                  <p className="text-xs text-red-400">Unable to load growth insights</p>
                )}
              </div>
            </div>
          )}
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