import { NextResponse } from 'next/server';
import { getBaziFromLunarNumbers } from '@/app/lib/getBaziFromLunar';

export async function GET() {
  try {
    // 测试日期：1989年11月2日
    const year = 1989;
    const month = 11;
    const day = 2;
    
    // 使用lunar-javascript库计算八字
    const bazi = getBaziFromLunarNumbers(year, month, day);
    
    // 返回结果
    return NextResponse.json({
      testDate: `${year}年${month}月${day}日`,
      bazi: {
        yearPillar: bazi?.yearPillar,
        monthPillar: bazi?.monthPillar,
        dayPillar: bazi?.dayPillar,
        zodiac: bazi?.zodiac,
        fiveElements: bazi?.fiveElements
      },
      readableBazi: bazi ? `${bazi.yearPillar}年、${bazi.monthPillar}月、${bazi.dayPillar}日` : '计算失败'
    });
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json({ error: '八字计算失败' }, { status: 500 });
  }
} 