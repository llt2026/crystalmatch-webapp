export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';

interface FiveElements {
  metal: number;
  wood: number;
  water: number;
  fire: number;
  earth: number;
}

interface ElementInfo {
  character: string;
  element: string;
}

interface BaziData {
  testDate: string;
  pillars: {
    year: string;
    month: string;
    day: string;
  };
  zodiac: string;
  fiveElements: FiveElements;
  primaryElement: string;
  missingElements: string[];
  allCharacters: string;
  individualFiveElements: ElementInfo[];
}

export default function TestBaziPage() {
  const [baziData, setBaziData] = useState<BaziData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/test-bazi');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bazi data');
        }
        
        const data = await response.json();
        setBaziData(data);
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
        <h1 className="text-3xl font-bold text-white mb-8 text-center">八字分析</h1>
        
        <div className="glass-card p-6 rounded-2xl mb-8">
          <h2 className="text-xl font-medium text-white mb-4">测试日期: {baziData?.testDate}</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-purple-300 mb-2">干支信息:</h3>
            <div className="bg-white/5 p-4 rounded-lg mb-4">
              <p className="text-white mb-1">年柱: <span className="text-purple-300">{baziData?.pillars.year}</span></p>
              <p className="text-white mb-1">月柱: <span className="text-purple-300">{baziData?.pillars.month}</span></p>
              <p className="text-white mb-1">日柱: <span className="text-purple-300">{baziData?.pillars.day}</span></p>
              <p className="text-white">生肖: <span className="text-purple-300">{baziData?.zodiac}</span></p>
            </div>
            
            <h3 className="text-lg font-medium text-purple-300 mb-2">五行分析:</h3>
            <div className="bg-white/5 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {baziData && Object.entries(baziData.fiveElements).map(([element, count]) => (
                  <div key={element} className="text-center">
                    <div className="text-white capitalize">{element}</div>
                    <div className={`text-xl font-bold ${count > 0 ? 'text-purple-300' : 'text-gray-500'}`}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-white mb-1">主导五行: <span className="text-purple-300 capitalize">{baziData?.primaryElement}</span></p>
              <p className="text-white">
                缺失五行: 
                {baziData?.missingElements.length ? (
                  <span className="text-purple-300 capitalize">{baziData.missingElements.join(', ')}</span>
                ) : (
                  <span className="text-green-300">无</span>
                )}
              </p>
            </div>
            
            <h3 className="text-lg font-medium text-purple-300 mb-2">字符分析:</h3>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-white mb-2">完整八字: <span className="text-purple-300">{baziData?.allCharacters}</span></p>
              
              <div className="grid grid-cols-6 gap-2">
                {baziData?.individualFiveElements.map((item, index) => (
                  <div key={index} className="text-center p-2 border border-purple-500/30 rounded-lg">
                    <div className="text-lg text-white">{item.character}</div>
                    <div className="text-xs text-purple-300 capitalize">{item.element}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-purple-400 text-sm">
          <p>此页面用于测试八字计算功能</p>
        </div>
      </div>
    </div>
  );
} 