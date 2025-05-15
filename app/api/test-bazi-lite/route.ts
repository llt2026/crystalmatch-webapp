import { NextResponse } from 'next/server';
import { getBaziFromLunarNumbers } from '@/app/lib/getBaziFromLunar';

export async function GET() {
  try {
    // 测试日期：1984年10月8日
    const baziResult = getBaziFromLunarNumbers(1984, 10, 8);
    
    if (!baziResult) {
      throw new Error('八字计算失败');
    }
    
    // 打印结果到控制台
    console.log('八字计算结果:', JSON.stringify(baziResult, null, 2));
    
    // 预期正确的结果，为1984年10月8日
    const expectedResult = {
      yearPillar: '甲子',
      monthPillar: '甲戌',
      dayPillar: '乙亥'
    };
    
    // 检查计算结果是否符合预期
    const isCorrect = 
      baziResult.yearPillar === expectedResult.yearPillar && 
      baziResult.monthPillar === expectedResult.monthPillar && 
      baziResult.dayPillar === expectedResult.dayPillar;
    
    // 返回结果
    return NextResponse.json({
      testDate: '1984年10月8日',
      bazi: baziResult,
      expectedResult: expectedResult,
      isCorrect: isCorrect,
      readableBazi: `${baziResult.yearPillar}年、${baziResult.monthPillar}月、${baziResult.dayPillar}日`,
      expectedReadable: `${expectedResult.yearPillar}年、${expectedResult.monthPillar}月、${expectedResult.dayPillar}日`,
    });
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json({ error: '八字计算失败' }, { status: 500 });
  }
} 