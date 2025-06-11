/**
 * GPT模型生成API端点
 * 处理不同模型的内容生成请求
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // 检查API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // 验证API密钥格式
    if (!apiKey.startsWith('sk-')) {
      console.error('OPENAI_API_KEY does not start with sk-:', apiKey.substring(0, 10) + '...');
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 500 }
      );
    }

    // 记录API密钥信息（隐藏敏感部分）
    console.log('OpenAI API key info:', {
      length: apiKey.length,
      prefix: apiKey.substring(0, 7),
      suffix: apiKey.substring(apiKey.length - 4)
    });

    // 在函数内部创建OpenAI客户端，确保使用最新的环境变量
    const openai = new OpenAI({
      apiKey: apiKey,
      timeout: 60000, // 60秒超时
      maxRetries: 3,   // 重试3次
    });
    
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
    console.log(`Request will be sent to: https://api.openai.com/v1/chat/completions`);
    
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
      console.error('OpenAI API error details:', {
        message: openaiError.message,
        status: openaiError.status,
        code: openaiError.code,
        type: openaiError.type,
        error: openaiError.error,
        stack: openaiError.stack?.substring(0, 500)
      });
      
      // 特别处理认证错误
      if (openaiError.status === 401) {
        return NextResponse.json({ 
          error: 'authentication_error',
          message: 'OpenAI API authentication failed. Please check your API key.',
          details: {
            status: 401,
            type: 'invalid_api_key',
            suggestion: 'Verify that your OpenAI API key is correctly set in environment variables',
            apiKeyInfo: {
              exists: !!apiKey,
              length: apiKey?.length,
              prefix: apiKey?.substring(0, 7),
              startsWithSk: apiKey?.startsWith('sk-')
            }
          }
        }, { status: 500 }); // 对外返回500，不暴露内部401
      }
      
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