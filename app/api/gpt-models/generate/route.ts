/**
 * GPT模型生成API端点
 * 处理不同模型的内容生成请求
 * 注意：此API已禁用实际OpenAI调用，改为返回模拟数据
 */

import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';

// 定义消息类型
interface Message {
  role: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('⚠️ GPT模型生成API已禁用实际OpenAI调用，使用模拟数据');
    
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
    
    console.log(`模拟调用OpenAI API: model=${model}, maxTokens=${maxTokens}, temperature=${temperature}`);
    
    // 从消息中提取最后一条用户消息
    const messages: Message[] = requestData.messages || [];
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '无用户消息';
    const shortUserMessage = lastUserMessage.substring(0, 50) + (lastUserMessage.length > 50 ? '...' : '');
    
    // 生成模拟响应
    const mockResponse = `这是来自模型 ${model} 的模拟响应。

您的请求已收到，但为了节省API费用，实际调用已被禁用。

请求概要:
- 模型: ${model}
- 温度: ${temperature}
- 最大令牌: ${maxTokens}
- 用户消息: "${shortUserMessage}"

[模拟数据] 如需实际生成内容，请联系管理员启用API调用。`;
    
    // 返回模拟响应
    return NextResponse.json({
      content: mockResponse,
      model: model,
      promptTokens: Math.floor(lastUserMessage.length / 4),
      completionTokens: Math.floor(mockResponse.length / 4),
      totalTokens: Math.floor(lastUserMessage.length / 4) + Math.floor(mockResponse.length / 4),
      isMockData: true
    });
    
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