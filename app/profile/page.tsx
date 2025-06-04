'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../utils/useTranslation';

interface UserProfile {
  id?: string;  // 添加id字段，使其可选
  name: string;
  email: string;
  avatar?: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  subscription: {
    status: 'free' | 'premium';
    expiresAt?: string;
  };
  reportsCount: number;
  joinedAt: string;
  birthInfo?: {
    date: string; // ISO date string
  };
}

interface BasicReport {
  title: string;
  year: number;
  type: 'basic' | 'premium';
  statusLabel?: string; // 如 FREE
}

interface MonthlyReport {
  monthLabel: string; // e.g. 'May 2025 Energy Report'
  isNew?: boolean;
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 尝试从多个位置获取token
        let token = null;
        if (typeof window !== 'undefined') {
          // 依次尝试从localStorage不同键名获取
          const possibleKeys = ['authToken', 'token', 'jwt', 'crystalMatchToken'];
          for (const key of possibleKeys) {
            const savedToken = localStorage.getItem(key);
            if (savedToken) {
              console.log(`从localStorage[${key}]获取到token: ${savedToken}`);
              token = savedToken;
              break;
            }
          }
        }

        // 设置请求头
        const headers: Record<string,string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        console.log('使用headers:', headers);
        
        // 尝试获取用户信息
        const response = await fetch('/api/user/profile', { 
          method: 'GET',
          headers,
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('成功获取API用户数据:', data);
        
        if (!data || !data.name) {
          throw new Error('API返回的用户数据无效');
        }
        
        setProfile(data);
      } catch (err) {
        console.error('获取用户数据失败:', err);
        
        // 使用默认数据
        console.warn('使用默认测试用户数据');
        const testProfile: UserProfile = {
          id: 'test-user',
          name: "Test User", // 使用与图片一致的测试用户名
          email: "user@example.com",
          location: {
            country: "USA",
            state: "California",
            city: "Los Angeles"
          },
          subscription: {
            status: 'premium'
          },
          reportsCount: 2,
          joinedAt: new Date().toISOString(),
          birthInfo: {
            date: "1990-01-01T00:00:00.000Z" // 默认出生日期
          }
        };
        setProfile(testProfile);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black p-4">
        <div className="text-red-400 text-center">
          <p className="text-lg sm:text-xl mb-4">{error || t('errors.networkError')}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg text-sm sm:text-base hover:bg-purple-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

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
            {/* Avatar - 始终使用默认头像 */}
            <div className="relative w-20 h-20 flex-shrink-0 mr-4">
              {/* 强制使用本地默认头像 */}
              <Image 
                src="/images/avatars/default-avatar.png" 
                alt="User Avatar" 
                width={80}
                height={80}
                className="rounded-full" 
                priority
              />
            </div>
            {/* 用户信息 - 右侧垂直布局 */}
            <div className="flex flex-col items-start text-left">
              {/* 用户名 */}
              <p className="text-lg font-semibold text-white leading-tight mb-1">{profile.name}</p>
              
              {/* 生日信息 - 使用美国格式 MM/DD/YYYY */}
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
              {profile.subscription.status === 'premium' && (
                <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-700 text-white">PREMIUM</span>
              )}
            </div>
          </div>
        </div>

        {/* UPGRADE Button */}
        {profile.subscription.status === 'free' && (
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
          <Link href={`/report/annual-basic-${new Date().getFullYear()}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-start no-underline">
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
            <h3 className="text-xs font-semibold tracking-wide uppercase text-purple-200 mb-1">Monthly Deep Reports</h3>
            {[
              { label: 'May 2025 Energy Report', isNew: true },
              { label: 'Apr 2025 Energy Report', isNew: false },
            ].map((r) => (
              <Link key={r.label} href={`/report/${r.label.startsWith('May') ? `${new Date().getFullYear()}-05` : `${new Date().getFullYear()}-04`}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline">
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