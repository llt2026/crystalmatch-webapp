'use client';

import React, { useEffect, useState } from 'react';
import { mapSubscriptionToTier, testSubscriptionMapping } from './subscription-utils';

/**
 * 订阅状态测试组件
 * 仅在开发环境中使用，用于验证会员状态映射
 */
export default function SubscriptionTest() {
  const [testInput, setTestInput] = useState<string>('plus');
  const [mappedValue, setMappedValue] = useState<string>('');
  const [testResults, setTestResults] = useState<string[]>([]);

  // 运行自动测试
  useEffect(() => {
    // 重定向控制台输出到状态
    const originalLog = console.log;
    const originalError = console.error;
    const logs: string[] = [];

    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError(...args);
    };

    // 运行测试
    testSubscriptionMapping();
    
    // 恢复控制台
    console.log = originalLog;
    console.error = originalError;

    setTestResults(logs);
  }, []);

  // 测试输入值映射
  const testMapping = () => {
    const result = mapSubscriptionToTier(testInput);
    setMappedValue(result);
  };

  useEffect(() => {
    testMapping();
  }, [testInput]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">订阅状态映射测试</h1>
      
      {/* 手动测试 */}
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">手动测试</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="border px-3 py-2 rounded"
            placeholder="输入订阅状态"
          />
          <button 
            onClick={testMapping}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            测试
          </button>
        </div>
        <div className="mt-4">
          <p>输入值: <code className="bg-gray-200 px-2 py-1 rounded">{testInput || '(空)'}</code></p>
          <p>映射结果: <code className="bg-green-100 px-2 py-1 rounded font-bold">{mappedValue}</code></p>
        </div>
      </div>
      
      {/* 自动测试结果 */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">自动测试结果</h2>
        <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
          {testResults.map((log, index) => (
            <div key={index} className={log.startsWith('ERROR') ? 'text-red-400' : ''}>
              {log}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
} 