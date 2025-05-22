'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  birthInfo?: {
    date: string; // ISO date string
  };
}

interface BasicReport {
  title: string;
  year: number;
  type: 'basic' | 'premium';
  statusLabel?: string; // 如 FREE
}

interface MonthlyReport {
  monthLabel: string; // e.g. 'May 2025 Energy Report'
  isNew?: boolean;
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
      <div className="max-w-xs sm:max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-5 shadow-xl flex flex-col items-center text-center space-y-2">
          {/* Avatar */}
          <div className="relative w-20 h-20">
            {profile.avatar ? (
              <Image src={profile.avatar} alt={`${profile.name} avatar`} fill className="rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-purple-500/30 flex items-center justify-center">
                <span className="text-3xl text-purple-200 font-semibold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* Name & Email */}
          <div>
            <p className="text-lg font-semibold text-white leading-tight">{profile.name}</p>
            <p className="text-xs text-purple-200">{profile.email}</p>
          </div>
          {/* Birth date */}
          {profile.birthInfo?.date && (
            <div className="flex items-center gap-1 text-xs text-purple-300">
              <span className="material-symbols-rounded text-base">calendar_today</span>
              {new Date(profile.birthInfo.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          )}
          {/* Subscription badge */}
          {profile.subscription.status === 'premium' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-700 text-white">PREMIUM</span>
          )}
        </div>

        {/* UPGRADE Button */}
        {profile.subscription.status === 'free' && (
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors"
          >
            UPGRADE
          </button>
        )}

        {/* Reports */}
        <section className="text-white space-y-4">
          {/* Section Title */}
          <h2 className="text-sm font-semibold">Reports</h2>

          {/* Annual Basic Report */}
          <Link href={`/report/annual-basic-${new Date().getFullYear()}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-start no-underline">
            <div className="leading-tight">
              <p className="text-sm font-medium">Annual Basic Report</p>
              <p className="text-[11px] text-purple-200">2025</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 h-fit rounded-full bg-white/10 text-purple-200 border border-purple-400/50 self-center">FREE</span>
          </Link>

          {/* Annual Premium Report */}
          <Link href={`/report/annual-premium-${new Date().getFullYear()}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-gradient-to-br from-purple-600/30 to-purple-800/30 p-4 rounded-xl flex justify-between items-center no-underline">
            <p className="text-sm font-medium">Annual Premium Report 2025</p>
          </Link>

          {/* Monthly Deep Reports */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-purple-200 mb-1">Monthly Deep Reports</h3>
            {[
              { label: 'May 2025 Energy Report', isNew: true },
              { label: 'Apr 2025 Energy Report', isNew: false },
            ].map((r) => (
              <Link key={r.label} href={`/report/${r.label.startsWith('May') ? `${new Date().getFullYear()}-05` : `${new Date().getFullYear()}-04`}${profile.birthInfo?.date ? `?birthDate=${encodeURIComponent(profile.birthInfo.date)}` : ''}`} className="bg-black/40 p-3 rounded-lg flex justify-between items-center no-underline">
                <span className="text-xs">{r.label}</span>
                {r.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-600 text-white">NEW</span>}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 