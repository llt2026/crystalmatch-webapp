import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { calculateUserElements } from '@/app/lib/calculateUserElements';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';
import { SubscriptionTier } from '@/app/types/subscription';

// 获取API密钥并添加调试信息
const apiKey = getOpenAiApiKey();
console.log('OpenAI API密钥状态:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  maskedKey: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : '无API密钥',
  hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r'),
  hasSpaces: apiKey?.includes(' '),
  startsWithPrefix: apiKey?.startsWith('sk-'),
  isEmpty: !apiKey || apiKey?.trim() === ''
});

// 验证API密钥格式
if (!apiKey || !apiKey.startsWith('sk-') || apiKey.length < 50) {
  console.error('OpenAI API密钥格式不正确或缺失');
}

// 创建OpenAI客户端
const openai = new OpenAI({ 
  apiKey: apiKey,
  timeout: 90000,  // 较长的超时时间
  maxRetries: 3    // 自动重试次数
});

interface PostBody {
  birthDate: string; // ISO
  year: number;
  month: number; // 1-12
  tier?: 'free' | 'plus' | 'pro';
  forceRefresh?: boolean;
  userId?: string;
}

export async function POST(request: NextRequest) {
  console.log('接收到月度报告生成请求');
  
  try {
    const { birthDate, year, month, tier = 'free', forceRefresh = false, userId = 'anonymous' } = (await request.json()) as PostBody;

    console.log('请求参数:', { birthDate, year, month, tier, forceRefresh, userId });

    if (!birthDate || !year || !month) {
      console.error('缺少必要参数');
      return NextResponse.json({ error: 'birthDate, year, month are required' }, { status: 400 });
    }

    // 验证订阅类型是否有效
    const validTiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
    const safeTier: SubscriptionTier = validTiers.includes(tier as SubscriptionTier) 
      ? tier as SubscriptionTier 
      : 'free';
    
    if (tier !== safeTier) {
      console.warn(`请求中的订阅类型 "${tier}" 无效，已转换为 "${safeTier}"`);
    }

    // 检查配额（这里只示例，实际应查询 DB）
    if (!hasRemainingRequests(safeTier, 0)) {
      console.error('用户配额已用完');
      return NextResponse.json({ error: 'quota exceeded' }, { status: 429 });
    }

    // 构造能量上下文
    const birthDateObj = new Date(birthDate);
    // 使用月份中间的日期（15号）来确保匹配正确的能量周期
    const targetDateObj = new Date(year, month - 1, 15);
    
    console.log('尝试构建能量上下文:', {
      birthDate: birthDateObj.toISOString(),
      targetDate: targetDateObj.toISOString(),
      year,
      month,
      targetDateString: targetDateObj.toISOString().slice(0, 10)
    });
    
    const energyContext = getFullEnergyContext(birthDateObj, targetDateObj);
    if (!energyContext) {
      console.error('能量上下文构建失败 - 详细调试信息:', {
        birthDateValid: !isNaN(birthDateObj.getTime()),
        targetDateValid: !isNaN(targetDateObj.getTime()),
        birthDateStr: birthDateObj.toString(),
        targetDateStr: targetDateObj.toString()
      });
      return NextResponse.json({ error: 'failed to build energy context' }, { status: 500 });
    }
    
    console.log('能量上下文构建成功:', {
      bazi: energyContext.bazi,
      currentYear: energyContext.currentYear,
      currentMonth: energyContext.currentMonth
    });

    // 计算用户真实的五行元素分布
    const userElements = calculateUserElements(energyContext.bazi);
    console.log('用户五行元素计算完成:', userElements);

    const prompt = buildMonthlyReportPrompt({ 
      ...(energyContext as any), 
      userElements,
      birthDate 
    });
    console.log('提示词构建成功，长度:', prompt.length);

    try {
      const model = getModelForTier(safeTier);
      const maxTokens = getMaxTokensForTier(safeTier);
      console.log(`使用OpenAI生成月度报告 ${year}-${month}, 会员等级: ${safeTier}, 模型: ${model}, 最大token: ${maxTokens}`);
      
      // 严格检查API密钥是否有效
      if (!apiKey || apiKey.trim() === '') {
        console.error('OpenAI API密钥未配置');
        throw new Error('OpenAI API key not configured');
      }
      
      if (!apiKey.startsWith('sk-')) {
        console.error('OpenAI API密钥格式不正确，应以sk-开头');
        throw new Error('OpenAI API key has invalid format, should start with sk-');
      }
      
      if (apiKey.length < 40) {
        console.error('OpenAI API密钥长度不足');
        throw new Error('OpenAI API key length is too short');
      }
      
      console.log('开始调用OpenAI API...');
      const completion = await openai.chat.completions.create({
        model: model,
        max_tokens: maxTokens,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const content = completion.choices[0].message?.content || '';
      console.log(`✅ OpenAI API调用成功！生成报告内容长度: ${content.length} 字符`);
      console.log('报告内容前100字符:', content.substring(0, 100));
      
      // 验证生成的内容是否有效
      if (!content || content.length < 100) {
        throw new Error('Generated content is too short or empty');
      }
      
      return NextResponse.json({ 
        report: content,
        debug: {
          api_success: true,
          content_length: content.length,
          model_used: model
        }
      });
    } catch (err: any) {
      console.error('❌ OpenAI API调用失败:', err);
      console.error('错误详情:', {
        message: err.message,
        name: err.name,
        code: err.code,
        status: err.status,
        type: err.type
      });
      
      // 正式环境中直接返回错误信息，不使用模拟数据
      console.error('API调用错误，返回错误信息');
      
      // 记录详细的错误信息以便调试
      const errorDetails = {
        message: err.message,
        code: err.code || 'unknown',
        type: err.type || 'connection_error',
        cause: err.cause?.code || 'unknown'
      };
      
      console.log('错误详情:', JSON.stringify(errorDetails));
      
      // 返回标准化的错误响应
      return NextResponse.json({ 
        error: 'api_error',
        message: 'Report generation service is temporarily unavailable. Please try again later.',
        details: {
          error_type: err.name || 'unknown',
          error_code: err.code || 'unknown',
          request_id: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString()
        }
      }, { 
        status: 503, // Service Unavailable更适合暂时性问题
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Retry-After': '300' // 建议5分钟后重试
        }
      });
    }
  } catch (reqError: any) {
    console.error('请求处理出错:', reqError);
    return NextResponse.json({ error: reqError.message, stack: reqError.stack?.substring(0, 500) }, { status: 500 });
  }
} 