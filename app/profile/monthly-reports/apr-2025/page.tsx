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
    <main className="min-h-screen bg-gradient-to-br from-indigo-800 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Plus)</h1>
          <p className="text-indigo-300 mt-1">{dateRange}</p>
        </header>
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile" className="text-indigo-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">76 / 100</div>
            <div className="mt-1 text-indigo-300">{gptReport.title || "Balance Focus"} ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full" 
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

        {/* Calendar Module */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">April Calendar</h2>
          
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          
          {/* First week (partial) */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {/* Empty cells for days before April 1 */}
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="aspect-square"></div>
            <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
              <span>1</span>
              <span className="text-[0.65rem] text-indigo-300">76</span>
            </div>
          </div>
          
          {/* Remaining calendar grid */}
          {!showFullCalendar && (
            <>
              {/* Second week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>2</span>
                  <span className="text-[0.65rem] text-indigo-300">77</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>3</span>
                  <span className="text-[0.65rem] text-indigo-300">75</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>4</span>
                  <span className="text-[0.65rem] text-indigo-300">74</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>5</span>
                  <span className="text-[0.65rem] text-indigo-300">72</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>6</span>
                  <span className="text-[0.65rem] text-red-300">68</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>7</span>
                  <span className="text-[0.65rem] text-red-300">65</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>8</span>
                  <span className="text-[0.65rem] text-indigo-300">70</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(true)}
                className="w-full text-xs text-indigo-300 mt-2 flex items-center justify-center"
              >
                Show full calendar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
          
          {showFullCalendar && (
            <>
              {/* Full calendar implementation (would be more rows) */}
              {/* Second week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>2</span>
                  <span className="text-[0.65rem] text-indigo-300">77</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>3</span>
                  <span className="text-[0.65rem] text-indigo-300">75</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>4</span>
                  <span className="text-[0.65rem] text-indigo-300">74</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>5</span>
                  <span className="text-[0.65rem] text-indigo-300">72</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>6</span>
                  <span className="text-[0.65rem] text-red-300">68</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>7</span>
                  <span className="text-[0.65rem] text-red-300">65</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>8</span>
                  <span className="text-[0.65rem] text-indigo-300">70</span>
                </div>
              </div>
              
              {/* Third week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>9</span>
                  <span className="text-[0.65rem] text-green-300">82</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>10</span>
                  <span className="text-[0.65rem] text-green-300">85</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>11</span>
                  <span className="text-[0.65rem] text-green-300">88</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>12</span>
                  <span className="text-[0.65rem] text-green-300">90</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>13</span>
                  <span className="text-[0.65rem] text-green-300">87</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>14</span>
                  <span className="text-[0.65rem] text-indigo-300">80</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>15</span>
                  <span className="text-[0.65rem] text-indigo-300">78</span>
                </div>
              </div>
              
              {/* Fourth week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>16</span>
                  <span className="text-[0.65rem] text-indigo-300">76</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>17</span>
                  <span className="text-[0.65rem] text-indigo-300">74</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>18</span>
                  <span className="text-[0.65rem] text-red-300">68</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>19</span>
                  <span className="text-[0.65rem] text-red-300">65</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>20</span>
                  <span className="text-[0.65rem] text-red-300">62</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>21</span>
                  <span className="text-[0.65rem] text-indigo-300">70</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>22</span>
                  <span className="text-[0.65rem] text-indigo-300">73</span>
                </div>
              </div>
              
              {/* Fifth week */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>23</span>
                  <span className="text-[0.65rem] text-indigo-300">76</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>24</span>
                  <span className="text-[0.65rem] text-green-300">80</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>25</span>
                  <span className="text-[0.65rem] text-green-300">83</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>26</span>
                  <span className="text-[0.65rem] text-green-300">85</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>27</span>
                  <span className="text-[0.65rem] text-green-300">88</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>28</span>
                  <span className="text-[0.65rem] text-green-300">86</span>
                </div>
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>29</span>
                  <span className="text-[0.65rem] text-green-300">82</span>
                </div>
              </div>
              
              {/* Last day of April */}
              <div className="grid grid-cols-7 gap-1">
                <div className="bg-indigo-900/20 rounded-md flex flex-col items-center justify-center py-1">
                  <span>30</span>
                  <span className="text-[0.65rem] text-indigo-300">78</span>
                </div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
                <div className="aspect-square"></div>
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="w-full text-xs text-indigo-300 mt-2 flex items-center justify-center"
              >
                Hide full calendar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
          
          <div className="flex justify-between items-center mt-3 text-xs text-indigo-300">
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>
              <span>High (80+)</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1"></span>
              <span>Medium (70-79)</span>
            </div>
            <div className="flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1"></span>
              <span>Low (< 70)</span>
            </div>
          </div>
        </div>

        {/* Daily Energy Chart Module */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daily Energy Chart</h2>
            <button 
              onClick={() => {}} 
              className="text-xs text-indigo-300 flex items-center"
            >
              Show More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="relative h-36 mb-2">
            {/* SVG Chart - Simple curve representation */}
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="300" y2="0" stroke="#6366f133" strokeWidth="1" />
              <line x1="0" y1="33" x2="300" y2="33" stroke="#6366f133" strokeWidth="1" />
              <line x1="0" y1="66" x2="300" y2="66" stroke="#6366f133" strokeWidth="1" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="#6366f133" strokeWidth="1" />
              
              {/* Data line - Energy curve */}
              <path 
                d="M0,50 C20,70 40,80 60,30 S80,10 100,30 S120,60 140,50 S160,30 180,20 S200,10 220,25 S240,60 260,40 S280,30 300,50" 
                fill="none" 
                stroke="url(#energyGradient)" 
                strokeWidth="3" 
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-[10px] text-indigo-300 pr-2">
              <span>High</span>
              <span>Medium</span>
              <span>Low</span>
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] text-indigo-300 px-4">
            <span>Apr 1</span>
            <span>Apr 10</span>
            <span>Apr 20</span>
            <span>Apr 30</span>
          </div>
          
          <div className="mt-4 border-t border-indigo-900/30 pt-4">
            <h3 className="text-sm font-medium mb-2">Monthly Insights</h3>
            <p className="text-xs text-indigo-300">
              {gptReport.insight ? gptReport.insight : 'April begins with moderate energy that drops during the first week. Energy peaks around April 12th, making this an ideal time for important presentations or decisions. The third week shows a notable dip, suggesting a time to rest and recharge. The month ends with rising energy, creating momentum into May.'}
            </p>
            
            <div className="mt-4">
              <h4 className="text-xs font-medium mb-1">Key Dates</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 text-xs">•</span>
                  <p className="text-xs"><span className="font-medium">April 12:</span> Peak energy day (90) — ideal for important decisions</p>
                </div>
                <div className="flex items-start">
                  <span className="text-red-400 mr-2 text-xs">•</span>
                  <p className="text-xs"><span className="font-medium">April 20:</span> Lowest energy point (62) — schedule lighter tasks</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 text-xs">•</span>
                  <p className="text-xs"><span className="font-medium">April 27:</span> High creative energy (88) — excellent for brainstorming</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Crystals Section */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">Crystal Recommendations</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-900/20 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Primary Crystal</h3>
              <div className="flex items-center mb-1.5">
                <span className="text-lg mr-2">💎</span>
                <span className="text-sm">{gptReport.crystals && gptReport.crystals[0] ? gptReport.crystals[0].name : "Amethyst"}</span>
              </div>
              <p className="text-xs text-indigo-200">
                {gptReport.crystals && gptReport.crystals[0] ? gptReport.crystals[0].benefit : "Enhances intuition and balances emotional fluctuations"}
              </p>
            </div>
            
            <div className="bg-indigo-900/20 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Support Crystal</h3>
              <div className="flex items-center mb-1.5">
                <span className="text-lg mr-2">💎</span>
                <span className="text-sm">{gptReport.crystals && gptReport.crystals[1] ? gptReport.crystals[1].name : "Aquamarine"}</span>
              </div>
              <p className="text-xs text-indigo-200">
                {gptReport.crystals && gptReport.crystals[1] ? gptReport.crystals[1].benefit : "Calms overthinking and enhances clear communication"}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Crystal Placement</h3>
            <p className="text-xs text-indigo-300">
              {gptReport.ritual ? gptReport.ritual.split('.')[0] + '.' : "Place your primary crystal on your workspace during morning hours. Keep your support crystal near your bed to enhance dream clarity and promote restful sleep."}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-indigo-900/30">
            <h3 className="font-medium text-sm mb-2">Crystal Insight</h3>
            <div className="flex items-start">
              <span className="text-indigo-300 mr-2 mt-0.5">✦</span>
              <p className="text-xs text-indigo-300">
                {gptReport.challenges ? gptReport.challenges[0] : "Your energy this month responds particularly well to blue and purple crystals, which can help stabilize the rapid fluctuations you'll experience."}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback button */}
        <div className="flex justify-center pt-2 pb-6">
          <button 
            onClick={() => openFeedbackModal('report')} 
            className="text-xs text-indigo-300 hover:text-white transition-colors"
          >
            Submit feedback about this report ↗
          </button>
        </div>
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