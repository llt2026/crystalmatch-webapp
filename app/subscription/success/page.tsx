'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [planName, setPlanName] = useState('');
  
  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan === 'plus') {
      setPlanName('Plus Insider');
    } else if (plan === 'pro') {
      setPlanName('Pro Master');
    } else {
      setPlanName('Premium');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            Welcome to {planName}! Your subscription is now active and you have access to all premium features.
          </p>

          {/* Plan Benefits */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✨ Access your personalized crystal recommendations</li>
              <li>📊 View your daily energy scores</li>
              <li>📱 Get monthly energy reports</li>
              {planName === 'Pro Master' && (
                <>
                  <li>🎨 Discover your lucky colors</li>
                  <li>⏰ Receive hourly energy notifications</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/profile"
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 inline-block"
            >
              Start Exploring Your Energy
            </Link>
            
            <Link 
              href="/profile"
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors inline-block"
            >
              Manage Subscription
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@crystalmatch.app" className="text-blue-600 hover:underline">
                support@crystalmatch.app
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            🔒 Your payment was processed securely. You'll receive a confirmation email shortly.
          </p>
        </div>
             </div>
     </div>
   );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
            <p className="text-gray-600">
              Processing your subscription details
            </p>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
} 