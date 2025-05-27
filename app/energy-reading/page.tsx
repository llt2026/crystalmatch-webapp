'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

export default function EnergyReading() {
  const router = useRouter();

  useEffect(() => {
    // 直接重定向到新的报告页面
    router.push('/energy-report');
  }, [router]);

  // 重定向前显示加载中
  return <LoadingScreen />;
} 