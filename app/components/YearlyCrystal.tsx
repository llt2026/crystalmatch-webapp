import React from 'react';
import Image from 'next/image';

interface CrystalInfo {
  name: string;
  description: string;
  imageUrl: string;
  effect?: string;
  planetAssociation?: string;
  year: string | number;
}

interface YearlyCrystalProps {
  crystal: CrystalInfo;
  isFreeUser?: boolean;
  userElement?: string;
}

const YearlyCrystal: React.FC<YearlyCrystalProps> = ({ crystal, isFreeUser = false, userElement = '' }) => {
  return (
    <div className="rounded-xl bg-purple-900/60 backdrop-blur-sm border border-purple-800/50 text-white p-6 mb-8">
      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 relative mb-4 flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 opacity-50"></div>
          <Image 
            src={crystal.imageUrl} 
            alt={crystal.name} 
            width={200} 
            height={200} 
            className="rounded-full object-cover border-2 border-purple-500/30 z-10 relative"
          />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          Your {crystal.year} Guiding Crystal
        </h2>
        <p className="text-2xl md:text-3xl font-bold text-purple-200 mb-3">
          {crystal.name} <span className="text-purple-300 ml-2">💎</span>
        </p>
        
        <div className="bg-purple-800/50 p-4 rounded-lg w-full">
          <p className="text-gray-200 mb-2">
            {crystal.description}
          </p>
          {crystal.effect && (
            <p className="text-purple-200 font-medium mt-2">
              ✨ {crystal.effect}
            </p>
          )}
          {crystal.planetAssociation && (
            <p className="text-sm text-purple-300 mt-2">
              Associated Planet: {crystal.planetAssociation}
            </p>
          )}
        </div>
        
        {isFreeUser && (
          <div className="mt-4 w-full">
            <p className="text-sm text-purple-200 mb-2">
              Upgrade to get personalized crystal advice and monthly rituals
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyCrystal; 