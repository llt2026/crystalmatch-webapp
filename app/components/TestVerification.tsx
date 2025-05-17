'use client';

import { useState, useEffect } from 'react';

export default function TestVerification() {
  const [email, setEmail] = useState('test@example.com');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [testCode, setTestCode] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 获取调试信息
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug/check-codes');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('获取调试信息失败:', error);
    }
  };

  // 清理验证码
  const clearCodes = async () => {
    try {
      await fetch('/api/debug/check-codes', { method: 'DELETE' });
      setStatus('所有验证码已清理');
      fetchDebugInfo();
    } catch (error) {
      setStatus(`清理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 发送验证码
  const sendCode = async () => {
    if (!email) {
      setStatus('请输入邮箱');
      return;
    }

    setLoading(true);
    setStatus('发送验证码中...');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        setStatus(`发送成功: ${data.testMode ? '测试模式' : '正常模式'}`);
        if (data.code) {
          setTestCode(data.code);
          setStatus(`发送成功: 测试模式，验证码: ${data.code}`);
        }
        // 更新调试信息
        fetchDebugInfo();
      } else {
        setStatus(`发送失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      setStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const verifyCode = async () => {
    if (!email || !code) {
      setStatus('请输入邮箱和验证码');
      return;
    }

    setLoading(true);
    setStatus('验证中...');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      setLastResponse(data);

      if (response.ok) {
        setStatus('验证成功');
        // 更新调试信息
        fetchDebugInfo();
      } else {
        setStatus(`验证失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      setStatus(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 使用测试验证码
  const useTestCode = () => {
    if (testCode) {
      setCode(testCode);
    }
  };

  // 定期刷新调试信息
  useEffect(() => {
    fetchDebugInfo();
    
    const interval = setInterval(() => {
      fetchDebugInfo();
      setRefreshKey(prev => prev + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto my-8 bg-white text-gray-800">
      <h2 className="text-xl font-bold mb-4">验证码测试工具</h2>
      
      <div className="mb-4">
        <label className="block mb-1 font-medium">邮箱地址</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="邮箱地址"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={sendCode}
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2"
        >
          {loading ? '处理中...' : '发送验证码'}
        </button>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">验证码</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md"
            placeholder="6位验证码"
            maxLength={6}
          />
          {testCode && (
            <button
              onClick={useTestCode}
              className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              使用测试码
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={verifyCode}
          disabled={loading || !code}
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {loading ? '处理中...' : '验证'}
        </button>
      </div>

      {status && (
        <div className={`p-3 mt-4 rounded-md ${status.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status}
        </div>
      )}

      {testCode && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          测试验证码: <strong>{testCode}</strong>
        </div>
      )}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">验证码存储状态</h3>
          <div className="flex gap-2">
            <button 
              onClick={fetchDebugInfo}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
            >
              刷新
            </button>
            <button 
              onClick={clearCodes}
              className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs"
            >
              清理所有
            </button>
          </div>
        </div>
        
        {debugInfo ? (
          <div className="text-xs">
            <div className="bg-gray-100 p-2 rounded-md mb-2">
              <p>总验证码数: <strong>{debugInfo.total}</strong></p>
              <p>SKIP_REDIS: <strong>{debugInfo.skipRedis ? 'true' : 'false'}</strong></p>
              <p>更新时间: {new Date(debugInfo.now).toLocaleTimeString()}</p>
            </div>
            
            {Object.keys(debugInfo.codes).length > 0 ? (
              <div className="overflow-auto max-h-40">
                <table className="w-full text-left">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-1">邮箱</th>
                      <th className="p-1">验证码</th>
                      <th className="p-1">过期时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(debugInfo.codes).map(([email, data]: [string, any]) => (
                      <tr key={email} className={data.isExpired ? 'bg-red-50' : 'bg-green-50'}>
                        <td className="p-1 border-b border-gray-200">{email}</td>
                        <td className="p-1 border-b border-gray-200">{data.code}</td>
                        <td className="p-1 border-b border-gray-200">
                          {data.isExpired ? '已过期' : `${data.expiresIn}秒`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">无存储验证码</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-xs">加载中...</p>
        )}
      </div>

      {lastResponse && (
        <div className="mt-4">
          <details>
            <summary className="cursor-pointer font-medium">最近响应</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded-md overflow-auto text-xs">
              {JSON.stringify(lastResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 