'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

// 用户类型定义
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  subscriptionStatus: 'free' | 'plus' | 'pro' | 'none';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加载用户数据
  useEffect(() => {
    const fetchUsers = async (page: number = 1, search: string = '') => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
        if (!res.ok) {
          throw new Error('API 请求失败');
        }
        const data = await res.json();
        setUsers(data.users);
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        setError('无法加载用户数据');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers(currentPage, searchTerm);
  }, []);

  // 当搜索词或分页变化时重新获取
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/users?page=${currentPage}&search=${encodeURIComponent(searchTerm)}`);
        if (!res.ok) {
          throw new Error('API 请求失败');
        }
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError('无法加载用户数据');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, currentPage]);

  // 过滤用户
  const currentUsers = users;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // 处理订阅类型修改
  const handleSubscriptionChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscriptionStatus: newStatus 
        }),
      });

      if (!res.ok) {
        throw new Error('修改订阅类型失败');
      }

      // 更新本地状态
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, subscriptionStatus: newStatus as 'free' | 'plus' | 'pro' | 'none' } 
          : user
      ));

      alert('订阅类型已成功更新');
    } catch (err) {
      console.error(err);
      alert('修改订阅类型失败，请重试');
    }
  };

  // 订阅状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'plus':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 订阅状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pro':
        return 'Pro会员';
      case 'plus':
        return 'Plus会员';
      case 'free':
        return '免费用户';
      default:
        return '未订阅';
    }
  };

  // 翻译函数的简单实现
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'admin.dashboard': '管理员仪表盘',
      'admin.users': '用户管理',
      'admin.logout': '退出登录'
    };
    return translations[key] || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] to-[#16213E]">
      {/* 管理后台导航栏 */}
      <nav className="bg-black/30 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image 
              src="/images/crystal-logo-v3.svg" 
              alt="Crystal Logo" 
              width={30} 
              height={30}
              className="animate-pulse"
            />
            <span className="ml-2 text-xl font-medium bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
              管理后台
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/admin/dashboard" 
              className="text-purple-200 hover:text-white transition-colors"
            >
              {t('admin.dashboard')}
            </Link>
            <Link 
              href="/admin/users" 
              className={`text-purple-200 hover:text-white transition-colors ${pathname === '/admin/users' ? 'text-white border-b-2 border-purple-500' : ''}`}
            >
              {t('admin.users')}
            </Link>
            <button 
              onClick={() => router.push('/admin/login')}
              className="text-purple-200 hover:text-white transition-colors"
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">用户管理</h1>
          </div>

          {/* 搜索框 */}
          <div className="glass-card p-4 rounded-xl mb-6">
            <input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-500 text-white"
            />
          </div>

          {error ? (
            <div className="glass-card p-4 rounded-xl text-red-500">
              {error}
            </div>
          ) : isLoading ? (
            <div className="glass-card p-8 rounded-xl flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* 用户列表 */}
              <div className="overflow-x-auto glass-card rounded-xl">
                <table className="min-w-full divide-y divide-purple-500/10">
                  <thead className="bg-purple-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        用户
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider hidden sm:table-cell">
                        注册日期
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider hidden md:table-cell">
                        最近登录
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        订阅状态
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-purple-200 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-300">{formatDate(user.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-300">{formatDate(user.lastLogin)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={user.subscriptionStatus}
                            onChange={(e) => handleSubscriptionChange(user.id, e.target.value)}
                            className="px-2 py-1 text-xs rounded-md bg-purple-900/50 text-white border border-purple-500/30 focus:outline-none focus:border-purple-500"
                          >
                            <option value="free">免费用户</option>
                            <option value="plus">Plus会员</option>
                            <option value="pro">Pro会员</option>
                            <option value="none">未订阅</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button 
                            className="text-purple-400 hover:text-purple-300 mx-1"
                            onClick={() => alert(`查看用户详情: ${user.id}`)}
                          >
                            详情
                          </button>
                          <button 
                            className="text-red-400 hover:text-red-300 mx-1"
                            onClick={() => alert(`删除用户: ${user.id}`)}
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md bg-purple-800/30 text-white disabled:text-gray-500 disabled:bg-transparent"
                    >
                      上一页
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === index + 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-800/30 text-white'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md bg-purple-800/30 text-white disabled:text-gray-500 disabled:bg-transparent"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 