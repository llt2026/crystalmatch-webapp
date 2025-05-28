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

// Sample data - in production this would come from API
const basicUserData = {
  id: "user-12345",
  name: "Olivia",
  avatar: "/images/profile-avatar.jpg",
  birthDate: "1990-06-15",
  subscriptionTier: "yearly" as const,
  elementValues: [
    { element: "S", value: 75, fullName: "Stability Energy" },
    { element: "F", value: 85, fullName: "Fluid Energy" },
    { element: "G", value: 65, fullName: "Growth Energy" },
    { element: "C", value: 25, fullName: "Clarity Energy" },
    { element: "P", value: 70, fullName: "Passion Energy" },
  ]
};

export default function EnergyReportPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function prepareUserData() {
      try {
        setLoading(true);
        
        // 在实际应用中，这里会从API获取真实用户数据
        // 现在使用示例数据模拟

        // Convert the element values to the format needed for trait calculation
        const elementDistribution = transformElementDataToDistribution(basicUserData.elementValues);
        
        // Get user's personalized strength and weakness traits
        const userTraits = getUserElementTraits(basicUserData.id, elementDistribution);
        
        // Get user's recommended crystal
        const userCrystal = getUserCrystal(basicUserData.id, elementDistribution, 2025);
        
        // Return combined user data
        setUserData({
          ...basicUserData,
          strength: userTraits.strength,
          weakness: userTraits.weakness,
          yearCrystal: userCrystal
        });
      } catch (err) {
        console.error("Error preparing user data:", err);
        setError('Failed to load your energy report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    prepareUserData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !userData) {
    return (
      <main className="min-h-screen bg-purple-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="mb-6">{error || "Unable to load your energy report"}</p>
          <Link href="/" className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
            Return Home
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
            Powered by 2,500-year Five-Element wisdom{" "}
            <span className="text-yellow-300">⚡</span> &amp; GPT insight
          </p>
        </div>
      </div>
      
      {/* Elements Radar Chart */}
      <div className="rounded-lg bg-purple-900/60 p-4 md:p-6 mb-8 backdrop-blur-sm border border-purple-800/50">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Your Energy Profile</h2>
        <ElementRadarChart data={userData.elementValues} />
      </div>
      
      {/* Strength & Weakness */}
      <ElementTraits strength={userData.strength} weakness={userData.weakness} />
      
      {/* Yearly Crystal */}
      <YearlyCrystal 
        crystal={{
          name: userData.yearCrystal.name,
          description: "Focus · Clarity · Structure",
          imageUrl: `/images/crystals/Clear Quartz.png`,
          effect: "Brainstorm booster",
          planetAssociation: "Sun/Moon",
          year: 2025
        }} 
        isFreeUser={false}
        userElement={findWeakestElement(userData.elementValues)}
      />
      
      {/* Energy Calendar */}
      <div className="mb-8">
        <EnergyCalendar 
          birthday={userData.birthDate}
          subscriptionTier={userData.subscriptionTier}
          userId={userData.id}
        />
      </div>
      
      {/* Call to action */}
      <div className="rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-center backdrop-blur-sm border border-purple-600/50">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Unlock Your Full Potential</h2>
        <p className="mb-6">Get detailed monthly guidance and personalized crystal recommendations</p>
        <Link href="/subscription" className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Upgrade Now
        </Link>
      </div>
    </main>
  );
} 