'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/app/utils/useTranslation';

interface VerificationCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onResend: () => void;
  isResending?: boolean;
  error?: string;
  codeExpirySeconds?: number;
  onComplete?: () => void;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  onResend,
  isResending = false,
  error,
  codeExpirySeconds = 15 * 60,
  onComplete
}) => {
  const { t } = useTranslation();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [expiryCountdown, setExpiryCountdown] = useState<number>(codeExpirySeconds);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [focused, setFocused] = useState<boolean>(false);
  
  // 自动开始倒计时
  useEffect(() => {
    startResendCountdown();
    startExpiryCountdown();
  }, []);
  
  // 检测验证码是否填写完成
  useEffect(() => {
    if (value.length === 6 && onComplete) {
      // 当验证码填写完成时，等待一小段时间后触发提交
      const timer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, onComplete]);
  
  // 重发倒计时逻辑
  const startResendCountdown = () => {
    setIsCounting(true);
    setResendCountdown(60);
  };
  
  // 过期倒计时逻辑
  const startExpiryCountdown = () => {
    setExpiryCountdown(codeExpirySeconds);
  };
  
  // 重发倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCounting && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setIsCounting(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown, isCounting]);
  
  // 过期倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (expiryCountdown > 0) {
      timer = setTimeout(() => {
        setExpiryCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [expiryCountdown]);
  
  // 处理重新发送
  const handleResend = () => {
    if (!isCounting && !isResending) {
      onResend();
      startResendCountdown();
      // 重置过期倒计时
      startExpiryCountdown();
    }
  };
  
  // 处理单个输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const digit = e.target.value;
    
    // 只允许输入数字
    if (/^\d?$/.test(digit)) {
      // 更新验证码
      const newCode = [...value.padEnd(6, '')];
      newCode[index] = digit;
      onChange(newCode.join(''));
      
      // 自动聚焦下一个输入框
      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // 退格键处理
    if (e.key === 'Backspace') {
      if (!value[index]) {
        // 当前框为空且按退格，移动到上一个输入框
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
          
          // 清除上一个输入框的值
          const newCode = [...value];
          newCode[index - 1] = '';
          onChange(newCode.join(''));
        }
      } else {
        // 清除当前框的值
        const newCode = [...value];
        newCode[index] = '';
        onChange(newCode.join(''));
      }
    } 
    // 方向键处理
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  // 处理粘贴验证码
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // 验证是否是6位数字
    if (/^\d{6}$/.test(pastedData)) {
      onChange(pastedData);
      // 聚焦到最后一个输入框
      inputRefs.current[5]?.focus();
    }
  };

  // 格式化倒计时显示
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // 确定边框颜色类
  const getBorderClass = () => {
    if (error) return "border-red-500";
    if (focused) return "border-purple-400";
    return "border-purple-500/30";
  };
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between space-x-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white/5 border ${getBorderClass()} rounded-lg text-white focus:ring-2 focus:ring-purple-500 transition-all`}
              aria-invalid={error ? "true" : "false"}
            />
          ))}
        </div>
        
        {/* 验证码有效期显示 */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-purple-300">
            {t('auth.codeExpiry')}: {formatTime(expiryCountdown)}
          </p>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-2 rounded-md mt-1 border border-red-500/20">
            <p>{error === 'code_not_found' 
                ? t('auth.invalidCode')
                : error === 'code_mismatch' 
                  ? t('auth.invalidCode')
                  : error}
            </p>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-purple-300">
          {isCounting 
            ? `${formatTime(resendCountdown)}${t('auth.resendIn')}` 
            : t('auth.notReceived')}
        </p>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={isCounting || isResending}
          className={`text-sm px-3 py-1 rounded ${
            isCounting || isResending 
              ? 'bg-gray-700/30 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 hover:text-white'
          }`}
        >
          {isResending ? t('auth.sending') : t('auth.resend')}
        </button>
      </div>
      
      {/* 帮助提示 */}
      <div className="text-xs text-gray-400 mt-1">
        <p>{t('auth.pasteHint')}</p>
      </div>
    </div>
  );
};

export default VerificationCodeInput; 