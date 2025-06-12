/**
 * May 2025 Monthly Deep Report Page - Pro Version
 */
'use client';

// Set page to dynamic rendering, disable static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Import marked for Markdown parsing
import { marked } from 'marked';

// Only keep FiveElementVector type for compatibility
import { FiveElementVector } from '@/app/lib/energyCalculation2025';
import { ENERGY_CONFIG, type ElementType } from '@/app/lib/energyCalculationConfig';
import { getCrystalForElement, getElementIcon, getElementDescription, getElementColorClass } from '@/app/lib/elementHelpers';

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
  errorDetails?: any;   // Detailed error information
  energyScore?: number;
  strongestElement?: ElementType;
  weakestElement?: ElementType;
  deficientElements?: ElementType[]; // Backend-provided deficient elements
  periodStart?: string; // API-provided date range start
  periodEnd?: string; // API-provided date range end
  generatedTime?: string; // Report generation time
}

// Real energy data interfaces
interface DailyEnergyData {
  date: Date;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  element?: ElementType;
  crystal?: string;
  score?: number; // Add score field
}

interface HourlyEnergyData {
  hour: number;
  energyChange: number;
  trend: 'up' | 'down' | 'stable';
  score?: number;
}

// Use constants from config
const { HOUR_THRESHOLD, ELEMENT_THRESHOLD, ELEMENT_ACTIVITIES, ELEMENT_EXERCISES, ELEMENT_CHALLENGES } = ENERGY_CONFIG;

