'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MonthlyReportTemplate from '@/app/components/MonthlyReportTemplate';
import type { AspectKey } from '@/app/components/AspectTabs';

interface LegacyReport {
  basicInfo?: any;
  sections?: Array<{ title: string; content: string }>;
  crystals?: Array<{ name: string; purpose: string }>;
  dailyEnergy?: Array<{ date: string; energyChange: number; trend: 'up' | 'down' | 'stable'; crystal?: string }>;
  energyScore?: number;
  strongestElement?: string;
  weakestElement?: string;
}

interface ApiData {
  report: LegacyReport;
  energyContext: any;
  tier: 'free' | 'plus' | 'pro';
  generatedAt: string;
}

const Loader = () => (
  <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
  </main>
);

export default function GeneratedReportCompatPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/report/generated/${slug}`, { headers, credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        console.error(e);
        setError('Failed to load report.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <Loader />;
  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/40 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl text-red-400 mb-4">Unable to load report</h2>
          <p className="text-white mb-6">{error}</p>
          <div className="space-x-4">
            <button onClick={() => router.push('/profile')} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Back to Profile
            </button>
            <button onClick={() => window.location.reload()} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { report, energyContext, tier, generatedAt } = data;

  // Transform legacy sections → Record<AspectKey,string>
  const sections: Record<AspectKey, string> = { finance: '', relationship: '', mood: '', health: '', growth: '' };
  if (report.sections?.length) {
    report.sections.forEach((s) => {
      const map: Record<string, AspectKey> = {
        '💰 Money Flow': 'finance',
        '👥 Social Vibes': 'relationship',
        '🌙 Mood Balance': 'mood',
        '🔥 Body Fuel': 'health',
        '🚀 Growth Track': 'growth'
      };
      const key = map[s.title.trim()] as AspectKey | undefined;
      if (key) sections[key] = s.content;
    });
  }

  // Overview data
  const overview = {
    title: report.sections?.[0]?.title || '',
    energyScore: report.energyScore || energyContext?.energyScore || 0,
    strongestElement: (report.strongestElement || energyContext?.dominantElement || '').toLowerCase(),
    weakestElement: (report.weakestElement || energyContext?.missingElement || '').toLowerCase(),
    periodStart: energyContext?.currentMonth?.start,
    periodEnd: energyContext?.currentMonth?.end
  } as any;

  // Daily energy
  const daily = report.dailyEnergy || [];

  // Hourly – 若无则空数组
  const hourly = energyContext?.hourly || [];

  // Crystals
  const crystals = (report.crystals || []).map((c) => ({ name: c.name, benefit: c.purpose }));

  return (
    <Suspense fallback={<Loader />}>
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white px-4 py-6 sm:p-8">
        <Link href="/profile" className="inline-flex items-center text-purple-300 hover:text-white transition-colors mb-6">
          ← Back to Profile
        </Link>

        <MonthlyReportTemplate
          overview={overview}
          sections={sections}
          daily={daily}
          hourly={hourly}
          crystals={crystals}
          tier={(tier === 'pro' ? 'pro' : 'plus') as 'plus' | 'pro'}
        />
      </main>
    </Suspense>
  );
}
