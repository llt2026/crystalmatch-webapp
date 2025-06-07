/**
 * April 2025 Monthly Deep Report Page - 简化版本
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AprilReportPage() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* 页头 */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">April 2025 Monthly Energy Report</h1>
          <p className="text-purple-300 mt-1">Your personalized Plus energy forecast</p>
        </header>
        
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* 日能量日历 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-purple-300">
                <th className="pb-2">DATE</th>
                <th className="pb-2">ENERGY</th>
                <th className="pb-2">TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="text-sm">
                <td className="py-2">March 31, 2025</td>
                <td className="py-2">6.1</td>
                <td className="py-2 text-green-400">Up</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 1, 2025</td>
                <td className="py-2">7</td>
                <td className="py-2 text-green-400">Up</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 2, 2025</td>
                <td className="py-2">2.1</td>
                <td className="py-2 text-blue-400">Stable</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 3, 2025</td>
                <td className="py-2">-9.8</td>
                <td className="py-2 text-red-400">Down</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 4, 2025</td>
                <td className="py-2">-4.2</td>
                <td className="py-2 text-red-400">Down</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 5, 2025</td>
                <td className="py-2">-6.4</td>
                <td className="py-2 text-red-400">Down</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 6, 2025</td>
                <td className="py-2">-8.7</td>
                <td className="py-2 text-red-400">Down</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">April 7, 2025</td>
                <td className="py-2">1.7</td>
                <td className="py-2 text-blue-400">Stable</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* 推送通知 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Push Notifications</h2>
          <div className="space-y-3">
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">Apr 8, 2025</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-800/70">Energy Balance</span>
              </div>
              <p className="text-sm">Your energy will be well-balanced. Good for various activities.</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">Apr 15, 2025</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/70">Energy Peak</span>
              </div>
              <p className="text-sm">High energy day. Great for challenging work and decisions.</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">Apr 22, 2025</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-800/70">Energy Dip</span>
              </div>
              <p className="text-sm">Energy levels will be lower. Take breaks and focus on lighter tasks.</p>
            </div>
          </div>
        </div>
        
        {/* 小时能量高峰 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Hourly Energy Peaks</h2>
          <div className="text-center text-xs text-purple-200 mb-2">
            Energy peaks for April 15, 2025
          </div>
          <div className="flex justify-between items-end h-32 px-2">
            {[
              { hour: 0, value: 30 },
              { hour: 3, value: 20 },
              { hour: 6, value: 40 },
              { hour: 9, value: 80 },
              { hour: 12, value: 60 },
              { hour: 15, value: 50 },
              { hour: 18, value: 70 },
              { hour: 21, value: 40 }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="w-4 bg-purple-600 rounded-t"
                  style={{ height: `${item.value}%` }}
                ></div>
                <div className="mt-1 text-gray-400">{item.hour}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-gray-400 mt-3">Hour of day (0-23)</div>
        </div>
        
        {/* 升级提示 */}
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/30 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🔒</span>
            <h2 className="text-lg font-semibold">Unlock Pro Features</h2>
          </div>
          <p className="text-sm mb-3">Upgrade to Pro to access auspicious days, relationship synergy, and weekly forecast</p>
          <Link 
            href="/subscription" 
            className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-center rounded text-white text-sm font-medium"
          >
            UPGRADE TO PRO
          </Link>
        </div>
        
        {/* 页脚 */}
        <footer className="text-center text-sm text-purple-300 mt-8">
          <p>Based on your birth data: {birthDate || 'Not specified'}</p>
          <p className="mt-1">© 2025 CrystalMatch</p>
        </footer>
      </div>
    </main>
  );
} 