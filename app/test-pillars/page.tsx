'use client';

import { useState, useEffect } from 'react';

export default function TestPillarsPage() {
  const [pillarData, setPillarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/test-pillars');
        
        if (!response.ok) {
          throw new Error('Failed to fetch pillar data');
        }
        
        const data = await response.json();
        setPillarData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="p-4 bg-red-500/20 text-red-200 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">年柱月柱测试</h1>
        
        <div className="glass-card p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-medium text-white mb-4">测试日期: {pillarData?.testDate}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-purple-300 mb-2">年柱信息:</h3>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white mb-1">年份: <span className="text-purple-300">{pillarData?.yearPillar.year}</span></p>
              <p className="text-white mb-1">干支: <span className="text-purple-300">{pillarData?.yearPillar.pillar}</span></p>
              <p className="text-white">生肖: <span className="text-purple-300">{pillarData?.yearPillar.zodiac}</span></p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-purple-300 mb-2">月柱信息:</h3>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white mb-1">月份: <span className="text-purple-300">{pillarData?.monthPillar.month}</span></p>
              <p className="text-white mb-1">起始日期: <span className="text-purple-300">{pillarData?.monthPillar.start}</span></p>
              <p className="text-white mb-1">结束日期: <span className="text-purple-300">{pillarData?.monthPillar.end}</span></p>
              <p className="text-white mb-1">干支: <span className="text-purple-300">{pillarData?.monthPillar.pillar}</span></p>
              <p className="text-white mb-1">五行: <span className="text-purple-300">{pillarData?.monthPillar.element}</span></p>
              <p className="text-white">能量类型: <span className="text-purple-300">{pillarData?.monthPillar.energyType}</span></p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-purple-400 text-sm">
          <p>此页面用于测试年柱和月柱计算功能</p>
        </div>
      </div>
    </div>
  );
} 