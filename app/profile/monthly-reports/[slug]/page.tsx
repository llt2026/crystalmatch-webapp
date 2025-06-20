'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import MonthlyReportTemplate from '@/app/components/MonthlyReportTemplate';
import type { AspectKey } from '@/app/components/AspectTabs';

interface ApiResponse {
  overview: any;
  daily: Array<{ date: string; energyChange: number; trend: 'up' | 'down' | 'stable'; crystal?: string }>;
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
        const query = birthDate ? `?birthDate=${encodeURIComponent(birthDate)}` : '';
        const res = await fetch(`/api/report/${params.slug}${query}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load report');
        const d: ApiResponse = await res.json();

        // 计算缺失概要数据
        try {
          if (birthDate) {
            const { getBaseBaziVector, calculateDayEnergy } = await import('@/app/lib/energyCalculation2025');
            const { calculateProReportEnergy } = await import('@/app/lib/proReportCalculation');

            const baseBazi = getBaseBaziVector(birthDate);

            // 补全 overview
            if (!d.overview.energyScore || d.overview.energyScore === 0) {
              const startDate = d.overview.periodStart ? new Date(d.overview.periodStart) : new Date();
              const er = calculateProReportEnergy(startDate, baseBazi);
              d.overview.energyScore = er.score;
              d.overview.strongestElement = er.dominantElement.toLowerCase();
              d.overview.weakestElement = er.weakestElement.toLowerCase();
            }

            // 若 daily 为空或缺少分数，则重新计算整月数据
            if (!Array.isArray(d.daily) || d.daily.length === 0) {
              const monthStart = d.overview.periodStart ? new Date(d.overview.periodStart) : new Date();
              const monthDays = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
              const { getDailyEnergyForRange } = await import('@/app/lib/energyCalculation2025');
              const rawDaily = await getDailyEnergyForRange(birthDate, monthStart, monthDays);
              d.daily = rawDaily.map((it: any) => ({
                date: it.date.toISOString(),
                energyChange: it.energyChange,
                trend: it.trend,
                crystal: it.crystal,
                element: it.element,
                score: it.score ?? 0
              }));
            }

            // 填充 score 字段
            if (Array.isArray(d.daily)) {
              d.daily = d.daily.map((item: any) => {
                if (item.score === undefined) {
                  const scoreRes = calculateDayEnergy(baseBazi, new Date(item.date));
                  item.score = scoreRes.score;
                }
                return item;
              });
            }

            // 若 hourly 为空则计算首日 24 小时
            if (!Array.isArray(d.hourly) || d.hourly.length === 0) {
              const { getHourlyEnergyHeatmap } = await import('@/app/lib/energyCalculation2025');
              d.hourly = await getHourlyEnergyHeatmap(birthDate, d.overview.periodStart ? new Date(d.overview.periodStart) : new Date());
            }
          }
        } catch (calcErr) {
          console.error('Local energy calc error', calcErr);
        }

        setData(d);
      } catch (e: any) {
        console.error('report fetch', e);
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
        {error}
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