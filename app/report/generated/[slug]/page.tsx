'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import MonthlyReportTemplate from '@/app/components/MonthlyReportTemplate';

interface ReportData {
  report: any;
  energyContext: any;
  tier: string;
  generatedAt: string;
  fromCache: boolean;
}

export default function GeneratedReportPage() {
  const params = useParams();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/report/generated/${params.slug}`, {
          headers,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.status}`);
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError('Failed to load report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchReport();
    }
  }, [params.slug]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </main>
    );
  }

  if (error || !reportData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center p-4">
        <div className="bg-black/40 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl text-red-400 mb-4">Unable to load report</h2>
          <p className="text-white mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Profile
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { report, tier, generatedAt } = reportData;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white px-4 py-6 sm:p-8">
      <Link href="/profile" className="inline-flex items-center text-purple-300 hover:text-white transition-colors mb-6">
        ← Back to Profile
      </Link>

      <MonthlyReportTemplate
        report={report}
        tier={tier as 'plus' | 'pro'}
        generatedAt={generatedAt}
      />
    </main>
  );
}
