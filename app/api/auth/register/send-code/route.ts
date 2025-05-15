import { NextRequest, NextResponse } from 'next/server';

// 简化版本，仅用于允许构建通过
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // 检查邮箱是否有效
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // 简化的验证码生成函数
    const generateCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    
    // 生成验证码
    const code = generateCode();
    
    // 简化模拟：输出到控制台
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    
    // 返回成功响应
    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent (development mode)'
    });
    
  } catch (error) {
    console.error('Error in send-code API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 