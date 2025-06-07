'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 用户配置文件接口
interface UserProfile {
  id?: string;
  name: string;
  email: string;
  birthDate?: string;
  subscription?: {
    status: 'free' | 'plus' | 'pro';
  };
  birthInfo?: {
    date: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取用户真实数据
  useEffect(() => {
    async function fetchRealUserData() {
      try {
        setIsLoading(true);
        // 直接使用浏览器自动附带的cookie，避免在前端暴露token
        const headers: Record<string, string> = {};
        
        // 从API获取用户数据 - 添加随机数防止缓存
        const cacheBuster = new Date().getTime();
        const response = await fetch(`/api/user/profile?_=${cacheBuster}`, {
          method: 'GET',
          headers,
          cache: 'no-store',
          credentials: 'include', // 确保携带cookie
        });
        
        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log('获取到用户数据:', userData);
        
        // 确保有必要的数据
        if (!userData || !userData.name) {
          throw new Error('API返回的数据无效');
        }
        
        setProfile(userData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        if ((err as any).message?.includes('401')) {
          setError('Unauthorized. Please sign in to view your profile.');
        } else {
          setError('Unable to fetch user info. Please try again or contact support.');
        }
        
        // 保持加载状态为false，但不设置profile，这样会显示错误信息
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRealUserData();
  }, []);
  
  // 加载状态
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </main>
    );
  }
  
  // 错误状态
  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/40 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl text-red-400 mb-4">Unable to load user data</h2>
          <p className="text-white mb-6">{error || 'Please check your network connection and retry'}</p>
          {error?.includes('Unauthorized') ? (
            <button
              onClick={() => router.push('/login')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Sign In
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          )}
        </div>
      </main>
    );
  }

  // 用户页面主体
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
            {/* 默认头像 */}
            <div className="w-20 h-20 flex-shrink-0 mr-4 relative overflow-hidden rounded-full">
              <img 
                src="/default-avatar.png"
                alt={`${profile.name}'s avatar`}
                className="w-full h-full object-cover"
              />
              
              {/* 会员等级标识 - 右上角 */}
              <div className="absolute top-0 right-0">
                {profile.subscription?.status === 'pro' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-purple-700 to-indigo-700 text-white">PRO</span>
                ) : profile.subscription?.status === 'plus' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-600 text-white">PLUS</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white border border-white/30">FREE</span>
                )}
              </div>
            </div>
            
            {/* 用户信息 */}
            <div className="flex flex-col items-start text-left">
              {/* 用户名 - 显示真实用户名 */}
              <p className="text-lg font-semibold text-white leading-tight mb-1">{profile.name}</p>
              
              {/* 生日信息 - 从真实数据中获取并格式化为美区格式 (MM/DD/YYYY) */}
              {(profile.birthDate || profile.birthInfo?.date || (profile as any).birthInfo?.birthdate) && (
                <p className="text-sm text-purple-200">
                  {new Date(profile.birthDate || profile.birthInfo?.date || (profile as any).birthInfo?.birthdate || '').toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              )}
              
              {/* 订阅状态标签 */}
              {profile.subscription?.status === 'pro' && (
                <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-700 text-white">PRO</span>
              )}
              {profile.subscription?.status === 'plus' && (
                <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] bg-purple-600 text-white">PLUS</span>
              )}
            </div>
          </div>
        </div>

        {/* UPGRADE Button - 只对免费用户显示 */}
        {(!profile.subscription || profile.subscription.status === 'free') && (
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            UPGRADE
          </button>
        )}
        
        {/* UPGRADE Button - 对Plus用户显示升级到Pro */}
        {(profile.subscription && profile.subscription.status === 'plus') && (
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            UPGRADE TO PRO
          </button>
        )}

        {/* Reports */}
        <section className="text-white space-y-4">
          {/* Section Title */}
          <h2 className="text-sm font-semibold">Reports</h2>

          {/* Annual Report - all users can access */}
          <Link 
            href={`/report/annual-premium${profile.birthDate ? `?birthDate=${encodeURIComponent(profile.birthDate)}` : profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} 
            className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-start no-underline"
          >
            <div className="leading-tight">
              <p className="text-sm font-medium">Annual Energy Report</p>
              <p className="text-[11px] text-purple-200">2025</p>
            </div>
            {(!profile.subscription || profile.subscription.status === 'free') && (
              <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-white/10 text-purple-200 border border-purple-400/50 self-center">FREE</span>
            )}
            {profile.subscription?.status === 'plus' && (
              <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-purple-600/50 text-white border border-purple-500 self-center">PLUS</span>
            )}
            {profile.subscription?.status === 'pro' && (
              <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-gradient-to-r from-purple-700 to-indigo-700 text-white self-center">PRO</span>
            )}
          </Link>

          {/* Monthly Deep Reports */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-purple-200 mb-1">MONTHLY DEEP REPORTS</h3>
            
            <div
              onClick={() => {
                const birthDateParam = profile.birthDate || profile.birthInfo?.date || '';
                const url = birthDateParam 
                  ? `/profile/monthly-reports/may-2025?birthDate=${encodeURIComponent(birthDateParam)}`
                  : '/profile/monthly-reports/may-2025';
                router.push(url);
              }}
              className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline cursor-pointer hover:bg-black/60 transition-colors"
            >
              <span className="text-xs">May 2025 Energy Report</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>
            </div>
            
            <div
              onClick={() => {
                const birthDateParam = profile.birthDate || profile.birthInfo?.date || '';
                const url = birthDateParam 
                  ? `/profile/monthly-reports/apr-2025?birthDate=${encodeURIComponent(birthDateParam)}`
                  : '/profile/monthly-reports/apr-2025';
                router.push(url);
              }}
              className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline cursor-pointer hover:bg-black/60 transition-colors"
            >
              <span className="text-xs">Apr 2025 Energy Report</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}