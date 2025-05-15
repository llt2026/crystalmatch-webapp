export const dynamic = 'force-dynamic';

import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
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
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/stars.png')] bg-repeat animate-twinkle"></div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col items-center mb-12 relative">
          <div className="flex items-center mb-4 space-x-3">
            <Image 
              src="/crystal-logo.svg" 
              alt="Crystal Logo" 
              width={50} 
              height={50}
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
        <div className="card backdrop-blur-md bg-white/5 p-8 rounded-2xl border border-purple-500/20 shadow-2xl">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-semibold text-white leading-tight">
              Your Personal<br/>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Energy Reading Awaits
              </span>
            </h2>
            
            {/* Crystal Animation */}
            <div className="my-12 relative group">
              <div className="animate-float transition-transform duration-500 group-hover:scale-110">
                <Image 
                  src="/crystal.svg" 
                  alt="Mystical Crystal" 
                  width={240} 
                  height={300}
                  priority
                  className="mx-auto drop-shadow-[0_0_15px_rgba(138,43,226,0.5)]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 to-transparent opacity-70 blur-2xl -z-10"></div>
            </div>
            
            {/* CTA Button */}
            <div className="space-y-4">
              <Link 
                href="/birth-info" 
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-full hover:from-purple-700 hover:to-purple-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
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
        <div className="mt-8 text-center">
          <p className="text-purple-200 text-sm">
            Join over 10,000 people who've discovered their crystal connection
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-purple-200 text-sm">4.9/5 from 2,000+ readings</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-purple-300 text-sm">
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