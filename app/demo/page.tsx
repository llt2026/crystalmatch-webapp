import React from 'react';
import Link from 'next/link';
import EnergyCalendar from '@/app/components/EnergyCalendar';

export default function DemoPage() {
  // Mock user data for demo
  const birthDate = '1990-06-15';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2">能量日历演示 (2025新模型)</h1>
        <p className="text-gray-600">
          此页面演示了新的能量日历组件，显示12行，并且考虑了地支藏干的影响。
        </p>
      </div>
      
      {/* 能量日历演示 */}
      <div className="mb-12 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">能量日历 (12行)</h2>
          <span className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            2025 新模型
          </span>
        </div>
        
        <EnergyCalendar 
          birthDate={birthDate}
          onSelectMonth={(month) => console.log(`Selected month: ${month}`)}
        />
      </div>
      
      {/* Feature Comparison CTA */}
      <div className="text-center mb-12">
        <Link 
          href="/energy-report"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md text-md font-medium hover:bg-indigo-700"
        >
          查看完整能量报告
        </Link>
      </div>
    </div>
  );
} 