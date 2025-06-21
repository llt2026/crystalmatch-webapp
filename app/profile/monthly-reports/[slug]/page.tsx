'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import MonthlyReportTemplate from '@/app/components/MonthlyReportTemplate';
import type { AspectKey } from '@/app/components/AspectTabs';

interface ApiResponse {
  overview: any;
  daily: Array<{ date: string; energyChange: number; trend: 'up' | 'down' | 'stable'; crystal?: string; score?: number }>;
  hourly: Array<{ hour: number; score?: number; energyChange?: number }>;
  report: string; // markdown with 5 sections
  crystals?: Array<{ name: string; benefit: string }>;
}

const SECTION_HEADERS: Record<AspectKey, string> = {
  finance: '## 💰 Money Flow',
  relationship: '## 👥 Social Vibes',
  mood: '## 🌙 Mood Balance',
  health: '## 🔥 Body Fuel',
  growth: '## 🚀 Growth Track'
};

const LoadingPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black text-white">
    Loading…
  </div>
);

export default function MonthlyReportPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [tier, setTier] = useState<'plus' | 'pro'>('plus');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const birthDate = searchParams.get('birthDate') || '';
        if (!birthDate) {
          setError('Birth date is required');
          return;
        }

        console.log('🔄 Fetching report data for:', params.slug, 'birthDate:', birthDate);
        
        const query = `?birthDate=${encodeURIComponent(birthDate)}`;
        const res = await fetch(`/api/report/${params.slug}${query}`, { cache: 'no-store' });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `API returned ${res.status}`);
        }
        const d: ApiResponse = await res.json();

        console.log('📊 API returned data:', {
          overview: d.overview,
          dailyCount: d.daily?.length,
          hourlyCount: d.hourly?.length,
          hasReport: !!d.report
        });

        // 强制计算真实数据，确保所有数据都是真实的
        try {
          const { getBaseBaziVector, calculateDayEnergy } = await import('@/app/lib/energyCalculation2025');
          const { calculateProReportEnergy } = await import('@/app/lib/proReportCalculation');

          const baseBazi = getBaseBaziVector(birthDate);
          console.log('🧮 Base Bazi calculated:', baseBazi);

          // 强制重新计算 overview 数据
          const startDate = d.overview?.periodStart ? new Date(d.overview.periodStart) : new Date();
          const energyResult = calculateProReportEnergy(startDate, baseBazi);
          
          d.overview = {
            ...d.overview,
            energyScore: energyResult.score,
            strongestElement: energyResult.dominantElement.toLowerCase(),
            weakestElement: energyResult.weakestElement.toLowerCase(),
            title: `${energyResult.energyMode} ${energyResult.energyEmoji}`,
            periodStart: startDate.toISOString().split('T')[0],
            periodEnd: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).toISOString().split('T')[0]
          };

          console.log('✅ Overview recalculated:', d.overview);

          // 强制重新计算 daily 数据
          const monthStart = new Date(startDate);
          const monthDays = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
          const { getDailyEnergyForRange } = await import('@/app/lib/energyCalculation2025');
          const rawDaily = await getDailyEnergyForRange(birthDate, monthStart, monthDays);
          
          d.daily = rawDaily.map((it: any) => ({
            date: it.date.toISOString(),
            energyChange: it.energyChange,
            trend: it.trend,
            crystal: it.crystal,
            element: it.element,
            score: it.score
          }));

          console.log('✅ Daily data recalculated:', d.daily.length, 'days');

          // 强制重新计算 hourly 数据
          const { getHourlyEnergyHeatmap } = await import('@/app/lib/energyCalculation2025');
          d.hourly = await getHourlyEnergyHeatmap(birthDate, monthStart);

          console.log('✅ Hourly data recalculated:', d.hourly.length, 'hours');

        } catch (calcErr) {
          console.error('❌ Energy calculation error:', calcErr);
          setError('Failed to calculate energy data');
          return;
        }

        setData(d);
        console.log('🎯 Final data being passed to component:', {
          overview: d.overview,
          dailyCount: d.daily?.length,
          hourlyCount: d.hourly?.length,
          reportLength: d.report?.length
        });
      } catch (e: any) {
        console.error('❌ Report fetch error:', e);
        setError(e.message);
      }

      // fetch profile for tier
      try {
        const pRes = await fetch('/api/user/profile', { cache: 'no-store', credentials: 'include' });
        if (pRes.ok) {
          const profile = await pRes.json();
          const status = (profile.subscription?.status || 'plus') as 'plus' | 'pro';
          setTier(status);
        }
      } catch {}
    };
    fetchAll();
  }, [params.slug, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return <LoadingPage />;
  }

  // Split report markdown into sections
  const sections: Record<AspectKey, string> = {
    finance: '',
    relationship: '',
    mood: '',
    health: '',
    growth: ''
  } as Record<AspectKey, string>;

  const lines = data.report.split('\n');
  let current: AspectKey | null = null;
  lines.forEach((line) => {
    const headerKey = (Object.keys(SECTION_HEADERS) as AspectKey[]).find((k) => line.startsWith(SECTION_HEADERS[k]));
    if (headerKey) {
      current = headerKey;
      sections[current] = '';
    } else if (current) {
      sections[current] += `${line}\n`;
    }
  });

  return (
    <Suspense fallback={<LoadingPage />}>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <MonthlyReportTemplate
          overview={data.overview}
          sections={sections}
          daily={data.daily}
          hourly={data.hourly}
          crystals={data.crystals || []}
          tier={tier}
        />
      </main>
    </Suspense>
  );
} 