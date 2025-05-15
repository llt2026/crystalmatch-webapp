import { NextResponse } from 'next/server';
import { getBaziFromLunarNumbers } from '@/app/lib/getBaziFromLunar';

export async function GET() {
  try {
    // 测试日期：1990年8月15日
    const baziResult = getBaziFromLunarNumbers(1990, 8, 15);
    
    if (!baziResult) {
      throw new Error('八字计算失败');
    }
    
    // 打印结果到控制台
    console.log('1990年8月15日八字计算结果:', JSON.stringify(baziResult, null, 2));
    
    // 返回结果
    return NextResponse.json({
      testDate: '1990年8月15日',
      bazi: baziResult,
      readableBazi: `${baziResult.yearPillar}年、${baziResult.monthPillar}月、${baziResult.dayPillar}日`,
      zodiac: baziResult.zodiac,
      fiveElements: baziResult.fiveElements
    });
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json({ error: '八字计算失败' }, { status: 500 });
  }
} 