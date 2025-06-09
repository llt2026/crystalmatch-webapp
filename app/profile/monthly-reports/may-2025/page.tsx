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

        {/* Five Life Aspects Section - NEW SECTION */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">Life Aspects Analysis</h2>
          
          {/* Finance & Career */}
          <div className="mb-4 pb-3 border-b border-purple-900/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">💼</span>
                <h3 className="font-medium">Finance & Career</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-900/40 text-green-200">
                Growth Energy
              </span>
            </div>
            <p className="text-sm text-purple-200 mb-1">
              Strategic time for business expansion and investment opportunities this month.
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-300">
                2 favorable days
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/20 text-red-300">
                1 challenging day
              </span>
            </div>
          </div>
          
          {/* Relationships */}
          <div className="mb-4 pb-3 border-b border-purple-900/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">👥</span>
                <h3 className="font-medium">Relationships</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-200">
                Fluid Energy
              </span>
            </div>
            <p className="text-sm text-purple-200 mb-1">
              Exceptional communication periods ahead with harmony-building opportunities.
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-300">
                1 harmonious period
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/20 text-red-300">
                1 sensitive period
              </span>
            </div>
          </div>
          
          {/* Mood & Stress */}
          <div className="mb-4 pb-3 border-b border-purple-900/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">🧠</span>
                <h3 className="font-medium">Mood & Stress</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-200">
                Fluid Energy
              </span>
            </div>
            <p className="text-sm text-purple-200 mb-1">
              Emotional clarity peaks in mid-month, focus on mindfulness practices.
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/20 text-blue-300">
                4-7-8 breathing technique
              </span>
            </div>
          </div>
          
          {/* Health & Habits */}
          <div className="mb-4 pb-3 border-b border-purple-900/30">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">🌿</span>
                <h3 className="font-medium">Health & Habits</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-900/40 text-yellow-200">
                Stability Energy
              </span>
            </div>
            <p className="text-sm text-purple-200 mb-1">
              Prioritize nutrition and moderate exercise for optimal balance.
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/20 text-yellow-300">
                3 recommended activities
              </span>
            </div>
          </div>
          
          {/* Personal Growth */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="font-medium">Personal Growth</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-900/40 text-green-200">
                Growth Energy
              </span>
            </div>
            <p className="text-sm text-purple-200 mb-1">
              Excellent period for learning new skills and exploring creative territories.
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-300">
                7-Day Micro-Challenge
              </span>
            </div>
          </div>
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
        
        {/* Hourly Peaks - Pro feature */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Hourly Energy Peaks</h2>
          <p className="text-xs text-purple-300 mb-3">Your next 24 hours energy peaks</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">8:00 AM</div>
                <div className="text-sm">9.2/10</div>
              </div>
              <p className="text-xs text-purple-200">Creative inspiration peak, ideal for brainstorming and creative work</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">2:00 PM</div>
                <div className="text-sm">8.7/10</div>
              </div>
              <p className="text-xs text-purple-200">Decision-making power enhanced, great for important choices and planning</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">7:00 PM</div>
                <div className="text-sm">8.5/10</div>
              </div>
              <p className="text-xs text-purple-200">Social energy surges, perfect for meetings and relationship building</p>
            </div>
          </div>
        </div>
        
        {/* Auspicious Days - Pro feature */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Auspicious Days</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 mr-2">
                  Favorable
                </span>
                <div>May 12</div>
              </div>
              <p className="text-xs text-purple-200">Ideal for starting new projects and investments</p>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 mr-2">
                  Favorable
                </span>
                <div>May 25</div>
              </div>
              <p className="text-xs text-purple-200">Perfect for travel and exploring new territories</p>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 mr-2">
                  Challenging
                </span>
                <div>May 18</div>
              </div>
              <p className="text-xs text-purple-200">Avoid major decisions and conflicts</p>
            </div>
          </div>
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