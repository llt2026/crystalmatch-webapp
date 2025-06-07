'use client';

// 强制设置动态渲染
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// 提取使用useSearchParams的逻辑到单独组件
function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // 处理跳转逻辑
  const navigateToReport = (reportPath: string) => {
    const url = birthDate 
      ? `${reportPath}?birthDate=${encodeURIComponent(birthDate)}`
      : reportPath;
    router.push(url);
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-white">Monthly Energy Reports</h1>
          <p className="text-sm text-purple-300 mt-1">Select a report to view</p>
        </header>
        
        <div className="space-y-3">
          <div
            onClick={() => navigateToReport('/profile/monthly-reports/may-2025')}
            className="block bg-black/40 p-4 rounded-lg hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <span className="text-white">May 2025 Energy Report</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>
            </div>
          </div>
          
          <div
            onClick={() => navigateToReport('/profile/monthly-reports/apr-2025')}
            className="block bg-black/40 p-4 rounded-lg hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <span className="text-white">April 2025 Energy Report</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// 主页面组件包装在Suspense中
export default function MonthlyReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
    </div>}>
      <ReportsContent />
    </Suspense>
  );
} 