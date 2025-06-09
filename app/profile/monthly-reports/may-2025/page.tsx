/**
 * May 2025 Monthly Deep Report Page - Pro Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Type for element
type ElementType = 'water' | 'fire' | 'earth' | 'metal' | 'wood';

// Extract useSearchParams component to a separate component
function MayReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // Calculate date range (US format: MM/DD/YYYY)
  const startDate = "05/01/2025";
  const endDate = "05/31/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for active aspect tab
  const [activeAspect, setActiveAspect] = useState('finance');
  
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
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Pro)</h1>
          <p className="text-purple-300 mt-1">{dateRange}</p>
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
            <div className="text-3xl font-bold">83 / 100</div>
            <div className="mt-1 text-purple-300">Growth Mode ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "83%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  💧 Water
                </span>
              </div>
              <div className="text-xs text-blue-300 mt-1 font-medium">Fluid Energy</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                  🔥 Fire
                </span>
              </div>
              <div className="text-xs text-red-300 mt-1 font-medium">Passion Energy</div>
            </div>
          </div>
        </div>

        {/* Five Life Aspects Section - NEW SECTION with Navigation Tabs */}
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
          
          {/* Finance & Career Content (Visible when activeAspect is finance) */}
          {activeAspect === 'finance' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">💼</span>
                <h3 className="text-lg font-medium">Finance & Career</h3>
              </div>
              
              <p className="text-sm text-purple-200 mb-4">
                Your financial energy is high this month—great for initiating negotiations or exploring new income streams.
              </p>
              
              {/* Favorable and unfavorable days */}
              <div className="space-y-3 mb-5">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/12</span> Good for interviews or applications</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/21</span> Well-timed for startup moves</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/18</span> Miscommunication likely, avoid signing</p>
                  </div>
                </div>
              </div>
              
              {/* Best time hint */}
              <div className="flex items-start mb-5">
                <span className="inline-block bg-purple-900/40 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="text-xs text-purple-200">
                  On 6/12 morning, aim for one high-stakes conversation. Energy favors expression.
                </p>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <h5 className="text-sm mb-2">Hourly Peaks</h5>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">9:00 AM–11:00 AM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 88</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for presentations</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">3:00 PM–5:00 PM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 83</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for contracts</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">7:00 PM–9:00 PM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 80</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for planning</p>
                </div>
                
                <div className="mt-4 flex items-center">
                  <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-xs text-purple-200">
                    Alerts enabled, you'll be notified 15 mins prior
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Relationship Content (Visible when activeAspect is relationship) */}
          {activeAspect === 'relationship' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">👥</span>
                <h3 className="text-lg font-medium">Social Vibes</h3>
              </div>
              
              <p className="text-sm text-purple-200 mb-4">
                This month offers both harmonious periods for deepening connections and potential friction points to navigate carefully.
              </p>
              
              {/* Harmonious periods section */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Harmonious Periods</h4>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm">Next 7 days with daily energy score <span className="font-medium">≥75</span> + water/fire balanced periods</p>
                  </div>
                </div>
                <div className="flex items-start pl-5">
                  <div>
                    <p className="text-xs text-purple-200">Hourly scores <span className="font-medium">≥80</span> marked as harmony windows</p>
                  </div>
                </div>
              </div>
              
              {/* Friction periods section */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Friction Periods</h4>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm">Hours with daily energy score <span className="font-medium">≤55</span> and metal/earth deficiency</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 8th, 14:00-16:00</span>: Avoid critical discussions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 16th, 11:00-13:00</span>: Communication challenges likely</p>
                  </div>
                </div>
              </div>
              
              {/* Best window hint */}
              <div className="flex items-start mb-5">
                <span className="inline-block bg-purple-900/40 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="text-xs text-purple-200">
                  Schedule meaningful conversations during harmony windows to enhance mutual understanding.
                </p>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <h5 className="text-sm mb-2">Best Connection Windows</h5>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-1">Select harmonious days first:</p>
                    <div className="flex items-center ml-2">
                      <span className="inline-block bg-green-900/30 rounded-full p-1 mr-2 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-xs text-purple-200">Hourly energy score <span className="font-medium">≥82</span></p>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="inline-block bg-green-900/30 rounded-full p-1 mr-2 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-xs text-purple-200">Dominant elements: water/fire (2-hour blocks)</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs">May 12th, 18:00–20:00</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Score 85</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 pl-6">Perfect for deep conversations</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs">May 24th, 15:00–17:00</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Score 84</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 pl-6">Ideal for relationship building</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mood Content (Only showing structure, similar pattern for all tabs) */}
          {activeAspect === 'mood' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🌙</span>
                <h3 className="text-lg font-medium">Mood & Balance</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Your emotional resilience is enhanced, making this a good time for mindfulness activities.
              </p>
              {/* Specific content for mood */}
            </div>
          )}
          
          {/* Health Content */}
          {activeAspect === 'health' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🔥</span>
                <h3 className="text-lg font-medium">Health & Vitality</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Focus on restorative practices and balanced nutrition this month.
              </p>
              {/* Specific content for health */}
            </div>
          )}
          
          {/* Growth Content */}
          {activeAspect === 'growth' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="text-lg font-medium">Personal Growth</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Excellent period to start learning a new skill or expanding your knowledge base.
              </p>
              {/* Specific content for growth */}
            </div>
          )}
        </div>
        
        {/* Daily Energy Calendar with expandable view */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
          
          {/* Initial 5-day view */}
          {!showFullCalendar && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 1</div>
                  <div className="text-sm">8.3/10</div>
                  <div className="text-green-400 text-sm">🟢 Rising</div>
                </div>
                <p className="text-xs text-purple-200">Morning meditation enhances intuition and creativity</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('fire').bgColor} rounded-full text-white ${getCrystalForElement('fire').color}`}>
                    {getCrystalForElement('fire').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 2</div>
                  <div className="text-sm">7.2/10</div>
                  <div className="text-yellow-400 text-sm">🟡 Stable</div>
                </div>
                <p className="text-xs text-purple-200">Wear blue to amplify intuitive energy</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('water').bgColor} rounded-full text-white ${getCrystalForElement('water').color}`}>
                    {getCrystalForElement('water').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 3</div>
                  <div className="text-sm">6.5/10</div>
                  <div className="text-red-400 text-sm">🔴 Declining</div>
                </div>
                <p className="text-xs text-purple-200">Good day for important decisions</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('earth').bgColor} rounded-full text-white ${getCrystalForElement('earth').color}`}>
                    {getCrystalForElement('earth').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 4</div>
                  <div className="text-sm">5.8/10</div>
                  <div className="text-red-400 text-sm">🔴 Declining</div>
                </div>
                <p className="text-xs text-purple-200">Rest more, avoid high-intensity activities</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('metal').bgColor} rounded-full text-white ${getCrystalForElement('metal').color}`}>
                    {getCrystalForElement('metal').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 5</div>
                  <div className="text-sm">7.4/10</div>
                  <div className="text-green-400 text-sm">🟢 Rising</div>
                </div>
                <p className="text-xs text-purple-200">Ideal for socializing and building relationships</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('wood').bgColor} rounded-full text-white ${getCrystalForElement('wood').color}`}>
                    {getCrystalForElement('wood').name}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(true)}
                className="w-full mt-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                View Full Month Calendar ↓
              </button>
            </div>
          )}
          
          {/* Full 30-day view */}
          {showFullCalendar && (
            <div>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div key={day} className="border-b border-purple-900/30 pb-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">May {day}</div>
                      <div className="text-sm">{(7.5 + Math.sin(day/3) * 2.5).toFixed(1)}/10</div>
                      <div className={`text-sm ${day % 3 === 0 ? 'text-red-400' : day % 3 === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {day % 3 === 0 ? '🔴 Declining' : day % 3 === 1 ? '🟢 Rising' : '🟡 Stable'}
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                      {day % 5 === 0 ? 'Focus on creativity and expression' : 
                       day % 5 === 1 ? 'Ideal for strategic planning and decisions' :
                       day % 5 === 2 ? 'Energy flows toward relationship building' :
                       day % 5 === 3 ? 'Best for practical tasks and organization' :
                       'Good balance between activity and rest'}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                      <span className={`text-xs px-2 py-0.5 ${getCrystalForElement(getDailyElement(day)).bgColor} rounded-full text-white ${getCrystalForElement(getDailyElement(day)).color}`}>
                        {getCrystalForElement(getDailyElement(day)).name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="w-full mt-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                Show Less ↑
              </button>
            </div>
          )}
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
export default function MayReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <MayReportContent />
    </Suspense>
  );
} 