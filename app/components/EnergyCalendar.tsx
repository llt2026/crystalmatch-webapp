import React, { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { calculateMonthlyEnergy, Elem, ElementRecord } from '@/app/lib/calculateMonthlyEnergy';
import { SubscriptionTier, getVisibleEnergyMonths } from '@/app/lib/subscription-config';

// Crystal mapping for lowest element
const CRYSTAL_MAP: Record<Elem, string> = {
  wood: 'Jade',
  fire: 'Ruby',
  earth: 'Citrine',
  metal: 'Clear Quartz',
  water: 'Sodalite'
};

interface EnergyCalendarProps {
  birthday: string;
  subscriptionTier: SubscriptionTier;
  userId: string;
}

const EnergyCalendar: React.FC<EnergyCalendarProps> = ({ 
  birthday, 
  subscriptionTier,
  userId 
}) => {
  const [monthlyData, setMonthlyData] = useState<Array<{
    month: string;
    energyChange: number;
    trend: 'up' | 'down' | 'stable';
    crystal: string;
    lowestElement: Elem;
  }>>([]);
  
  // 获取基于八字的总体水晶推荐（为免费用户准备）
  const [overallCrystal, setOverallCrystal] = useState<{
    name: string;
    element: Elem;
  }>({ name: 'Unknown', element: 'earth' });

  const isPremium = subscriptionTier === 'monthly' || subscriptionTier === 'yearly';
  const isYearly = subscriptionTier === 'yearly';
  const visibleMonths = getVisibleEnergyMonths(subscriptionTier);

  useEffect(() => {
    // Calculate energy calendar data for 12 months
    const today = new Date();
    const months: Array<{
      month: string;
      energyChange: number;
      trend: 'up' | 'down' | 'stable';
      crystal: string;
      lowestElement: Elem;
    }> = [];
    let prevMonthScores: ElementRecord | null = null;
    let weakestOverallElement: { elem: Elem, score: number } = { elem: 'earth', score: 100 };

    // Always calculate all 12 months data, but display according to subscription tier
    for (let i = 0; i < 12; i++) {
      const currentDate = addMonths(today, i);
      const monthName = format(currentDate, 'MMM');
      
      try {
        // Calculate energy for this month
        const energyData = calculateMonthlyEnergy({
          birthday,
          dateRef: currentDate,
          prevMonthScores
        });
        
        // Find the lowest element for this month
        const lowestElement = Object.entries(energyData.monthScores).reduce(
          (lowest, [elem, score]) => {
            const elemKey = elem as Elem;
            return score < lowest.score ? { elem: elemKey, score } : lowest;
          },
          { elem: 'earth' as Elem, score: 100 }
        );
        
        // For the first month, also update the overall weakest element for free users
        if (i === 0) {
          // 使用baseScores而不是monthScores来找出基于八字的最弱元素
          weakestOverallElement = Object.entries(energyData.baseScores).reduce(
            (lowest, [elem, score]) => {
              const elemKey = elem as Elem;
              return score < lowest.score ? { elem: elemKey, score } : lowest;
            },
            { elem: 'earth' as Elem, score: 100 }
          );
          
          // 设置总体水晶推荐
          setOverallCrystal({
            name: CRYSTAL_MAP[weakestOverallElement.elem],
            element: weakestOverallElement.elem
          });
        }
        
        // Calculate overall energy change (average of all elements)
        const avgChange = Object.values(energyData.diffScores).reduce((sum, val) => sum + val, 0) / 5;
        const roundedChange = Math.round(avgChange);
        
        // Get crystal recommendation based on lowest element
        const crystal = CRYSTAL_MAP[lowestElement.elem];
        
        months.push({
          month: monthName,
          energyChange: roundedChange,
          trend: energyData.trend,
          crystal,
          lowestElement: lowestElement.elem
        });
        
        // Save this month's scores for the next iteration
        prevMonthScores = energyData.monthScores;
      } catch (error) {
        console.error(`Error calculating energy for ${monthName}:`, error);
        months.push({
          month: monthName,
          energyChange: 0,
          trend: 'stable' as const,
          crystal: 'Unknown',
          lowestElement: 'earth'
        });
      }
    }
    
    setMonthlyData(months);
  }, [birthday]);

  return (
    <div className="w-full mt-6 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Energy Calendar</h2>
        
        {!isPremium && (
          <Link 
            href="/subscription" 
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Upgrade for Full Calendar
          </Link>
        )}
      </div>
      
      {/* 免费用户的总体水晶推荐 */}
      {subscriptionTier === 'free' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-md font-medium mb-2">Your Overall Crystal Recommendation</h3>
          <div className="flex items-center">
            <span className="mr-2">
              <Image 
                src={`/images/crystals/${overallCrystal.element}.png`} 
                alt={overallCrystal.name}
                width={24}
                height={24}
                className="inline-block"
              />
            </span>
            <span>
              <strong>{overallCrystal.name}</strong> - Based on your birth chart's five elements balance
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Upgrade to premium to get monthly crystal recommendations based on your changing energy.
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Month</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Energy Change</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Crystal</th>
              <th className="py-3 px-4 text-left text-gray-700 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.slice(0, visibleMonths).map((month, index) => (
              <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 border-b border-gray-200">{month.month}</td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {month.energyChange === 0 ? (
                    <span className="text-gray-500">—</span>
                  ) : month.energyChange > 0 ? (
                    <span className="text-green-500 font-medium">▲ +{month.energyChange}</span>
                  ) : (
                    <span className="text-rose-500 font-medium">▼ {month.energyChange}</span>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {/* 水晶显示逻辑 - 免费用户不显示月度水晶 */}
                  {(subscriptionTier === 'monthly' && index === 0) || 
                   subscriptionTier === 'yearly' ? (
                    <div className="flex items-center">
                      <span className="mr-1">
                        <Image 
                          src={`/images/crystals/${month.lowestElement}.png`} 
                          alt={month.crystal}
                          width={16}
                          height={16}
                          className="inline-block"
                        />
                      </span>
                      {month.crystal}
                    </div>
                  ) : subscriptionTier === 'free' ? (
                    <span className="text-gray-400">
                      <span className="mr-1">🔒</span> Upgrade for monthly crystal
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      <span className="mr-1">🔒</span> Locked
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {/* Action button logic based on subscription tier */}
                  {(index === 0 || isPremium) ? (
                    <Link 
                      href={`/monthly-rituals/${month.month.toLowerCase()}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      ✓ View Rituals
                    </Link>
                  ) : (
                    <button 
                      className="text-gray-400 hover:text-gray-600 font-medium flex items-center"
                      onClick={() => window.location.href = '/subscription'}
                    >
                      <span className="mr-1">🔒</span> Tap to unlock
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {/* If free user, show locked rows indicator */}
            {subscriptionTier === 'free' && (
              <tr className="bg-gray-50">
                <td colSpan={4} className="py-3 px-4 border-b border-gray-200 text-center text-gray-400">
                  <span className="mr-1">🔒</span> Remaining 11 months locked
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Subscription upgrade CTA */}
      {!isYearly && (
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <p className="text-indigo-800 text-sm">
            {subscriptionTier === 'free' ? (
              <>
                <span className="font-medium">Unlock your full Energy Calendar</span> - Get personalized monthly crystal recommendations and energy rituals for every month with a premium subscription.
              </>
            ) : (
              <>
                <span className="font-medium">Upgrade to Annual Plan</span> - Access all 12 months of crystal recommendations and save over 16% compared to monthly payments.
              </>
            )}
          </p>
          <Link 
            href="/subscription" 
            className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            {subscriptionTier === 'free' ? 'Upgrade Now' : 'Switch to Annual Plan'}
          </Link>
        </div>
      )}
      
      {/* Monthly subscription info */}
      {subscriptionTier === 'monthly' && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Your monthly subscription includes access to the current month's detailed reports and crystal recommendations.</p>
        </div>
      )}
      
      {/* Yearly subscription info */}
      {subscriptionTier === 'yearly' && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Your annual subscription includes access to all 12 months of detailed reports and crystal recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default EnergyCalendar; 