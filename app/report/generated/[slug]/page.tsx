'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
        if (!token) {
          setError('Please sign in to view your reports');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/report/generated/${params.slug}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
  const reportDate = new Date(generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-6 sm:p-8">
        <Link href="/profile" className="inline-flex items-center text-purple-300 hover:text-white transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Profile
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Report Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold">CrystalMatch Monthly Energy Report</h1>
              <div className="ml-3">
                {tier === 'pro' && (
                  <span className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-700 to-indigo-700 text-white">PRO</span>
                )}
                {tier === 'plus' && (
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-600 text-white">PLUS</span>
                )}
              </div>
            </div>
            <p className="text-purple-200 text-lg">{reportDate}</p>
            <div className="mt-2 flex items-center justify-center text-sm text-purple-300">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Generated Report (Cached)
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-8">
            {/* 渲染报告内容 - 这里可以复用现有的报告组件 */}
            {report && (
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Your Energy Profile</h2>
                
                {/* 基础信息 */}
                {report.basicInfo && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="font-medium text-purple-300">Birth Date</h4>
                        <p className="text-white">{report.basicInfo.birthDate}</p>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4">
                        <h4 className="font-medium text-purple-300">Energy Signature</h4>
                        <p className="text-white">{report.basicInfo.energySignature}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 主要内容区域 */}
                {report.sections && report.sections.map((section: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg font-medium mb-3">{section.title}</h3>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-white whitespace-pre-line">{section.content}</p>
                    </div>
                  </div>
                ))}

                {/* 水晶推荐 */}
                {report.crystals && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Crystal Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {report.crystals.map((crystal: any, index: number) => (
                        <div key={index} className="bg-black/20 rounded-lg p-4">
                          <h4 className="font-medium text-purple-300 mb-2">{crystal.name}</h4>
                          <p className="text-sm text-white">{crystal.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pb-8">
            <p className="text-purple-300 text-sm">
              This report was generated on {reportDate} and is personalized for your energy profile.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
