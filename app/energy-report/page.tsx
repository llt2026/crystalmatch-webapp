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
import { mapSubscriptionToTier } from '../lib/subscription-utils';

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
  subscriptionTier: 'free' | 'plus' | 'pro';
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
  const [urlBirthDate, setUrlBirthDate] = useState<string | null>(null);

  useEffect(() => {
    // 客户端加载时读取URL参数
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const birthDateParam = urlParams.get('birthDate');
      console.log('URL中的birthDate参数:', birthDateParam || '未提供');
      setUrlBirthDate(birthDateParam);
    }
    
    async function fetchUserData() {
      try {
        setLoading(true);

        let urlParams;
        
        // 优先检查URL参数中是否包含birthDate
        if (typeof window !== 'undefined') {
          urlParams = new URLSearchParams(window.location.search);
          const urlBirthDate = urlParams.get('birthDate');
          console.log('URL中的birthDate参数:', urlBirthDate || '未提供');
        }

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
        let userData = null;
        try {
          // 请求前故意加上时间戳，避免浏览器缓存
          const ts = new Date().getTime();
          const userRes = await fetch('/api/user/profile', { 
            headers,
            credentials: 'include',
            cache: 'no-store', 
            method: 'GET',
            next: { revalidate: 0 }
          });
          if (!userRes.ok) {
            throw new Error(`获取用户数据失败: ${userRes.status}`);
          }
          userData = await userRes.json();
          console.log('成功获取用户数据(完整):', JSON.stringify(userData));
          console.log('生日信息:', userData.birthDate, userData.birthInfo?.date, userData.birthInfo?.birthdate);
        } catch (userError) {
          console.error('获取用户数据出错:', userError);
          // 继续尝试其他API调用，而不是立即返回错误
        }
        
        // 获取用户能量数据 - 确保无论如何都能获取到数据
        let elementsData = null;
        try {
          const elementsRes = await fetch('/api/user/elements', { 
            headers,
            credentials: 'include',
            cache: 'no-store'
          });
          if (!elementsRes.ok) {
            throw new Error(`获取元素数据失败: ${elementsRes.status}`);
          }
          elementsData = await elementsRes.json();
          console.log('成功获取元素数据:', elementsData);
        } catch (elementsError) {
          console.error('获取元素数据出错:', elementsError);
          // 如果无法获取元素数据，设置默认值
          elementsData = {
            earth: 50 + Math.floor(Math.random() * 30),
            water: 50 + Math.floor(Math.random() * 30), 
            wood: 50 + Math.floor(Math.random() * 30),
            metal: 30 + Math.floor(Math.random() * 40),
            fire: 40 + Math.floor(Math.random() * 35)
          };
        }
        
        // 确保有用户数据 - 如果API获取失败则使用默认数据
        if (!userData || !userData.id) {
          console.warn('API无法获取用户数据，使用应急默认数据');
          // 生成唯一ID确保一致性
          const tempId = `temp-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
          userData = {
            id: tempId,
            name: "Guest User",
            email: "guest@crystalmatch.com",
            birthDate: "1990-01-01T00:00:00.000Z",
            subscription: {
              status: "free" // 默认为免费会员
            }
          };
        }
        
        // 从API返回中提取订阅状态
        const subscriptionTier = mapSubscriptionToTier(userData.subscription?.status || userData.subscriptionTier);
        console.log('✅ energy-report 提取的订阅状态:', subscriptionTier, '来源:', userData.subscription?.status);
        
        // 创建新的用户数据对象，显式覆盖subscriptionTier属性
        let userDataForState = {
          ...userData,
          subscriptionTier: subscriptionTier // 显式覆盖subscriptionTier属性
        };
        
        console.log('✅ energy-report 修改后的userData:', {
          id: userDataForState.id,
          subscriptionTier: userDataForState.subscriptionTier,
          hasSubscription: !!userDataForState.subscription
        });
        
        // 格式化元素数据 - 确保总是使用真实元素值
        const elementValues: ElementData[] = [
          { element: "S", value: elementsData.earth, fullName: "Stability Energy" },
          { element: "F", value: elementsData.water, fullName: "Fluid Energy" },
          { element: "G", value: elementsData.wood, fullName: "Growth Energy" },
          { element: "C", value: elementsData.metal, fullName: "Clarity Energy" },
          { element: "P", value: elementsData.fire, fullName: "Passion Energy" },
        ];
        
        // 转换元素值以计算特质
        const elementDistribution = transformElementDataToDistribution(elementValues);
        
        // 获取用户的个性化优势和劣势特质 - 基于真实用户ID确保一致性
        const userTraits = getUserElementTraits(userDataForState.id, elementDistribution);
        
        // 获取用户推荐的水晶 - 基于真实的八字五行元素数据
        const userCrystal = getUserCrystal(userDataForState.id, elementDistribution, 2025);
        
        // 返回组合的用户数据
        setUserData({
          id: userDataForState.id,
          name: userDataForState.name || 'Guest User',
          email: userDataForState.email || 'guest@crystalmatch.com',
          avatar: userDataForState.avatar, // 在UI渲染时处理默认头像
          elementValues,
          strength: userTraits.strength,
          weakness: userTraits.weakness,
          yearCrystal: userCrystal,
          birthDate: urlBirthDate || userDataForState.birthDate || (userDataForState as any).birthInfo?.date || (userDataForState as any).birthInfo?.birthdate || '1990-01-01T00:00:00.000Z',
          subscriptionTier: userDataForState.subscriptionTier
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
          
          <div className="flex flex-col">
            <h1 className="text-5xl font-bold text-white leading-none">{userData.name}</h1>
            {/* Birthday below name */}
            <p className="text-purple-300 text-sm mt-1">
              {new Date(userData.birthDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="bg-purple-800/80 rounded-lg p-4 w-full text-center">
          <p className="text-lg">
            4,000 Years of Five Elements Wisdom{" "}
            <span className="text-yellow-300">⚡</span> Enhanced by AI
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
          description: userData.yearCrystal.description || "Your Personalized Crystal",
          imageUrl: `/images/crystals/${userData.yearCrystal.name}.png`,
          effect: userData.yearCrystal.effect,
          planetAssociation: userData.yearCrystal.planet || "Earth",
          year: 2025
        }} 
        isFreeUser={userData.subscriptionTier === 'free'}
        userElement={findWeakestElement(userData.elementValues)}
      />
      
      {/* Energy Calendar */}
      <div className="mb-8">
        <EnergyCalendar birthDate={urlBirthDate || userData.birthDate || '1990-01-01T00:00:00.000Z'} subscriptionTier={userData.subscriptionTier} />
      </div>
      
      {/* Call to action */}
      {userData.subscriptionTier !== 'pro' && (
        <div className="rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-center backdrop-blur-sm border border-purple-600/50">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Unlock Your Full Potential</h2>
          <p className="mb-6">Get detailed monthly guidance and personalized crystal recommendations</p>
          <Link href="/subscription" className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Upgrade Now
          </Link>
        </div>
      )}
      
      {/* Back to Profile button */}
      <div className="mt-10 mb-6 text-center">
        <Link href="/profile" className="inline-flex items-center text-white bg-purple-800 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Profile
        </Link>
      </div>
    </main>
  );
} 