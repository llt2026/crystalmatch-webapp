import React from 'react';

interface TraitData {
  element: string;
  traits: string[];
}

interface ElementTraitsProps {
  strength: TraitData;
  weakness: TraitData;
}

const ElementTraits: React.FC<ElementTraitsProps> = ({ strength, weakness }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      {/* Strength Section */}
      <div className="rounded-lg bg-purple-900/60 p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-3 text-white border-l-4 border-green-400 pl-3">Strength</h2>
        <p className="text-lg md:text-xl mb-3 text-white">
          <span className="font-bold text-green-400">{strength.element}</span> Energy
        </p>
        <div className="grid grid-cols-2 gap-2">
          {strength.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-800/80 rounded-full px-2 py-2 flex items-center justify-center text-white text-xs sm:text-sm text-center leading-tight"
            >
              {trait}
            </div>
          ))}
        </div>
      </div>
      
      {/* Weakness Section */}
      <div className="rounded-lg bg-purple-900/60 p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-3 text-white border-l-4 border-red-400 pl-3">Weakness</h2>
        <p className="text-lg md:text-xl mb-3 text-white">
          <span className="font-bold text-red-400">{weakness.element}</span> Energy
        </p>
        <div className="grid grid-cols-2 gap-2">
          {weakness.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-800/80 rounded-full px-2 py-2 flex items-center justify-center text-white text-xs sm:text-sm text-center leading-tight"
            >
              {trait}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementTraits; 