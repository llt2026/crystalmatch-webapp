'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SharePage() {
  const searchParams = useSearchParams();
  const [sharedContent, setSharedContent] = useState({
    title: '',
    text: '',
    url: ''
  });

  useEffect(() => {
    // Get shared content from URL parameters
    const title = searchParams?.get('title') || '';
    const text = searchParams?.get('text') || '';
    const url = searchParams?.get('url') || '';

    setSharedContent({ title, text, url });

    // Track sharing analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'receive_shared_content', {
        'event_category': 'Share',
        'event_label': url || text
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <span className="text-yellow-300 text-4xl mr-2">✨</span>
            <h1 className="text-4xl md:text-5xl font-bold">Shared with CrystalMatch</h1>
          </div>
          <p className="text-xl md:text-2xl mt-2 opacity-90">
            Thanks for sharing content with us!
          </p>
        </div>

        <div className="bg-purple-800/70 rounded-xl p-6 md:p-8 shadow-lg border border-purple-600/30 backdrop-blur-sm">
          {sharedContent.title && (
            <div className="mb-4">
              <h2 className="text-lg font-medium text-yellow-300">Title</h2>
              <p className="mt-1">{sharedContent.title}</p>
            </div>
          )}

          {sharedContent.text && (
            <div className="mb-4">
              <h2 className="text-lg font-medium text-yellow-300">Text</h2>
              <p className="mt-1">{sharedContent.text}</p>
            </div>
          )}

          {sharedContent.url && (
            <div className="mb-4">
              <h2 className="text-lg font-medium text-yellow-300">URL</h2>
              <a 
                href={sharedContent.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 text-blue-300 hover:text-blue-200 break-all"
              >
                {sharedContent.url}
              </a>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 transition-colors rounded-lg text-center font-medium"
            >
              Go to Home
            </Link>
            <Link 
              href="/birth-info"
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-lg text-center font-medium text-purple-900"
            >
              Get Your Crystal Match
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 