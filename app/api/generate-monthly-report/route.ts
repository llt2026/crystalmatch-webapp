import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';
import { SubscriptionTier } from '@/app/types/subscription';

// 获取API密钥并添加调试信息
const apiKey = getOpenAiApiKey();
console.log('OpenAI API密钥状态:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  maskedKey: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : '无API密钥',
  hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r'),
  hasSpaces: apiKey?.includes(' '),
  startsWithPrefix: apiKey?.startsWith('sk-'),
  isEmpty: !apiKey || apiKey?.trim() === ''
});

// 创建OpenAI客户端，添加异常捕获
let openai: OpenAI;
try {
  openai = new OpenAI({ apiKey });
  console.log('OpenAI客户端初始化成功');
} catch (error) {
  console.error('OpenAI客户端初始化失败:', error);
  // 创建一个最小化的客户端，以便后续代码不会崩溃
  openai = new OpenAI({ apiKey: 'sk-dummy' });
}

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
    const energyContext = getFullEnergyContext(new Date(birthDate), new Date(year, month - 1));
    if (!energyContext) {
      console.error('能量上下文构建失败');
      return NextResponse.json({ error: 'failed to build energy context' }, { status: 500 });
    }
    
    console.log('能量上下文构建成功:', {
      bazi: energyContext.bazi,
      currentYear: energyContext.currentYear,
      currentMonth: energyContext.currentMonth
    });

    const prompt = buildMonthlyReportPrompt({ ...(energyContext as any), birthDate });
    console.log('提示词构建成功，长度:', prompt.length);

    try {
      const model = getModelForTier(safeTier);
      const maxTokens = getMaxTokensForTier(safeTier);
      console.log(`使用OpenAI生成月度报告 ${year}-${month}, 会员等级: ${safeTier}, 模型: ${model}, 最大token: ${maxTokens}`);
      
      // 检查API密钥是否有效
      if (!apiKey || apiKey.trim() === '') {
        console.error('OpenAI API密钥未配置或为空');
        return NextResponse.json({ 
          error: 'OpenAI API key not configured',
          message: 'API密钥未配置，无法生成报告',
          debug: { apiKeyExists: !!apiKey }
        }, { status: 500 });
      }
      
      const completion = await openai.chat.completions.create({
        model: model,
        max_tokens: maxTokens,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const content = completion.choices[0].message?.content || '';
      console.log(`生成报告成功，内容长度: ${content.length} 字符`);
      console.log('报告内容前100字符:', content.substring(0, 100));
      
      // 不再缓存结果，每次都从OpenAI获取新的内容
      return NextResponse.json({ report: content });
    } catch (err: any) {
      console.error('OpenAI API调用错误:', err);
      console.error('错误详情:', {
        message: err.message,
        name: err.name,
        stack: err.stack?.substring(0, 500),
        code: err.code,
        status: err.status
      });
      
      // 返回模拟数据 - 用于临时应对API问题
      const mockReport = `
# 🔮 ${month}月 ${year} — 平衡能量

## 🌟 Energy Insight
This month brings a balanced energy that helps stabilize your natural tendencies. You might find yourself more centered and able to approach challenges with clarity.

## ⚠️ Potential Challenges
- You might struggle with making quick decisions when pressured
- Finding time for self-care could feel challenging
- Balancing work and personal time might require extra attention

## 💎 Monthly Crystals
- Clear Quartz — amplifies your natural energy while helping balance areas where you feel depleted
- Amethyst — may help calm your mind during overthinking moments

## ✨ Practice to Explore
Consider starting your day with a brief 2-minute breathing exercise to set your intentions and center your energy.

## 🧭 Monthly Possibilities
✅ Focus on one priority task each day before checking messages  
✅ Schedule small breaks between focused work periods  
🚫 Try to avoid overthinking simple decisions  
🚫 Consider limiting negative news consumption when feeling drained
      `;
      
      console.log('返回模拟报告数据，长度:', mockReport.length);
      
      return NextResponse.json({ 
        report: mockReport,
        error: err.message,
        debug: {
          api_error: true,
          message: err.message,
          code: err.code || 'unknown'
        }
      }, { status: 200 });
    }
  } catch (reqError: any) {
    console.error('请求处理出错:', reqError);
    return NextResponse.json({ error: reqError.message, stack: reqError.stack?.substring(0, 500) }, { status: 500 });
  }
} 