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

const YearlyCrystal: React.FC<{ crystal: CrystalInfo }> = ({ crystal }) => {
  return (
    <div className="rounded-lg bg-green-100 text-gray-800 p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 relative">
          <Image 
            src={crystal.imageUrl} 
            alt={crystal.name} 
            width={96} 
            height={96} 
            className="rounded-full object-cover"
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Your {crystal.year} Guiding Crystal:
          </h2>
          <p className="text-xl font-bold mb-1">
            {crystal.name} 🌿
          </p>
          <p className="text-gray-600 mb-2">
            {crystal.description}
          </p>
          
          {crystal.effect && (
            <p className="text-sm italic text-gray-700 mt-2">
              {crystal.effect}
            </p>
          )}
          
          {crystal.planetAssociation && (
            <div className="mt-3 flex items-center">
              <span className="text-sm font-medium">Planet Association:</span>
              <span className="ml-2 text-sm text-gray-600">{crystal.planetAssociation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyCrystal; 