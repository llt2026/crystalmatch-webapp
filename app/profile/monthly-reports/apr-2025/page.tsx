/**
 * April 2025 Monthly Deep Report Page - 完整版本
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
function AprilReportContent() {
  const searchParams = useSearchParams();
  const birthDate = searchParams?.get('birthDate') || '';
  const userType = searchParams?.get('userType') || 'plus'; // 默认为plus用户
  
  // 计算日期范围（美国格式：MM/DD/YYYY）
  const startDate = "04/01/2025";
  const endDate = "04/30/2025";
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
            <div className="text-3xl font-bold">75 / 100</div>
            <div className="mt-1 text-purple-300">平衡模式 ⚖️</div>
          </div>
          
          {/* 美化版进度条 */}
          <div className="mt-3 relative">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full" 
                style={{ width: "75%" }}
              >
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="font-medium">最强元素</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                  🌱 木
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">推荐水晶：翠绿玉</div>
            </div>
            <div className="text-center">
              <div className="font-medium">最弱元素</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  🪨 土
                </span>
              </div>
              <div className="text-xs text-purple-300 mt-1">推荐水晶：紫水晶</div>
            </div>
          </div>
        </div>
        
        {/* 日能量日历 - 表格格式，显示趋势 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">日能量日历</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-purple-300">
                <th className="pb-2">日期</th>
                <th className="pb-2">能量值</th>
                <th className="pb-2">趋势</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="text-sm">
                <td className="py-2">4月1日</td>
                <td className="py-2">7.0/10</td>
                <td className="py-2 text-green-400">🟢 上升</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">4月2日</td>
                <td className="py-2">6.2/10</td>
                <td className="py-2 text-yellow-400">🟡 稳定</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">4月3日</td>
                <td className="py-2">3.8/10</td>
                <td className="py-2 text-red-400">🔴 下降</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">4月4日</td>
                <td className="py-2">2.5/10</td>
                <td className="py-2 text-red-400">🔴 下降</td>
              </tr>
              <tr className="text-sm">
                <td className="py-2">4月5日</td>
                <td className="py-2">4.5/10</td>
                <td className="py-2 text-green-400">🟢 上升</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 space-y-2">
            <details className="text-sm">
              <summary className="cursor-pointer text-purple-300 hover:text-white">查看日能量详细建议</summary>
              <div className="mt-2 space-y-2 pl-2 border-l-2 border-purple-700">
                <p className="text-xs">4月1日：适合开始新项目和重要工作</p>
                <p className="text-xs">4月2日：上午能量高，建议安排重要会议</p>
                <p className="text-xs">4月3日：能量低谷，建议休息和反思</p>
                <p className="text-xs">4月4日：避免重要决策，专注简单任务</p>
                <p className="text-xs">4月5日：能量开始恢复，适合轻松社交活动</p>
              </div>
            </details>
          </div>
        </div>
        
        {/* 推送通知/能量提示 */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">能量提示</h2>
          <div className="space-y-3">
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">4月8日</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-800/70">能量平衡</span>
              </div>
              <p className="text-sm">能量将趋于平衡，适合各种活动</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">4月15日</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800/70">能量高峰</span>
              </div>
              <p className="text-sm">高能量日，适合挑战性工作和决策</p>
            </div>
            
            <div className="bg-black/30 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-purple-300">4月22日</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-800/70">能量低谷</span>
              </div>
              <p className="text-sm">能量水平将较低，注意休息，专注轻松任务</p>
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
            <div className="text-center text-xs text-purple-200 mb-2">
              4月15日能量高峰时段
            </div>
            <div className="flex justify-between items-end h-32 px-2 mb-4">
              {[
                { hour: 0, value: 30 },
                { hour: 3, value: 20 },
                { hour: 6, value: 40 },
                { hour: 9, value: 80 },
                { hour: 12, value: 60 },
                { hour: 15, value: 50 },
                { hour: 18, value: 70 },
                { hour: 21, value: 40 }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-4 bg-gradient-to-t from-purple-800 to-purple-500 rounded-t"
                    style={{ height: `${item.value}%` }}
                  ></div>
                  <div className="mt-1 text-gray-400">{item.hour}</div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">上午 9:00</div>
                  <div className="text-sm">8.0/10</div>
                </div>
                <p className="text-xs text-purple-200">最佳创意时段，适合头脑风暴和创新工作</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">下午 6:00</div>
                  <div className="text-sm">7.0/10</div>
                </div>
                <p className="text-xs text-purple-200">社交能量高峰，适合团队合作和会议</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">晚上 9:00</div>
                  <div className="text-sm">4.0/10</div>
                </div>
                <p className="text-xs text-purple-200">放松时间，适合冥想和反思</p>
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
                  <div>4月10日</div>
                </div>
                <p className="text-xs text-purple-200">适合财务规划和重要会议</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200 mr-2">
                    吉日
                  </span>
                  <div>4月21日</div>
                </div>
                <p className="text-xs text-purple-200">适合创新和启动新项目</p>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200 mr-2">
                    凶日
                  </span>
                  <div>4月17日</div>
                </div>
                <p className="text-xs text-purple-200">避免冲突和重大决策</p>
              </div>
            </div>
          </div>
        )}
        
        {/* 关系契合度 - 仅对Pro用户显示 */}
        {userType === 'pro' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-3">关系契合度</h2>
            <div className="text-center mb-3">
              <div className="text-3xl font-bold">64%</div>
              <div className="mt-1 text-purple-300">当前关系能量</div>
            </div>
            <p className="text-sm text-purple-200">
              4月份的关系能量处于修复状态。本月中旬是增进理解的好时机，建议在4月10日前后进行深入沟通，有助于消除误解。
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
export default function AprilReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <AprilReportContent />
    </Suspense>
  );
} 