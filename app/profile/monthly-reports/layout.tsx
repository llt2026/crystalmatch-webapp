'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 强制设置动态渲染
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function MonthlyReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    // 确保URL不含尾部斜杠
    if (pathname.endsWith('/') && pathname !== '/profile/monthly-reports/') {
      router.replace(pathname.slice(0, -1));
    }
  }, [pathname, router]);
  
  return (
    <div className="monthly-reports-layout">
      {children}
    </div>
  );
} 