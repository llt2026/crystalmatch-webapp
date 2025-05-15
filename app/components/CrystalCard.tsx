import React from 'react';
import Image from 'next/image';

interface CrystalCardProps {
  crystal: {
    name: string;
    image: string;
    description: string;
    benefits: string[];
    usage: string;
  };
}

export default function CrystalCard({ crystal }: CrystalCardProps) {
  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
      {/* Crystal Image */}
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <Image
          src={crystal.image}
          alt={crystal.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-50" />
      </div>

      {/* Crystal Info */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold">{crystal.name}</h4>
        <p className="text-purple-200 text-sm">{crystal.description}</p>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-purple-300">Benefits:</div>
          <div className="flex flex-wrap gap-2">
            {crystal.benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-sm bg-white/10 text-purple-200"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-purple-300">How to Use:</span>
          </div>
          <p className="text-sm text-purple-200">{crystal.usage}</p>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
} 