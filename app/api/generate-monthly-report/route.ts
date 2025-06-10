import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';

// 直接初始化OpenAI客户端，不再使用缓存
const openai = new OpenAI({ apiKey: getOpenAiApiKey() });

interface PostBody {
  birthDate: string; // ISO
  year: number;
  month: number; // 1-12
  tier?: 'free' | 'plus' | 'pro';
  forceRefresh?: boolean;
  userId?: string;
}

export async function POST(request: NextRequest) {
  const { birthDate, year, month, tier = 'free', forceRefresh = false, userId = 'anonymous' } = (await request.json()) as PostBody;

  if (!birthDate || !year || !month) {
    return NextResponse.json({ error: 'birthDate, year, month are required' }, { status: 400 });
  }

  // 检查配额（这里只示例，实际应查询 DB）
  if (!hasRemainingRequests(tier as any, 0)) {
    return NextResponse.json({ error: 'quota exceeded' }, { status: 429 });
  }

  // 构造能量上下文
  const energyContext = getFullEnergyContext(new Date(birthDate), new Date(year, month - 1));
  if (!energyContext) {
    return NextResponse.json({ error: 'failed to build energy context' }, { status: 500 });
  }

  const prompt = buildMonthlyReportPrompt({ ...(energyContext as any), birthDate });

  try {
    console.log(`Generating monthly report with OpenAI for ${year}-${month}, tier: ${tier}`);
    const completion = await openai.chat.completions.create({
      model: getModelForTier(tier as any),
      max_tokens: getMaxTokensForTier(tier as any),
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = completion.choices[0].message?.content || '';
    console.log(`Generated report content length: ${content.length} characters`);
    
    // 不再缓存结果，每次都从OpenAI获取新的内容
    return NextResponse.json({ report: content });
  } catch (err: any) {
    console.error('GPT monthly report error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 