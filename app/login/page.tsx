'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        cache: 'no-store',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.status === 404 && data?.unregistered) {
        router.push('/birth-info?email=' + encodeURIComponent(email));
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-black p-4">
      <Link href="/" className="self-start mb-8 flex items-center text-purple-300 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Home
      </Link>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">
            Sign In
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
                placeholder="example@email.com"
                disabled={isLoading || codeSent}
              />
            </div>

            {!codeSent ? (
              <button
                onClick={handleSendCode}
                disabled={isLoading || !email}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg text-white font-medium transition-colors"
              >
                {isLoading ? 'Loading...' : 'Send Verification Code'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading || code.length !== 6}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg text-white font-medium transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Verify Code'}
                </button>
              </>
            )}

            <div className="pt-4 border-t border-purple-400/20">
              <p className="text-center text-gray-300 mb-4">
                New to CrystalMatch?
              </p>
              <Link 
                href="/birth-info"
                className="block w-full py-3 px-4 bg-purple-500/50 hover:bg-purple-500/70 rounded-lg text-white font-medium transition-colors text-center"
              >
                Start Your Energy Reading
              </Link>
            </div>

            <p className="text-center text-gray-400 text-sm mt-4">
              By logging in, you agree to our <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms of Service</Link> and <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 