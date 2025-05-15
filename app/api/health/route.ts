import { NextResponse } from 'next/server';
import { checkDBConnection } from '@/app/lib/db';

/**
 * Health check API endpoint
 * 检查系统状态和数据库连接
 */
export async function GET() {
  try {
    // 检查数据库连接
    const dbStatus = await checkDBConnection();
    
    // 返回系统状态
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: {
        connected: dbStatus.isConnected,
        responseTime: dbStatus.responseTime || 0,
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // 返回错误状态
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 });
  }
} 