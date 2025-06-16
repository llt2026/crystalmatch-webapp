'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionCancel() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Subscription Cancelled</h1>
          <p className="text-purple-200 mb-8">
            Your subscription process was cancelled.
            <br />
            No charges have been made to your account.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/subscription"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg inline-block transition-colors"
            >
              Return to Plans
            </Link>
            
            <Link 
              href="/profile"
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg inline-block transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 