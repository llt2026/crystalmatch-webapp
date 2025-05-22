import { notFound } from 'next/navigation';
import React from 'react';
import { marked } from 'marked';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params, searchParams }: Props) {
  const { slug } = params;
  const birthDate = Array.isArray(searchParams.birthDate) ? searchParams.birthDate[0] : searchParams.birthDate;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reports/${slug}${birthDate ? `?birthDate=${encodeURIComponent(birthDate)}` : ''}`, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    if (!res.ok) throw new Error('Report not found');
    const data = await res.json();
    if (!data.report) throw new Error('No content');

    const html = marked.parse(data.report || '');

    return (
      <main className="prose prose-invert mx-auto px-4 py-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />
    );
  } catch (err) {
    console.error(err);
    notFound();
  }
} 