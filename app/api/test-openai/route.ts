import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

export const dynamic = 'force-dynamic';

/**
 * 测试OpenAI API连接
 * GET /api/test-openai
 */
export async function GET(request: NextRequest) {
  try {
    // 获取API密钥
    const apiKey = getOpenAiApiKey();
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: "API密钥未配置或为空",
        details: {
          apiKeyExists: !!apiKey,
          apiKeyLength: apiKey?.length || 0,
          hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r'),
          hasSpaces: apiKey?.includes(' '),
          startsWithSk: apiKey?.startsWith('sk-')
        }
      }, { status: 400 });
    }

    // 打印API密钥前后5个字符，用于调试
    const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : '无API密钥';
    console.log('测试API密钥:', maskedKey);

    // 创建OpenAI客户端
    const openai = new OpenAI({ apiKey });

    // 简单调用，测试连接
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 20,
      temperature: 0.7,
      messages: [{ 
        role: 'user', 
        content: 'Say "API connection test successful" in Chinese.' 
      }],
    });
    
    // 获取API响应
    const content = completion.choices[0].message?.content || '';
    
    return NextResponse.json({ 
      success: true, 
      message: "API连接测试成功", 
      details: {
        usage: completion.usage,
        model: completion.model,
        response: content
      }
    });
  } catch (error: any) {
    console.error('OpenAI API连接测试失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: "API连接测试失败", 
      error: error.message,
      details: {
        name: error.name,
        status: error.status,
        code: error.code,
        type: error.type,
        stack: error.stack?.substring(0, 500)
      }
    }, { status: 500 });
  }
} 