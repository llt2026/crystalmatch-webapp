import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VerificationCodeInput from '@/app/components/auth/VerificationCodeInput';
import { useTranslation } from '@/app/utils/useTranslation';

export default function EmailLogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [codeExpirySeconds, setCodeExpirySeconds] = useState(900); // Default 15 minutes

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError(t('auth.enterEmail'));
      return;
    }

    // Check if email format is valid
    if (!validateEmail(email)) {
      setError(t('errors.emailFormat'));
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
          // Rate limit error
          throw new Error(`${t('errors.networkError')}, ${data.remainingTime || 60} ${t('auth.resendIn')}`);
        }
        throw new Error(data.error || t('errors.networkError'));
      }

      // Get code expiry from response
      if (data.expirySeconds) {
        setCodeExpirySeconds(data.expirySeconds);
      }

      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.networkError'));
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      setVerificationError(t('auth.enterVerificationCode'));
      return;
    }
    
    setError('');
    setVerificationError('');
    setIsLoading(true);

    try {
      // Use the verification API
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use API error message
        throw new Error(data.error || t('auth.invalidCode'));
      }

      // Verification successful, redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.networkError');
      // If error is related to verification code, set it as verification error, otherwise set as general error
      if (errorMessage.includes('verification code') || errorMessage.includes('code')) {
        setVerificationError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit when verification code is complete
  const handleCodeComplete = () => {
    if (code.length === 6 && !isLoading) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="w-full max-w-md">
      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
              {t('profile.email')}
            </label>
            <input
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white text-sm sm:text-base focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              placeholder={t('auth.emailPlaceholder')}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              title="Please enter a valid email address (e.g. user@example.com)"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 text-red-400 text-xs sm:text-sm p-2 rounded-md border border-red-500/20">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || sendingCode}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingCode ? t('auth.sending') : t('auth.sendCode')}
          </button>
        </form>
      ) : (
        <form ref={formRef} onSubmit={handleVerifyCode} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="code" className="block text-xs sm:text-sm font-medium text-gray-200 mb-1">
              {t('auth.verificationCode')}
            </label>
            <VerificationCodeInput 
              value={code}
              onChange={setCode}
              onResend={handleSendCode}
              isResending={sendingCode}
              error={verificationError}
              codeExpirySeconds={codeExpirySeconds}
              onComplete={handleCodeComplete}
            />
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              {t('auth.codeSent')} <span className="text-purple-300">{email}</span>
            </p>
          </div>
          {error && (
            <div className="bg-red-500/10 text-red-400 text-xs sm:text-sm p-2 rounded-md border border-red-500/20">
              {error}
            </div>
          )}
          <div className="space-y-2 sm:space-y-3">
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium text-sm sm:text-base hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.verifying') : t('auth.verifyAndLogin')}
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
              {t('auth.backToEmail')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 