/**
 * May 2025 Monthly Deep Report Page (Plus & Pro Subscription)
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { fetchMonthlyReportData } from '../../../services/reportService';
import {
  ReportContainer,
  ReportLoading,
  DailyEnergyTable,
  PushNotifications,
  HourlyEnergyPeaks,
  MonthlyEnergyChart
} from '../../../components/reports/EnergyComponents';

// 提取使用useSearchParams的部分到单独的组件
function ReportContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 检查用户是否已登录
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // 检查用户是否有Plus或Pro订阅 (临时禁用，确保所有用户都能看到)
    if (status === 'authenticated') {
      const hasAccess = true; // 临时禁用订阅检查
      if (!hasAccess) {
        router.push('/pricing');
        return;
      }
      
      // 加载报告数据
      const fetchReportData = async () => {
        try {
          // 获取URL中的出生日期参数
          const birthDate = searchParams?.get('birthDate') || '';
          console.log("获取5月报告数据, 出生日期:", birthDate);
          
          // 获取报告数据
          const data = await fetchMonthlyReportData('may-2025', birthDate);
          console.log("5月报告数据获取成功:", data);
          
          if (!data || !data.dailyEnergy) {
            setError('报告数据无效，请稍后再试');
            setLoading(false);
            return;
          }
          
          setReportData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error loading May report data:', error);
          setError('无法加载5月报告数据，请刷新页面重试');
          setLoading(false);
        }
      };
      
      fetchReportData();
    }
  }, [status, session, router, searchParams]);

  if (loading) {
    return <ReportLoading />;
  }
  
  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-black/40 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-4">加载报告失败</h2>
          <p className="text-white mb-6">{error || '无法获取5月报告数据'}</p>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              重试
            </button>
            <Link 
              href="/profile" 
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              返回个人资料
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReportContainer 
      title="May 2025 Monthly Energy Report"
      subtitle="Your latest personalized energy forecast"
      isNew={true}
    >
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Profile
        </Link>
      </div>
      
      {/* 新的月度图表 */}
      <section className="bg-gradient-to-r from-purple-900/40 to-black/40 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-purple-500/20 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white">Monthly Energy Overview</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>
        </div>
        <MonthlyEnergyChart 
          data={reportData.monthlyOverview} 
          month="May"
        />
      </section>
      
      {/* 日能量表格 */}
      <section className="bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-white">Daily Energy Calendar</h2>
        <DailyEnergyTable 
          data={reportData.dailyEnergy} 
          month={reportData.month} 
        />
      </section>
      
      {/* 推送通知 */}
      <section className="bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-white">Push Notifications</h2>
        <PushNotifications 
          data={reportData.notifications} 
        />
      </section>
      
      {/* 小时能量高峰 */}
      <section className="bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-white">Hourly Energy Peaks</h2>
        <HourlyEnergyPeaks 
          data={reportData.hourlyEnergy}
          date="2025-05-15" 
        />
      </section>
    </ReportContainer>
  );
}

// 主页面组件，使用Suspense包装ReportContent
export default function MayReportPage() {
  return (
    <Suspense fallback={<ReportLoading />}>
      <ReportContent />
    </Suspense>
  );
} 