import { NextResponse } from 'next/server';
import bootstrapDatabase from '@/app/lib/bootstrap';
import prisma from '@/app/lib/prisma';

/**
 * API健康检查端点
 * 验证应用和数据库连接状态
 */
export async function GET() {
  // 确保数据库已初始化
  await bootstrapDatabase();
  
  try {
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