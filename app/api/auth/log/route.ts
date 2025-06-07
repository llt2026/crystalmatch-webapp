import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 简单的API路由处理登录日志
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 记录登录活动 (实际环境中应该存储到数据库)
    console.log('登录活动记录:', {
      timestamp: new Date().toISOString(),
      ...body
    });
    
    // 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('登录日志API错误:', error);
    
    // 返回友好的错误信息
    return NextResponse.json(
      { error: 'Failed to log auth activity' },
      { status: 400 }
    );
  }
}

// 处理GET请求
export async function GET() {
  return NextResponse.json({ message: 'Auth logging service is running' });
} 