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
      <div className="w-24 h-24 relative flex-shrink-0 mr-5 rounded-full overflow-hidden bg-purple-800/40">
        <Image 
          src={crystal.imageUrl} 
          alt={crystal.name} 
          width={96} 
          height={96} 
          className="object-cover"
        />
        
        {/* 免费用户显示锁图标覆盖在图片上 */}
        {isFreeUser && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* 水晶信息 - 右侧 */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">
          Your {crystal.year} Guiding Crystal:
        </h2>
        
        {isFreeUser ? (
          <>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-yellow-500 font-bold">PLUS</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Upgrade to Plus to unlock your personal crystal recommendation
            </p>
          </>
        ) : (
          <>
            <p className="text-xl font-bold mb-1">
              {crystal.name}
            </p>
            <p className="text-gray-300 text-sm">
              {shortEffect || crystal.description} • Planet {crystal.planetAssociation}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default YearlyCrystal; 