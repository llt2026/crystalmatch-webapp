'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import ShareButton from './ShareButton';
import InstallButton from './InstallButton';

export default function NavBar() {
  const pathname = usePathname() || '';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isHomePage = pathname === '/';
  const [isMounted, setIsMounted] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    setIsMounted(true);
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/check', { 
          method: 'GET',
          credentials: 'include'
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        console.error('Login status check error:', error);
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  // Admin pages have a special navigation
  const isAdminPage = pathname?.startsWith('/admin') || false;
  
  // Only show login button on home page
  if (isHomePage) {
    return (
      <nav className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {isMounted && <InstallButton className="mr-2" />}
          </div>
          <div className="flex items-center space-x-2">
            {isMounted && <ShareButton className="mr-2" />}
            <Link 
              href="/login" 
              className="px-6 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-sm transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Admin navigation bar (in English for US localization)
  if (isAdminPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="flex items-center">
                <Image 
                  src="/images/crystal-logo-v3.svg" 
                  alt="Crystal Logo" 
                  width={30} 
                  height={30}
                  className="animate-pulse"
                />
                <span className="ml-2 text-xl font-medium bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/users" 
                className="text-purple-200 hover:text-white transition-colors"
              >
                User Management
              </Link>
              <Link 
                href="/admin/dashboard" 
                className="text-purple-200 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // For user pages, don't show login button, only basic navbar structure
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/20 border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/images/crystal-logo-v3.svg" 
                alt="Crystal Logo" 
                width={30} 
                height={30}
                className="animate-pulse"
              />
              <span className="ml-2 text-xl font-medium bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
                CrystalMatch
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {isMounted && <InstallButton className="mr-2" />}
            {isMounted && <ShareButton className="mr-2" />}
            {/* Only show options for logged in users */}
            {isLoggedIn && (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-purple-200 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-sm transition-colors"
                >
                  My Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 