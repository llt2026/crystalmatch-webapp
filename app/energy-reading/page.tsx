'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

export default function EnergyReading() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到正确的年度报告页面
    router.push('/report/annual-premium');
  }, [router]);

  // 重定向前显示加载中
  return <LoadingScreen />;
} 