import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 简易鉴权：仅检查X-Admin-Secret 请求头（示例）
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const adminKey = request.headers.get('x-admin-secret');
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = params;
  const body = await request.json();
  const { status = 'free', expiresAt } = body;

  // TODO: 在真实环境中更新数据库中的订阅信息
  console.log(`Admin updated user ${userId} subscription to ${status}`, expiresAt);

  return NextResponse.json({ success: true, userId, status, expiresAt });
} 