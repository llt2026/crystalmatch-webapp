'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './styles.css';
import { SUBSCRIPTION_FEATURES, SUBSCRIPTION_TIERS } from '@/app/lib/subscription-config';

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Choose Your Plan</h1>
      <p className="text-center text-gray-600 mb-8">Unlock personalized energy insights and crystal recommendations</p>
      
      {/* Subscription tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <div 
            key={tier.id}
            className={`rounded-lg overflow-hidden border ${
              tier.recommended 
                ? 'border-indigo-500 shadow-lg' 
                : 'border-gray-200'
            }`}
          >
            {tier.recommended && (
              <div className="bg-indigo-500 text-white text-center py-1 text-sm font-medium">
                BEST VALUE
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{tier.name}</h2>
              
              <div className="mb-4">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-gray-500 ml-1">{tier.period}</span>}
              </div>
              
              <ul className="mb-6 space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {tier.limitations && tier.limitations.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Limitations:</p>
                  <ul className="space-y-1">
                    {tier.limitations.map((limitation, index) => (
                      <li key={index} className="text-sm text-gray-500 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <button 
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  tier.id === 'free' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                disabled={tier.id === 'free'}
              >
                {tier.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Feature comparison table */}
      <h2 className="text-xl font-bold text-center mb-6">Feature Comparison</h2>
      
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Feature</th>
              <th className="py-3 px-4 text-center border-b">Free Snapshot</th>
              <th className="py-3 px-4 text-center border-b">Plus Plan $4.99</th>
              <th className="py-3 px-4 text-center border-b">Pro Plan</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(SUBSCRIPTION_FEATURES).map(([key, feature]) => (
              <tr key={key} className="hover:bg-gray-50">
                <td className="py-3 px-4 border-b">{feature.description}</td>
                <td className="py-3 px-4 text-center border-b">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm">{feature.free}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center border-b">
                  {typeof feature.plus === 'boolean' ? (
                    feature.plus ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm">{feature.plus}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center border-b">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )
                  ) : (
                    <span className="text-sm">{feature.pro}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-center mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">How do the subscription plans work?</h3>
            <p className="text-gray-600">Plus plans are charged every 30 days, while Pro plans offer a discounted rate and are charged once per year. Both plans include automatic renewal, which you can cancel anytime.</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">Can I cancel my subscription?</h3>
            <p className="text-gray-600">Yes, you can cancel your subscription at any time. Plus plans have a 14-day refund window. Pro plans have a 14-day refund window, but you can't request a refund after monthly reports have been generated.</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-2">What's the difference between Plus and Pro plans?</h3>
            <p className="text-gray-600">Pro plans provide access to all 12 months of crystal recommendations and save over 16% compared to paying monthly. Plus plans only provide current month crystal recommendations but still give you access to the full energy calendar.</p>
          </div>
        </div>
      </div>
      
      {/* Back to app link */}
      <div className="text-center">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Energy Dashboard
        </Link>
      </div>
    </div>
  );
} 