export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Components
import EnergyCard from '../components/EnergyCard';
import CrystalCard from '../components/CrystalCard';
import ActionSteps from '../components/ActionSteps';
import LoadingScreen from '../components/LoadingScreen';
import QuoteShareCard from '../components/QuoteShareCard';
import PairShareModal from '../components/PairShareModal';

export default function EnergyReading() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [pairOpen, setPairOpen] = useState(false);

  useEffect(() => {
    const birthInfoString = localStorage.getItem('birthInfo');
    
    if (!birthInfoString) {
      router.push('/birth-info');
      return;
    }
    
    const fetchEnergyReading = async () => {
      try {
        const birthInfo = JSON.parse(birthInfoString);
        
        const response = await fetch('/api/energy-reading', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(birthInfo),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get your energy reading');
        }
        
        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error('Error reading energy:', error);
        setError('Something went wrong while getting your reading. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnergyReading();
  }, [router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-black">
        <div className="glass-card max-w-md w-full p-8 text-center rounded-2xl">
          <div className="text-red-300 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <Link 
            href="/birth-info" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  if (!report) {
    return null;
  }

  const { 
    greeting,
    overview, 
    primaryEnergy, 
    secondaryEnergy, 
    energyRanking, 
    zodiac, 
    westernAstrology, 
    crystalRecommendations,
    actionSteps
  } = report;

  return (
    <main className="min-h-screen p-4 sm:p-8 md:p-12 bg-gradient-to-br from-purple-900 to-black">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center text-purple-300 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <button 
            onClick={() => setPairOpen(true)} 
            className="text-sm text-amber-300 hover:text-amber-200 transition-colors"
          >
            🔗 Compare with a Friend
          </button>
        </div>

        {/* Header Section */}
        <div className="glass-card p-8 rounded-2xl mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {greeting}
          </h1>
          <p className="text-purple-200 text-lg">{overview}</p>
        </div>

        {/* Quote Share Card (if report has a shareQuote) */}
        {report?.monthly?.shareQuote && (
          <div className="mb-8 flex justify-center">
            <QuoteShareCard quote={report.monthly.shareQuote} />
          </div>
        )}

        {/* Primary and Secondary Energy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EnergyCard title="Primary Energy" energy={primaryEnergy} isPrimary />
          <EnergyCard title="Secondary Energy" energy={secondaryEnergy} />
        </div>

        {/* Energy Ranking */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Energy Spectrum</h2>
          <div className="space-y-6">
            {energyRanking.map((energy: any, index: number) => (
              <div key={energy.type} className="relative">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 mr-3 text-purple-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{energy.name}</span>
                      <span className="text-purple-300">{energy.strength}%</span>
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-700"
                    style={{ width: `${energy.strength}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Energy Insight */}
          {energyRanking[4] && (
            <div className="mt-8 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-purple-300">Energy Insight:</span>
              </div>
              <p className="text-purple-200">{energyRanking[4].tip}</p>
            </div>
          )}
        </div>

        {/* Zodiac & Astrology */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Chinese Zodiac */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Chinese Zodiac</h3>
            <p className="text-purple-200 mb-4">{zodiac.personality}</p>
            <p className="text-purple-200 mb-4">{zodiac.forecast}</p>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <span className="font-medium text-purple-300">Zodiac Tip:</span>
              </div>
              <p className="text-purple-200">{zodiac.tip}</p>
            </div>
          </div>
          
          {/* Western Astrology */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Astrological Influence</h3>
            <p className="text-purple-200 mb-4">{westernAstrology.traits}</p>
            <p className="text-purple-200 mb-4">{westernAstrology.monthlyTip}</p>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                <span className="font-medium text-purple-300">Astro Tip:</span>
              </div>
              <p className="text-purple-200">{westernAstrology.tip}</p>
            </div>
          </div>
        </div>
        
        {/* Crystal Recommendations */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold mb-6">Your Crystal Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crystalRecommendations.map((crystal: any) => (
              <CrystalCard key={crystal.name} crystal={crystal} />
            ))}
          </div>
        </div>
        
        {/* Daily Rituals */}
        <div className="glass-card p-8 rounded-2xl mb-8">
          <h3 className="text-2xl font-bold mb-6">Daily Energy Rituals</h3>
          <ActionSteps steps={actionSteps} />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share My Reading
          </button>
          <Link 
            href="/subscription"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            Upgrade to Premium
          </Link>
        </div>

        {/* Pair Share Modal */}
        <PairShareModal isOpen={pairOpen} onClose={() => setPairOpen(false)} />
      </div>
    </main>
  );
} 