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
  // 将effect转换为简短描述
  const shortEffect = crystal.effect?.replace('Amplifies intentions and mental clarity', 'Brainstorm booster');
  
  return (
    <div className="rounded-xl bg-purple-900/60 backdrop-blur-sm border border-purple-800/50 text-white p-5 mb-8 flex flex-row items-center">
      {/* 水晶图片 - 左侧 */}
      <div className="w-20 h-20 relative flex-shrink-0 mr-4">
        <Image 
          src={crystal.imageUrl} 
          alt={crystal.name} 
          width={80} 
          height={80} 
          className="rounded-full object-cover"
        />
      </div>
      
      {/* 水晶信息 - 右侧 */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">
          Your {crystal.year} Guiding Crystal:
        </h2>
        
        <p className="text-xl font-bold mb-1">
          {crystal.name}
        </p>
        
        <p className="text-gray-300 text-sm">
          {shortEffect || crystal.description} • Planet {crystal.planetAssociation}
        </p>
      </div>
    </div>
  );
};

export default YearlyCrystal; 