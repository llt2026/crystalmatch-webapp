"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ElementRadarChart, { ElementData } from '../../components/ElementRadarChart';
import YearlyCrystal from '../../components/YearlyCrystal';
import ElementTraits from '../../components/ElementTraits';
import { getUserElementTraits } from '../../lib/getUserElementTraits';
import { getUserCrystal, CrystalRecommendation } from '../../lib/getUserCrystal';
import { useRouter } from 'next/navigation';
import LoadingScreen from '../../components/LoadingScreen';
import EnergyCalendar from '../../components/EnergyCalendar';
import { mapSubscriptionToTier } from '../../lib/subscription-utils';

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
  subscription?: {
    status: string;
  };
};

// Five Elements crystals mapping - each element has 4 crystals
const elementCrystals: Record<string, string[]> = {
  "wood": [
    "Green Aventurine", "Malachite", "Nephrite Jade", "Amazonite"
  ],
  "fire": [
    "Carnelian", "Sunstone", "Garnet", "Ruby"
  ],
  "earth": [
    "Tiger's Eye", "Smoky Quartz", "Moss Agate", "Picture Jasper"
  ],
  "metal": [
    "Clear Quartz", "Hematite", "Pyrite", "Howlite"
  ],
  "water": [
    "Sodalite", "Aquamarine", "Blue Lace Agate", "Labradorite"
  ]
};

