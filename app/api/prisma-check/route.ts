import { NextResponse } from 'next/server';

// 告诉 Next.js：这个接口完全动态，不要在构建期进行预渲染
export const dynamic = 'force-dynamic';

/**
 * 特殊的 Prisma 检查 API 端点
 * 使用懒加载方式避免构建时初始化
 */
export async function GET() {
  // 如果正处于 Vercel 的 production build 阶段，直接跳过
  if (process.env.VERCEL && process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ status: 'skipped during build' });
  }
  
  let status = 'unknown';
  let error = null;
  let clientInfo = null;
  
  try {
    // 使用懒加载方式导入 Prisma
    const { PrismaClient } = await import('@prisma/client');
    status = 'loaded';
    
    // 使用简易单例
    const prisma = globalThis.prisma ?? new PrismaClient();
    if (!globalThis.prisma) globalThis.prisma = prisma;
    
    status = 'initialized';
    
    // 获取版本信息
    clientInfo = {
      version: prisma._clientVersion,
      engine: prisma._engineConfig?.binaryPath || 'unknown'
    };
    
    return NextResponse.json({
      status: 'ok',
      prisma: {
        status,
        clientInfo
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    error = {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : null
    };
    
    return NextResponse.json({
      status: 'error',
      prisma: {
        status,
        error
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 