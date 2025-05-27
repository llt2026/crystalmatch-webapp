import React from 'react';
import Link from 'next/link';
import EnergyCalendar from '@/app/components/EnergyCalendar';
import { SubscriptionTier } from '@/app/lib/subscription-config';

export default function DemoPage() {
  // Mock user data for demo
  const birthday = '1990-06-15';
  const userId = 'demo-user-123';
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-4 mb-2">Subscription Tier Demo</h1>
        <p className="text-gray-600">
          This page demonstrates how the Energy Calendar looks different for each subscription tier.
        </p>
      </div>
      
      {/* Free User */}
      <div className="mb-12 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Free User Experience</h2>
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium">
            Free Snapshot
          </span>
        </div>
        
        <EnergyCalendar 
          birthday={birthday}
          subscriptionTier={'free' as SubscriptionTier}
          userId={userId}
        />
      </div>
      
      {/* Monthly Subscriber */}
      <div className="mb-12 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Monthly Subscriber Experience</h2>
          <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
            Monthly Plan
          </span>
        </div>
        
        <EnergyCalendar 
          birthday={birthday}
          subscriptionTier={'monthly' as SubscriptionTier}
          userId={userId}
        />
      </div>
      
      {/* Yearly Subscriber */}
      <div className="mb-12 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Yearly Subscriber Experience</h2>
          <span className="inline-block bg-indigo-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            Annual Plan
          </span>
        </div>
        
        <EnergyCalendar 
          birthday={birthday}
          subscriptionTier={'yearly' as SubscriptionTier}
          userId={userId}
        />
      </div>
      
      {/* Feature Comparison CTA */}
      <div className="text-center mb-12">
        <Link 
          href="/subscription"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md text-md font-medium hover:bg-indigo-700"
        >
          View Full Plan Comparison
        </Link>
      </div>
    </div>
  );
} 