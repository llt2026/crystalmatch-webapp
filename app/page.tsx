'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react';

export default function Home() {
  // 强制刷新图片缓存
  useEffect(() => {
    // 清除浏览器缓存
    const now = new Date().getTime();
    // 在浏览器环境中预加载图片
    if (typeof window !== 'undefined') {
      const logoImg = new window.Image();
      const crystalImg = new window.Image();
      logoImg.src = `/images/crystal-logo-v2.svg?v=${now}`;
      crystalImg.src = `/images/hero-crystal-v2.svg?v=${now}`;
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-black">
      {/* Login Button - Fixed to top right corner */}
      <div className="fixed top-4 right-4 z-10">
        <Link 
          href="/login" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 bg-opacity-70 hover:bg-opacity-100 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
        >
          <span className="hidden sm:inline">Sign In</span>
          <span className="sm:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
        </Link>
      </div>

      <div className="relative flex flex-col items-center justify-center max-w-4xl w-full">
        {/* Mystical Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/stars.svg')] bg-repeat animate-twinkle"></div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 relative">
          <div className="flex items-center mb-4 space-x-3">
            {/* 使用新上传的logo图片，增加尺寸50% */}
            <img 
              src={`/images/crystal-logo-v2.svg?t=${Date.now()}`}
              alt="Crystal Logo" 
              width={38} 
              height={38}
              className="animate-pulse"
            />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              CrystalMatch
            </h1>
          </div>
          <p className="text-lg text-purple-200 text-center max-w-xl mt-2 font-light tracking-wide">
            Hello there! Ready to discover your unique cosmic energy? Let's find your perfect crystal match!
          </p>
        </div>
        
        {/* Main Content */}
        <div className="card backdrop-blur-md bg-white/5 p-6 rounded-2xl border border-purple-500/20 shadow-2xl">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold text-white leading-tight">
              Your Personal<br/>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Energy Reading Awaits
              </span>
            </h2>
            
            {/* Crystal Animation - 增加尺寸50% */}
            <div className="my-6 relative group">
              <div className="animate-float transition-transform duration-500 group-hover:scale-110">
                <div className="relative w-[180px] h-[180px] mx-auto">
                  {/* 使用新上传的水晶图片 */}
                  <img 
                    src={`/images/hero-crystal-v2.svg?t=${Date.now()}`}
                    alt="Mystical Crystal" 
                    width={180}
                    height={180}
                    className="absolute top-0 left-0 w-full h-full object-contain z-10"
                  />
                  {/* 发光效果 */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/30 rounded-full blur-2xl animate-pulse-slow -z-10"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-400/30 rounded-full blur-xl animate-pulse-fast -z-10"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-pink-400/30 rounded-full blur-md animate-pulse -z-10"></div>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="space-y-3">
              <Link 
                href="/birth-info" 
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-full hover:from-purple-700 hover:to-purple-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
              >
                Get Your Reading
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-sm text-purple-300 italic">
                Fast & easy - takes just 2 minutes!
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            Join over 10,000 people who've discovered their crystal connection
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-purple-200 text-sm">4.9/5 from 2,000+ readings</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-4 text-center text-purple-300 text-sm">
          <p>Questions? Contact us at: <a href="mailto:llt2921@outlook.com" className="hover:text-white underline">llt2921@outlook.com</a></p>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="floating-crystal left-10 top-1/4"></div>
          <div className="floating-crystal right-10 top-3/4"></div>
        </div>
      </div>
    </main>
  )
} 