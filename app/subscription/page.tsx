'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './styles.css';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 text-white bg-gradient-animate">
      <Link href="/profile" className="inline-flex items-center text-purple-300 hover:text-white transition-colors ml-4 mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back
      </Link>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <span className="text-yellow-300 text-4xl mr-2 star-twinkle">✨</span>
            <h1 className="text-4xl md:text-5xl font-bold text-shadow">CrystalMatch Plans</h1>
          </div>
          <p className="text-xl md:text-2xl mt-2 text-shadow">Discover your energy. Transform your life.</p>
        </div>

        {/* Subscription Plans */}
        <div className="space-y-6 md:space-y-8">
          {/* Free Plan */}
          <div className="bg-purple-800/70 rounded-xl p-6 md:p-8 shadow-lg border border-purple-600/30 backdrop-blur-sm subscription-card">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shadow">Free</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Recommended crystal for 2025</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Main energy type for 2025</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Energy types & levels for next 12 months</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Report saved for 1 month</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Shareable report link</span>
              </li>
            </ul>
            <Link 
              href="/birth-info"
              className="block w-full py-3 bg-purple-600 hover:bg-purple-500 transition-colors rounded-lg text-center font-medium btn-subscribe"
            >
              Start Free
            </Link>
          </div>

          {/* Monthly Plan */}
          <div className="bg-purple-800/70 rounded-xl p-6 md:p-8 shadow-lg border border-purple-500/50 backdrop-blur-sm relative overflow-hidden subscription-card">
            <div className="absolute -right-12 top-6 rotate-45 bg-yellow-500 text-purple-900 px-12 py-1 font-medium text-sm">
              POPULAR
            </div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-shadow">Monthly</h2>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold">$4.99</div>
                <div className="text-sm opacity-80">per month</div>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>All Free plan features</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Current month deep insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Energy-boosting tips</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Personalized action steps</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Monthly crystal recommendations</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Daily energy insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Monthly style guidance</span>
              </li>
            </ul>
            <Link 
              href="/payment?plan=monthly"
              className="block w-full py-3 bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-lg text-center font-medium text-purple-900 btn-subscribe"
            >
              Subscribe Monthly
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="bg-purple-800/70 rounded-xl p-6 md:p-8 shadow-lg border border-yellow-500/30 backdrop-blur-sm subscription-card">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl md:text-4xl font-bold text-shadow">Annual</h2>
              <div className="text-right">
                <div className="text-3xl md:text-4xl font-bold">$49.99</div>
                <div className="text-sm opacity-80">per year</div>
                <div className="text-sm bg-green-500/20 text-green-300 px-2 py-0.5 rounded mt-1">Save 17%</div>
              </div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>All Monthly plan features</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Full year energy overview</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Quarterly energy snapshots</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Month-to-month transition guides</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Key energy days for the year</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Advanced crystal combinations</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>Long-term energy balancing strategies</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 mr-2 mt-1">•</span>
                <span>PDF download option</span>
              </li>
            </ul>
            <Link 
              href="/payment?plan=yearly"
              className="block w-full py-3 bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-lg text-center font-medium text-purple-900 btn-subscribe"
            >
              Best Value - Subscribe Annually
            </Link>
          </div>
        </div>

        {/* User Testimonials */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-shadow">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="text-yellow-300 mr-2">★★★★★</div>
                <div className="font-medium">Sarah T.</div>
              </div>
              <p className="opacity-90">"CrystalMatch has completely transformed my approach to daily challenges. The monthly insights are spot-on!"</p>
            </div>
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="text-yellow-300 mr-2">★★★★★</div>
                <div className="font-medium">Michael R.</div>
              </div>
              <p className="opacity-90">"The annual plan is worth every penny. The quarterly snapshots help me prepare for upcoming energy shifts."</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-shadow">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">How accurate are the energy readings?</h3>
              <p className="mt-2 opacity-80">Our readings combine traditional Chinese Five Elements theory and Western astrological principles to provide personalized insights based on your birth information.</p>
            </div>
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">Can I change my subscription plan later?</h3>
              <p className="mt-2 opacity-80">Yes, you can upgrade or downgrade your subscription at any time. Changes will take effect at the start of your next billing cycle.</p>
            </div>
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">How do I cancel my subscription?</h3>
              <p className="mt-2 opacity-80">You can cancel your subscription anytime from your account settings. You'll continue to have access until the end of your current billing period.</p>
            </div>
            <div className="bg-purple-800/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">Is my payment information secure?</h3>
              <p className="mt-2 opacity-80">Absolutely. We use industry-standard encryption and secure payment processors to ensure your payment information is always protected.</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-lg opacity-90">Join thousands of users who have transformed their lives with CrystalMatch</p>
          <div className="flex justify-center items-center mt-3 space-x-2">
            <span className="text-yellow-300 text-xl">✨</span>
            <p className="text-sm opacity-70">Cancel anytime. No hidden fees. 100% satisfaction guaranteed.</p>
            <span className="text-yellow-300 text-xl">✨</span>
          </div>
        </div>
      </div>
    </div>
  );
} 