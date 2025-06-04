'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  
  // 直接使用硬编码数据
  const testUser = {
    name: "Test User",
    birthDate: "01/01/1990", // 美国格式日期
    isPremium: true
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black px-4 py-6 sm:p-8">
      <Link href="/" className="inline-flex items-center text-purple-300 hover:text-white transition-colors mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Home
      </Link>
      <div className="max-w-xs sm:max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
          {/* 修改为水平布局 */}
          <div className="flex flex-row items-center">
            {/* 使用传统img标签 */}
            <div className="w-20 h-20 flex-shrink-0 mr-4">
              <img 
                src="/images/avatars/default-avatar.png" 
                alt="User Avatar" 
                className="rounded-full w-full h-full" 
              />
            </div>
            {/* 用户信息 - 右侧垂直布局 */}
            <div className="flex flex-col items-start text-left">
              {/* 用户名 */}
              <p className="text-lg font-semibold text-white leading-tight mb-1">{testUser.name}</p>
              
              {/* 生日信息 */}
              <p className="text-sm text-purple-200">{testUser.birthDate}</p>
              
              {/* 订阅状态标签 */}
              {testUser.isPremium && (
                <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-700 text-white">PREMIUM</span>
              )}
            </div>
          </div>
        </div>

        {/* Reports */}
        <section className="text-white space-y-4">
          {/* Section Title */}
          <h2 className="text-sm font-semibold">Reports</h2>

          {/* Annual Basic Report */}
          <Link href="/report/annual-basic-2025" className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-start no-underline">
            <div className="leading-tight">
              <p className="text-sm font-medium">Annual Basic Report</p>
              <p className="text-[11px] text-purple-200">2025</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-white/10 text-purple-200 border border-purple-400/50 self-center">FREE</span>
          </Link>

          {/* Annual Premium Report */}
          <Link href="/energy-report" className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-center no-underline">
            <p className="text-sm font-medium">Annual Premium Report 2025</p>
          </Link>

          {/* Monthly Deep Reports */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-purple-200 mb-1">MONTHLY DEEP REPORTS</h3>
            <Link href="/report/2025-05" className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline">
              <span className="text-xs">May 2025 Energy Report</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>
            </Link>
            <Link href="/report/2025-04" className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline">
              <span className="text-xs">Apr 2025 Energy Report</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
} 