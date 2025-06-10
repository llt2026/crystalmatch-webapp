/**
 * April 2025 Monthly Deep Report Page - Plus Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Type for element
type ElementType = 'water' | 'fire' | 'earth' | 'metal' | 'wood';

// Add GPT Report interface
interface GPTReport {
  title?: string;
  insight?: string;
  challenges?: string[];
  crystals?: Array<{name: string, benefit: string}>;
  ritual?: string;
  guidance?: string[];
  loading: boolean;
  error?: string;
}

// Extract useSearchParams component to a separate component
function AprilReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // Calculate date range (US format: MM/DD/YYYY)
  const startDate = "04/01/2025";
  const endDate = "04/30/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for GPT generated report content
  const [gptReport, setGptReport] = useState<GPTReport>({
    loading: true,
  });

  // Fetch GPT report data when component loads
  useEffect(() => {
    async function fetchReportData() {
      try {
        console.log('Fetching report data for April 2025...');
        const response = await fetch(`/api/reports/2025-04?birthDate=${encodeURIComponent(birthDate || '1990-01-01')}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'x-tier': 'plus' // Ensure we get plus-level content
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received report data:', data);

        if (data.report) {
          // Parse the markdown content
          const reportContent = data.report;
          
          // Extract title
          const titleMatch = reportContent.match(/# 🔮 .* — (.*)/);
          const title = titleMatch ? titleMatch[1] : 'Energy Rising';
          
          // Extract insight
          const insightMatch = reportContent.match(/## 🌟 Energy Insight\n([\s\S]*?)(?=##)/);
          const insight = insightMatch ? insightMatch[1].trim() : '';
          
          // Extract challenges
          const challengesMatch = reportContent.match(/## ⚠️ (?:Potential )?Challenges\n([\s\S]*?)(?=##)/);
          const challengesText = challengesMatch ? challengesMatch[1] : '';
          const challenges = challengesText
            .split('\n')
            .filter((line) => line.trim().startsWith('-'))
            .map((line) => line.replace('-', '').trim());
          
          // Extract crystals
          const crystalsMatch = reportContent.match(/## 💎 (?:Monthly )?Crystals(?: to Consider)?\n([\s\S]*?)(?=##)/);
          const crystalsText = crystalsMatch ? crystalsMatch[1] : '';
          const crystals = crystalsText
            .split('\n')
            .filter((line) => line.trim().startsWith('-'))
            .map((line) => {
              const parts = line.replace('-', '').trim().split('—');
              return {
                name: parts[0].trim(),
                benefit: parts.length > 1 ? parts[1].trim() : ''
              };
            });
          
          // Extract ritual
          const ritualMatch = reportContent.match(/## ✨ (?:Ritual|Practice)(?: to Explore)?.*\n([\s\S]*?)(?=##|$)/);
          const ritual = ritualMatch ? ritualMatch[1].trim() : '';
          
          // Extract guidance
          const guidanceMatch = reportContent.match(/## 🧭 Monthly (?:Guidance|Possibilities)\n([\s\S]*?)(?=$)/);
          const guidanceText = guidanceMatch ? guidanceMatch[1] : '';
          const guidance = guidanceText
            .split('\n')
            .filter((line) => line.trim().startsWith('✅') || line.trim().startsWith('🚫'))
            .map((line) => line.trim());
          
          setGptReport({
            title,
            insight,
            challenges,
            crystals,
            ritual,
            guidance,
            loading: false
          });
        } else {
          throw new Error('Report data is missing');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setGptReport({
          loading: false,
          error: 'Failed to load report. Please try again later.'
        });
      }
    }

    fetchReportData();
  }, [birthDate]);
  
  // Helper function to get crystal for each element
  const getCrystalForElement = (element: ElementType) => {
    const crystalMap = {
      'water': { name: 'Clear Quartz', color: 'text-blue-300', bgColor: 'bg-blue-900/50' },
      'fire': { name: 'Red Jasper', color: 'text-red-300', bgColor: 'bg-red-900/50' },
      'earth': { name: 'Amethyst', color: 'text-purple-300', bgColor: 'bg-purple-900/50' },
      'metal': { name: 'Citrine', color: 'text-yellow-300', bgColor: 'bg-yellow-900/50' },
      'wood': { name: 'Green Jade', color: 'text-green-300', bgColor: 'bg-green-900/50' }
    };
    return crystalMap[element] || crystalMap.water;
  };
  
  // Function to determine daily element based on day number
  const getDailyElement = (day: number): ElementType => {
    const elements: ElementType[] = ['water', 'fire', 'earth', 'metal', 'wood'];
    return elements[day % 5];
  };

  // Function to get element color class based on element type
  const getElementColorClass = (element: ElementType): {bg: string, text: string} => {
    const colorMap = {
      'water': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
      'fire': { bg: 'bg-red-900/40', text: 'text-red-300' },
      'earth': { bg: 'bg-yellow-900/40', text: 'text-yellow-300' },
      'metal': { bg: 'bg-purple-900/40', text: 'text-purple-300' },
      'wood': { bg: 'bg-green-900/40', text: 'text-green-300' }
    };
    return colorMap[element] || colorMap.water;
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Plus)</h1>
          <p className="text-purple-300 mt-1">{dateRange}</p>
        </header>
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* GPT Report Block */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">Energy Report</h2>
          
          {/* Energy Insight */}
          <div className="mb-5">
            <h3 className="text-sm font-medium text-purple-300 mb-2">🌟 Energy Insight</h3>
            <p className="text-sm">{gptReport.insight || "Loading energy insight..."}</p>
          </div>
          
          {/* Challenges */}
          {gptReport.challenges && gptReport.challenges.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-purple-300 mb-2">⚠️ Challenges</h3>
              <ul className="text-sm space-y-2">
                {gptReport.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-2">•</span>
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Crystals */}
          {gptReport.crystals && gptReport.crystals.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-purple-300 mb-2">💎 Crystals to Consider</h3>
              <ul className="text-sm space-y-3">
                {gptReport.crystals.map((crystal, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>
                      <span className="font-medium">{crystal.name}</span> — {crystal.benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Ritual */}
          {gptReport.ritual && (
            <div className="mb-5">
              <h3 className="text-sm font-medium text-purple-300 mb-2">✨ Practice to Explore</h3>
              <p className="text-sm bg-purple-900/20 p-3 rounded-md">{gptReport.ritual}</p>
            </div>
          )}
          
          {/* Guidance */}
          {gptReport.guidance && gptReport.guidance.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-purple-300 mb-2">🧭 Monthly Possibilities</h3>
              <ul className="text-sm space-y-2">
                {gptReport.guidance.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{item.includes('✅') ? '✅' : '🚫'}</span>
                    <span>{item.replace(/[✅🚫]/g, '').trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">76 / 100</div>
            <div className="mt-1 text-purple-300">{gptReport.title || "Balance Focus"} ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "76%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                  🌿 Wood
                </span>
              </div>
              <div className="text-xs text-green-300 mt-1 font-medium">Growth Energy</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  🪨 Earth
                </span>
              </div>
              <div className="text-xs text-yellow-300 mt-1 font-medium">Stability Energy</div>
            </div>
          </div>
        </div>

        {/* Five Life Aspects Section - NEW SECTION (Plus Version) */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">Life Aspects Analysis</h2>
          
          <div className="space-y-4">
            {/* Finance & Career */}
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">💼</span>
                <h3 className="font-medium">Finance & Career</h3>
              </div>
              <p className="text-sm text-purple-200">
                Two favorable days this month for important business decisions.
              </p>
            </div>
            
            {/* Relationships */}
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">👥</span>
                <h3 className="font-medium">Relationships</h3>
              </div>
              <p className="text-sm text-purple-200">
                Focused time to work on strengthening important connections.
              </p>
            </div>
            
            {/* Mood & Stress */}
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🧠</span>
                <h3 className="font-medium">Mood & Stress</h3>
              </div>
              <p className="text-sm text-purple-200">
                Practice 4-7-8 breathing technique to reduce stress this month.
              </p>
            </div>
            
            {/* Health & Habits */}
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🌿</span>
                <h3 className="font-medium">Health & Habits</h3>
              </div>
              <p className="text-sm text-purple-200">
                Three recommended wellness activities based on your energy.
              </p>
            </div>
            
            {/* Personal Growth */}
            <div className="p-3 bg-black/20 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="font-medium">Personal Growth</h3>
              </div>
              <p className="text-sm text-purple-200">
                Focus on small daily habits to build momentum toward goals.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-purple-300">
              Upgrade to Pro for deeper insights and personalized recommendations
            </p>
          </div>
        </div>
        
        {/* Daily Energy Calendar with expandable view */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
          
          {/* Initial 5-day view */}
          {!showFullCalendar && (
            <div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-purple-300">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Energy</th>
                    <th className="pb-2">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr className="text-sm">
                    <td className="py-2">April 1</td>
                    <td className="py-2">7.0/10</td>
                    <td className="py-2 text-green-400">🟢 Rising</td>
                  </tr>
                  <tr className="text-sm">
                    <td className="py-2">April 2</td>
                    <td className="py-2">6.2/10</td>
                    <td className="py-2 text-yellow-400">🟡 Stable</td>
                  </tr>
                  <tr className="text-sm">
                    <td className="py-2">April 3</td>
                    <td className="py-2">3.8/10</td>
                    <td className="py-2 text-red-400">🔴 Declining</td>
                  </tr>
                  <tr className="text-sm">
                    <td className="py-2">April 4</td>
                    <td className="py-2">2.5/10</td>
                    <td className="py-2 text-red-400">🔴 Declining</td>
                  </tr>
                  <tr className="text-sm">
                    <td className="py-2">April 5</td>
                    <td className="py-2">4.5/10</td>
                    <td className="py-2 text-green-400">🟢 Rising</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 space-y-2">
                <details className="text-sm">
                  <summary className="cursor-pointer text-purple-300 hover:text-white">View Daily Crystal Recommendations</summary>
                  <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-700">
                    <div className="flex justify-between text-xs">
                      <span>April 1:</span>
                      <span className={`px-2 py-0.5 ${getCrystalForElement('fire').bgColor} rounded-full text-white ${getCrystalForElement('fire').color}`}>
                        {getCrystalForElement('fire').name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>April 2:</span>
                      <span className={`px-2 py-0.5 ${getCrystalForElement('water').bgColor} rounded-full text-white ${getCrystalForElement('water').color}`}>
                        {getCrystalForElement('water').name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>April 3:</span>
                      <span className={`px-2 py-0.5 ${getCrystalForElement('earth').bgColor} rounded-full text-white ${getCrystalForElement('earth').color}`}>
                        {getCrystalForElement('earth').name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>April 4:</span>
                      <span className={`px-2 py-0.5 ${getCrystalForElement('metal').bgColor} rounded-full text-white ${getCrystalForElement('metal').color}`}>
                        {getCrystalForElement('metal').name}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>April 5:</span>
                      <span className={`px-2 py-0.5 ${getCrystalForElement('wood').bgColor} rounded-full text-white ${getCrystalForElement('wood').color}`}>
                        {getCrystalForElement('wood').name}
                      </span>
                    </div>
                  </div>
                </details>
              </div>

              <button 
                onClick={() => setShowFullCalendar(true)}
                className="w-full mt-4 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                View Full Month Calendar ↓
              </button>
            </div>
          )}
          
          {/* Full 30-day view */}
          {showFullCalendar && (
            <div>
              <div className="max-h-80 overflow-y-auto pr-1">
                <table className="w-full">
                  <thead className="sticky top-0 bg-black/50">
                    <tr className="text-left text-sm text-purple-300">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Energy</th>
                      <th className="pb-2">Trend</th>
                      <th className="pb-2">Crystal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                      <tr key={day} className="text-sm border-b border-purple-900/30">
                        <td className="py-2">April {day}</td>
                        <td className="py-2">{(6 + Math.sin(day/3) * 3).toFixed(1)}/10</td>
                        <td className="py-2">
                          <span className={day % 3 === 0 ? 'text-red-400' : day % 3 === 1 ? 'text-green-400' : 'text-yellow-400'}>
                            {day % 3 === 0 ? '🔴 Declining' : day % 3 === 1 ? '🟢 Rising' : '🟡 Stable'}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 ${getCrystalForElement(getDailyElement(day)).bgColor} rounded-full text-white ${getCrystalForElement(getDailyElement(day)).color}`}>
                            {getCrystalForElement(getDailyElement(day)).name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="w-full mt-4 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                Show Less ↑
              </button>
            </div>
          )}
        </div>
        
        {/* Energy Tips */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Energy Tips</h2>
          <div className="space-y-3">
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">April 8</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-800/70">Energy Balance</span>
              </div>
              <p className="text-sm">Energy will be well-balanced, suitable for various activities</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">April 15</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/70">Energy Peak</span>
              </div>
              <p className="text-sm">High energy day, perfect for challenging work and decisions</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">April 22</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-800/70">Energy Dip</span>
              </div>
              <p className="text-sm">Energy levels will be lower, focus on rest and lighter tasks</p>
            </div>
          </div>
        </div>
        
        {/* Upgrade Teaser - Plus feature */}
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/30 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🔒</span>
            <h2 className="text-lg font-semibold">Unlock Pro Features</h2>
          </div>
          <p className="text-sm mb-3">Upgrade to Pro to access hourly energy peaks, auspicious days, and relationship synergy analysis</p>
          <Link 
            href="/subscription" 
            className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-center rounded text-white text-sm font-medium"
          >
            UPGRADE TO PRO
          </Link>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-sm text-purple-300 mt-8">
          <p className="mt-1">This report weaves together almost 4,000 years of evolving Chinese Five-Element Feng Shui, evidence-backed modern science, and the freshest AI intelligence—ancient wisdom, updated for your everyday life.</p>
          <p className="mt-3">© 2025 CrystalMatch</p>
        </footer>
      </div>
    </main>
  );
}

// Wrap component with Suspense to solve useSearchParams requirement
export default function AprilReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AprilReportContent />
    </Suspense>
  );
} 