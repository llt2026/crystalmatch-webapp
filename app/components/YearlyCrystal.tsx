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
  // 解析描述字符串，通常格式为 "Focus · Clarity · Structure"
  const descriptionParts = crystal.description.split('·').map(part => part.trim());
  
  return (
    <div className="rounded-xl bg-purple-900/60 backdrop-blur-sm border border-purple-800/50 text-white p-6 mb-8 flex flex-col items-center">
      {/* 水晶图片 */}
      <div className="w-32 h-32 relative mb-4">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-700 opacity-50"></div>
        <Image 
          src={crystal.imageUrl} 
          alt={crystal.name} 
          width={200} 
          height={200} 
          className="rounded-full object-cover border-2 border-purple-500/30 z-10 relative"
        />
      </div>
      
      {/* 水晶标题 */}
      <h2 className="text-xl font-bold mb-3 text-white text-center">
        Your {crystal.year} Guiding Crystal
      </h2>
      
      {/* 水晶名称 */}
      <p className="text-2xl font-bold text-white mb-6 flex items-center">
        {crystal.name} <span className="ml-2">💎</span>
      </p>
      
      {/* 水晶属性描述 */}
      <div className="w-full text-center mb-4">
        <p className="text-lg text-white">
          {descriptionParts.join(' · ')}
        </p>
      </div>
      
      {/* 水晶效果 */}
      {crystal.effect && (
        <div className="w-full text-center mb-4">
          <p className="text-white flex items-center justify-center">
            <span className="mr-2">✨</span> {crystal.effect}
          </p>
        </div>
      )}
      
      {/* 关联行星 */}
      {crystal.planetAssociation && (
        <div className="w-full text-center mb-4">
          <p className="text-sm text-gray-300">
            Associated Planet: {crystal.planetAssociation}
          </p>
        </div>
      )}
      
      {/* 订阅升级提示 */}
      {isFreeUser && (
        <div className="w-full text-center mt-4">
          <p className="text-sm text-purple-200 mb-2">
            Upgrade to get personalized crystal advice and monthly rituals
          </p>
          <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-sm font-medium">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default YearlyCrystal; 