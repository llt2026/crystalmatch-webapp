'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './styles.css';
import { SUBSCRIPTION_FEATURES, SUBSCRIPTION_TIERS } from '@/app/lib/subscription-config';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handlePlanSelect = (planId: string) => {
    if (planId === 'free') {
      // Free plan - redirect to dashboard
      window.location.href = '/';
      return;
    }
    setSelectedPlan(planId);
    setShowPayment(true);
    setPaymentError('');
  };

  const selectedTier = SUBSCRIPTION_TIERS.find(tier => tier.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-blue-800/20"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Unlock Your
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Energy Potential</span>
            </h1>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Discover your Five Elements energy code and get personalized crystal recommendations to enhance your daily life
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {SUBSCRIPTION_TIERS.map((tier, index) => (
              <div
                key={tier.id}
                className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  tier.recommended 
                    ? 'ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-500/25' 
                    : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                {/* Recommended Badge */}
                {tier.recommended && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {/* Card Background */}
                <div className={`bg-gradient-to-br ${tier.gradient} p-8 h-full flex flex-col`}>
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      {tier.period && tier.period !== 'forever' && (
                        <span className="text-purple-200 ml-2">/{tier.period.replace('per ', '')}</span>
                      )}
                    </div>
                    {tier.period === 'forever' && (
                      <span className="text-purple-200 text-sm">No commitment required</span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="flex-grow">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-400 flex items-center justify-center mr-3 mt-0.5">
                            <svg className="w-3 h-3 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-white text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations */}
                    {tier.limitations && tier.limitations.length > 0 && (
                      <div className="mb-6">
                        <p className="text-purple-200 text-xs mb-2 font-medium">Limitations:</p>
                        <ul className="space-y-1">
                          {tier.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className="flex items-start">
                              <span className="text-purple-300 mr-2 text-xs">•</span>
                              <span className="text-purple-200 text-xs">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(tier.id)}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      tier.id === 'free'
                        ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                        : tier.recommended
                        ? 'bg-white text-purple-900 hover:bg-yellow-50 shadow-lg hover:shadow-xl'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Compare All Features
          </h2>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left py-6 px-6 text-white font-semibold">Features</th>
                    <th className="text-center py-6 px-4 text-white font-semibold">Free</th>
                    <th className="text-center py-6 px-4 text-white font-semibold">Plus</th>
                    <th className="text-center py-6 px-4 text-white font-semibold">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SUBSCRIPTION_FEATURES).map(([key, feature], index) => (
                    <tr key={key} className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                      <td className="py-4 px-6 text-purple-100 font-medium">{feature.description}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-purple-200 text-sm">{feature.free}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.plus === 'boolean' ? (
                          feature.plus ? (
                            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-purple-200 text-sm">{feature.plus}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-4 h-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-purple-200 text-sm">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "How do the subscription plans work?",
                answer: "Both Plus and Pro plans are monthly subscriptions that automatically renew. You can cancel anytime from your account settings. Plus gives you comprehensive energy insights, while Pro adds lucky colors and hourly notifications."
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer: "Yes! You can cancel your subscription at any time. There are no long-term commitments. You'll continue to have access to your plan features until the end of your current billing period."
              },
              {
                question: "What's the difference between Plus and Pro?",
                answer: "Plus ($4.99/month) includes all crystal recommendations, daily energy scores, and monthly reports. Pro ($9.99/month) adds 12-month lucky colors and hourly energy notifications for more detailed guidance."
              },
              {
                question: "Is my payment information secure?",
                answer: "Absolutely! We use PayPal for secure payment processing. We never store your payment information on our servers, ensuring your financial data stays protected."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-purple-200 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedTier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Subscription</h3>
              <p className="text-gray-600">You're subscribing to {selectedTier.name}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-gray-900">{selectedTier.name}</span>
                <span className="font-bold text-gray-900">{selectedTier.price}</span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedTier.period && `Billed ${selectedTier.period}`}
              </div>
            </div>

            {/* PayPal Payment Section */}
            <div className="mb-6">
              <div className="text-center text-sm text-gray-600 mb-4">
                Secure payment with PayPal
              </div>
              
              {/* Instant PayPal Payment Options */}
              <div className="space-y-3">
                {/* PayPal.me Link - Most Reliable */}
                <button
                  onClick={() => {
                    const amount = selectedTier.price.replace('$', '');
                    const paypalMeUrl = `https://www.paypal.com/paypalme/crystalmatch/${amount}USD`;
                    window.open(paypalMeUrl, '_blank');
                  }}
                  className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 6.430-7.958 6.430H10.15c-.524 0-.968.382-1.05.9L7.858 19.96c-.073.462.263.877.736.877h4.78c.524 0 .968-.382 1.05-.9l.429-2.72c.073-.462-.263-.877-.736-.877h-1.52l.429-2.72c.073-.462.526-.9 1.05-.9h2.19c3.578 0 6.396-1.456 7.205-5.66.202-1.05.078-1.94-.429-2.603z"/>
                  </svg>
                  Pay ${selectedTier.price} with PayPal
                </button>
                
                                 {/* Credit Card via PayPal */}
                <button
                  onClick={() => {
                    const amount = selectedTier.price.replace('$', '');
                    // Direct PayPal checkout URL that accepts credit cards
                    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=crystalmatch.app@gmail.com&item_name=${encodeURIComponent(selectedTier.name + ' Monthly Subscription - Crystal Match')}&amount=${amount}&currency_code=USD&return=${encodeURIComponent(window.location.origin + '/subscription/success?plan=' + selectedTier.id)}&cancel_return=${encodeURIComponent(window.location.origin + '/subscription')}&no_shipping=1`;
                    window.open(paypalUrl, '_blank');
                  }}
                  className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay with Credit Card
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Choose your preferred payment method - all options are secure and instant<br/>
                  No waiting, no loading - click and pay immediately!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-2xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure payment powered by PayPal. Cancel anytime from your account settings.
            </p>
          </div>
        </div>
      )}

      {/* Back to Dashboard */}
      <div className="text-center pb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-purple-300 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Energy Dashboard
        </Link>
      </div>
    </div>
  );
} 