'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const refCode = searchParams?.get('ref');
    
    if (refCode && typeof window !== 'undefined') {
      if (!localStorage.getItem('inviterCode')) {
        localStorage.setItem('inviterCode', refCode);
        console.log('Referral code saved:', refCode);
      }
    }
  }, [searchParams]);
  
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#4c1d95" />
        <meta name="description" content="Discover your energy signature through your birth information and find the crystals that resonate with your unique vibration." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <title>CrystalMatch - Find Your Perfect Crystal Match</title>
      </head>
      <body>
        {children}
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  )
} 