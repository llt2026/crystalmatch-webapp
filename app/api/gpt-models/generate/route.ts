/**
 * GPT模型生成API端点
 * 处理不同模型的内容生成请求
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 创建OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
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
    
    console.log(`Calling OpenAI API with model: ${model}, maxTokens: ${maxTokens}`);
    
    try {
      // 调用OpenAI API
      const completion = await openai.chat.completions.create({
        model,
        messages: requestData.messages,
        temperature,
        max_tokens: maxTokens,
        user: requestData.user || 'anonymous'
      });
      
      // 提取结果
      const content = completion.choices[0]?.message?.content || '';
      
      console.log(`OpenAI API call successful, content length: ${content.length}`);
      
      // 返回响应
      return NextResponse.json({
        content,
        model: completion.model,
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      
      // 确保返回有效的JSON错误响应
      return NextResponse.json({ 
        error: 'openai_error',
        message: openaiError.message || 'Error calling OpenAI API',
        details: {
          status: openaiError.status,
          type: openaiError.type,
          code: openaiError.code
        }
      }, { status: 502 }); // 使用502 Bad Gateway表示上游服务失败
    }
    
  } catch (error: any) {
    console.error('Error in GPT generate API:', error);
    
    // 返回适当的错误信息
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    
    return NextResponse.json({ 
      error: 'api_error',
      message: message,
      details: { type: 'request_processing_error' }
    }, { status });
  }
} 