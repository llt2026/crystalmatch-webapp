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
    <div className="rounded-lg bg-purple-900/60 text-white p-6 text-center mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Your {crystal.year} Guiding Crystal:
      </h2>
      
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
          <Image 
            src={crystal.imageUrl} 
            alt={crystal.name} 
            width={160} 
            height={160} 
            className="rounded-full object-cover border-4 border-purple-500/50"
          />
        </div>
        
        <p className="text-2xl font-bold mb-2">
          {crystal.name}
        </p>
        
        <p className="text-gray-200 mb-4 max-w-md mx-auto">
          {crystal.description}
        </p>
        
        {crystal.effect && (
          <p className="text-sm italic text-gray-300 mt-2 max-w-md mx-auto">
            {crystal.effect}
          </p>
        )}
        
        {crystal.planetAssociation && (
          <div className="mt-3 flex items-center justify-center">
            <span className="text-sm font-medium">Planet Association:</span>
            <span className="ml-2 text-sm text-gray-300">{crystal.planetAssociation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyCrystal; 