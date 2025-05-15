import { NextResponse } from 'next/server';
import { getBaziFromLunarNumbers } from '@/app/lib/getBaziFromLunar';

export async function GET() {
  try {
    // 测试日期：1986年5月29日
    const baziResult = getBaziFromLunarNumbers(1986, 5, 29);
    
    if (!baziResult) {
      throw new Error('八字计算失败');
    }
    
    // 打印结果到控制台
    console.log('1986年5月29日八字计算结果:', JSON.stringify(baziResult, null, 2));
    
    // 返回结果
    return NextResponse.json({
      testDate: '1986年5月29日',
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

// 辅助函数：获取天干地支的五行属性
function getFiveElement(char: string): string {
  const fiveElementMap: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '丑': '土', '辰': '土', '未': '土', '戌': '土'
  };
  
  return fiveElementMap[char] || '未知';
} 