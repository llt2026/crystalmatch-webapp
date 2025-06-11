'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// 模拟用户订阅状态，实际应用中应从API或上下文获取
const MOCK_USER_TIER: 'free' | 'plus' | 'pro' = 'free';

// 月份数据
const months = [
  { id: '2025-01', name: 'January', energy: 'Stability Energy', score: 4, vibe: 'Calm & grounded' },
  { id: '2025-02', name: 'February', energy: 'Passion Energy', score: 5, vibe: 'Bold confidence' },
  { id: '2025-03', name: 'March', energy: 'Fluid Energy', score: 3, vibe: 'Unstable emotions' },
  { id: '2025-04', name: 'April', energy: 'Growth Energy', score: 2, vibe: 'Restless planning' },
  { id: '2025-05', name: 'May', energy: 'Passion Energy', score: 5, vibe: 'Strong momentum' },
  { id: '2025-06', name: 'June', energy: 'Stability Energy', score: 4, vibe: 'Mid-year focus' },
  { id: '2025-07', name: 'July', energy: 'Growth Energy', score: 3, vibe: 'Creative expansion' },
  { id: '2025-08', name: 'August', energy: 'Clarity Energy', score: 5, vibe: 'Mental sharpness' },
  { id: '2025-09', name: 'September', energy: 'Stability Energy', score: 4, vibe: 'Structured progress' },
  { id: '2025-10', name: 'October', energy: 'Fluid Energy', score: 2, vibe: 'Adaptability needed' },
  { id: '2025-11', name: 'November', energy: 'Clarity Energy', score: 3, vibe: 'Strategic planning' },
  { id: '2025-12', name: 'December', energy: 'Passion Energy', score: 4, vibe: 'Year-end momentum' },
];

// 获取水晶推荐
const getCrystalRecommendation = (fiveElements: any) => {
  // This should return crystal recommendations based on five elements data
  // Simplified implementation, should analyze the strength and weakness of five elements
  return {
    name: 'Citrine',
    description: 'Citrine enhances your personal power and confidence. It helps you stay focused when your energy is scattered—especially when Fire is weak in your chart.'
  };
};

