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

export async function middleware(request: NextRequest) {
  // API路由处理
  if (request.nextUrl.pathname.startsWith('/api')) {
    // 可以在这里添加API特定的中间件逻辑
    // 例如: API速率限制、认证检查等
  }

  return NextResponse.next();
}

// 仅对API路由应用此中间件
export const config = {
  matcher: '/api/:path*',
} 