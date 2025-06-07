/**
 * May 2025 Monthly Deep Report Page (Pro Subscription)
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getReportConfig } from '../../../lib/monthlyReportConfig';
import { hasRequiredSubscription } from '../../../lib/subscriptionUtils';
import { fetchMonthlyReportData } from '../../../services/reportService';
import {
  ReportContainer,
  ReportLoading,
  DailyEnergyTable,
  PushNotifications,
  HourlyEnergyPeaks,
  WeeklyForecast,
  MonthlyOverview
} from '../../../components/reports/EnergyComponents';

// 提取使用useSearchParams的部分到单独的组件
function ReportContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  
  useEffect(() => {
    // 检查用户是否已登录
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // 检查用户是否有Pro订阅
    if (status === 'authenticated') {
      const hasPro = hasRequiredSubscription(session, 'pro');
      if (!hasPro) {
        router.push('/pricing');
        return;
      }
      
      // 加载报告数据
      const fetchReportData = async () => {
        try {
          // 获取URL中的出生日期参数
          const birthDate = searchParams?.get('birthDate') || '';
          
          // 获取报告数据
          const data = await fetchMonthlyReportData('may-2025', birthDate);
          
          setReportData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error loading report data:', error);
          setLoading(false);
        }
      };
      
      fetchReportData();
    }
  }, [status, session, router, searchParams]);

  if (loading) {
    return <ReportLoading />;
  }

  return (
    <ReportContainer 
      title="May 2025 Monthly Energy Report"
      subtitle="Your personalized Pro energy forecast"
    >
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
      
      {/* 周预测 */}
      <section className="bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-white">Weekly Forecast</h2>
        <WeeklyForecast 
          data={reportData.weeklyForecast} 
        />
      </section>
      
      {/* 月概览 */}
      <section className="bg-black/30 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-white">Monthly Overview</h2>
        <MonthlyOverview 
          overview={reportData.monthlyOverview.overview} 
          phases={reportData.monthlyOverview.phases} 
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