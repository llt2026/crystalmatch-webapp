/**
 * May 2025 Monthly Deep Report Page - 完整版本
 */
'use client';

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// 提取使用useSearchParams的部分到单独组件
function MayReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  const userType = searchParams?.get('userType') || 'plus'; // 默认为plus用户
  
  // 计算日期范围（美国格式：MM/DD/YYYY）
  const startDate = "05/01/2025";
  const endDate = "05/31/2025";
  const dateRange = `${startDate} - ${endDate}`;
  
  // 根据用户类型确定标题后缀
  const titleSuffix = userType === 'pro' ? '(Pro)' : '(Plus)';
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-black py-8 px-4 text-white">
      <div className="max-w-md mx-auto space-y-6">
        {/* 页头 - 按要求修改格式 */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">CrystalMatch Monthly Energy Report {titleSuffix}</h1>
          <p className="text-purple-300 mt-1">{dateRange}</p>
        </header>
        
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link href="/profile" className="text-purple-300 hover:text-white flex items-center w-fit">
            ← 返回个人主页
          </Link>
        </div>
        
        {/* 能量概览 - 使用更美观的进度条 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 space-y-3">
          <h2 className="text-lg font-semibold text-center">能量概览</h2>
          
          <div className="text-center">
            <div className="text-3xl font-bold">83 / 100</div>
            <div className="mt-1 text-purple-300">成长模式 ✨</div>
          </div>
          
          {/* 美化版进度条 */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "83%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">最强元素</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  💧 水
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">推荐水晶：透明水晶</div>
            </div>
            <div className="text-center">
              <div className="font-medium">最弱元素</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
                  🔥 火
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">推荐水晶：红碧玺</div>
            </div>
          </div>
        </div>
        
        {/* 日能量日历 - 显示5天，包含行动建议 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">日能量日历</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">5月1日</div>
                <div className="text-sm">8.3/10</div>
                <div className="text-green-400 text-sm">🟢 上升</div>
              </div>
              <p className="text-xs text-purple-200">清晨冥想有助于提高直觉和创造力</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">5月2日</div>
                <div className="text-sm">7.2/10</div>
                <div className="text-yellow-400 text-sm">🟡 稳定</div>
              </div>
              <p className="text-xs text-purple-200">穿蓝色衣物可增强直觉能量</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">5月3日</div>
                <div className="text-sm">6.5/10</div>
                <div className="text-red-400 text-sm">🔴 下降</div>
              </div>
              <p className="text-xs text-purple-200">重要决策适合在今天做出</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">5月4日</div>
                <div className="text-sm">5.8/10</div>
                <div className="text-red-400 text-sm">🔴 下降</div>
              </div>
              <p className="text-xs text-purple-200">建议多休息，避免高强度活动</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">5月5日</div>
                <div className="text-sm">7.4/10</div>
                <div className="text-green-400 text-sm">🟢 上升</div>
              </div>
              <p className="text-xs text-purple-200">适合社交和建立新的人际关系</p>
            </div>
          </div>
        </div>
        
        {/* 升级提示 - 仅对Plus用户显示 */}
        {userType === 'plus' && (
          <div className="bg-gradient-to-r from-purple-900/40 to-purple-700/30 backdrop-blur-sm rounded-xl p-5 border border-purple-500/20">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">🔒</span>
              <h2 className="text-lg font-semibold">解锁Pro功能</h2>
            </div>
            <p className="text-sm mb-3">升级至Pro版本解锁小时能量高峰、吉凶日和关系契合度分析</p>
            <Link 
              href="/subscription" 
              className="block w-full py-2 bg-purple-600 hover:bg-purple-700 text-center rounded text-white text-sm font-medium"
            >
              升级至PRO
            </Link>
          </div>
        )}
        
        {/* 小时能量高峰 - 仅对Pro用户显示 */}
        {userType === 'pro' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">小时能量高峰</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">上午 8:00</div>
                  <div className="text-sm">9.2/10</div>
                </div>
                <p className="text-xs text-purple-200">创意灵感高峰，适合头脑风暴和创造性工作</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">下午 2:00</div>
                  <div className="text-sm">8.7/10</div>
                </div>
                <p className="text-xs text-purple-200">决策能力强化，适合重要决策和规划</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">晚上 7:00</div>
                  <div className="text-sm">8.5/10</div>
                </div>
                <p className="text-xs text-purple-200">社交能量高涨，适合会面和建立人际关系</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 吉凶日 - 仅对Pro用户显示 */}
        {userType === 'pro' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">吉凶日</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 mr-2">
                    吉日
                  </span>
                  <div>5月12日</div>
                </div>
                <p className="text-xs text-purple-200">适合开始新项目和投资</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 mr-2">
                    吉日
                  </span>
                  <div>5月25日</div>
                </div>
                <p className="text-xs text-purple-200">适合旅行和探索新领域</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 mr-2">
                    凶日
                  </span>
                  <div>5月18日</div>
                </div>
                <p className="text-xs text-purple-200">避免重大决策和冲突</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 关系契合度 - 仅对Pro用户显示 */}
        {userType === 'pro' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">关系契合度</h2>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold">78%</div>
              <div className="mt-1 text-purple-300">当前关系能量</div>
            </div>
            <p className="text-sm text-purple-200">
              5月份，你的人际关系能量处于良好状态。可以尝试在5月中旬主动联系重要的人际关系，将有助于增强情感连接。
            </p>
          </div>
        )}
        
        {/* 页脚 */}
        <footer className="text-center text-sm text-purple-300 mt-8">
          <p>基于您的生日数据：{birthDate || '未指定'}</p>
          <p className="mt-1">© 2025 CrystalMatch</p>
        </footer>
      </div>
    </main>
  );
}

// 使用Suspense包装组件以解决useSearchParams需要Suspense边界的问题
export default function MayReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <MayReportContent />
    </Suspense>
  );
} 