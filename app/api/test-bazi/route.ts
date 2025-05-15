import { NextResponse } from 'next/server';
import { getBaziFromLunarNumbers } from '@/app/lib/getBaziFromLunar';

export async function GET() {
  try {
    // 测试日期：1984年10月8日
    const year = 1984;
    const month = 10;
    const day = 8;
    
    // 计算八字
    const bazi = getBaziFromLunarNumbers(year, month, day);
    
    if (!bazi) {
      throw new Error('八字计算失败');
    }
    
    // 计算五行统计
    const fiveElementsCount = {
      metal: 0, // 金
      wood: 0,  // 木
      water: 0, // 水
      fire: 0,  // 火
      earth: 0  // 土
    };
    
    // 将中文五行映射到英文
    const fiveElementMapping = {
      '金': 'metal',
      '木': 'wood',
      '水': 'water',
      '火': 'fire',
      '土': 'earth'
    };
    
    // 统计年月日柱中各五行的数量
    if (bazi.fiveElements) {
      // 年柱五行
      bazi.fiveElements.year.forEach(element => {
        const engElement = fiveElementMapping[element as keyof typeof fiveElementMapping];
        if (engElement) {
          fiveElementsCount[engElement as keyof typeof fiveElementsCount]++;
        }
      });
      
      // 月柱五行
      bazi.fiveElements.month.forEach(element => {
        const engElement = fiveElementMapping[element as keyof typeof fiveElementMapping];
        if (engElement) {
          fiveElementsCount[engElement as keyof typeof fiveElementsCount]++;
        }
      });
      
      // 日柱五行
      bazi.fiveElements.day.forEach(element => {
        const engElement = fiveElementMapping[element as keyof typeof fiveElementMapping];
        if (engElement) {
          fiveElementsCount[engElement as keyof typeof fiveElementsCount]++;
        }
      });
    }
    
    // 确定主导五行和缺失五行
    const elementsEntries = Object.entries(fiveElementsCount);
    elementsEntries.sort((a, b) => b[1] - a[1]);
    
    const primaryElement = elementsEntries[0][0];
    const missingElements = elementsEntries
      .filter(([_, count]) => count === 0)
      .map(([element, _]) => element);
    
    // 获取所有字符
    const allCharacters = [
      bazi.yearPillar[0], bazi.yearPillar[1],   // 年柱天干地支
      bazi.monthPillar[0], bazi.monthPillar[1], // 月柱天干地支
      bazi.dayPillar[0], bazi.dayPillar[1]      // 日柱天干地支
    ];
    
    // 返回结果
    return NextResponse.json({
      testDate: `${year}年${month}月${day}日`,
      pillars: {
        year: bazi.yearPillar,
        month: bazi.monthPillar,
        day: bazi.dayPillar
      },
      zodiac: bazi.zodiac,
      fiveElements: fiveElementsCount,
      primaryElement,
      missingElements,
      allCharacters: allCharacters.join(''),
      readableBazi: `${bazi.yearPillar}年、${bazi.monthPillar}月、${bazi.dayPillar}日`
    });
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json({ error: '八字计算失败' }, { status: 500 });
  }
} 