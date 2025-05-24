import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

interface Props {
  percent: number;
  quote: string;
}

const PairShareCard: React.FC<Props> = ({ percent, quote }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob as Blob);
        }, 'image/png');
      });

      // Check if Web Share API supports sharing files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'crystal-match.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'CrystalMatch Energy Compatibility',
          files: [new File([blob], 'crystal-match.png', { type: 'image/png' })],
        });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'crystal-match.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing match:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="w-[1080px] h-[1350px] bg-gradient-to-b from-purple-800 via-purple-900 to-purple-950 flex flex-col items-center justify-center p-16 relative"
      >
        <div className="mb-12">
          <div className="text-white text-7xl font-bold text-center mb-4">
            Energy Match
          </div>
          <div className="text-amber-400 text-8xl font-bold text-center">
            {percent}%
          </div>
        </div>
        
        <div className="text-white text-4xl font-medium text-center leading-relaxed max-w-3xl z-10">
          {quote}
        </div>
        
        <div className="absolute bottom-10 right-10 opacity-30">
          <div className="text-white text-xl font-bold">CrystalMatch</div>
        </div>
      </div>
      <button 
        onClick={handleShare}
        className="mt-4 px-6 py-3 bg-amber-500 text-purple-900 font-medium rounded-lg hover:bg-amber-400 transition-colors"
      >
        Share / Save
      </button>
    </div>
  );
};

export default PairShareCard; 