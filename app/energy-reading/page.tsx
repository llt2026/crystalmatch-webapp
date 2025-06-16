'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

export default function EnergyReading() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到个人资料页面，让用户从那里访问带有正确生日参数的年度报告
    router.push('/profile');
  }, [router]);

  // 重定向前显示加载中
  return <LoadingScreen />;
} 