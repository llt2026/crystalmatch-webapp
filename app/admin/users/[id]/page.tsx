'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: {
    status: 'free' | 'premium';
    expiresAt?: string;
    history: {
      planId: string;
      startDate: string;
      endDate: string;
      amount: number;
    }[];
  };
  reports: {
    id: string;
    date: string;
    title: string;
    summary: string;
  }[];
}

export default function UserDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('获取用户详情失败');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError('获取用户数据失败');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [router, params.id]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
        <div className="text-center">
          <p className="text-red-300 mb-4">{error || '用户不存在'}</p>
          <Link 
            href="/admin/dashboard"
            className="text-purple-300 hover:text-purple-200 transition-colors"
          >
            返回仪表板
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213E] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 导航栏 */}
        <div className="mb-8">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center text-purple-300 hover:text-purple-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            返回用户列表
          </Link>
        </div>

        {/* 用户基本信息 */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-purple-200">{user.email}</p>
              <p className="text-purple-300 text-sm mt-2">
                注册时间: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.subscription.status === 'premium' 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-gray-500/20 text-gray-300'
              }`}>
                {user.subscription.status === 'premium' ? '高级会员' : '免费用户'}
              </div>
              {user.subscription.status === 'premium' && user.subscription.expiresAt && (
                <p className="text-sm text-purple-300 mt-2">
                  到期时间: {new Date(user.subscription.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 订阅历史 */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-bold text-white mb-6">订阅历史</h2>
          {user.subscription.history.length === 0 ? (
            <p className="text-purple-200">暂无订阅记录</p>
          ) : (
            <div className="space-y-4">
              {user.subscription.history.map((record, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {record.planId === 'premium' ? '月度会员' : '年度会员'}
                    </p>
                    <p className="text-sm text-purple-300">
                      {new Date(record.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(record.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <p className="text-purple-300">¥{record.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 报告历史 */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6">报告历史</h2>
          {user.reports.length === 0 ? (
            <p className="text-purple-200">暂无报告记录</p>
          ) : (
            <div className="space-y-4">
              {user.reports.map((report) => (
                <div 
                  key={report.id}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/reports/${report.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white">{report.title}</h3>
                    <span className="text-sm text-purple-300">
                      {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-purple-200 text-sm">{report.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 