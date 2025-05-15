export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { getBaziFromLunarNumbers } from '../lib/getBaziFromLunar';

interface BaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  zodiac?: {
    year: string;
    month: string;
    day: string;
  };
  fiveElements?: {
    year: string[];
    month: string[];
    day: string[];
  };
}

interface TestCase {
  date: string;
  year: number;
  month: number;
  day: number;
  result: BaziResult | null;
}

export default function BaziTestPage() {
  const testCases: TestCase[] = [
    { date: '1984年10月8日', year: 1984, month: 10, day: 8, result: null },
    { date: '1986年5月29日', year: 1986, month: 5, day: 29, result: null },
    { date: '1990年8月15日', year: 1990, month: 8, day: 15, result: null },
    { date: '2000年1月1日', year: 2000, month: 1, day: 1, result: null },
  ];

  const [results, setResults] = useState<TestCase[]>(testCases);

  useEffect(() => {
    // 在客户端计算八字
    const calculatedResults = testCases.map(test => {
      const result = getBaziFromLunarNumbers(test.year, test.month, test.day);
      return { ...test, result };
    });
    setResults(calculatedResults);
  }, []);

  // 辅助函数：获取五行属性
  const getFiveElement = (char: string): string => {
    const fiveElementMap: Record<string, string> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
      '子': '水', '亥': '水',
      '寅': '木', '卯': '木',
      '巳': '火', '午': '火',
      '申': '金', '酉': '金',
      '丑': '土', '辰': '土', '未': '土', '戌': '土'
    };
    
    return fiveElementMap[char] || '未知';
  };

  // 获取柱子的五行属性
  const getPillarElements = (pillar: string): { tg: string, dz: string, tgElement: string, dzElement: string } => {
    if (pillar.length < 2) return { tg: '', dz: '', tgElement: '未知', dzElement: '未知' };
    const tg = pillar[0];
    const dz = pillar[1];
    return {
      tg,
      dz,
      tgElement: getFiveElement(tg),
      dzElement: getFiveElement(dz)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">八字计算测试</h1>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
        {results.map((test, index) => (
          <div key={index} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h2 className="text-xl font-medium mb-3">{test.date}</h2>
            
            {test.result ? (
              <div>
                <div className="mb-4 text-center">
                  <div className="text-lg font-bold">
                    {test.result.yearPillar}年 {test.result.monthPillar}月 {test.result.dayPillar}日
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* 年柱 */}
                  <div className="bg-indigo-900/40 p-3 rounded-lg text-center">
                    <div className="text-lg font-medium mb-1">年柱: {test.result.yearPillar}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">天干: {test.result.yearPillar[0]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.yearPillar[0])}</div>
                      </div>
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">地支: {test.result.yearPillar[1]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.yearPillar[1])}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 月柱 */}
                  <div className="bg-indigo-900/40 p-3 rounded-lg text-center">
                    <div className="text-lg font-medium mb-1">月柱: {test.result.monthPillar}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">天干: {test.result.monthPillar[0]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.monthPillar[0])}</div>
                      </div>
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">地支: {test.result.monthPillar[1]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.monthPillar[1])}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 日柱 */}
                  <div className="bg-indigo-900/40 p-3 rounded-lg text-center">
                    <div className="text-lg font-medium mb-1">日柱: {test.result.dayPillar}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">天干: {test.result.dayPillar[0]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.dayPillar[0])}</div>
                      </div>
                      <div className="bg-indigo-800/30 p-2 rounded">
                        <div className="text-sm">地支: {test.result.dayPillar[1]}</div>
                        <div className="text-xs text-indigo-300">{getFiveElement(test.result.dayPillar[1])}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 五行统计 */}
                <div className="mt-4 p-3 bg-indigo-800/20 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">五行分析</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {['木', '火', '土', '金', '水'].map((element) => {
                      // 计算每个五行的数量
                      const chars = [
                        test.result?.yearPillar[0] || '',
                        test.result?.yearPillar[1] || '',
                        test.result?.monthPillar[0] || '',
                        test.result?.monthPillar[1] || '',
                        test.result?.dayPillar[0] || '',
                        test.result?.dayPillar[1] || '',
                      ];
                      
                      const count = chars.filter(char => getFiveElement(char) === element).length;
                      
                      return (
                        <div key={element} className="text-center">
                          <div className={`text-sm font-bold ${count > 0 ? 'text-white' : 'text-gray-400'}`}>
                            {element}
                          </div>
                          <div className={`text-xs ${count > 0 ? 'text-indigo-300' : 'text-gray-500'}`}>
                            {count > 0 ? `${count}` : '缺'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent mx-auto"></div>
                <p className="mt-2 text-sm">计算中...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 