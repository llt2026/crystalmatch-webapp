/**
 * May 2025 Monthly Deep Report Page - Pro Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Type for element
type ElementType = 'water' | 'fire' | 'earth' | 'metal' | 'wood';

// Extract useSearchParams component to a separate component
function MayReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // Calculate date range (US format: MM/DD/YYYY)
  const startDate = "05/01/2025";
  const endDate = "05/31/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for active aspect tab
  const [activeAspect, setActiveAspect] = useState<string>('relationship');
  
  // State for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  
  // Helper function to get crystal for each element
  const getCrystalForElement = (element: ElementType) => {
    const crystalMap = {
      'water': { name: 'Clear Quartz', color: 'text-blue-300', bgColor: 'bg-blue-900/50' },
      'fire': { name: 'Red Jasper', color: 'text-red-300', bgColor: 'bg-red-900/50' },
      'earth': { name: 'Amethyst', color: 'text-purple-300', bgColor: 'bg-purple-900/50' },
      'metal': { name: 'Citrine', color: 'text-yellow-300', bgColor: 'bg-yellow-900/50' },
      'wood': { name: 'Green Jade', color: 'text-green-300', bgColor: 'bg-green-900/50' }
    };
    return crystalMap[element] || crystalMap.water;
  };
  
  // Function to determine daily element based on day number
  const getDailyElement = (day: number): ElementType => {
    const elements: ElementType[] = ['water', 'fire', 'earth', 'metal', 'wood'];
    return elements[day % 5];
  };

  // Function to get element color class based on element type
  const getElementColorClass = (element: ElementType): {bg: string, text: string} => {
    const colorMap = {
      'water': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
      'fire': { bg: 'bg-red-900/40', text: 'text-red-300' },
      'earth': { bg: 'bg-yellow-900/40', text: 'text-yellow-300' },
      'metal': { bg: 'bg-purple-900/40', text: 'text-purple-300' },
      'wood': { bg: 'bg-green-900/40', text: 'text-green-300' }
    };
    return colorMap[element] || colorMap.water;
  };
  
  // Function to open feedback modal with specified type
  const openFeedbackModal = (type: string) => {
    setFeedbackType(type);
    setShowFeedbackModal(true);
  };
  
  // Function to handle checkbox selection
  const handleOptionSelect = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };
  
  // Function to handle feedback submission
  const handleFeedbackSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      // 获取用户ID，如果可用的话
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // 准备要发送的数据
      const feedbackData = {
        userId,
        feedbackType,
        reportType: 'Pro - Growth Track', // 当前报告类型
        content: additionalFeedback,
        options: selectedOptions
      };
      
      // 发送到API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '提交反馈失败');
      }
      
      // 成功提交
      console.log('Feedback submitted successfully');
      
      // 重置并关闭模态框
      setAdditionalFeedback('');
      setSelectedOptions([]);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError(error instanceof Error ? error.message : '提交反馈失败');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Pro)</h1>
          <p className="text-purple-300 mt-1">{dateRange}</p>
        </header>
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">83 / 100</div>
            <div className="mt-1 text-purple-300">Growth Mode ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "83%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  💧 Water
                </span>
              </div>
              <div className="text-xs text-blue-300 mt-1 font-medium">Fluid Energy</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                  🔥 Fire
                </span>
              </div>
              <div className="text-xs text-red-300 mt-1 font-medium">Passion Energy</div>
            </div>
          </div>
        </div>

        {/* Five Life Aspects Section - NEW SECTION with Navigation Tabs */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl">
          {/* Aspect Navigation Tabs */}
          <div className="flex border-b border-purple-900/30">
            <button 
              onClick={() => setActiveAspect('finance')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'finance' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">💰</span>
              <span className="text-xs mt-1">Money Flow</span>
            </button>
            <button 
              onClick={() => setActiveAspect('relationship')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'relationship' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">👥</span>
              <span className="text-xs mt-1">Social Vibes</span>
            </button>
            <button 
              onClick={() => setActiveAspect('mood')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'mood' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🌙</span>
              <span className="text-xs mt-1">Mood Balance</span>
            </button>
            <button 
              onClick={() => setActiveAspect('health')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'health' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🔥</span>
              <span className="text-xs mt-1">Body Fuel</span>
            </button>
            <button 
              onClick={() => setActiveAspect('growth')} 
              className={`flex flex-col items-center justify-center py-3 flex-1 ${activeAspect === 'growth' ? 'bg-purple-900/30' : ''}`}
            >
              <span className="text-lg">🚀</span>
              <span className="text-xs mt-1">Growth Track</span>
            </button>
          </div>
          
          {/* Finance & Career Content (Visible when activeAspect is finance) */}
          {activeAspect === 'finance' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">💼</span>
                <h3 className="text-lg font-medium">Finance & Career</h3>
              </div>
              
              <p className="text-sm text-purple-200 mb-4">
                Your financial energy is high this month—great for initiating negotiations or exploring new income streams.
              </p>
              
              {/* Favorable and unfavorable days */}
              <div className="space-y-3 mb-5">
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/12</span> Good for interviews or applications</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/21</span> Well-timed for startup moves</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">6/18</span> Miscommunication likely, avoid signing</p>
                  </div>
                </div>
              </div>
              
              {/* Best time hint */}
              <div className="flex items-start mb-5">
                <span className="inline-block bg-purple-900/40 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="text-xs text-purple-200">
                  On 6/12 morning, aim for one high-stakes conversation. Energy favors expression.
                </p>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <h5 className="text-sm mb-2">Hourly Peaks</h5>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">9:00 AM–11:00 AM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 88</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for presentations</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">3:00 PM–5:00 PM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 83</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for contracts</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-xs">7:00 PM–9:00 PM</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Score 80</span>
                    </div>
                  </div>
                  <p className="text-xs text-purple-200 pl-6">Best for planning</p>
                </div>
                
                <div className="mt-4 flex items-center">
                  <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-xs text-purple-200">
                    Alerts enabled, you'll be notified 15 mins prior
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Relationship Content (Visible when activeAspect is relationship) */}
          {activeAspect === 'relationship' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">👥</span>
                <h3 className="text-lg font-medium">Social Vibes</h3>
              </div>
              
              <p className="text-sm text-purple-200 mb-4">
                This month offers both harmonious periods for deepening connections and potential friction points to navigate carefully.
              </p>
              
              {/* Harmonious periods section */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Harmonious Periods</h4>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 3rd - 9th</span>: Perfect for social gatherings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 17th, 10:00-12:00</span>: Ideal for important conversations</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 24th - 26th</span>: Strong connection energy</p>
                  </div>
                </div>
              </div>
              
              {/* Friction periods section */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Friction Periods</h4>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 8th, 14:00-16:00</span>: Avoid critical discussions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 16th, 11:00-13:00</span>: Communication challenges likely</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 19th</span>: Potential conflicts, practice patience</p>
                  </div>
                </div>
              </div>
              
              {/* Best window hint */}
              <div className="flex items-start mb-5">
                <span className="inline-block bg-purple-900/40 rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="text-xs text-purple-200">
                  Schedule meaningful conversations during harmony windows to enhance mutual understanding.
                </p>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <h5 className="text-sm mb-2">Best Connection Windows</h5>
                
                <div className="space-y-3">                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs">May 12th, 18:00–20:00</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Score 85</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 pl-6">Perfect for deep conversations</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs">May 24th, 15:00–17:00</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Score 84</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 pl-6">Ideal for relationship building</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs">May 28th, 19:00–21:00</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium">Score 82</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 pl-6">Excellent for social gatherings</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mood Content (Only showing structure, similar pattern for all tabs) */}
          {activeAspect === 'mood' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🌙</span>
                <h3 className="text-lg font-medium">Mood Balance</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Your emotional energy fluctuates this month with clear peaks and valleys to be aware of.
              </p>
              
              {/* Mood peak periods */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Mood Peaks</h4>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">Top 3 days this month:</span> May 7th, 15th, and 23rd</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">✓</span>
                  <div>
                    <p className="text-sm">If dominant element is wood on these days, emotional flow will be significantly enhanced</p>
                  </div>
                </div>
              </div>
              
              {/* Mood low periods */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Mood Valleys</h4>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">May 11th and 19th</span>: Low emotional energy days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                  <div>
                    <p className="text-sm">Metal or water deficient hours may intensify emotional challenges</p>
                  </div>
                </div>
              </div>
              
              {/* 4-7-8 Breathing */}
              <div className="p-4 bg-purple-900/20 rounded-lg mb-5">
                <h4 className="text-sm font-medium text-white mb-3">4-7-8 Breathing Exercise</h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex">
                    <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">1</span>
                    <span>Exhale completely through your mouth</span>
                  </li>
                  <li className="flex">
                    <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">2</span>
                    <span>Inhale through your nose for 4 seconds</span>
                  </li>
                  <li className="flex">
                    <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">3</span>
                    <span>Hold your breath for 7 seconds</span>
                  </li>
                  <li className="flex">
                    <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">4</span>
                    <span>Exhale through mouth for 8 seconds</span>
                  </li>
                  <li className="flex">
                    <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">5</span>
                    <span>Repeat 4 times, twice daily</span>
                  </li>
                </ol>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm mb-2">Mind-Body Alignment Tip</h5>
                    <div className="flex items-start">
                      <span className="inline-block rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-sm">Fixed 2-minute meditation at 8:30 PM sends you a reminder with GPT prompt</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm mb-2">Sleep Aid Recommendation</h5>
                    <div className="flex items-start">
                      <span className="inline-block rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-sm">Your evening choice at 8:30 PM sends "2-min relaxation meditation"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Health Content */}
          {activeAspect === 'health' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🔥</span>
                <h3 className="text-lg font-medium">Body Fuel</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                This month's energy patterns suggest specific dietary and activity adjustments for optimal wellbeing.
              </p>
              
              {/* Monthly recommendations section */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Monthly Recommendations</h4>
                <p className="text-sm mb-3">Based on your deficient elements:</p>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">•</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">Earth deficiency</span> → Dietary suggestion: Add more root vegetables</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">•</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">Fire deficiency</span> → Activity suggestion: Add cardio exercise</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">•</span>
                  <div>
                    <p className="text-sm"><span className="font-medium">Water deficiency</span> → Sleep suggestion: Earlier bedtime</p>
                  </div>
                </div>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm mb-2">Weekly Exercise Plan</h5>
                    <div className="bg-purple-900/20 rounded-lg p-3">
                      <p className="text-xs mb-2">Personalized 3-part schedule for Week 1-4:</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">M</span>
                          <span className="text-xs">20 minute cardio</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">W</span>
                          <span className="text-xs">20 minute strength training</span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">F</span>
                          <span className="text-xs">20 minute flexibility</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Growth Content */}
          {activeAspect === 'growth' && (
            <div className="p-5">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🚀</span>
                <h3 className="text-lg font-medium">Growth Track</h3>
              </div>
              <p className="text-sm text-purple-200 mb-4">
                Your personal development energy peaks this month in specific areas aligned with your element patterns.
              </p>
              
              {/* 7-Day Challenge */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">7-Day Micro-Challenge</h4>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">1</span>
                  <div>
                    <p className="text-sm">Monthly wood element guidance (creativity): <span className="font-medium">Write 200 words daily</span></p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">2</span>
                  <div>
                    <p className="text-sm">Monthly metal element guidance (clarity): <span className="font-medium">Organize for 20 mins daily</span></p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">3</span>
                  <div>
                    <p className="text-sm">AI generates 7 daily prompts to guide your practice</p>
                  </div>
                </div>
              </div>
              
              {/* Pro Exclusive Section */}
              <div className="mt-5 pt-4 border-t border-purple-900/30">
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center mr-2 w-5 h-5 rounded-full bg-purple-900/50 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <h4 className="font-medium">Pro Exclusive</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm mb-2">Progress Tracker</h5>
                    <div className="flex items-start">
                      <span className="inline-block bg-purple-900/40 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-sm">Opt-in reminder at 9:00 PM: "Have you completed today's challenge?"</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-900/20 rounded-lg p-3 mt-3">
                    <h5 className="text-sm mb-2 font-medium">Key Reminders</h5>
                    <ol className="space-y-2 text-xs text-purple-200">
                      <li className="flex items-start">
                        <span className="font-medium mr-1">1.</span>
                        <span>Good days/bad days are influenced by your daily energy score and element balance</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-1">2.</span>
                        <span>Hour peaks follow daily score rankings, with scores ≥85 being the top 3 hours</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-1">3.</span>
                        <span>Activity suggestions: Wood → creative activities, Metal → organizational tasks</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-1">4.</span>
                        <span>Share time, scores & elements with AI for personalized recommendations</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Daily Energy Calendar with expandable view */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Daily Energy Calendar</h2>
          
          {/* Initial 5-day view */}
          {!showFullCalendar && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 1</div>
                  <div className="text-sm">8.3/10</div>
                  <div className="text-green-400 text-sm">🟢 Rising</div>
                </div>
                <p className="text-xs text-purple-200">Morning meditation enhances intuition and creativity</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('fire').bgColor} rounded-full text-white ${getCrystalForElement('fire').color}`}>
                    {getCrystalForElement('fire').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 2</div>
                  <div className="text-sm">7.2/10</div>
                  <div className="text-yellow-400 text-sm">🟡 Stable</div>
                </div>
                <p className="text-xs text-purple-200">Wear blue to amplify intuitive energy</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('water').bgColor} rounded-full text-white ${getCrystalForElement('water').color}`}>
                    {getCrystalForElement('water').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 3</div>
                  <div className="text-sm">6.5/10</div>
                  <div className="text-red-400 text-sm">🔴 Declining</div>
                </div>
                <p className="text-xs text-purple-200">Good day for important decisions</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('earth').bgColor} rounded-full text-white ${getCrystalForElement('earth').color}`}>
                    {getCrystalForElement('earth').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 4</div>
                  <div className="text-sm">5.8/10</div>
                  <div className="text-red-400 text-sm">🔴 Declining</div>
                </div>
                <p className="text-xs text-purple-200">Rest more, avoid high-intensity activities</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('metal').bgColor} rounded-full text-white ${getCrystalForElement('metal').color}`}>
                    {getCrystalForElement('metal').name}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">May 5</div>
                  <div className="text-sm">7.4/10</div>
                  <div className="text-green-400 text-sm">🟢 Rising</div>
                </div>
                <p className="text-xs text-purple-200">Ideal for socializing and building relationships</p>
                <div className="mt-1 flex items-center">
                  <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                  <span className={`text-xs px-2 py-0.5 ${getCrystalForElement('wood').bgColor} rounded-full text-white ${getCrystalForElement('wood').color}`}>
                    {getCrystalForElement('wood').name}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(true)}
                className="w-full mt-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                View Full Month Calendar ↓
              </button>
            </div>
          )}
          
          {/* Full 30-day view */}
          {showFullCalendar && (
            <div>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div key={day} className="border-b border-purple-900/30 pb-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">May {day}</div>
                      <div className="text-sm">{(7.5 + Math.sin(day/3) * 2.5).toFixed(1)}/10</div>
                      <div className={`text-sm ${day % 3 === 0 ? 'text-red-400' : day % 3 === 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {day % 3 === 0 ? '🔴 Declining' : day % 3 === 1 ? '🟢 Rising' : '🟡 Stable'}
                      </div>
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                      {day % 5 === 0 ? 'Focus on creativity and expression' : 
                       day % 5 === 1 ? 'Ideal for strategic planning and decisions' :
                       day % 5 === 2 ? 'Energy flows toward relationship building' :
                       day % 5 === 3 ? 'Best for practical tasks and organization' :
                       'Good balance between activity and rest'}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                      <span className={`text-xs px-2 py-0.5 ${getCrystalForElement(getDailyElement(day)).bgColor} rounded-full text-white ${getCrystalForElement(getDailyElement(day)).color}`}>
                        {getCrystalForElement(getDailyElement(day)).name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="w-full mt-3 py-1.5 bg-purple-900/50 hover:bg-purple-800/50 rounded-md text-sm font-medium text-purple-200"
              >
                Show Less ↑
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="text-center text-sm text-purple-300 mt-8">
          <p className="mt-1">This report weaves together almost 4,000 years of evolving Chinese Five-Element Feng Shui, evidence-backed modern science, and the freshest AI intelligence—ancient wisdom, updated for your everyday life.</p>
          
          {/* Feedback Section */}
          <div className="mt-6 mb-4 flex flex-col items-center">
            <p className="text-sm mb-3">Did this report feel helpful to you?</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => openFeedbackModal('positive')}
                className="flex items-center px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors"
              >
                <span className="mr-2 text-lg">👍</span>
                <span>Yes</span>
              </button>
              <button 
                onClick={() => openFeedbackModal('negative')}
                className="flex items-center px-4 py-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/50 transition-colors"
              >
                <span className="mr-2 text-lg">👎</span>
                <span>Not really</span>
              </button>
            </div>
          </div>
          
          <p className="mt-3">© 2025 CrystalMatch</p>
        </footer>
        
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {feedbackType === 'positive' ? (
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">👍</span> Awesome! What did you find most helpful?
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">👎</span> Sorry to hear that. What didn't work for you?
                    </span>
                  )}
                </h3>
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                {feedbackType === 'positive' ? (
                  <>
                    <div className="flex items-start">
                      <input 
                        id="option1" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('The energy forecast felt accurate')}
                        onChange={() => handleOptionSelect('The energy forecast felt accurate')}
                      />
                      <label htmlFor="option1" className="text-sm">The energy forecast felt accurate</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option2" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('The daily suggestions were actionable')}
                        onChange={() => handleOptionSelect('The daily suggestions were actionable')}
                      />
                      <label htmlFor="option2" className="text-sm">The daily suggestions were actionable</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option3" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('I liked the crystal and timing tips')}
                        onChange={() => handleOptionSelect('I liked the crystal and timing tips')}
                      />
                      <label htmlFor="option3" className="text-sm">I liked the crystal and timing tips</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option4" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('The tone felt encouraging and supportive')}
                        onChange={() => handleOptionSelect('The tone felt encouraging and supportive')}
                      />
                      <label htmlFor="option4" className="text-sm">The tone felt encouraging and supportive</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option5" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('It matched how I actually felt')}
                        onChange={() => handleOptionSelect('It matched how I actually felt')}
                      />
                      <label htmlFor="option5" className="text-sm">It matched how I actually felt</label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start">
                      <input 
                        id="option1" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('The forecast didn\'t feel accurate')}
                        onChange={() => handleOptionSelect('The forecast didn\'t feel accurate')}
                      />
                      <label htmlFor="option1" className="text-sm">The forecast didn't feel accurate</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option2" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('Suggestions were too vague')}
                        onChange={() => handleOptionSelect('Suggestions were too vague')}
                      />
                      <label htmlFor="option2" className="text-sm">Suggestions were too vague</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option3" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('Felt too generic, not personal')}
                        onChange={() => handleOptionSelect('Felt too generic, not personal')}
                      />
                      <label htmlFor="option3" className="text-sm">Felt too generic, not personal</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option4" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('Tone felt too negative or unclear')}
                        onChange={() => handleOptionSelect('Tone felt too negative or unclear')}
                      />
                      <label htmlFor="option4" className="text-sm">Tone felt too negative or unclear</label>
                    </div>
                    <div className="flex items-start">
                      <input 
                        id="option5" 
                        type="checkbox" 
                        className="mt-1 mr-2"
                        checked={selectedOptions.includes('Didn\'t reflect my actual energy or mood')}
                        onChange={() => handleOptionSelect('Didn\'t reflect my actual energy or mood')}
                      />
                      <label htmlFor="option5" className="text-sm">Didn't reflect my actual energy or mood</label>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="additional-feedback" className="block text-sm mb-2">Any other thoughts?</label>
                <textarea 
                  id="additional-feedback"
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  className="w-full bg-purple-950/70 border border-purple-800 rounded-md p-2 text-sm text-white"
                  rows={3}
                ></textarea>
              </div>
              
              {submitError && (
                <div className="mb-4 text-red-300 text-sm">
                  {submitError}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-sm font-medium transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    feedbackType === 'positive' ? "Thanks! We'll keep improving your insights 🔮" : "Thanks for your feedback. We'll fine-tune future reports just for you 💜"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Wrap component with Suspense to solve useSearchParams requirement
export default function MayReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <MayReportContent />
    </Suspense>
  );
} 