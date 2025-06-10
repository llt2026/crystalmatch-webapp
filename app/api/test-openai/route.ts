import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

export const dynamic = 'force-dynamic';

/**
 * 测试OpenAI API连接
 * 返回OpenAI API状态和测试消息
 */
export async function GET(request: NextRequest) {
  // 获取API密钥
  const apiKey = getOpenAiApiKey();
  
  // 隐藏API密钥的一部分以安全展示
  const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : '无API密钥';
  
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json({
      success: false,
      error: "API密钥未配置或为空",
      maskedKey
    }, { status: 500 });
  }
  
  // 尝试调用OpenAI API
  try {
    console.log('测试OpenAI API连接...');
    
    // 初始化OpenAI客户端
    const openai = new OpenAI({ apiKey });
    
    // 简单的测试请求
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, are you working correctly? Please respond with 'Yes, I am working correctly.'" }],
      max_tokens: 20,
    });
    
    // 获取响应内容
    const content = completion.choices[0].message?.content || '';
    
    return NextResponse.json({
      success: true,
      maskedKey,
      model: completion.model,
      content,
      apiConnected: true
    });
  } catch (error: any) {
    console.error('OpenAI API调用错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || "未知错误",
      maskedKey,
      apiConnected: false
    }, { status: 500 });
  }
} 