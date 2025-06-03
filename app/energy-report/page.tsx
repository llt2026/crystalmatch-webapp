"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ElementRadarChart, { ElementData } from '../components/ElementRadarChart';
import YearlyCrystal from '../components/YearlyCrystal';
import EnergyCalendar from '../components/EnergyCalendar';
import ElementTraits from '../components/ElementTraits';
import { getUserElementTraits } from '../lib/getUserElementTraits';
import { getUserCrystal, CrystalRecommendation } from '../lib/getUserCrystal';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../components/LoadingScreen';

// Types for our data
type UserData = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  elementValues: ElementData[];
  strength: {
    element: string;
    traits: string[];
  };
  weakness: {
    element: string;
    traits: string[];
  };
  yearCrystal: CrystalRecommendation;
  birthDate: string;
  subscriptionTier: 'free' | 'monthly' | 'yearly';
};

// Transform element data to element distribution for traits calculation
function transformElementDataToDistribution(data: ElementData[]): { element: any; value: number }[] {
  return data.map(item => {
    // Convert short element names to full element names for trait mapping
    const elementMap: Record<string, string> = {
      'S': 'earth',
      'F': 'water',
      'G': 'wood',
      'C': 'metal',
      'P': 'fire'
    };
    
    return {
      element: elementMap[item.element] || item.element.toLowerCase(),
      value: item.value
    };
  });
}

// 找出用户最弱的元素
function findWeakestElement(data: ElementData[]): string {
  if (!data || data.length === 0) return 'earth';
  
  // 找出值最小的元素
  const weakest = data.reduce((min, item) => 
    item.value < min.value ? item : min, data[0]);
  
  // 映射到完整元素名称
  const elementMap: Record<string, string> = {
    'S': 'Earth',
    'F': 'Water',
    'G': 'Wood',
    'C': 'Metal',
    'P': 'Fire'
  };
  
  return elementMap[weakest.element] || weakest.element;
}

export default function EnergyReportPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);

        // 尝试从多个位置获取token
        let token = null;
        if (typeof window !== 'undefined') {
          // 依次尝试从localStorage不同键名获取
          const possibleKeys = ['authToken', 'token', 'jwt', 'crystalMatchToken'];
          for (const key of possibleKeys) {
            const savedToken = localStorage.getItem(key);
            if (savedToken) {
              console.log(`从localStorage[${key}]获取到token`);
              token = savedToken;
              break;
            }
          }
        }

        const headers: Record<string,string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        console.log('使用headers:', headers);
        
        if (token) {
          // 同时也设置到cookie，增加成功概率
          document.cookie = `token=${token}; path=/; max-age=86400`;
        }

        // 从API获取用户数据
        const userRes = await fetch('/api/user/profile', { headers });
        if (!userRes.ok) {
          throw new Error('Failed to load user profile');
        }
        let userData = await userRes.json();

        // 获取用户能量数据
        const elementsRes = await fetch('/api/user/elements', { headers });
        if (!elementsRes.ok) {
          throw new Error('Failed to load user elements');
        }
        const elementsData = await elementsRes.json();
        
        // 格式化元素数据 - 使用真实数据
        const elementValues: ElementData[] = [
          { element: "S", value: elementsData.earth || 75, fullName: "Stability Energy" },
          { element: "F", value: elementsData.water || 85, fullName: "Fluid Energy" },
          { element: "G", value: elementsData.wood || 65, fullName: "Growth Energy" },
          { element: "C", value: elementsData.metal || 25, fullName: "Clarity Energy" },
          { element: "P", value: elementsData.fire || 70, fullName: "Passion Energy" },
        ];

        // 使用真实数据，不再使用测试数据
        if (!userData || !userData.id) {
          throw new Error('User data is required');
        }
        
        // 转换元素值以计算特质
        const elementDistribution = transformElementDataToDistribution(elementValues);
        
        // 获取用户的个性化优势和劣势特质
        const userTraits = getUserElementTraits(userData.id, elementDistribution);
        
        // 获取用户推荐的水晶
        const userCrystal = getUserCrystal(userData.id, elementDistribution, 2025);
        
        // 返回组合的用户数据
        setUserData({
          id: userData.id,
          name: userData.name || 'Demo User',
          email: userData.email || 'demo@crystalmatch.com',
          avatar: userData.avatar,
          elementValues,
          strength: userTraits.strength,
          weakness: userTraits.weakness,
          yearCrystal: userCrystal,
          birthDate: userData.birthDate,
          subscriptionTier: userData.subscriptionTier || 'free'
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Unable to load your energy report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !userData) {
    return (
      <main className="min-h-screen bg-purple-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error!</h1>
          <p className="mb-6">{error || "Unable to load your energy report"}</p>
          <Link href="/" className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-purple-900 text-white p-4">
      {/* User Profile - 重新设计为水平布局 */}
      <div className="rounded-lg bg-purple-900/60 p-6 mb-8 backdrop-blur-sm border border-purple-800/50">
        <div className="flex flex-row items-center mb-6">
          {userData.avatar ? (
            <div className="w-24 h-24 rounded-full overflow-hidden mr-6 bg-purple-800 border-2 border-purple-600 relative flex-shrink-0">
              <Image 
                src={userData.avatar}
                alt={userData.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full mr-6 bg-purple-800 border-2 border-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl font-bold">
                {userData.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          <h1 className="text-5xl font-bold text-white">{userData.name}</h1>
        </div>
        
        <div className="bg-purple-800/80 rounded-lg p-4 w-full text-center">
          <p className="text-lg">
            Based on 2,500 years of Five Elements wisdom{" "}
            <span className="text-yellow-300">⚡</span> &amp; GPT insights
          </p>
        </div>
      </div>
      
      {/* Elements Radar Chart */}
      <div className="rounded-lg bg-purple-900/60 p-4 md:p-6 mb-8 backdrop-blur-sm border border-purple-800/50">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Your Energy Status</h2>
        <ElementRadarChart data={userData.elementValues} />
      </div>
      
      {/* Strength & Weakness */}
      <ElementTraits strength={userData.strength} weakness={userData.weakness} />
      
      {/* Yearly Crystal */}
      <YearlyCrystal 
        crystal={{
          name: userData.yearCrystal.name,
          description: "Focus · Clarity · Structure",
          imageUrl: `/images/crystals/${userData.yearCrystal.name}.png`,
          effect: "Inspiration Enhancer",
          planetAssociation: "Sun/Moon",
          year: 2025
        }} 
        isFreeUser={userData.subscriptionTier === 'free'}
        userElement={findWeakestElement(userData.elementValues)}
      />
      
      {/* Energy Calendar */}
      <div className="mb-8">
        <EnergyCalendar birthDate={userData.birthDate} />
      </div>
      
      {/* Call to action */}
      {userData.subscriptionTier !== 'yearly' && (
        <div className="rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-center backdrop-blur-sm border border-purple-600/50">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Unlock Your Full Potential</h2>
          <p className="mb-6">Get detailed monthly guidance and personalized crystal recommendations</p>
          <Link href="/subscription" className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}
    </main>
  );
} 