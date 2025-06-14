﻿'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Feedback {
  id: string;
  userId: string;
  feedbackType: string;
  reportType: string;
  content: string;
  options: string[];
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });

  // 获取反馈数据
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/feedback?page=${currentPage}`);
        
        if (!response.ok) {
          throw new Error('无法获取反馈数据');
        }
        
        const data = await response.json();
        setFeedbacks(data.feedbacks);
        setPagination(data.pagination);
      } catch (err) {
        setError('获取反馈数据失败');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, [currentPage]);
  
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setCurrentPage(page);
  };
  
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 获取反馈类型对应的图标
  const getFeedbackIcon = (type: string) => {
    return type === 'positive' ? '👍' : '👎';
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
              管理员仪表盘
            </Link>
            <Link 
              href="/admin/users" 
              className="text-purple-200 hover:text-white transition-colors"
            >
              用户管理
            </Link>
            <Link 
              href="/admin/feedback" 
              className={`text-purple-200 hover:text-white transition-colors ${pathname === '/admin/feedback' ? 'text-white border-b-2 border-purple-500' : ''}`}
            >
              用户反馈
            </Link>
            <button 
              onClick={() => router.push('/admin/login')}
              className="text-purple-200 hover:text-white transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      {/* 页面内容 */}
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white mb-4 sm:mb-0">用户反馈</h1>
          </div>

          {error ? (
            <div className="bg-red-900/20 backdrop-blur-sm p-4 rounded-xl text-red-400">
              {error}
            </div>
          ) : isLoading ? (
            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl flex justify-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* 反馈表格 */}
              <div className="overflow-x-auto bg-black/30 backdrop-blur-sm rounded-xl">
                <table className="min-w-full divide-y divide-purple-500/10">
                  <thead className="bg-purple-900/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        用户 ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        反馈类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        报告类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        反馈时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                        内容
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10 bg-black/10">
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-purple-200">
                          暂无反馈数据
                        </td>
                      </tr>
                    ) : (
                      feedbacks.map((feedback) => (
                        <tr key={feedback.id} className="hover:bg-purple-900/10 transition-colors">
                          <td className="px-4 py-4 text-sm">
                            {feedback.userId}
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-200">
                              {getFeedbackIcon(feedback.feedbackType)} {feedback.feedbackType === 'positive' ? '正面' : '负面'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-purple-200">
                            {feedback.reportType}
                          </td>
                          <td className="px-4 py-4 text-sm text-purple-200 whitespace-nowrap">
                            {formatDate(feedback.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-sm text-purple-200">
                            <div className="max-w-xs">
                              {feedback.content ? (
                                <p className="truncate">{feedback.content}</p>
                              ) : (
                                <ul className="list-disc list-inside">
                                  {feedback.options.map((option, idx) => (
                                    <li key={idx} className="truncate text-xs">{option}</li>
                                  ))}
                                </ul>
                              )}
                              <button 
                                onClick={() => {
                                  alert(`用户选项:\n${feedback.options.join('\n')}\n\n内容:\n${feedback.content || '无'}`);
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 mt-1"
                              >
                                查看详情
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 分页控制 */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-purple-500/30 bg-black/20 text-sm font-medium ${
                        currentPage === 1 ? 'text-purple-500/50 cursor-not-allowed' : 'text-purple-300 hover:bg-purple-900/20'
                      }`}
                    >
                      <span className="sr-only">上一页</span>
                      &larr;
                    </button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-purple-500/30 text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-purple-900/50 border-purple-500 text-white'
                            : 'bg-black/20 text-purple-300 hover:bg-purple-900/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-purple-500/30 bg-black/20 text-sm font-medium ${
                        currentPage === pagination.pages ? 'text-purple-500/50 cursor-not-allowed' : 'text-purple-300 hover:bg-purple-900/20'
                      }`}
                    >
                      <span className="sr-only">下一页</span>
                      &rarr;
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
