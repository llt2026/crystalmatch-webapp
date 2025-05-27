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
    <div className="rounded-lg bg-purple-800 text-white p-5 mb-8">
      <div className="flex items-center">
        <div className="w-16 h-16 relative mr-4 flex-shrink-0">
          <Image 
            src={crystal.imageUrl} 
            alt={crystal.name} 
            width={64} 
            height={64} 
            className="rounded-full object-cover"
          />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1">
            Your {crystal.year} Guiding Crystal:
          </h2>
          <p className="text-xl font-bold flex items-center">
            {crystal.name} <span className="text-green-300 ml-1">🌿</span>
          </p>
          <p className="text-sm text-gray-200 mt-1">
            {crystal.effect || crystal.description} • {crystal.planetAssociation ? `Planet ${crystal.planetAssociation}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default YearlyCrystal; 