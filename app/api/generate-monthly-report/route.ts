import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - 扩展 globalThis 以存储简单内存缓存
const cache: Map<string, any> = globalThis.__monthlyReportCache ?? new Map<string, any>();
// @ts-ignore
if (!globalThis.__monthlyReportCache) globalThis.__monthlyReportCache = cache;

const openai = new OpenAI({ apiKey: getOpenAiApiKey() });

interface PostBody {
  birthDate: string; // ISO
  year: number;
  month: number; // 1-12
  tier?: 'free' | 'monthly' | 'yearly';
  forceRefresh?: boolean;
  userId?: string;
}

function getCacheKey(userId: string, year: number, month: number, tier: string) {
  return `${userId}_${year}-${month}_${tier}`;
}

export async function POST(request: NextRequest) {
  const { birthDate, year, month, tier = 'free', forceRefresh = false, userId = 'anonymous' } = (await request.json()) as PostBody;

  if (!birthDate || !year || !month) {
    return NextResponse.json({ error: 'birthDate, year, month are required' }, { status: 400 });
  }

  const cacheKey = getCacheKey(userId, year, month, tier);
  if (!forceRefresh && cache.has(cacheKey)) {
    return NextResponse.json({ cached: true, report: cache.get(cacheKey) });
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
    const completion = await openai.chat.completions.create({
      model: getModelForTier(tier as any),
      max_tokens: getMaxTokensForTier(tier as any),
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });
    const content = completion.choices[0].message?.content || '';
    cache.set(cacheKey, content);
    return NextResponse.json({ report: content });
  } catch (err: any) {
    console.error('GPT monthly report error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 