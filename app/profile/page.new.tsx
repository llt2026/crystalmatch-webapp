'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 简化版用户配置文件
interface UserProfile {
  id?: string;
  name: string;
  birthDate?: string;
  subscription?: {
    status: 'free' | 'premium';
  };
  birthInfo?: {
    date: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // 直接使用硬编码的测试用户数据，确保界面正确显示
  const profile: UserProfile = {
    id: 'test-user-123',
    name: 'Test User',
    subscription: {
      status: 'premium'
    },
    birthInfo: {
      date: '1990-01-01T00:00:00.000Z'
    }
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
          {/* 水平布局 */}
          <div className="flex flex-row items-center">
            {/* 固定使用默认头像 */}
            <div className="w-20 h-20 flex-shrink-0 mr-4 relative">
              <img 
                src="/images/avatars/default-avatar.png" 
                alt="Default Avatar" 
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            {/* 用户信息 */}
            <div className="flex flex-col items-start text-left">
              {/* 用户名 */}
              <p className="text-lg font-semibold text-white leading-tight mb-1">{profile.name}</p>
              
              {/* 生日信息 - 美国格式 MM/DD/YYYY */}
              {profile.birthInfo?.date && (
                <p className="text-sm text-purple-200">
                  {new Date(profile.birthInfo.date).toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              )}
              
              {/* 订阅状态标签 */}
              {profile.subscription?.status === 'premium' && (
                <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-700 text-white">PREMIUM</span>
              )}
            </div>
          </div>
        </div>

        {/* UPGRADE Button */}
        {profile.subscription?.status === 'free' && (
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            UPGRADE
          </button>
        )}

        {/* Reports */}
        <section className="text-white space-y-4">
          {/* Section Title */}
          <h2 className="text-sm font-semibold">Reports</h2>

          {/* Annual Basic Report */}
          <Link href={`/report/annual-basic-2025${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-start no-underline">
            <div className="leading-tight">
              <p className="text-sm font-medium">Annual Basic Report</p>
              <p className="text-[11px] text-purple-200">2025</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-white/10 text-purple-200 border border-purple-400/50 self-center">FREE</span>
          </Link>

          {/* Annual Premium Report */}
          <Link href={`/energy-report${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-center no-underline">
            <p className="text-sm font-medium">Annual Premium Report 2025</p>
          </Link>

          {/* Monthly Deep Reports */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-purple-200 mb-1">MONTHLY DEEP REPORTS</h3>
            {[
              { label: 'May 2025 Energy Report', isNew: true },
              { label: 'Apr 2025 Energy Report', isNew: false },
            ].map((r) => (
              <Link key={r.label} href={`/report/${r.label.startsWith('May') ? `2025-05` : `2025-04`}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline">
                <span className="text-xs">{r.label}</span>
                {r.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 