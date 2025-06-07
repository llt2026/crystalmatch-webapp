import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 创建虚拟会话路由，解决NextAuth错误
export async function GET() {
  // 返回一个有效的虚拟会话
  return NextResponse.json({
    user: {
      id: 'user-123',
      name: '测试用户',
      email: 'test@example.com',
      subscription: {
        status: 'pro',
        expiresAt: '2026-01-01'
      }
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
} 