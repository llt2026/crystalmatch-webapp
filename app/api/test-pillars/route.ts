import { NextResponse } from 'next/server';
import { getYearPillarByDate } from '@/app/lib/year-pillar';
import { energyCalendar } from '@/app/lib/energy-calendar';

export async function GET() {
  try {
    // 测试日期：2025年5月8日
    const testDate = new Date('2025-05-08');
    
    // 获取年柱信息
    const yearPillar = getYearPillarByDate(testDate);
    
    // 获取月柱信息
    const monthPillarInfo = energyCalendar.find(item => {
      return testDate >= new Date(item.start) && testDate <= new Date(item.end);
    });
    
    return NextResponse.json({
      testDate: '2025年5月8日',
      yearPillar: {
        year: yearPillar.year,
        pillar: yearPillar.pillar,
        zodiac: yearPillar.zodiac
      },
      monthPillar: {
        month: monthPillarInfo?.month,
        start: monthPillarInfo?.start,
        end: monthPillarInfo?.end,
        pillar: monthPillarInfo?.pillar,
        element: monthPillarInfo?.element,
        energyType: monthPillarInfo?.energyType
      }
    });
  } catch (error) {
    console.error('测试出错:', error);
    return NextResponse.json({ error: 'Failed to test pillars' }, { status: 500 });
  }
} 