// app/components/QuoteShareCard.tsx
// Quote source: report.monthly.shareQuote or dailyTip.shareQuote

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

interface Props {
  quote: string;
}

const QuoteShareCard: React.FC<Props> = ({ quote }) => {
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
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'crystal-quote.png', { type: 'image/png' })] })) {
        await navigator.share({
          title: 'CrystalMatch Quote',
          files: [new File([blob], 'crystal-quote.png', { type: 'image/png' })],
        });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'crystal-quote.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={cardRef} 
        className="w-[1080px] h-[1920px] bg-gradient-to-b from-purple-700 via-purple-800 to-purple-900 flex flex-col items-center justify-center p-20 relative"
      >
        <div className="text-white text-5xl font-bold text-center leading-relaxed z-10">
          {quote}
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <div className="text-white text-2xl font-bold">CrystalMatch</div>
        </div>
      </div>
      <button 
        onClick={handleShare}
        className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Share / Save
      </button>
    </div>
  );
};

export default QuoteShareCard; 