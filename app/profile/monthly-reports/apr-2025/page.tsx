/**
 * April 2025 Monthly Deep Report Page - Plus Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Type for element
type ElementType = 'water' | 'fire' | 'earth' | 'metal' | 'wood';

// Add GPT Report interface
interface GPTReport {
  title?: string;
  insight?: string;
  challenges?: string[];
  crystals?: Array<{name: string, benefit: string}>;
  ritual?: string;
  guidance?: string[];
  loading: boolean;
  error?: string;
}

// Extract useSearchParams component to a separate component
function AprilReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  
  // Calculate date range (US format: MM/DD/YYYY)
  const startDate = "04/01/2025";
  const endDate = "04/30/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for active aspect
  const [activeAspect, setActiveAspect] = useState('growth');
  
  // State for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // State for GPT generated report content
  const [gptReport, setGptReport] = useState<GPTReport>({
    loading: true,
  });

  // Fetch GPT report data when component loads
  useEffect(() => {
    async function fetchReportData() {
      try {
        console.log('Fetching report data for April 2025...');
        const response = await fetch(`/api/reports/2025-04?birthDate=${encodeURIComponent(birthDate || '1990-01-01')}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'x-tier': 'plus' // Ensure we get plus-level content
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received report data:', data);

        if (data.report) {
          // Parse the markdown content
          const reportContent = data.report;
          
          // Extract title
          const titleMatch = reportContent.match(/# 🔮 .* — (.*)/);
          const title = titleMatch ? titleMatch[1] : 'Energy Rising';
          
          // Extract insight
          const insightMatch = reportContent.match(/## 🌟 Energy Insight\n([\s\S]*?)(?=##)/);
          const insight = insightMatch ? insightMatch[1].trim() : '';
          
          // Extract challenges
          const challengesMatch = reportContent.match(/## ⚠️ (?:Potential )?Challenges\n([\s\S]*?)(?=##)/);
          const challengesText = challengesMatch ? challengesMatch[1] : '';
          const challenges = challengesText
            .split('\n')
            .filter((line: string) => line.trim().startsWith('-'))
            .map((line: string) => line.replace('-', '').trim());
          
          // Extract crystals
          const crystalsMatch = reportContent.match(/## 💎 (?:Monthly )?Crystals(?: to Consider)?\n([\s\S]*?)(?=##)/);
          const crystalsText = crystalsMatch ? crystalsMatch[1] : '';
          const crystals = crystalsText
            .split('\n')
            .filter((line: string) => line.trim().startsWith('-'))
            .map((line: string) => {
              const parts = line.replace('-', '').trim().split('—');
              return {
                name: parts[0].trim(),
                benefit: parts.length > 1 ? parts[1].trim() : ''
              };
            });
          
          // Extract ritual
          const ritualMatch = reportContent.match(/## ✨ (?:Ritual|Practice)(?: to Explore)?.*\n([\s\S]*?)(?=##|$)/);
          const ritual = ritualMatch ? ritualMatch[1].trim() : '';
          
          // Extract guidance
          const guidanceMatch = reportContent.match(/## 🧭 Monthly (?:Guidance|Possibilities)\n([\s\S]*?)(?=$)/);
          const guidanceText = guidanceMatch ? guidanceMatch[1] : '';
          const guidance = guidanceText
            .split('\n')
            .filter((line: string) => line.trim().startsWith('✅') || line.trim().startsWith('🚫'))
            .map((line: string) => line.trim());
          
          setGptReport({
            title,
            insight,
            challenges,
            crystals,
            ritual,
            guidance,
            loading: false
          });
        } else {
          throw new Error('Report data is missing');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setGptReport({
          loading: false,
          error: 'Failed to load report. Please try again later.'
        });
      }
    }

    fetchReportData();
  }, [birthDate]);
  
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
        reportType: 'Plus - April 2025', // 当前报告类型
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
  
  // Show loading state if the report is still loading
  if (gptReport.loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-800 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-t-2 border-indigo-500 border-r-2 rounded-full mb-4"></div>
            <p>Loading your personalized energy report...</p>
          </div>
        </div>
      </main>
    );
  }
  
  // Show error state if there was an error loading the report
  if (gptReport.error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-800 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-xl mb-2">Report Generation Error</p>
            <p>{gptReport.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-800 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Plus)</h1>
          <p className="text-indigo-300 mt-1">{dateRange}</p>
        </header>
        
        {/* Back button */}
        <div className="mb-6">
          <Link href="/profile" className="text-indigo-300 hover:text-white flex items-center w-fit">
            ← Back to Profile
          </Link>
        </div>
        
        {/* Energy Overview */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">Energy Overview</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">76 / 100</div>
            <div className="mt-1 text-indigo-300">{gptReport.title || "Balance Focus"} ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full" 
                style={{ width: "76%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                  🌿 Wood
                </span>
              </div>
              <div className="text-xs text-green-300 mt-1 font-medium">Growth Energy</div>
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  🪨 Earth
                </span>
              </div>
              <div className="text-xs text-yellow-300 mt-1 font-medium">Stability Energy</div>
            </div>
          </div>
        </div>

        {/* Crystal Recommendations */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4 text-center">Crystal Recommendations</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-900/20 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Primary Crystal</h3>
              <div className="flex items-center mb-1.5">
                <span className="text-lg mr-2">💎</span>
                <span className="text-sm">{gptReport.crystals && gptReport.crystals[0] ? gptReport.crystals[0].name : "Amethyst"}</span>
              </div>
              <p className="text-xs text-indigo-200">
                {gptReport.crystals && gptReport.crystals[0] ? gptReport.crystals[0].benefit : "Enhances intuition and balances emotional fluctuations"}
              </p>
            </div>
            
            <div className="bg-indigo-900/20 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-1">Support Crystal</h3>
              <div className="flex items-center mb-1.5">
                <span className="text-lg mr-2">💎</span>
                <span className="text-sm">{gptReport.crystals && gptReport.crystals[1] ? gptReport.crystals[1].name : "Aquamarine"}</span>
              </div>
              <p className="text-xs text-indigo-200">
                {gptReport.crystals && gptReport.crystals[1] ? gptReport.crystals[1].benefit : "Calms overthinking and enhances clear communication"}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Crystal Placement</h3>
            <p className="text-xs text-indigo-300">
              {gptReport.ritual ? gptReport.ritual.split('.')[0] + '.' : "Place your primary crystal on your workspace during morning hours. Keep your support crystal near your bed to enhance dream clarity and promote restful sleep."}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-indigo-900/30">
            <h3 className="font-medium text-sm mb-2">Crystal Insight</h3>
            <div className="flex items-start">
              <span className="text-indigo-300 mr-2 mt-0.5">✦</span>
              <p className="text-xs text-indigo-300">
                {gptReport.challenges ? gptReport.challenges[0] : "Your energy this month responds particularly well to blue and purple crystals, which can help stabilize the rapid fluctuations you'll experience."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-indigo-900/80 rounded-xl max-w-md w-full p-5 shadow-xl">
              <h3 className="text-lg font-semibold mb-3">
                {feedbackType === 'report' ? 'Report Feedback' : 'Share Your Thoughts'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">What did you think?</label>
                  <div className="space-y-2">
                    {['Very helpful', 'Somewhat accurate', 'Not accurate', 'Need more details'].map(option => (
                      <div key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`option-${option}`}
                          checked={selectedOptions.includes(option)}
                          onChange={() => handleOptionSelect(option)}
                          className="mr-2 rounded"
                        />
                        <label htmlFor={`option-${option}`} className="text-sm">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="additional-feedback" className="text-sm font-medium block mb-2">Additional comments</label>
                  <textarea
                    id="additional-feedback"
                    rows={3}
                    value={additionalFeedback}
                    onChange={(e) => setAdditionalFeedback(e.target.value)}
                    className="w-full bg-indigo-800/50 border border-indigo-700 rounded-md px-3 py-2 text-sm placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Share any additional thoughts..."
                  />
                </div>
                
                {submitError && (
                  <div className="text-red-400 text-sm">{submitError}</div>
                )}
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition-colors disabled:bg-indigo-800 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Wrap component with Suspense to solve useSearchParams requirement
export default function AprilReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <AprilReportContent />
    </Suspense>
  );
} 