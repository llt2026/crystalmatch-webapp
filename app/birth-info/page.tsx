'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Countries data with regions
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  // Add more countries as needed
];

// States/Regions data (example for US)
const statesByCountry: { [key: string]: { code: string; name: string }[] } = {
  US: [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    // Add more US states
  ],
  CN: [
    { code: 'BJ', name: 'Beijing' },
    { code: 'SH', name: 'Shanghai' },
    { code: 'GD', name: 'Guangdong' },
    // Add more Chinese provinces
  ],
  // Add more countries' regions
};

// Cities data (example)
const citiesByState: { [key: string]: string[] } = {
  CA: ['Los Angeles', 'San Francisco', 'San Diego'],
  NY: ['New York City', 'Buffalo', 'Albany'],
  BJ: ['Chaoyang', 'Haidian', 'Dongcheng'],
  // Add more cities
};

export default function BirthInfo() {
  const router = useRouter();
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Registration fields
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [name, setName] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setSendingCode(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate || !gender || !email) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!name) {
      setError('Please enter your name');
      return;
    }
    
    if (codeSent && !verificationCode) {
      setError('Please enter the verification code sent to your email');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const birthDateTime = new Date(birthDate);
      
      const birthInfo = {
        birthDate: birthDateTime.toISOString(),
        gender
      };
      
      localStorage.setItem('birthInfo', JSON.stringify(birthInfo));
      
      // Register the user if code has been sent
      if (codeSent) {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            birthdate: birthDateTime.toISOString(),
            code: verificationCode
          })
        });
        
        const registerData = await registerResponse.json();
        
        if (!registerResponse.ok) {
          throw new Error(registerData.error || 'Registration failed');
        }
      }
      
      router.push('/energy-reading');
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-8 md:p-12 bg-gradient-to-br from-purple-900 to-black">
      <Link href="/" className="self-start mb-8 flex items-center text-purple-300 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Home
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Your Cosmic Details
          </h1>
          <p className="text-purple-200 text-sm">
            Let's discover your unique energy signature
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          {error && (
            <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-200">When were you born? *</label>
              <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                dateFormat="MMMM d, yyyy"
                className="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholderText="Select your birth date"
                required
              />
            </div>
            
            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-purple-200">What's your gender? *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`p-3 rounded-lg text-center transition-all ${
                    gender === 'male' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-white/5 border border-purple-500/30 hover:bg-white/10'
                  }`}
                  onClick={() => setGender('male')}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg text-center transition-all ${
                    gender === 'female' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50' 
                      : 'bg-white/5 border border-purple-500/30 hover:bg-white/10'
                  }`}
                  onClick={() => setGender('female')}
                >
                  Female
                </button>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="pt-4 border-t border-purple-500/20">
              <h3 className="text-lg font-medium text-white mb-4">Create Your Account</h3>
              
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-200">Your Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-purple-200">Email Address *</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    placeholder="your@email.com"
                    required
                    disabled={codeSent}
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode || !email}
                    className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 disabled:bg-purple-600/50 rounded-lg text-white text-sm transition-colors whitespace-nowrap"
                  >
                    {sendingCode ? 'Sending...' : codeSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>
              
              {/* Verification Code */}
              {codeSent && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-purple-200">Verification Code *</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="mt-1 text-xs text-purple-300">
                    We've sent a verification code to {email}
                  </p>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reading the Stars...
                </>
              ) : (
                'Reveal My Energy Reading'
              )}
            </button>
            
            <p className="text-center text-purple-300 text-xs">
              By continuing, you agree to our <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
            </p>
          </form>
        </div>

        {/* Trust Indicator */}
        <div className="mt-6 text-center">
          <p className="text-purple-300 text-xs">
            🔒 Your information is kept private and secure
          </p>
        </div>
      </div>
    </main>
  );
} 