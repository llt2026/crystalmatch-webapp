/**
 * GPT模型生成API端点
 * 处理不同模型的内容生成请求
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { rateLimit } from '../../../lib/rate-limit';

// 创建OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GPT请求配额限制 - 每个用户每分钟最多5个请求
const limiter = rateLimit({
  interval: 60 * 1000, // 1分钟
  uniqueTokenPerInterval: 500, // 最多500个不同用户
});

export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || 'anonymous';
    
    // 应用限流
    try {
      await limiter.check(10, userId); // 10 requests per minute per user
    } catch (error) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // 解析请求数据
    const requestData = await request.json();
    
    // 验证必要字段
    if (!requestData.model || !requestData.messages) {
      return NextResponse.json(
        { error: 'Missing required fields: model, messages' },
        { status: 400 }
      );
    }
    
    // 默认值处理
    const model = requestData.model || 'gpt-4-turbo';
    const temperature = requestData.temperature ?? 0.7;
    const maxTokens = requestData.max_tokens || 2000;
    
    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages: requestData.messages,
      temperature,
      max_tokens: maxTokens,
      user: userId
    });
    
    // 提取结果
    const content = completion.choices[0]?.message?.content || '';
    
    // 返回响应
    return NextResponse.json({
      content,
      model: completion.model,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0
    });
    
  } catch (error: any) {
    console.error('Error in GPT generate API:', error);
    
    // 返回适当的错误信息
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    
    return NextResponse.json({ error: message }, { status });
  }
} 