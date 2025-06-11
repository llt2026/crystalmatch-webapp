import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

export const dynamic = 'force-dynamic';

/**
 * 测试OpenAI API连接
 * GET /api/test-openai
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Starting OpenAI API test...');
  
  try {
    // 获取API密钥
    const apiKey = getOpenAiApiKey();
    
    console.log('🔑 API Key check:', {
      fromEnv: !!process.env.OPENAI_API_KEY,
      fromConfig: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 7) || 'none',
      keySuffix: apiKey?.substring(apiKey.length - 4) || 'none',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    });
    
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        message: "API密钥未配置或为空",
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          hasEnvKey: !!process.env.OPENAI_API_KEY,
          configKey: !!apiKey
        }
      }, { status: 400 });
    }

    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        message: "API密钥格式不正确，应以sk-开头",
        keyInfo: {
          length: apiKey.length,
          prefix: apiKey.substring(0, 10)
        }
      }, { status: 400 });
    }

    // 创建OpenAI客户端
    const openai = new OpenAI({ 
      apiKey,
      timeout: 30000, // 30秒超时
      maxRetries: 2   // 重试2次
    });

    console.log('🤖 Attempting OpenAI API call...');

    // 简单调用，测试连接
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 10,
      temperature: 0.1,
      messages: [{ 
        role: 'user', 
        content: 'Respond with just "API OK"' 
      }],
    });
    
    // 获取API响应
    const content = completion.choices[0].message?.content || '';
    
    console.log('✅ OpenAI API test successful');
    
    return NextResponse.json({ 
      success: true, 
      message: "API连接测试成功", 
      details: {
        usage: completion.usage,
        model: completion.model,
        response: content,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV || 'local',
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('❌ OpenAI API test failed:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      cause: error.cause
    });
    
    return NextResponse.json({ 
      success: false, 
      message: "API连接测试失败", 
      error: {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        isConnectionError: error.message?.includes('Connection') || error.code === 'ECONNREFUSED',
        isAuthError: error.status === 401,
        isRateLimitError: error.status === 429
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV || 'local',
        timestamp: new Date().toISOString()
      },
      suggestions: error.status === 401 
        ? ['检查API密钥是否正确', '确认API密钥未过期', '检查OpenAI账户余额']
        : ['检查网络连接', '稍后重试', '联系技术支持']
    }, { status: 500 });
  }
} 