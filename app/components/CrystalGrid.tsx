'use client';

import React from 'react';

export interface CrystalItem {
  name: string;
  benefit: string;
}

interface CrystalGridProps {
  crystals: CrystalItem[];
}

const CrystalGrid: React.FC<CrystalGridProps> = ({ crystals }) => {
  if (!crystals || crystals.length === 0) return null;

  const topNine = crystals.slice(0, 9);

  return (
    <section className="bg-black/30 backdrop-blur-sm rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Crystal Recommendations</h2>
      <div className="grid grid-cols-3 gap-4">
        {topNine.map((c, idx) => (
          <div key={idx} className="bg-black/20 p-4 rounded-lg flex flex-col items-center text-center">
            <div className="text-2xl mb-2">🔮</div>
            <h4 className="font-medium mb-1 text-sm">{c.name}</h4>
            <p className="text-xs text-purple-200">{c.benefit}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CrystalGrid; 