// 能量评分表组件
function EnergyScoreTable({ currentMonth, userTier }: { currentMonth: string, userTier: string }) {
  const router = useRouter();
  
  // 处理月份行动按钮点击
  const handleActionClick = (monthId: string) => {
    // 检查用户是否有权限查看此月份
    const canView = userTier === 'pro' || 
                   (userTier === 'plus' && monthId === currentMonth);
    
    if (canView) {
      // 导航到月度报告页面
      router.push(`/energy-reading/report/month?m=${monthId}`);
    } else {
      // 显示订阅引导弹窗
      showSubscriptionModal();
    }
  };
  
  // 显示订阅引导弹窗
  const showSubscriptionModal = () => {
    // 在实际应用中实现弹窗逻辑
    alert('Subscribe to unlock full reports for all months!');
  };
  
  // 确定行动按钮文本和当前月份高亮
  const getActionButton = (monthId: string) => {
    if (userTier === 'pro') {
      return <button onClick={() => handleActionClick(monthId)} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">🔍 View</button>;
    } else if (userTier === 'plus' && monthId === currentMonth) {
      return <button onClick={() => handleActionClick(monthId)} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">🔍 View</button>;
    } else {
      return <button onClick={() => handleActionClick(monthId)} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">🔓 Unlock</button>;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy Type</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score (1-5)</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vibe Summary</th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {months.map((month) => (
            <tr 
              key={month.id} 
              className={`${month.id === currentMonth ? 'bg-yellow-50' : ''} hover:bg-gray-50`}
            >
              <td className="px-3 py-4 whitespace-nowrap">
                {month.name}
                {month.id === currentMonth && <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">📍 This Month</span>}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">{month.energy}</td>
              <td className="px-3 py-4 whitespace-nowrap">
                {Array(month.score).fill(0).map((_, i) => (
                  <span key={i} className="text-yellow-500">★</span>
                ))}
                {Array(5 - month.score).fill(0).map((_, i) => (
                  <span key={i} className="text-gray-300">★</span>
                ))}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {month.vibe} <span className="text-lg">🔮</span>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                {getActionButton(month.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EnergyReportPage() {
  const [userTier, setUserTier] = useState<'free' | 'plus' | 'pro'>(MOCK_USER_TIER);
  const [loading, setLoading] = useState(true);
  
  // 获取当前月份，格式为 YYYY-MM
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentMonthWithDay = months.find(m => m.id.substring(0, 7) === currentMonth.substring(0, 7))?.id || '2025-05';
  
  // 模拟从API加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 在实际应用中，这里应该是真正的API调用
      // const response = await fetch('/api/user/subscription');
      // const data = await response.json();
      // setUserTier(data.tier);
      
      setLoading(false);
    };
    
    loadUserData();
  }, []);
  
  // 获取用户的水晶推荐
  const crystalRecommendation = getCrystalRecommendation({
    // 模拟五行数据
    wood: 20,
    fire: 15, 
    earth: 30,
    metal: 25,
    water: 10
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse">Loading your energy report...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Report Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-emerald-800 mb-6">Your 2025 Energy Forecast</h1>
        
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-emerald-700 mb-2">✨ This personalized energy forecast combines:</h2>
          <ul className="text-gray-700 list-inside space-y-2">
            <li>- The Five Elements from your Chinese birth chart</li>
            <li>- Your Western Zodiac and elemental alignment</li>
            <li>- Monthly seasonal energy and emotional resonance</li>
          </ul>
          <p className="mt-4 text-emerald-800 font-medium">Our goal: clarity, alignment, and inner growth.</p>
        </div>
      </div>
      
      {/* User's Crystal Recommendation (Free Tier) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-40 h-40 relative flex-shrink-0">
            <Image 
              src="/crystals/citrine.png" 
              alt="Citrine Crystal"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              width={160}
              height={160}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-800 mb-3">🔮 Your 2025 Guiding Crystal: <span className="text-amber-600">{crystalRecommendation.name}</span></h2>
            <p className="text-gray-700">{crystalRecommendation.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                ✅ Based on your birth chart analysis
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                ✅ Personalized energy match
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ✅ Year-round guiding crystal
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Yearly Energy Score Table (Core Interaction Area) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-emerald-800 mb-4">Your 2025 Energy Timeline</h2>
        
        {/* Mobile scroll hint */}
        <div className="md:hidden text-sm text-gray-500 mb-2">
          👈 Swipe to see more data
        </div>
        
        {/* Score table */}
        <EnergyScoreTable currentMonth={currentMonthWithDay} userTier={userTier} />
      </div>
      
      {/* Explanatory text below table (Conversion enhancement) */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 mb-10">
        <h3 className="font-medium text-purple-900 mb-3">📝 Note:</h3>
        <p className="text-gray-700 mb-4">
          Each person's core energy is influenced by the yearly and monthly elemental changes.<br/>
          Your energy may rise or dip depending on how these cycles interact with your birth chart.
        </p>
        <p className="text-purple-900 font-medium">
          👉 That's why it's essential to adjust monthly—with the right focus, crystals, and small rituals—to stay balanced and empowered.
        </p>
        
        {/* Subscription button (free users only) */}
        {userTier === 'free' && (
          <div className="mt-6 text-center">
            <button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-8 py-3 shadow-md hover:shadow-lg transition-all"
              onClick={() => showSubscriptionModal()}
            >
              Unlock Your Complete Energy Report
            </button>
            <p className="mt-2 text-sm text-gray-600">Starting at just $4.99/month</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center mt-8">
        {userTier === 'free' && (
          <Link href="/subscription">
            <a className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Upgrade to PRO for Full Access 🚀
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}

// Helper function: subscription modal (should be a separate component in production)
function showSubscriptionModal() {
  alert('Subscribe to unlock full reports for all months!');
} 