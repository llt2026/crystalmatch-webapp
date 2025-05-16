'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VerificationCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onResend: () => void;
  isResending?: boolean;
  error?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  onResend,
  isResending = false,
  error
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([null, null, null, null, null, null]);
  const [countdown, setCountdown] = useState<number>(60);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  
  // 自动开始倒计时
  useEffect(() => {
    startCountdown();
  }, []);
  
  // 倒计时逻辑
  const startCountdown = () => {
    setIsCounting(true);
    setCountdown(60);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isCounting]);
  
  // 处理重新发送
  const handleResend = () => {
    if (!isCounting && !isResending) {
      onResend();
      startCountdown();
    }
  };
  
  // 处理单个输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const digit = e.target.value;
    
    // 只允许输入数字
    if (/^\d?$/.test(digit)) {
      // 更新验证码
      const newCode = [...value];
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
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
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
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white/5 border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
            />
          ))}
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-purple-300">
          {isCounting 
            ? `${countdown}秒后可重新发送` 
            : '没有收到验证码？'}
        </p>
        
        <button
          type="button"
          onClick={handleResend}
          disabled={isCounting || isResending}
          className={`text-sm ${
            isCounting || isResending 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-purple-400 hover:text-purple-300'
          }`}
        >
          {isResending ? '发送中...' : '重新发送'}
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeInput; 