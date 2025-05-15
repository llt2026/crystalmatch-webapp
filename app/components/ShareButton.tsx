import React, { useState } from 'react';

// 添加全局gtag类型声明
declare global {
  interface Window {
    gtag: (command: string, action: string, params: any) => void;
  }
}

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Check out CrystalMatch!',
  text = 'I found my energy signature with CrystalMatch. Discover yours too!',
  url,
  className = '',
}) => {
  const [shared, setShared] = useState(false);
  
  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
        
        // Track sharing analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'share_content', {
            'event_category': 'Engagement',
            'event_label': shareData.url
          });
        }
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center px-4 py-2 bg-yellow-500 text-purple-900 rounded-lg font-medium transition-all hover:bg-yellow-400 ${className}`}
      aria-label="Share"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      {shared ? 'Shared!' : 'Share'}
    </button>
  );
};

export default ShareButton; 