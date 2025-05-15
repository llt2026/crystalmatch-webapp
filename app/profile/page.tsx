'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '../utils/useTranslation';

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
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(t('errors.networkError'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black p-4">
        <div className="text-red-400 text-center">
          <p className="text-lg sm:text-xl mb-4">{error || t('errors.networkError')}</p>
          <button
            onClick={() => router.push('/dashboard')}
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
        {/* Profile Header */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={t('profile.title')}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl text-purple-300">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{profile.name}</h1>
              <p className="text-gray-300 text-sm sm:text-base mb-3">{profile.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm ${
                  profile.subscription.status === 'premium'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {profile.subscription.status === 'premium' ? t('subscription.premium') : t('subscription.basic')}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs sm:text-sm">
                  {`${t('profile.joinedAt')} ${new Date(profile.joinedAt).toLocaleDateString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="bg-black/30 backdrop-blur-xl p-4 rounded-xl text-center">
            <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('profile.energyReadings')}</h3>
            <p className="text-xl sm:text-2xl font-bold text-white">{profile.reportsCount}</p>
          </div>
          <div className="bg-black/30 backdrop-blur-xl p-4 rounded-xl text-center">
            <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('profile.location')}</h3>
            <p className="text-sm sm:text-base text-white">{profile.location.city}, {profile.location.state}</p>
          </div>
          {profile.subscription.status === 'premium' && (
            <div className="bg-black/30 backdrop-blur-xl p-4 rounded-xl text-center sm:col-span-2 lg:col-span-1">
              <h3 className="text-sm sm:text-base text-purple-300 mb-2">{t('subscription.expiresAt')}</h3>
              <p className="text-sm sm:text-base text-white">
                {profile.subscription.expiresAt
                  ? new Date(profile.subscription.expiresAt).toLocaleDateString()
                  : t('subscription.never')}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/profile/edit')}
            className="w-full sm:flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm sm:text-base font-medium hover:from-purple-700 hover:to-purple-900 transition-all"
          >
            {t('profile.updateProfile')}
          </button>
          <button
            onClick={() => router.push('/subscription')}
            className="w-full sm:flex-1 px-4 py-3 bg-black/30 backdrop-blur-xl text-white rounded-lg text-sm sm:text-base font-medium hover:bg-white/10 transition-all"
          >
            {profile.subscription.status === 'premium' 
              ? t('subscription.manage')
              : t('subscription.upgrade')}
          </button>
        </div>
      </div>
    </main>
  );
} 