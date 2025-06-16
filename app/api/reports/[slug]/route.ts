import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionTier } from '@/app/types/subscription';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reports/[slug]
 * slug 形式： annual-basic-2025 | annual-premium-2025 | 2025-05
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // 根据 slug 类型调用不同 API 生成，每次都重新生成
  try {
    if (slug.startsWith('annual-basic-')) {
      // 免费年度简化版，调用年度生成 API，订阅层 free
      const year = parseInt(slug.split('-').pop() || '0');
      const birthDate = request.nextUrl.searchParams.get('birthDate') || '1990-01-01';
      // 强制使用内部绝对路径调用API
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/generate-annual-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          currentDate: new Date(`${year}-01-01`).toISOString(),
          tier: 'free',
          userId: 'anonymous',
          forceRefresh: true // 强制刷新，不使用缓存
        }),
        cache: 'no-store' // 不使用浏览器缓存
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[annual-basic-${year}] 年度报告API调用失败:`, errorText);
        return NextResponse.json({ 
          error: 'api_error',
          message: 'Annual report generation service temporarily unavailable',
          slug 
        }, { status: 503 });
      }
      const data = await res.json();
      return NextResponse.json({ slug, report: data.report });
    }

    if (/^\d{4}-\d{2}$/.test(slug)) {
      // 月报 slug 如 2025-05
      const [yearStr, monthStr] = slug.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const birthDate = request.nextUrl.searchParams.get('birthDate') || '1990-01-01';
      
      // 获取并验证订阅类型
      const requestedTier = request.headers.get('x-tier') || 'free';
      const validTiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
      const safeTier: SubscriptionTier = validTiers.includes(requestedTier as SubscriptionTier) 
        ? requestedTier as SubscriptionTier 
        : 'free';
      
      if (requestedTier !== safeTier) {
        console.warn(`[reports/${slug}] 请求中的订阅类型 "${requestedTier}" 无效，已转换为 "${safeTier}"`);
      }
      
      // 强制使用内部绝对路径调用API
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/generate-monthly-report`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store' 
        },
        body: JSON.stringify({
          birthDate,
          year,
          month,
          tier: safeTier,
          userId: 'anonymous',
          forceRefresh: true // 强制刷新，不使用缓存
        }),
        cache: 'no-store' // 不使用浏览器缓存
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[reports/${slug}] 月度报告API调用失败:`, errorText);
        return NextResponse.json({ 
          error: 'api_error',
          message: 'Monthly report generation service temporarily unavailable',
          slug 
        }, { status: 503 });
      }
      const data = await res.json();
      return NextResponse.json({ slug, report: data.report });
    }

    return NextResponse.json({ error: 'unsupported slug' }, { status: 400 });
  } catch (err: any) {
    console.error('report slug error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 