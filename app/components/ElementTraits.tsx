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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strength Section */}
      <div className="rounded-lg bg-purple-800/60 p-6">
        <h2 className="text-2xl font-semibold mb-4">Strength</h2>
        <p className="text-xl mb-3">{strength.element}</p>
        <div className="flex flex-wrap gap-2">
          {strength.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-700/60 rounded-full px-4 py-1 flex items-center"
            >
              <span className="mr-1">✨</span>
              {trait}
            </div>
          ))}
        </div>
      </div>
      
      {/* Weakness Section */}
      <div className="rounded-lg bg-purple-800/60 p-6">
        <h2 className="text-2xl font-semibold mb-4">Weakness</h2>
        <p className="text-xl mb-3">{weakness.element}</p>
        <div className="flex flex-wrap gap-2">
          {weakness.traits.map((trait, index) => (
            <div 
              key={index} 
              className="bg-purple-700/60 rounded-full px-4 py-1 flex items-center"
            >
              <span className="mr-1">⚠️</span>
              {trait}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElementTraits; 