// Extract useSearchParams component to a separate component
function MayReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate');
  
  // Redirect to profile if no birthDate
  useEffect(() => {
    if (!birthDate) {
      window.location.href = '/profile';
      return;
    }
  }, [birthDate]);
  
  // State for expanding the full calendar
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // State for active aspect tab
  const [activeAspect, setActiveAspect] = useState<string>('relationship');

  // State for GPT generated report content
  const [gptReport, setGptReport] = useState<GPTReport>({
    loading: true,
  });
  
  // Add state for parsed report sections
  const [reportSections, setReportSections] = useState<{[key: string]: string}>({
    finance: '',
    relationship: '',
    mood: '',
    health: '',
    growth: ''
  });
  
  // State for real energy data
  const [dailyEnergyData, setDailyEnergyData] = useState<DailyEnergyData[]>([]);
  const [hourlyEnergyData, setHourlyEnergyData] = useState<HourlyEnergyData[]>([]);
  const [energyDataLoading, setEnergyDataLoading] = useState(true);
  
  // State for user's element deficiencies (for mood/health calculations)
  const [userElements, setUserElements] = useState<FiveElementVector | null>(null);
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    meditationReminder: false,
    sleepReminder: false,
    challengeReminder: false,
  });
  
  // State for feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Fetch all data from a single API endpoint
  useEffect(() => {
    async function fetchAllData() {
      try {
        setEnergyDataLoading(true);
        console.log('🔄 Fetching May 2025 report data...');
        
        // Use dynamic API path based on URL slug
        const pathMatch = window.location.pathname.match(/\/monthly-reports\/([a-z]+-\d{4})/i);
        const slug = pathMatch ? pathMatch[1] : 'may-2025';
        console.log('📌 Detected slug from URL:', slug);
        
        // Convert month-year format to year-month format for API
        let apiSlug = slug;
        if (/^([a-z]+)-(\d{4})$/i.test(slug)) {
          const [month, year] = slug.split('-');
          const monthMap: Record<string, string> = {
            'january': '01', 'jan': '01',
            'february': '02', 'feb': '02',
            'march': '03', 'mar': '03',
            'april': '04', 'apr': '04',
            'may': '05',
            'june': '06', 'jun': '06',
            'july': '07', 'jul': '07',
            'august': '08', 'aug': '08',
            'september': '09', 'sep': '09',
            'october': '10', 'oct': '10',
            'november': '11', 'nov': '11',
            'december': '12', 'dec': '12'
          };
          const monthNum = monthMap[month.toLowerCase()];
          if (monthNum) {
            apiSlug = `${year}-${monthNum}`;
            console.log('📌 Converted slug for API:', apiSlug);
          }
        }
        
        const apiUrl = `/api/report/${apiSlug}${birthDate ? `?birthDate=${encodeURIComponent(birthDate)}` : ''}`;
        console.log('📌 API URL:', apiUrl);
        
        const res = await fetch(apiUrl, { 
          cache: 'no-store'
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `API request failed: ${res.status}`;
          console.error('API Error Details:', errorData);
          throw new Error(errorMessage);
        }
        
        // Parse all data returned from the API
        const data = await res.json();
        console.log('📊 API returned data structure:', Object.keys(data));
        
        if (data.error) {
          throw new Error(data.message || data.error);
        }
        
        // Extract various parts of data returned from the API
        const { overview, daily, hourly, report: reportText } = data;
        
        // Update component state
        setGptReport({ ...overview, loading: false });
        setDailyEnergyData(daily || []);
        setHourlyEnergyData(hourly || []);
        setUserElements(overview?.vector || null);
        
        // Date range will be used directly from gptReport.periodStart/periodEnd
        
        // Convert Markdown report to HTML
        if (reportText) {
          try {
            // Parse and divide the report into sections
            const sectionHeaders = {
              finance: '## 💰 Money Flow',
              relationship: '## 👥 Social Vibes',
              mood: '## 🌙 Mood Balance',
              health: '## 🔥 Body Fuel',
              growth: '## 🚀 Growth Track'
            };
            
            const parsedSections: {[key: string]: string} = {
              finance: '',
              relationship: '',
              mood: '',
              health: '',
              growth: ''
            };
            
            // Function to extract section content between headers
            const extractSection = (text: string, startHeader: string, endHeaders: string[]): string => {
              const startIndex = text.indexOf(startHeader);
              if (startIndex === -1) return '';
              
              let endIndex = text.length;
              for (const header of endHeaders) {
                const idx = text.indexOf(header, startIndex + startHeader.length);
                if (idx !== -1 && idx < endIndex) {
                  endIndex = idx;
                }
              }
              
              return text.substring(startIndex + startHeader.length, endIndex).trim();
            };
            
            // Extract each section
            const remainingHeaders = Object.values(sectionHeaders);
            Object.entries(sectionHeaders).forEach(([key, header], index) => {
              const endHeaders = remainingHeaders.slice(index + 1);
              const sectionContent = extractSection(reportText, header, endHeaders);
              parsedSections[key] = sectionContent;
              console.log(`Extracted ${key} section, length: ${sectionContent.length}`);
            });
            
            // Set the parsed sections
            setReportSections(parsedSections);
            
            // Use a simpler synchronous approach with marked for full report HTML
            const html = marked.parse(reportText.toString()) as string;
            setReportHTML(html);
            console.log('📄 Markdown report parsed to HTML and sections extracted');
          } catch (error) {
            console.error('Markdown parsing failed:', error);
            setReportHTML('');
          }
        }
        
        console.log('✅ Data loading complete');
        
      } catch (error) {
        console.error('❌ Data loading failed:', error);
        setGptReport({
          loading: false,
          error: error instanceof Error ? error.message : 'Loading failed'
        });
      } finally {
        setEnergyDataLoading(false);
      }
    }
    
    fetchAllData();
  }, [birthDate]);

  // Memoized calculations to avoid re-computation on tab switching
  const moodPeakDays = useMemo((): number[] => {
    if (!dailyEnergyData || dailyEnergyData.length === 0) return [];
    
    return dailyEnergyData
      .filter(day => day.score !== undefined)
      .map((day, index) => ({ 
        index: index + 1, 
        score: day.score!
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, ENERGY_CONFIG.MAX_PEAK_DAYS)
      .map(item => item.index);
  }, [dailyEnergyData]);

  const moodLowDays = useMemo((): number[] => {
    if (!dailyEnergyData || dailyEnergyData.length === 0) return [];
    
    return dailyEnergyData
      .filter(day => day.score !== undefined)
      .map((day, index) => ({ 
        index: index + 1, 
        score: day.score!
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, ENERGY_CONFIG.MAX_LOW_DAYS)
      .map(item => item.index);
  }, [dailyEnergyData]);

  const deficientElements = useMemo((): ElementType[] => {
    // If backend provides deficient elements directly, use that
    if (gptReport.deficientElements && Array.isArray(gptReport.deficientElements)) {
      return gptReport.deficientElements;
    }
    
    // Fallback: calculate from vector if available
    if (userElements && userElements.water !== undefined) {
      const elements: ElementType[] = [];
      
      if (userElements.water < ELEMENT_THRESHOLD) elements.push('water');
      if (userElements.fire < ELEMENT_THRESHOLD) elements.push('fire');
      if (userElements.earth < ELEMENT_THRESHOLD) elements.push('earth');
      if (userElements.metal < ELEMENT_THRESHOLD) elements.push('metal');
      if (userElements.wood < ELEMENT_THRESHOLD) elements.push('wood');
      
      return elements;
    }
    
    return [];
  }, [gptReport.deficientElements, userElements]);

  // Notification management functions
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const scheduleNotification = async (type: 'meditation' | 'sleep' | 'challenge', time: string) => {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      alert('Please enable notifications to receive reminders');
      return false;
    }

    // Store notification preference in localStorage
    const currentSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    const updatedSettings = { ...currentSettings, [`${type}Reminder`]: true };
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
    
    // Schedule the notification (simplified - in production would use service worker)
    const scheduleTime = new Date();
    const [hours, minutes] = time.split(':');
    scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduleTime < new Date()) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    console.log(`🔔 Notification scheduled: ${type} reminder at ${time}`);
    return true;
  };

  const toggleNotification = async (type: 'meditation' | 'sleep' | 'challenge', time: string) => {
    const settingKey = `${type}Reminder` as keyof typeof notificationSettings;
    const currentValue = notificationSettings[settingKey];
    
    if (!currentValue) {
      const success = await scheduleNotification(type, time);
      if (success) {
        setNotificationSettings(prev => ({ ...prev, [settingKey]: true }));
        
        // Show confirmation
        const messages = {
          meditation: 'Meditation reminder set for 8:30 PM daily',
          sleep: 'Sleep meditation reminder set for 8:30 PM daily', 
          challenge: 'Challenge reminder set for 9:00 PM daily'
        };
        alert(`✅ ${messages[type]}`);
      }
    } else {
      setNotificationSettings(prev => ({ ...prev, [settingKey]: false }));
      // Remove from localStorage
      const currentSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
      delete currentSettings[settingKey];
      localStorage.setItem('notificationSettings', JSON.stringify(currentSettings));
      alert('🔕 Notification reminder disabled');
    }
  };

  // Load notification settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    setNotificationSettings({
      meditationReminder: savedSettings.meditationReminder || false,
      sleepReminder: savedSettings.sleepReminder || false,
      challengeReminder: savedSettings.challengeReminder || false,
    });
  }, []);

  // 需要添加一个状态来存储Markdown报告
  const [reportHTML, setReportHTML] = useState<string>('');

  // Use imported element helper functions from elementHelpers.ts
  
  // 辅助函数 - 获取健康建议
  const getHealthRecommendations = () => {
    const recommendations = [];

    if (deficientElements.includes('earth')) {
      recommendations.push({ element: 'Earth deficiency', suggestion: 'Add more root vegetables', type: 'Dietary' });
    }
    if (deficientElements.includes('fire')) {
      recommendations.push({ element: 'Fire deficiency', suggestion: 'Add cardio exercise', type: 'Activity' });
    }
    if (deficientElements.includes('water')) {
      recommendations.push({ element: 'Water deficiency', suggestion: 'Earlier bedtime', type: 'Sleep' });
    }
    if (deficientElements.includes('metal')) {
      recommendations.push({ element: 'Metal deficiency', suggestion: 'Deep breathing exercises', type: 'Respiratory' });
    }
    if (deficientElements.includes('wood')) {
      recommendations.push({ element: 'Wood deficiency', suggestion: 'Morning stretching routine', type: 'Flexibility' });
    }

    return recommendations.slice(0, 3); // 限制为3条建议
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
      
      // Get user ID if available
      const userId = localStorage.getItem('userId') || 'anonymous';
      
      // Prepare data to send
      const feedbackData = {
        userId,
        feedbackType,
        reportType: 'Pro - Growth Track', // Current report type
        content: additionalFeedback,
        options: selectedOptions
      };
      
      // Send to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
      
      // Successfully submitted
      console.log('Feedback submitted successfully');
      
      // Reset and close modal
      setAdditionalFeedback('');
      setSelectedOptions([]);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state if the report is still loading
  if (gptReport.loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-t-2 border-purple-500 border-r-2 rounded-full mb-4"></div>
            <p>Loading your personalized energy report...</p>
          </div>
        </div>
      </main>
    );
  }
  
  // Show error state if there was an error loading the report
  if (gptReport.error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
        <div className="max-w-md mx-auto flex items-center justify-center h-[80vh]">
          <div className="text-center space-y-4">
            <div className="text-red-500 text-4xl">🔧</div>
            <h2 className="text-xl font-semibold">Report Temporarily Unavailable</h2>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-left">
              <p className="text-sm text-red-200 mb-2">Details:</p>
              <p className="text-xs text-red-300 font-mono">{gptReport.error}</p>
              {gptReport.errorDetails && gptReport.errorDetails.timestamp && (
                <p className="text-xs text-red-300 mt-2">
                  Time: {new Date(gptReport.errorDetails.timestamp).toLocaleString()}
                </p>
              )}
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-left">
              <p className="text-sm text-yellow-200 mb-2">💡 Information:</p>
              <ul className="text-xs text-yellow-300 space-y-1">
                <li>• Our report generation service is currently experiencing issues</li>
                <li>• Your request has been logged and we're working on it</li>
                <li>• This is usually resolved within a few minutes</li>
                <li>• Please try again later</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md text-sm font-medium transition-colors"
              >
                🔄 Try Again
              </button>
              <Link 
                href="/profile"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                ← Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }


  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report (Pro)</h1>
          <p className="text-purple-300 mt-1">{
            gptReport.periodStart && gptReport.periodEnd 
              ? `${gptReport.periodStart} - ${gptReport.periodEnd}` 
              : "Loading..."
          }</p>
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
            <div className="text-3xl font-bold">{gptReport.energyScore ? `${gptReport.energyScore} / 100` : '--'}</div>
            <div className="mt-1 text-purple-300">{gptReport.title || "Loading..."} ✨</div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: `${gptReport.energyScore || 0}%` }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">Strongest Element</div>
              {gptReport.strongestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gptReport.strongestElement).bg} ${getElementColorClass(gptReport.strongestElement).text}`}>
                      {getElementIcon(gptReport.strongestElement)} {gptReport.strongestElement.charAt(0).toUpperCase() + gptReport.strongestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gptReport.strongestElement).text}`}>
                    {getElementDescription(gptReport.strongestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
            <div className="text-center">
              <div className="font-medium">Weakest Element</div>
              {gptReport.weakestElement ? (
                <>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getElementColorClass(gptReport.weakestElement).bg} ${getElementColorClass(gptReport.weakestElement).text}`}>
                      {getElementIcon(gptReport.weakestElement)} {gptReport.weakestElement.charAt(0).toUpperCase() + gptReport.weakestElement.slice(1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 font-medium ${getElementColorClass(gptReport.weakestElement).text}`}>
                    {getElementDescription(gptReport.weakestElement)}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 mt-1">Loading...</div>
              )}
            </div>
          </div>
        </div>

        {/* Five Life Aspects Section - Navigation Tabs */}
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
              
              {/* Render GPT-generated finance content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.finance ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.finance) as string }} />
                ) : gptReport.insight ? (
                  <p>{gptReport.insight}</p>
                ) : gptReport.loading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Generating financial insights...</p>
                  </div>
                ) : gptReport.error ? (
                  <p className="text-xs text-red-400">Unable to load financial insights</p>
                ) : null}
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
                  {energyDataLoading ? (
                    <div className="text-center py-2">
                      <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                      <p className="text-xs text-purple-300">Loading hourly energy data...</p>
                    </div>
                  ) : (
                    hourlyEnergyData
                      .filter(hour => hour.score && hour.score >= HOUR_THRESHOLD) // Use constant threshold
                      .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by score descending
                      .slice(0, ENERGY_CONFIG.MAX_HIGH_ENERGY_HOURS) // Take top high energy hours
                      .map((hour, index) => {
                        const hourTime = `${hour.hour}:00`;
                        const endTime = `${hour.hour + 2}:00`;
                        
                        // Generate activity suggestions based on strongest element
                        const getActivitySuggestion = () => {
                          if (gptReport.strongestElement) {
                            return ELEMENT_ACTIVITIES[gptReport.strongestElement]?.[index] || 'important tasks';
                          }
                          return 'high-energy tasks';
                        };
                        
                        return (
                          <div key={hour.hour}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="inline-block bg-yellow-900/30 rounded-full p-1 mr-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span className="text-xs">{hourTime}–{endTime}</span>
                              </div>
                              <div>
                                <span className="text-xs font-medium">Score {hour.score}</span>
                              </div>
                            </div>
                            <p className="text-xs text-purple-200 pl-6">Best for {getActivitySuggestion()}</p>
                          </div>
                        );
                      })
                  )}
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
              
              {/* Render GPT-generated social vibes content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.relationship ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.relationship) as string }} />
                ) : (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Loading relationship insights...</p>
                  </div>
                )}
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
                  {energyDataLoading ? (
                    <div className="text-center py-2">
                      <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                      <p className="text-xs text-purple-300">Loading hourly energy data...</p>
                    </div>
                  ) : (
                    hourlyEnergyData
                      .filter(hour => hour.score && hour.score >= HOUR_THRESHOLD) // Use constant threshold
                      .sort((a, b) => (b.score || 0) - (a.score || 0)) // Sort by score descending
                      .slice(0, ENERGY_CONFIG.MAX_HIGH_ENERGY_HOURS) // Take top high energy hours
                      .map((hour, index) => {
                        // 使用能量峰值日期而不是固定日期
                        const peakDays = moodPeakDays;
                        const dayNum = peakDays[index] || (index + 1);
                        const hourTime = `${hour.hour}:00`;
                        const endTime = `${hour.hour + 2}:00`;
                        const activities = ['deep conversations', 'relationship building', 'social gatherings'];
                        
                        return (
                          <div key={hour.hour} className={index === 0 ? "mt-3" : ""}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="inline-block bg-blue-900/30 rounded-full p-1 mr-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <span className="text-xs">Day {dayNum}, {hourTime}–{endTime}</span>
                              </div>
                              <div>
                                <span className="text-xs font-medium">Score {hour.score}</span>
                              </div>
                            </div>
                            <p className="text-xs text-purple-200 pl-6">{index === 0 ? 'Perfect' : index === 1 ? 'Ideal' : 'Excellent'} for {activities[index] || 'social connection'}</p>
                          </div>
                        );
                      })
                  )}
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
              
              {/* Render GPT-generated mood content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.mood ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.mood) as string }} />
                ) : (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Loading mood insights...</p>
                  </div>
                )}
              </div>
              
              {/* Mood peak periods */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Mood Peaks</h4>
                {energyDataLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Calculating mood patterns...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-0.5">✓</span>
                      <div>
                        <p className="text-sm"><span className="font-medium">Top {ENERGY_CONFIG.MAX_PEAK_DAYS} days this month:</span> Day {moodPeakDays.join(', Day ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-0.5">✓</span>
                      <div>
                        <p className="text-sm">
                                              {deficientElements.length > 0
                      ? `Focus on strengthening ${deficientElements[0]} element during these peak days`
                            : 'Your elemental balance is strong - leverage these peak days for emotional breakthroughs'
                          }
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Mood low periods */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">Mood Valleys</h4>
                {energyDataLoading ? (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Analyzing low energy periods...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start">
                      <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                      <div>
                        <p className="text-sm"><span className="font-medium">Day {moodLowDays.join(' and Day ')}</span>: Low emotional energy days</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-yellow-400 mr-2 mt-0.5">⚠</span>
                      <div>
                        <p className="text-sm">
                          {deficientElements.length > 0 
                            ? `${deficientElements.join(' or ')} deficient hours may intensify emotional challenges`
                            : 'Extra self-care recommended during these valley periods'
                          }
                        </p>
                      </div>
                    </div>
                  </>
                )}
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
                      <div className="flex-1">
                        <p className="text-sm">Fixed 2-minute meditation at 8:30 PM sends you a reminder with GPT prompt</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => toggleNotification('meditation', '20:30')}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                              notificationSettings.meditationReminder ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                notificationSettings.meditationReminder ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="ml-2 text-xs text-purple-300">
                            {notificationSettings.meditationReminder ? 'Notifications ON' : 'Enable notifications'}
                          </span>
                        </div>
                      </div>
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
                      <div className="flex-1">
                        <p className="text-sm">Your evening choice at 8:30 PM sends "2-min relaxation meditation"</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => toggleNotification('sleep', '20:30')}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                              notificationSettings.sleepReminder ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                notificationSettings.sleepReminder ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="ml-2 text-xs text-purple-300">
                            {notificationSettings.sleepReminder ? 'Notifications ON' : 'Enable notifications'}
                          </span>
                        </div>
                      </div>
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
              
              {/* Render GPT-generated health content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.health ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.health) as string }} />
                ) : (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Loading health insights...</p>
                  </div>
                )}
              </div>
              
              {/* Monthly recommendations section - only show if we have element data */}
              {userElements && userElements.water !== undefined ? (
                <>
                  
                  <div className="space-y-3 mb-5">
                    <h4 className="text-sm font-medium text-white mb-2">Monthly Recommendations</h4>
                    {energyDataLoading ? (
                      <div className="text-center py-2">
                        <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                        <p className="text-xs text-purple-300">Analyzing elemental deficiencies...</p>
                      </div>
                    ) : (
                      <>
                        {getHealthRecommendations().length > 0 ? (
                          getHealthRecommendations().map((rec, index) => (
                            <div key={index} className="flex items-start">
                              <span className="text-green-400 mr-2 mt-0.5">•</span>
                              <div>
                                <p className="text-sm"><span className="font-medium">{rec.element}</span> → {rec.type} suggestion: {rec.suggestion}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start">
                            <span className="text-green-400 mr-2 mt-0.5">✓</span>
                            <div>
                              <p className="text-sm">Your elemental balance is excellent! Focus on maintaining current healthy habits.</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : null}
              
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
                      {reportHTML ? (
                        <div className="text-xs" dangerouslySetInnerHTML={{ __html: reportHTML }} />
                      ) : userElements ? (
                        <>
                          <p className="text-xs mb-2">Based on your elemental balance:</p>
                          <div className="space-y-2">
                            {deficientElements.slice(0, 3).map((element: ElementType, index: number) => {
                              const days = ['M', 'W', 'F']; // Exercise days pattern
                              return (
                                <div key={element} className="flex items-center">
                                  <span className="inline-block bg-purple-900/30 rounded-full h-5 w-5 flex items-center justify-center mr-2 text-xs">{days[index]}</span>
                                  <span className="text-xs">20 min {ENERGY_CONFIG.ELEMENT_EXERCISES[element] || 'balanced exercise'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : null}
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
              
              {/* Render GPT-generated growth content */}
              <div className="text-sm text-purple-200 mb-4">
                {reportSections.growth ? (
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(reportSections.growth) as string }} />
                ) : (
                  <div className="text-center py-2">
                    <div className="animate-spin inline-block w-4 h-4 border-t-2 border-purple-500 border-r-2 rounded-full mb-1"></div>
                    <p className="text-xs text-purple-300">Loading growth insights...</p>
                  </div>
                )}
              </div>
              
              {/* 7-Day Challenge - Dynamic based on GPT content or element analysis */}
              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-medium text-white mb-2">7-Day Micro-Challenge</h4>
                
                {reportHTML ? (
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: reportHTML }} />
                ) : userElements ? (
                  <div className="space-y-3">
                    {deficientElements.slice(0, 2).map((element: ElementType, index: number) => {
                      const challenge = ENERGY_CONFIG.ELEMENT_CHALLENGES[element];
                      return (
                        <div key={element} className="flex items-start">
                          <span className="text-green-400 mr-2 mt-0.5">{index + 1}</span>
                          <div>
                            <p className="text-sm">Monthly {element} element guidance ({challenge.description}): <span className="font-medium">{challenge.activity}</span></p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-0.5">{deficientElements.length + 1}</span>
                      <div>
                        <p className="text-sm">AI generates 7 daily prompts to guide your practice</p>
                      </div>
                    </div>
                  </div>
                ) : null}
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
                      <div className="flex-1">
                        <p className="text-sm">Opt-in reminder at 9:00 PM: "Have you completed today's challenge?"</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => toggleNotification('challenge', '21:00')}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                              notificationSettings.challengeReminder ? 'bg-purple-600' : 'bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                notificationSettings.challengeReminder ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className="ml-2 text-xs text-purple-300">
                            {notificationSettings.challengeReminder ? 'Notifications ON' : 'Enable notifications'}
                          </span>
                        </div>
                      </div>
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
                        <span>Hour peaks follow daily score rankings, with high energy scores (≥{ENERGY_CONFIG.HOUR_THRESHOLD}) being optimal</span>
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
              {energyDataLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin inline-block w-6 h-6 border-t-2 border-purple-500 border-r-2 rounded-full mb-2"></div>
                  <p className="text-sm text-purple-300">Loading real energy data...</p>
                </div>
              ) : (
                dailyEnergyData.slice(0, 5).map((day, index) => {
                  const dayNumber = index + 1;
                  const energyScore = day.score ?? '--'; // Show -- when no score available
                  const trendColor = day.trend === 'up' ? 'text-green-400' : day.trend === 'down' ? 'text-red-400' : 'text-yellow-400';
                  const trendIcon = day.trend === 'up' ? '🟢 Rising' : day.trend === 'down' ? '🔴 Declining' : '🟡 Stable';
                  
                  return (
                    <div key={dayNumber}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium">{day.date ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}</div>
                        <div className="text-sm">{typeof energyScore === 'number' ? `${energyScore}/100` : energyScore}</div>
                        <div className={`text-sm ${trendColor}`}>{trendIcon}</div>
                      </div>
                      <p className="text-xs text-purple-200">
                        {day.trend === 'up' ? `Energy rising day, suitable for new plans and creative work (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})` :
                         day.trend === 'down' ? `Energy declining day, suitable for rest and reflection (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})` :
                         `Energy stable day, suitable for steady progress (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})`}
                      </p>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                        {(() => {
                          const crystal = getCrystalForElement(day.element || 'water');
                          return (
                            <span className={`text-xs px-2 py-0.5 ${crystal.bgColor} rounded-full text-white ${crystal.color}`}>
                              {day.crystal || crystal.name}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })
              )}
              
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
                {energyDataLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-t-2 border-purple-500 border-r-2 rounded-full mb-2"></div>
                    <p className="text-sm text-purple-300">Loading full month energy data...</p>
                  </div>
                ) : (
                  dailyEnergyData.map((day, index) => {
                    const dayNumber = index + 1;
                    const energyScore = day.score ?? '--'; // Show -- when no score available
                    const trendColor = day.trend === 'up' ? 'text-green-400' : day.trend === 'down' ? 'text-red-400' : 'text-yellow-400';
                    const trendIcon = day.trend === 'up' ? '🟢 Rising' : day.trend === 'down' ? '🔴 Declining' : '🟡 Stable';
                    
                    return (
                      <div key={dayNumber} className="border-b border-purple-900/30 pb-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{day.date ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}</div>
                          <div className="text-sm">{typeof energyScore === 'number' ? `${energyScore}/100` : energyScore}</div>
                          <div className={`text-sm ${trendColor}`}>{trendIcon}</div>
                        </div>
                        <p className="text-xs text-purple-200 mt-1">
                          {day.trend === 'up' ? `Energy rising day, suitable for new plans and creative work (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})` :
                           day.trend === 'down' ? `Energy declining day, suitable for rest and reflection (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})` :
                           `Energy stable day, suitable for steady progress (energy value: ${day.energyChange > 0 ? '+' : ''}${day.energyChange})`}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-purple-300 mr-2">Crystal:</span>
                          {(() => {
                            const crystal = getCrystalForElement(day.element || 'water');
                            return (
                              <span className={`text-xs px-2 py-0.5 ${crystal.bgColor} rounded-full text-white ${crystal.color}`}>
                                {day.crystal || crystal.name}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })
                )}
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