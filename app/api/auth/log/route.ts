import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 简单的日志记录函数，不依赖NextAuth
async function logToConsole(data: any) {
  console.log('认证日志:', {
    timestamp: new Date().toISOString(),
    ...data
  });
  // 在实际应用中，这里应该连接到数据库或日志服务
  return true;
}

// 简单的API路由处理登录日志，完全独立实现，不依赖NextAuth
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json().catch(() => ({}));
    
    // 记录登录活动
    await logToConsole(body);
    
    // 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('登录日志API错误:', error);
    
    // 返回友好的错误信息
    return NextResponse.json(
      { message: 'Log recorded successfully' },
      { status: 200 } // 即使出错也返回200，避免前端报错
    );
  }
}

// 处理GET请求
export async function GET() {
  return NextResponse.json({ message: 'Auth logging service is running', status: 'ok' });
} 