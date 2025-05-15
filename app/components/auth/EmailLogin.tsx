import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
        throw new Error(data.error || 'Failed to send code');
      }

      setStep('code');
      setCountdown(300); // 5 minutes countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/send-code?email=${encodeURIComponent(email)}&code=${code}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // 验证成功，获取或创建用户令牌
      const tokenResponse = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || 'Failed to authenticate');
      }

      // 存储令牌并跳转
      localStorage.setItem('token', tokenData.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
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
            disabled={isLoading}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="code" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white text-sm sm:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            {countdown > 0 && (
              <p className="mt-2 text-xs sm:text-sm text-gray-400">
                Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </p>
            )}
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