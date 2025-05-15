'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '../../utils/useTranslation';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  subscription: {
    status: 'free' | 'premium';
    expiresAt?: string;
  };
  reportsCount: number;
  joinedAt: string;
  birthInfo?: {
    date: string;
    time: string;
    location: string;
  };
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
}

export default function EditProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 表单状态
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error(t('profile.updateFailed'));
        }
        const data = await response.json();
        setProfile(data);
        
        // 初始化表单数据
        setName(data.name || '');
        setCountry(data.location?.country || '');
        setState(data.location?.state || '');
        setCity(data.location?.city || '');
        setBirthDate(data.birthInfo?.date || '');
        setBirthTime(data.birthInfo?.time || '');
        setBirthLocation(data.birthInfo?.location || '');
        setNotificationsEnabled(data.preferences?.notifications || false);
        setNewsletterEnabled(data.preferences?.newsletter || false);
        setLanguage(data.preferences?.language || 'en');
      } catch (err) {
        setError(t('errors.networkError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      
      const updatedProfile = {
        name,
        location: {
          country,
          state,
          city
        },
        birthInfo: {
          date: birthDate,
          time: birthTime,
          location: birthLocation
        },
        preferences: {
          notifications: notificationsEnabled,
          newsletter: newsletterEnabled,
          language
        }
      };
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile)
      });
      
      if (!response.ok) {
        throw new Error(t('profile.updateFailed'));
      }
      
      setSuccess(t('profile.profileUpdated'));
      
      // 3秒后返回个人资料页面
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.networkError'));
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black p-4">
        <div className="text-red-400 text-center">
          <p className="text-lg sm:text-xl mb-4">{error || t('errors.networkError')}</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg text-sm sm:text-base hover:bg-purple-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black px-4 py-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">{t('profile.editTitle')}</h1>
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center text-purple-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t('profile.backToProfile')}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 个人信息部分 */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.personalInfo')}</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.fullName')}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="text-gray-400 text-sm">
                <p>{t('profile.email')}: {profile.email}</p>
                <p>{t('profile.memberSince')}: {new Date(profile.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* 位置信息部分 */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.location')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.country')}
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.state')}
                </label>
                <input
                  type="text"
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="city" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.city')}
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* 出生信息部分 */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.birthInfo')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.birthDate')}
                </label>
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="birthTime" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.birthTime')}
                </label>
                <input
                  type="time"
                  id="birthTime"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="birthLocation" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.birthLocation')}
                </label>
                <input
                  type="text"
                  id="birthLocation"
                  value={birthLocation}
                  onChange={(e) => setBirthLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
          
          {/* 偏好设置部分 */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-semibold text-white mb-4">{t('profile.preferences')}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-200">
                  {t('profile.enableNotifications')}
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletterEnabled}
                  onChange={(e) => setNewsletterEnabled(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-200">
                  {t('profile.subscribeNewsletter')}
                </label>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-purple-200 mb-2">
                  {t('profile.language')}
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 提交按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm sm:text-base font-medium hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving')}
                </span>
              ) : (
                t('profile.saveChanges')
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="w-full sm:flex-1 px-4 py-3 bg-black/30 backdrop-blur-xl text-white rounded-lg text-sm sm:text-base font-medium hover:bg-white/10 transition-all"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 