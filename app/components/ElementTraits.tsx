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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Strength Section */}
      <div className="rounded-lg bg-purple-900/60 p-6">
        <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-green-400 pl-3">Strength</h2>
        <p className="text-xl mb-4 text-white">
          <span className="font-bold text-green-400">{strength.element}</span> Energy
        </p>
        <div className="flex flex-wrap gap-2">
          {strength.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-800/80 rounded-full px-5 py-2 mb-2 flex items-center text-white"
            >
              {trait}
            </div>
          ))}
        </div>
      </div>
      
      {/* Weakness Section */}
      <div className="rounded-lg bg-purple-900/60 p-6">
        <h2 className="text-2xl font-bold mb-4 text-white border-l-4 border-red-400 pl-3">Weakness</h2>
        <p className="text-xl mb-4 text-white">
          <span className="font-bold text-red-400">{weakness.element}</span> Energy
        </p>
        <div className="flex flex-wrap gap-2">
          {weakness.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-800/80 rounded-full px-5 py-2 mb-2 flex items-center text-white"
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