// Five Elements lucky colors
const elementLuckyColors: Record<string, string> = {
  "wood": "Green + Brown",
  "fire": "Red + Orange",
  "earth": "Yellow + Beige",
  "metal": "White + Silver/Gray",
  "water": "Blue + Black"
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

// Find user's weakest element
function findWeakestElement(data: ElementData[]): string {
  if (!data || data.length === 0) return 'earth';
  
  // Find element with minimum value
  const weakest = data.reduce((min, item) => 
    item.value < min.value ? item : min, data[0]);
  
  // Map to full element name
  const elementMap: Record<string, string> = {
    'S': 'Earth',
    'F': 'Water',
    'G': 'Wood',
    'C': 'Metal',
    'P': 'Fire'
  };
  
  return elementMap[weakest.element] || weakest.element;
}

export default function AnnualPremiumReport() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [urlBirthDate, setUrlBirthDate] = useState<string | null>(null);
  const [calendarData, setCalendarData] = useState<any[]>([]);

  useEffect(() => {
    // Read URL parameters on client-side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const birthDateParam = urlParams.get('birthDate');
      console.log('URL birthDate parameter:', birthDateParam || 'not provided');
      setUrlBirthDate(birthDateParam);
    }
    
    async function fetchUserData() {
      try {
        setLoading(true);

        // Try to get token from various storage locations
        let token = null;
        if (typeof window !== 'undefined') {
          const possibleKeys = ['authToken', 'token', 'jwt', 'crystalMatchToken'];
          for (const key of possibleKeys) {
            const savedToken = localStorage.getItem(key);
            if (savedToken) {
              console.log(`Retrieved token from localStorage[${key}]`);
              token = savedToken;
              break;
            }
          }
        }

        const headers: Record<string,string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        if (token) {
          // Also set to cookie for better success rate
          document.cookie = `token=${token}; path=/; max-age=86400`;
        }

        // Get user data from API
        let userData = null;
        try {
          const userRes = await fetch('/api/user/profile', { 
            headers,
            credentials: 'include',
            cache: 'no-store', 
            method: 'GET',
          });
          if (!userRes.ok) {
            throw new Error(`Failed to get user data: ${userRes.status}`);
          }
          userData = await userRes.json();
          console.log('User data retrieved:', userData);
        } catch (userError) {
          console.error('Error fetching user data:', userError);
        }
        
        // Get user energy data
        let elementsData = null;
        try {
          const elementsRes = await fetch('/api/user/elements', { 
            headers,
            credentials: 'include',
            cache: 'no-store'
          });
          if (!elementsRes.ok) {
            throw new Error(`Failed to get elements data: ${elementsRes.status}`);
          }
          elementsData = await elementsRes.json();
          console.log('Elements data retrieved:', elementsData);
        } catch (elementsError) {
          console.error('Error fetching elements data:', elementsError);
          // If unable to get element data, set default values
          elementsData = {
            earth: 50 + Math.floor(Math.random() * 30),
            water: 50 + Math.floor(Math.random() * 30), 
            wood: 50 + Math.floor(Math.random() * 30),
            metal: 30 + Math.floor(Math.random() * 40),
            fire: 40 + Math.floor(Math.random() * 35)
          };
        }
        
        // 如果无法获取用户数据，不应该创建假数据，而应该重定向到登录页面
        if (!userData || !userData.id) {
          console.warn('无法获取用户数据，重定向到登录页面');
          router.push('/login?message=please-login');
          return;
        }
        
        // 优先使用 subscription.status，其次才回退到旧字段 subscriptionTier，避免历史字段干扰
        const subscriptionTier = mapSubscriptionToTier(userData.subscription?.status || userData.subscriptionTier);
        console.log('✅ annual-premium 提取的订阅状态:', subscriptionTier, '来源:', userData.subscription?.status);
        
        // 创建新的用户数据对象，显式覆盖subscriptionTier属性
        let userDataForState = {
          ...userData,
          subscriptionTier: subscriptionTier // 使用映射后的订阅状态
        };
        
        console.log('✅ annual-premium 修改后的userData:', {
          id: userDataForState.id,
          subscriptionTier: userDataForState.subscriptionTier,
          hasSubscription: !!userDataForState.subscription
        });
        
        // Format element data
        const elementValues: ElementData[] = [
          { element: "S", value: elementsData.earth, fullName: "Stability Energy" },
          { element: "F", value: elementsData.water, fullName: "Fluid Energy" },
          { element: "G", value: elementsData.wood, fullName: "Growth Energy" },
          { element: "C", value: elementsData.metal, fullName: "Clarity Energy" },
          { element: "P", value: elementsData.fire, fullName: "Passion Energy" },
        ];
        
        // Convert element values for traits calculation
        const elementDistribution = transformElementDataToDistribution(elementValues);
        
        // Get user's personalized strength and weakness traits
        const userTraits = getUserElementTraits(userData.id, elementDistribution);
        
        // Get user's recommended crystal
        const userCrystal = getUserCrystal(userData.id, elementDistribution, 2025);
        
        // 检查生日信息
        const finalBirthDate = urlBirthDate || userDataForState.birthDate || (userDataForState as any).birthInfo?.date || (userDataForState as any).birthInfo?.birthdate || '';
        
        // 如果没有生日信息，重定向到个人资料编辑页面
        if (!finalBirthDate) {
          console.warn('No birth date found, redirecting to profile edit');
          router.push('/profile/edit?message=请先完善您的生日信息');
          return;
        }
        
        // Set combined user data
        setUserData({
          id: userDataForState.id,
          name: userDataForState.name,
          email: userDataForState.email,
          avatar: userDataForState.avatar,
          elementValues,
          strength: userTraits.strength,
          weakness: userTraits.weakness,
          yearCrystal: userCrystal,
          birthDate: finalBirthDate,
          subscriptionTier: userDataForState.subscriptionTier
        });
        
        // Load calendar data
        try {
          if (urlBirthDate || userData.birthDate || (userData as any).birthInfo?.date) {
            const birthDateForCalc = urlBirthDate || userData.birthDate || (userData as any).birthInfo?.date;
            const { calculateEnergyCalendar } = await import('../../lib/energyCalculation2025');
            const calendarData = await calculateEnergyCalendar(birthDateForCalc);
            
            // Find opposite elements for lucky colors - we assume the highest element is opposite to the lowest
            const oppositeElement: Record<string, string> = {
              "wood": "metal",
              "fire": "water",
              "earth": "wood",
              "metal": "fire",
              "water": "earth"
            };
            
            // Process calendar data for complete information
            const elementOccurrences: Record<string, number[]> = {};
            calendarData.forEach((item: any, index: number) => {
              if (item.lowestElement) {
                const element = item.lowestElement;
                if (!elementOccurrences[element]) {
                  elementOccurrences[element] = [];
                }
                elementOccurrences[element].push(index);
              }
            });
            
            // Format month strings and add crystal and lucky color recommendations
            const formattedCalendarData = calendarData.map((item: any, index: number) => {
              // Get crystal recommendation based on element and occurrence
              let crystal = "Unknown Crystal";
              let luckyColor = "Unknown";
              
              if (item.lowestElement) {
                const element = item.lowestElement;
                let elementIndex = 0;
                
                if (elementOccurrences[element]) {
                  const elementIndices = elementOccurrences[element];
                  elementIndex = elementIndices.indexOf(index);
                }
                
                // Get crystal for the element
                if (elementCrystals[element]) {
                  const crystalList = elementCrystals[element];
                  crystal = crystalList[elementIndex % crystalList.length];
                }
                
                // Get lucky color based on the opposite element
                const highestElement = oppositeElement[element];
                if (elementLuckyColors[highestElement]) {
                  luckyColor = elementLuckyColors[highestElement];
                }
              }
              
              return {
                ...item,
                formattedMonth: formatDateRange(item.month),
                crystal,
                luckyColor
              };
            });
            
            setCalendarData(formattedCalendarData);
          }
        } catch (calendarError) {
          console.error('Error calculating energy calendar:', calendarError);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Unable to load your energy report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [urlBirthDate]);
  
  // Format date string to "Month Day, Year" format
  const formatDateRange = (dateStr: string): string => {
    if (!dateStr) return '';
    
    const parts = dateStr.split(' - ');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const parsePart = (part: string) => {
      const [m, d, y] = part.split('/').map(Number);
      return { month: m, day: d, year: y };
    };

    if (parts.length === 1) {
      const { month, day, year } = parsePart(parts[0]);
      return `${months[month-1]} ${day}, ${year}`;
    } else {
      const start = parsePart(parts[0]);
      const end = parsePart(parts[1]);

      if (start.month === end.month && start.year === end.year) {
        return `${months[start.month-1]} ${start.day}-${end.day}, ${start.year}`;
      }
      return `${months[start.month-1]} ${start.day}, ${start.year} - ${months[end.month-1]} ${end.day}, ${end.year}`;
    }
  };
  
  // Get color for energy change value
  const getEnergyColor = (energyChange: number): string => {
    if (energyChange >= 5) return 'text-red-500';
    if (energyChange >= 2) return 'text-red-400';
    if (energyChange > 0) return 'text-red-300';
    if (energyChange === 0) return 'text-white';
    if (energyChange >= -2) return 'text-blue-300';
    if (energyChange >= -5) return 'text-blue-400';
    return 'text-blue-500';
  };

  // Get trend icon
  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '—';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }
  
  if (error || !userData) {
    return (
      <main className="min-h-screen bg-purple-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error!</h1>
          <p className="mb-6">{error || "Unable to load your energy report"}</p>
          <Link href="/profile" className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
            Back to Profile
          </Link>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 to-purple-900 text-white p-4">
      {/* User Profile */}
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
              <img 
                src="/default-avatar.png"
                alt={`${userData.name}'s avatar`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex flex-col">
            <h1 className="text-5xl font-bold text-white leading-none">{userData.name}</h1>
            {/* Birthday below name */}
            {userData.birthDate && (
              <p className="text-purple-300 text-sm mt-1">
                {new Date(userData.birthDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </p>
            )}
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
      
      {/* Energy Calendar - Full table with all four columns */}
      <div className="mb-8">
        {userData.birthDate ? (
          <EnergyCalendar birthDate={userData.birthDate} subscriptionTier={userData.subscriptionTier} />
        ) : (
          <div className="rounded-lg bg-yellow-600/20 p-6 backdrop-blur-sm border border-yellow-500/30 text-center">
            <h3 className="text-xl font-bold text-yellow-300 mb-2">Birth date required</h3>
            <p className="text-yellow-200 mb-4">
              We need your birth date to generate accurate energy insights.
            </p>
            <Link 
              href="/profile/edit" 
              className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add birth date
            </Link>
          </div>
        )}
      </div>
      
      {/* Pro member benefits with integrated Back button */}
      <div className="rounded-lg bg-purple-900/40 p-6 mb-8 backdrop-blur-sm border border-purple-400/40">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            ✨ Unlock Premium Features ✨
          </h2>
          <p className="text-purple-200 text-sm mb-4">
            Upgrade to <span className="text-yellow-300 font-semibold">Plus ($4.99)</span> for 12-month crystal guidance or <span className="text-orange-300 font-semibold">Pro ($9.99)</span> for full lucky color insights
          </p>
          
          {/* Buttons row - always horizontal on all screen sizes */}
          <div className="flex flex-row justify-center gap-2 mt-4">
            <Link 
              href="/subscription" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-md shadow transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-1">✨</span>
              Upgrade
            </Link>
            
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-4 py-2 text-sm bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-md shadow transform hover:scale-105 transition-all duration-200 border border-purple-500/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Home
            </Link>
          </div>
          
          <p className="text-purple-300 text-xs mt-4">
            Cancel anytime • 14-day money-back guarantee
          </p>
        </div>
      </div>
    </main>
  );
}