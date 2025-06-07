/**
 * April 2025 Monthly Deep Report Page (Plus Subscription)
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { useEffect, useState } from 'react';
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
  HourlyEnergyPeaks
} from '../../../components/reports/EnergyComponents';

export default function AprilReportPage() {
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
    
    // 检查用户是否有Plus订阅
    if (status === 'authenticated') {
      const hasPlus = hasRequiredSubscription(session, 'plus');
      if (!hasPlus) {
        router.push('/pricing');
        return;
      }
      
      // 加载报告数据
      const fetchReportData = async () => {
        try {
          // 获取URL中的出生日期参数
          const birthDate = searchParams?.get('birthDate') || '';
          
          // 获取报告数据
          const data = await fetchMonthlyReportData('apr-2025', birthDate);
          
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
      title="April 2025 Monthly Energy Report"
      subtitle="Your personalized Plus energy forecast"
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
          date="2025-04-15" 
        />
      </section>
    </ReportContainer>
  );
} 