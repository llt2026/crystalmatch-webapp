import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

export const dynamic = 'force-dynamic';

/**
 * 测试OpenAI API连接
 * GET /api/test-openai
 */
export async function GET(request: NextRequest) {
  console.log('🔍 Starting OpenAI API test... [DISABLED - USING MOCK DATA]');
  
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
    
    // 返回模拟数据，避免实际API调用
    console.log('✅ OpenAI API test skipped, returning mock data');
    
    return NextResponse.json({ 
      success: true, 
      message: "API连接测试成功 [模拟数据]", 
      details: {
        usage: {
          prompt_tokens: 10,
          completion_tokens: 2,
          total_tokens: 12
        },
        model: "gpt-3.5-turbo",
        response: "API OK [MOCK]",
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV || 'local',
          timestamp: new Date().toISOString(),
          isMockData: true
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