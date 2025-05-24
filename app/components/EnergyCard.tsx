import React from 'react';

interface EnergyCardProps {
  title: string;
  energy: {
    type: string;
    name: string;
    description: string;
    strength: number;
    traits?: string[];
    color?: string;
    tip?: string;
  };
  isPrimary?: boolean;
}

export default function EnergyCard({ title, energy, isPrimary = false }: EnergyCardProps) {
  const traits = energy.traits || [];
  return (
    <div className={`glass-card p-6 rounded-2xl relative overflow-hidden ${
      isPrimary ? 'border-2 border-purple-500/30' : 'border border-purple-500/20'
    }`}>
      {/* Energy Type Badge */}
      <div className="absolute top-4 right-4">
        <div className={`px-3 py-1 rounded-full text-sm font-medium
          ${isPrimary 
            ? 'bg-purple-500/20 text-purple-300' 
            : 'bg-white/10 text-purple-200'
          }`}
        >
          {energy.strength}% Strength
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      {/* Energy Name */}
      <div className="mb-4">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {energy.name}
        </div>
        <p className="text-purple-200 mt-2">{energy.description}</p>
      </div>

      {/* Traits */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-purple-300">Key Traits:</div>
        <div className="flex flex-wrap gap-2">
          {traits.map((trait, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm
                ${isPrimary 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'bg-white/10 text-purple-200'
                }`}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Background Decoration */}
      <div 
        className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: energy.color }}
      />
    </div>
  );
} 