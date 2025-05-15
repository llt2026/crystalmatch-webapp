import { NextResponse } from 'next/server';

/**
 * 特殊的 Prisma 检查 API 端点
 * 尝试直接通过 require 加载 Prisma，绕过常规导入
 */
export async function GET() {
  let status = 'unknown';
  let error = null;
  let clientInfo = null;
  
  try {
    // 尝试通过 require 加载 Prisma
    // @ts-ignore
    const { PrismaClient } = require('@prisma/client');
    status = 'loaded';
    
    // 尝试初始化客户端
    const client = new PrismaClient();
    status = 'initialized';
    
    // 获取版本信息
    clientInfo = {
      version: client._clientVersion,
      engine: client._engineConfig?.binaryPath || 'unknown'
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