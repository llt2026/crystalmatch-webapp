'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TokenHelperPage() {
  const [tokenData, setTokenData] = useState<{
    authToken?: string;
    token?: string;
    jwt?: string;
    crystalMatchToken?: string;
  }>({});
  
  const [cookies, setCookies] = useState<string[]>([]);
  const [newToken, setNewToken] = useState('');
  
  useEffect(() => {
    // 获取所有可能的token
    if (typeof window !== 'undefined') {
      const data: Record<string, string> = {};
      ['authToken', 'token', 'jwt', 'crystalMatchToken'].forEach(key => {
        const value = localStorage.getItem(key);
        if (value) data[key] = value;
      });
      setTokenData(data);
      
      // 获取所有cookies
      setCookies(document.cookie.split(';').map(c => c.trim()));
    }
  }, []);
  
  const handleTokenSave = () => {
    if (!newToken) return;
    
    // 保存到所有可能的位置
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('token', newToken);
    document.cookie = `token=${newToken}; path=/; max-age=86400`;
    
    alert('Token已保存到localStorage和cookie!');
    window.location.reload();
  };
  
  const handleClearTokens = () => {
    ['authToken', 'token', 'jwt', 'crystalMatchToken'].forEach(key => {
      localStorage.removeItem(key);
    });
    document.cookie = 'token=; path=/; max-age=0';
    alert('所有token已清除!');
    window.location.reload();
  };
  
  const decodeJwt = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return '无法解析: 不是有效的JWT格式';
      
      const decoded = JSON.parse(atob(parts[1]));
      return JSON.stringify(decoded, null, 2);
    } catch (e) {
      return '解析失败: ' + (e instanceof Error ? e.message : String(e));
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Token 助手</h1>
      
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">当前存储的Token</h2>
        {Object.keys(tokenData).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(tokenData).map(([key, value]) => (
              <div key={key} className="p-3 border rounded bg-white">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{key}</h3>
                  <span className="text-xs text-gray-500">
                    {value.length} 字符
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-800 overflow-hidden overflow-ellipsis">
                  {value.substring(0, 20)}...
                </div>
                <div className="mt-3 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <pre>{decodeJwt(value)}</pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">未找到任何存储的Token</p>
        )}
      </div>
      
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">当前Cookies</h2>
        {cookies.length > 0 ? (
          <ul className="list-disc list-inside">
            {cookies.map((cookie, index) => (
              <li key={index} className="mb-1 text-gray-700">{cookie}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">未找到任何Cookie</p>
        )}
      </div>
      
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">设置新Token</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">
              输入JWT Token
            </label>
            <textarea 
              className="w-full p-2 border rounded h-32" 
              value={newToken} 
              onChange={(e) => setNewToken(e.target.value)} 
              placeholder="粘贴JWT token..."
            />
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleTokenSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
              disabled={!newToken}
            >
              保存Token
            </button>
            
            <button
              onClick={handleClearTokens}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清除所有Token
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors text-center"
                          href="/profile" // 重定向到个人资料页面，确保有正确的生日参数
        >
          View Annual Energy Report
        </Link>
      </div>
    </div>
  );
} 