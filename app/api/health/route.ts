import { NextResponse } from 'next/server';

// 告诉 Next.js：这个接口完全动态，不要在构建期进行预渲染
export const dynamic = 'force-dynamic';

/**
 * API健康检查端点
 * 验证应用和数据库连接状态
 */
export async function GET() {
  // 如果正处于 Vercel 的 production build 阶段，直接跳过
  if (process.env.VERCEL && process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ status: 'skipped during build' });
  }
  
  try {
    // 使用懒加载方式导入 Prisma
    const { PrismaClient } = await import('@prisma/client');
    
    // 使用简易单例
    const prisma = globalThis.prisma ?? new PrismaClient();
    if (!globalThis.prisma) globalThis.prisma = prisma;
    
    // 检查Prisma连接
    const dbResult = await prisma.$queryRaw`SELECT 1 as connected`;
    const dbConnected = Array.isArray(dbResult) && dbResult.length > 0;
    
    // 收集Prisma和系统信息
    const info = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      prisma: {
        connected: dbConnected,
        client: {
          version: prisma._clientVersion || 'unknown'
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    
    return NextResponse.json(info);
  } catch (error) {
    console.error('健康检查失败:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : '未知错误',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      environment: process.env.NODE_ENV || 'unknown'
    }, { status: 500 });
  }
} 