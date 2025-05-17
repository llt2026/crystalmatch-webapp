import { NextRequest, NextResponse } from 'next/server';
import { MemoryVerificationCodes, globalMemoryStorage } from '@/app/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // For security, only allow in development or with a secret
  if (process.env.NODE_ENV === 'production') {
    const { searchParams } = new URL(request.url);
    const debug_key = searchParams.get('debug_key');
    if (debug_key !== process.env.DEBUG_SECRET) {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }
  }
  
  const memoryStorage = MemoryVerificationCodes.getInstance();
  
  // 获取当前时间
  const now = Date.now();
  
  // 收集当前在内存中的所有验证码
  const codes: Record<string, any> = {};
  
  globalMemoryStorage.forEach((data, email) => {
    codes[email] = {
      code: data.code,
      expiry: new Date(data.expiry).toISOString(),
      expiresIn: Math.ceil((data.expiry - now) / 1000),
      isExpired: now > data.expiry
    };
  });
  
  return NextResponse.json({
    total: globalMemoryStorage.size,
    skipRedis: process.env.SKIP_REDIS,
    now: new Date().toISOString(),
    codes
  });
}

// 允许删除特定验证码或清理所有验证码
export async function DELETE(request: NextRequest) {
  // For security, only allow in development or with a secret
  if (process.env.NODE_ENV === 'production') {
    const { searchParams } = new URL(request.url);
    const debug_key = searchParams.get('debug_key');
    if (debug_key !== process.env.DEBUG_SECRET) {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (email) {
    // 删除指定邮箱的验证码
    const normalizedEmail = email.toLowerCase().trim();
    const existed = globalMemoryStorage.has(normalizedEmail);
    globalMemoryStorage.delete(normalizedEmail);
    return NextResponse.json({ 
      action: 'delete', 
      email: normalizedEmail,
      success: true,
      existed
    });
  } else {
    // 删除所有验证码
    const count = globalMemoryStorage.size;
    globalMemoryStorage.clear();
    return NextResponse.json({ 
      action: 'clear_all', 
      count,
      success: true 
    });
  }
} 