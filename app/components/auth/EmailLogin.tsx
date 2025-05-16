import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VerificationCodeInput from '@/app/components/auth/VerificationCodeInput';

export default function EmailLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setVerificationError('');
    setSendingCode(true);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // 频率限制错误
          throw new Error(`Too many requests. Please try again in ${data.remainingTime || 60} seconds.`);
        }
        throw new Error(data.error || 'Failed to send code');
      }

      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationError('');
    setIsLoading(true);

    try {
      // 使用新的验证接口
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // 验证成功，跳转到仪表盘
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      if (errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('验证')) {
        setVerificationError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white text-sm sm:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Enter your email"
            />
          </div>
          {error && (
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading || sendingCode}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingCode ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="code" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
              Verification Code
            </label>
            <VerificationCodeInput 
              value={code}
              onChange={setCode}
              onResend={handleSendCode}
              isResending={sendingCode}
              error={verificationError}
            />
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              We've sent a verification code to {email}
            </p>
          </div>
          {error && (
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          )}
          <div className="space-y-2 sm:space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
                setVerificationError('');
              }}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white/5 text-white rounded-lg font-medium text-sm sm:text-base hover:bg-white/10 transition-all"
            >
              Back to Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 