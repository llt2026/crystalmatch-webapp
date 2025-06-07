/**
 * May 2025 Monthly Deep Report Page - 简化版本
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 提取使用useSearchParams的部分到单独组件
function MayReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* 页头 */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch</h1>
          <h2 className="text-xl mt-2">Monthly Energy Report</h2>
          <p className="text-purple-300 mt-1">May 2025</p>
        </header>
        
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* 能量概览 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">83 / 100</div>
            <div className="mt-1 text-purple-300">Growth Mode ✨</div>
          </div>
          
          <div className="text-center text-xl mt-2">
            <div>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░</div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest</div>
              <div>💧 Water</div>
              <div className="text-xs text-purple-300">Clear Quartz</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest</div>
              <div>🔥 Fire</div>
              <div className="text-xs text-purple-300">Red Jasper</div>
            </div>
          </div>
        </div>
        
        {/* 日能量日历 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>May 1</div>
              <div>8.3</div>
              <div>🟢 Up</div>
            </div>
            <div className="flex justify-between">
              <div>May 2</div>
              <div>7.2</div>
              <div>🟡 Stable</div>
            </div>
            <div className="flex justify-between">
              <div>May 3</div>
              <div>6.5</div>
              <div>🔴 Down</div>
            </div>
            <div className="flex justify-between">
              <div>May 4</div>
              <div>5.8</div>
              <div>🔴 Down</div>
            </div>
            <div className="flex justify-between">
              <div>May 5</div>
              <div>7.4</div>
              <div>🟢 Up</div>
            </div>
            <div className="flex justify-between">
              <div>May 6</div>
              <div>8.9</div>
              <div>🟢 Up</div>
            </div>
            <div className="flex justify-between">
              <div>May 7</div>
              <div>8.3</div>
              <div>🟡 Stable</div>
            </div>
          </div>
        </div>
        
        {/* 能量提示 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Tips</h2>
          <div className="space-y-3">
            <div className="flex">
              <div className="w-16">May 1</div>
              <div>Morning meditation for clarity</div>
            </div>
            <div className="flex">
              <div className="w-16">May 2</div>
              <div>Wear blue to amplify intuition</div>
            </div>
            <div className="flex">
              <div className="w-16">May 3</div>
              <div>Important decisions best made today</div>
            </div>
          </div>
        </div>
        
        {/* 高峰时段 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Energy Peak Hours</h2>
          <ul className="space-y-2">
            <li>• 8 am - Creative inspiration</li>
            <li>• 2 pm - Decision making</li>
            <li>• 7 pm - Social connection</li>
          </ul>
        </div>
        
        {/* 幸运日 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Auspicious Days</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-purple-800/50 rounded-full">May 12</span>
            <span className="px-3 py-1 bg-purple-800/50 rounded-full">May 18</span>
            <span className="px-3 py-1 bg-purple-800/50 rounded-full">May 25</span>
          </div>
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

// 使用Suspense包装组件以解决useSearchParams需要Suspense边界的问题
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