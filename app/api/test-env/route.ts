import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 测试环境变量配置
 * GET /api/test-env
 * 用于验证环境变量是否正确加载
 */
export async function GET(request: NextRequest) {
  // 获取所有需要测试的环境变量
  const envVars = {
    // OpenAI相关
    OPENAI_API_KEY: process.env.OPENAI_API_KEY 
      ? `${process.env.OPENAI_API_KEY.substring(0, 5)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 5)}` 
      : undefined,
    
    // 数据库相关
    DATABASE_URL: process.env.DATABASE_URL 
      ? (process.env.DATABASE_URL.includes('://') 
        ? `${process.env.DATABASE_URL.split('://')[0]}://${process.env.DATABASE_URL.split('://')[1].split(':')[0]}:***@...` 
        : '格式无效') 
      : undefined,
    
    // 应用配置
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
    
    // JWT配置
    JWT_SECRET: process.env.JWT_SECRET ? '已设置(不显示)' : undefined,
    
    // PayPal相关
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID 
      ? '已设置(不显示)' 
      : undefined,
  };

  // 检测环境变量问题
  const issues = [];
  
  // 检查OpenAI API密钥
  if (!process.env.OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY 未设置');
  } else if (process.env.OPENAI_API_KEY.includes('\n') || process.env.OPENAI_API_KEY.includes('\r')) {
    issues.push('OPENAI_API_KEY 包含换行符');
  } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    issues.push('OPENAI_API_KEY 格式可能不正确 (应以sk-开头)');
  }
  
  // 检查数据库URL
  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL 未设置');
  }
  
  // 检查模拟数据设置
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    issues.push('应用配置为使用模拟数据 (NEXT_PUBLIC_USE_MOCK_DATA=true)');
  }
  
  // 返回结果
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environmentName: process.env.NODE_ENV || '未知',
    environmentVariables: envVars,
    issues: issues.length > 0 ? issues : ['未发现明显问题'],
    hasIssues: issues.length > 0
  });
} 