import { NextRequest, NextResponse } from 'next/server';
import { redis, getAllCodes, saveCode, checkCode } from '@/utils/upstash';

export const dynamic = 'force-dynamic';

/**
 * 调试端点 - 获取当前存储的所有验证码
 * 仅在开发环境可用
 */
export async function GET(request: NextRequest) {
  // 生产环境不可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  // 获取当前时间
  const now = Date.now();
  
  // 检查Redis配置
  const redisEnabled = !!redis;
  
  // 获取所有验证码
  const allCodes = getAllCodes();
  
  return NextResponse.json({
    now: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    redisEnabled,
    redis: redisEnabled ? {
      url: process.env.UPSTASH_REDIS_REST_URL ? '(configured)' : '(missing)',
      token: process.env.UPSTASH_REDIS_REST_TOKEN ? '(configured)' : '(missing)'
    } : null,
    skipRedis: process.env.SKIP_REDIS === 'true',
    storage: redisEnabled ? 'Upstash Redis' : 'Local Memory',
    codes: allCodes
  });
}

/**
 * 测试API - 保存验证码
 */
export async function POST(request: NextRequest) {
  // 生产环境不可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  try {
    const { email, code = Math.floor(100000 + Math.random() * 900000).toString() } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // 保存验证码
    await saveCode(email, code);
    
    return NextResponse.json({
      success: true,
      email,
      code,
      storage: redis ? 'Upstash Redis' : 'Local Memory'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * 测试API - 验证验证码
 */
export async function PUT(request: NextRequest) {
  // 生产环境不可用
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }
  
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }
    
    // 验证验证码
    const isValid = await checkCode(email, code);
    
    return NextResponse.json({
      success: true,
      email,
      code,
      isValid,
      storage: redis ? 'Upstash Redis' : 'Local Memory'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 