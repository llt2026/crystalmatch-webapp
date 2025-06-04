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
  subscriptionTier: 'free' | 'plus' | 'pro' | 'premium';
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
        
        // Ensure we have user data - use default if API fails
        if (!userData || !userData.id) {
          console.warn('API could not retrieve user data, using emergency default data');
          const tempId = `temp-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
          userData = {
            id: tempId,
            name: "Guest User",
            email: "guest@crystalmatch.com",
            birthDate: "1990-01-01T00:00:00.000Z",
            subscriptionTier: "pro" // Show appropriate content for pro user
          };
        }
        
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
        
        // Set combined user data
        setUserData({
          id: userData.id,
          name: userData.name || 'Guest User',
          email: userData.email || 'guest@crystalmatch.com',
          avatar: userData.avatar,
          elementValues,
          strength: userTraits.strength,
          weakness: userTraits.weakness,
          yearCrystal: userCrystal,
          birthDate: urlBirthDate || userData.birthDate || (userData as any).birthInfo?.date || (userData as any).birthInfo?.birthdate || '1990-01-01T00:00:00.000Z',
          subscriptionTier: userData.subscriptionTier || 'pro'
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
          <Link href="/" className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
            Return to Home
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
        isFreeUser={false}
        userElement={findWeakestElement(userData.elementValues)}
      />
      
      {/* Energy Calendar - Full table with all four columns */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">Energy Calendar</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-purple-800">
              <tr>
                <th className="py-3 px-4 text-left text-white font-semibold">Month</th>
                <th className="py-3 px-4 text-left text-white font-semibold">Energy Change</th>
                <th className="py-3 px-4 text-left text-white font-semibold">Crystal</th>
                <th className="py-3 px-4 text-left text-white font-semibold">Lucky Colors</th>
              </tr>
            </thead>
            <tbody>
              {calendarData.map((item, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-purple-900' : 'bg-purple-800/70'}
                >
                  <td className="py-3 px-4 text-white font-medium">{item.formattedMonth}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getEnergyColor(item.energyChange)}`}>
                      {item.energyChange > 0 ? `+${item.energyChange}` : item.energyChange === 0 ? '—' : item.energyChange}
                      {' '}{getTrendIcon(item.trend)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-yellow-300">
                    {item.crystal}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {item.luckyColor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pro/Premium member benefits */}
      <div className="rounded-lg bg-black/40 p-6 mb-8">
        <h2 className="text-xl font-medium mb-4 text-yellow-300">Pro Member Exclusive Features</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
          <li>Monthly personalized energy guidance</li>
          <li>Customized crystal and color recommendations</li>
          <li>Important date alerts</li>
          <li>Priority access to new features</li>
        </ul>
      </div>
      
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