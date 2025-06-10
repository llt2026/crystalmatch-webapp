import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 测试环境变量配置
 */
export async function GET(request: NextRequest) {
  // 获取环境变量
  const apiKey = process.env.OPENAI_API_KEY || '';
  
  // 处理API密钥以便安全显示
  const maskedKey = apiKey ? 
    `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 
    '无API密钥';
  
  // 检查API密钥是否包含换行符或空格
  const hasNewlines = apiKey.includes('\n') || apiKey.includes('\r');
  const hasSpaces = apiKey.includes(' ');
  
  // 分析API密钥格式
  const keyFormat = {
    length: apiKey.length,
    hasNewlines,
    hasSpaces,
    startsWithPrefix: apiKey.startsWith('sk-'),
    isEmpty: !apiKey || apiKey.trim() === ''
  };
  
  // 获取其他关键环境变量
  const useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'not set';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'not set';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'not set';
  
  return NextResponse.json({
    apiKey: {
      masked: maskedKey,
      format: keyFormat
    },
    envVars: {
      NEXT_PUBLIC_USE_MOCK_DATA: useMockData,
      NEXT_PUBLIC_API_URL: apiUrl,
      NEXT_PUBLIC_BASE_URL: baseUrl
    },
    processEnv: {
      NODE_ENV: process.env.NODE_ENV
    }
  });
} 