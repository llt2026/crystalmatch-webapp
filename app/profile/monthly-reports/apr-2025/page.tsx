/**
 * April 2025 Monthly Deep Report Page - Plus Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Extract useSearchParams component to a separate component
function AprilReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // Calculate date range (US format: MM/DD/YYYY)
  const startDate = "04/01/2025";
  const endDate = "04/30/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
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
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">75 / 100</div>
            <div className="mt-1 text-purple-300">Balance Mode ⚖️</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "75%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                  🌱 Wood
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">Crystal: Green Jade</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  🪨 Earth
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">Crystal: Amethyst</div>
            </div>
          </div>
        </div>
        
        {/* Daily Energy Calendar with crystal recommendations */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
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
                  <span className="px-2 py-0.5 bg-red-900/50 rounded-full text-white">Fire Agate</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>April 2:</span>
                  <span className="px-2 py-0.5 bg-blue-900/50 rounded-full text-white">Sodalite</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>April 3:</span>
                  <span className="px-2 py-0.5 bg-yellow-900/50 rounded-full text-white">Tiger's Eye</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>April 4:</span>
                  <span className="px-2 py-0.5 bg-green-900/50 rounded-full text-white">Aventurine</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>April 5:</span>
                  <span className="px-2 py-0.5 bg-purple-900/50 rounded-full text-white">Fluorite</span>
                </div>
              </div>
            </details>
          </div>
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