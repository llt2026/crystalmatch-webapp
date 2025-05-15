export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscription: {
    status: 'free' | 'premium';
    expiresAt?: string;
  };
  reportsCount: number;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  subscribedUsers: number;
  conversionRate: string;
  revenue: number;
  userGrowth: {
    labels: string[];
    data: number[];
  };
  revenueGrowth: {
    labels: string[];
    data: number[];
  };
  userTypes: {
    labels: string[];
    data: number[];
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 翻译函数的简单实现
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'errors.networkError': '网络错误',
      'admin.dashboard': '管理员仪表盘',
      'admin.totalUsers': '总用户数',
      'admin.activeUsers': '活跃用户',
      'admin.onlineUsers': '在线用户',
      'admin.subscribedUsers': '订阅用户',
      'admin.conversionRate': '转化率',
      'admin.revenue': '收入',
      'admin.userTypes': '用户类型',
      'admin.userGrowth': '用户增长',
      'admin.revenueGrowth': '收入增长',
      'admin.users': '用户管理',
      'admin.logout': '退出登录'
    };
    return translations[key] || key;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/stats');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/admin/login');
            return;
          }
          throw new Error('获取统计数据失败');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(t('errors.networkError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // 每60秒刷新一次数据
    const intervalId = setInterval(fetchStats, 60000);
    
    return () => clearInterval(intervalId);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a2e] to-[#16213E] p-4">
        <div className="text-red-400 text-center">
          <p className="text-lg sm:text-xl mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const userGrowthData = {
    labels: stats.userGrowth.labels,
    datasets: [
      {
        label: t('admin.userGrowth'),
        data: stats.userGrowth.data,
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const revenueGrowthData = {
    labels: stats.revenueGrowth.labels,
    datasets: [
      {
        label: t('admin.revenueGrowth'),
        data: stats.revenueGrowth.data,
        backgroundColor: '#8B5CF6',
      },
    ],
  };

  const userTypesData = {
    labels: stats.userTypes.labels,
    datasets: [
      {
        data: stats.userTypes.data,
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
      {/* 管理后台导航栏 */}
      <nav className="bg-black/30 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/crystal-logo.svg" 
              alt="Crystal Logo" 
              width={30} 
              height={30}
              className="animate-pulse"
            />
            <span className="ml-2 text-xl font-medium bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              管理后台
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/admin/dashboard" 
              className={`text-purple-200 hover:text-white transition-colors ${pathname === '/admin/dashboard' ? 'text-white border-b-2 border-purple-500' : ''}`}
            >
              {t('admin.dashboard')}
            </Link>
            <Link 
              href="/admin/users" 
              className="text-purple-200 hover:text-white transition-colors"
            >
              {t('admin.users')}
            </Link>
            <button 
              onClick={() => router.push('/admin/login')}
              className="text-purple-200 hover:text-white transition-colors"
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            {t('admin.dashboard')}
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.totalUsers')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.activeUsers')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.onlineUsers')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.onlineUsers.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.subscribedUsers')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.subscribedUsers.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.conversionRate')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.conversionRate}</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('admin.revenue')}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white">
                ${stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* User Growth Chart */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('admin.userGrowth')}
              </h3>
              <div className="aspect-[16/9] w-full">
                <Line
                  data={userGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Revenue Growth Chart */}
            <div className="glass-card p-4 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('admin.revenueGrowth')}
              </h3>
              <div className="aspect-[16/9] w-full">
                <Bar
                  data={revenueGrowthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* User Types Chart */}
            <div className="glass-card p-4 rounded-xl lg:col-span-2">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('admin.userTypes')}
              </h3>
              <div className="max-w-md mx-auto">
                <Doughnut
                  data={userTypesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 