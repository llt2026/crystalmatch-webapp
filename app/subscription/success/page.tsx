'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 创建一个包含useSearchParams的子组件
function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, we would validate the payment with the backend
    // and retrieve the subscription details
    const orderId = searchParams?.get('orderId') || '';
    
    if (!orderId) {
      setError('Invalid order information');
      setIsLoading(false);
      return;
    }

    // Simulate API call to get order details
    setTimeout(() => {
      setOrderDetails({
        orderId,
        planName: searchParams?.get('planId') === 'premium-yearly' ? 'Premium Yearly' : 'Premium Monthly',
        amount: searchParams?.get('amount') || '99',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
      setIsLoading(false);
    }, 1500);
  }, [searchParams, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-white">Processing your subscription...</p>
          </div>
        ) : error ? (
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="text-red-400 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-4">{error}</h2>
            <p className="text-purple-200 mb-6">Please contact customer support if you believe this is an error.</p>
            <Link 
              href="/subscription"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-block transition-colors"
            >
              Return to Plans
            </Link>
          </div>
        ) : (
          <div className="glass-card p-8 rounded-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Subscription Confirmed!</h1>
              <p className="text-purple-200">
                Thank you for subscribing to CrystalMatch Premium
              </p>
            </div>

            <div className="bg-purple-900/30 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-medium text-white mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-purple-200">Plan:</span>
                  <span className="text-white font-medium">{orderDetails.planName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Amount:</span>
                  <span className="text-white font-medium">${orderDetails.amount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Order Date:</span>
                  <span className="text-white font-medium">{orderDetails.date}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Next Billing Date:</span>
                  <span className="text-white font-medium">{orderDetails.nextBilling}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-purple-200">Order ID:</span>
                  <span className="text-white font-medium">{orderDetails.orderId}</span>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <Link 
                href="/dashboard"
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg inline-block transition-colors"
              >
                Go to Dashboard
              </Link>
              
              <p className="text-purple-200 text-sm">
                A confirmation email has been sent to your inbox
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// 主页面组件使用Suspense包装子组件
export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
            <p className="text-white">Loading subscription details...</p>
          </div>
        </div>
      </main>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
} 