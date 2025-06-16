'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Report {
  id: string;
  date: string;
  title: string;
  summary: string;
}

interface UserProfile {
  name: string;
  email: string;
  subscription: {
    status: 'free' | 'premium';
    expiresAt?: string;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 获取用户资料
        const profileRes = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profileData = await profileRes.json();
        setProfile(profileData);

        // 获取报告列表
        const reportsRes = await fetch('/api/user/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">欢迎回来, {profile?.name}</h1>
              <p className="text-purple-200">{profile?.email}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                profile?.subscription.status === 'premium' 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-gray-500/20 text-gray-300'
              }`}>
                {profile?.subscription.status === 'premium' ? '高级会员' : '免费用户'}
              </div>
              {profile?.subscription.status === 'premium' && profile.subscription.expiresAt && (
                <p className="text-sm text-purple-300 mt-1">
                  到期时间: {new Date(profile.subscription.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link 
            href="/birth-info" 
            className="flex-1 p-4 glass-card rounded-xl text-center hover:border-purple-500/30 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-white">新能量报告</span>
          </Link>
          
          {profile?.subscription.status !== 'premium' && (
            <Link 
              href="/subscription" 
              className="flex-1 p-4 glass-card rounded-xl text-center hover:border-purple-500/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-white">升级会员</span>
            </Link>
          )}
        </div>

        {/* 报告列表 */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">您的能量报告</h2>
          {reports.length === 0 ? (
            <div className="glass-card p-8 rounded-xl text-center">
              <p className="text-purple-200">还没有能量报告，立即创建您的第一份报告！</p>
            </div>
          ) : (
            reports.map((report) => (
              <div 
                key={report.id} 
                className="glass-card p-6 rounded-xl hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => router.push('/profile')} // 重定向到个人资料页面
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-white">{report.title}</h3>
                  <span className="text-sm text-purple-300">
                    {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-purple-200 text-sm">{report.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 