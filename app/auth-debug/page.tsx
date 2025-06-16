"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [token, setToken] = useState('');
  const [savedToken, setSavedToken] = useState('');
  const [profileData, setProfileData] = useState<any>(null);
  const [elementsData, setElementsData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 页面加载时检查当前token
  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      setSavedToken(currentToken);
      setToken(currentToken);
    }
  }, []);
  
  // 保存token到localStorage
  const handleSaveToken = () => {
    if (token) {
      localStorage.setItem('authToken', token);
      setSavedToken(token);
      setError('');
    }
  };
  
  // 清除token
  const handleClearToken = () => {
    localStorage.removeItem('authToken');
    setSavedToken('');
    setError('');
  };
  
  // 获取新token
  const handleGenerateToken = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/debug/auth?action=generate-token');
      const data = await res.json();
      setToken(data.token);
    } catch (err) {
      setError('获取token失败');
    }
    setLoading(false);
  };
  
  // 测试调用API
  const handleTestAPI = async (endpoint: string, setter: (data: any) => void) => {
    if (!savedToken) {
      setError('请先保存token');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      
      if (!res.ok) {
        throw new Error(`API返回错误: ${res.status}`);
      }
      
      const data = await res.json();
      setter(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(`调用 ${endpoint} 失败: ${err instanceof Error ? err.message : String(err)}`);
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">认证调试工具</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Token管理</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">JWT Token</label>
            <textarea 
              className="w-full p-2 border rounded" 
              rows={3}
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleSaveToken}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              保存到localStorage
            </button>
            
            <button
              onClick={handleGenerateToken}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={loading}
            >
              生成新Token
            </button>
            
            <button
              onClick={handleClearToken}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              清除Token
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-700">当前Token状态: {savedToken ? '已设置' : '未设置'}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">API测试</h2>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => handleTestAPI('/api/user/profile', setProfileData)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              disabled={loading}
            >
              测试 /api/user/profile
            </button>
            
            <button
              onClick={() => handleTestAPI('/api/user/elements', setElementsData)}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={loading}
            >
              测试 /api/user/elements
            </button>
            
            <Link 
              href="/profile" // 重定向到个人资料页面，确保有正确的生日参数 
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
            >
              View Annual Energy Report
            </Link>
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-600 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading && <p className="text-gray-600">加载中...</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Profile API 结果:</h3>
            {profileData && (
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-80 text-sm">
                {JSON.stringify(profileData, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Elements API 结果:</h3>
            {elementsData && (
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-80 text-sm">
                {JSON.stringify(elementsData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 