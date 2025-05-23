import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 临时使用内存缓存，生产应接数据库
// @ts-ignore
const reportCache: Map<string, any> = globalThis.__reportSlugCache ?? new Map<string, any>();
// @ts-ignore
if (!globalThis.__reportSlugCache) globalThis.__reportSlugCache = reportCache;

/**
 * GET /api/reports/[slug]
 * slug 形式： annual-basic-2025 | annual-premium-2025 | 2025-05
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  if (reportCache.has(slug)) {
    return NextResponse.json({ slug, report: reportCache.get(slug), cached: true });
  }

  // 如果没有缓存，根据 slug 类型调用不同 API 生成
  try {
    if (slug.startsWith('annual-basic-')) {
      // 免费年度简化版，调用年度生成 API，订阅层 free
      const year = parseInt(slug.split('-').pop() || '0');
      const birthDate = request.nextUrl.searchParams.get('birthDate') || '1990-01-01';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/generate-energy-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          currentDate: new Date(`${year}-01-01`).toISOString(),
          tier: 'free',
          userId: 'anonymous'
        }),
      });
      if (!res.ok) {
        const placeholder = `<p>Report temporarily unavailable.</p>`;
        reportCache.set(slug, placeholder);
        return NextResponse.json({ slug, report: placeholder, fallback: true });
      }
      const data = await res.json();
      reportCache.set(slug, data.report);
      return NextResponse.json({ slug, report: data.report });
    }

    if (/^\d{4}-\d{2}$/.test(slug)) {
      // 月报 slug 如 2025-05
      const [yearStr, monthStr] = slug.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const birthDate = request.nextUrl.searchParams.get('birthDate') || '1990-01-01';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/generate-monthly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          year,
          month,
          tier: request.headers.get('x-tier') || 'free',
          userId: 'anonymous'
        }),
      });
      if (!res.ok) {
        const placeholder = `<p>Report temporarily unavailable.</p>`;
        reportCache.set(slug, placeholder);
        return NextResponse.json({ slug, report: placeholder, fallback: true });
      }
      const data = await res.json();
      reportCache.set(slug, data.report);
      return NextResponse.json({ slug, report: data.report });
    }

    return NextResponse.json({ error: 'unsupported slug' }, { status: 400 });
  } catch (err: any) {
    console.error('report slug error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 