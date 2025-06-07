import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 禁用在构建时执行此中间件
if (process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('⚠️ 跳过构建阶段的中间件初始化');
} else {
  // 动态导入，避免构建问题
  import('./app/lib/bootstrap').then(({ default: bootstrapDatabase }) => {
    console.log('🚀 通过中间件预热Prisma客户端...');
    bootstrapDatabase().catch(err => {
      console.error('中间件Prisma初始化失败:', err);
    });
  }).catch(err => {
    console.error('导入bootstrap模块失败:', err);
  });
}

// 这个配置确保中间件仅在指定路径上运行
export const config = {
  matcher: [
    '/api/:path*',
    '/profile/monthly-reports/:path*',
  ],
};

export default function middleware(request: NextRequest) {
  // 获取当前路径
  const url = request.nextUrl.clone();
  
  // API路由处理
  if (url.pathname.startsWith('/api')) {
    // API特定的中间件逻辑
    return NextResponse.next();
  }
  
  // 确保报告页面是可访问的
  if (url.pathname.includes('/monthly-reports/')) {
    // 如果直接访问，确保设置为动态渲染
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
  }
  
  return NextResponse.next();
} 