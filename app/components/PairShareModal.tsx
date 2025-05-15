import React, { useState } from 'react';
import PairShareCard from './PairShareCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PairShareModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [friendBirthday, setFriendBirthday] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matchData, setMatchData] = useState<{ matchPercent: number; matchQuote: string } | null>(null);
  const [error, setError] = useState<string>('');

  const handleGenerateMatch = async () => {
    if (!friendBirthday) {
      setError('Please enter your friend\'s birthday');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get user's birthday from localStorage or context
      const myBirthday = localStorage.getItem('birthDate') || new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/match?mine=${encodeURIComponent(myBirthday)}&friend=${encodeURIComponent(friendBirthday)}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate match');
      }
      
      const data = await response.json();
      setMatchData(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Match generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 rounded-xl max-w-lg w-full shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Energy Match with a Friend</h2>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!matchData ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="friendBirthday" className="block text-purple-200 mb-2">
                Enter your friend's birthday
              </label>
              <input
                id="friendBirthday"
                type="date"
                value={friendBirthday}
                onChange={(e) => setFriendBirthday(e.target.value)}
                className="w-full p-3 rounded-lg bg-purple-800 text-white border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
            </div>
            
            <button
              onClick={handleGenerateMatch}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-purple-900 font-medium rounded-lg hover:from-amber-500 hover:to-amber-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Calculating...' : 'Generate Match'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <PairShareCard percent={matchData.matchPercent} quote={matchData.matchQuote} />
            <button
              onClick={() => setMatchData(null)}
              className="mt-4 text-purple-300 hover:text-white"
            >
              Try Another Match
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PairShareModal; 