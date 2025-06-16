"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

// 此页面已弃用，重定向到新的年度报告页面
export default function EnergyReportPage() {
  const router = useRouter();

  useEffect(() => {
    // 获取URL参数，如果有的话
    const urlParams = new URLSearchParams(window.location.search);
    const birthDateParam = urlParams.get('birthDate');
    
    // 重定向到新的年度报告页面，并保留birthDate参数
    const redirectUrl = birthDateParam 
      ? `/report/annual-premium?birthDate=${encodeURIComponent(birthDateParam)}`
      : '/report/annual-premium';
      
    router.replace(redirectUrl);
  }, [router]);

  // 重定向前显示加载中
  return <LoadingScreen />;
} 