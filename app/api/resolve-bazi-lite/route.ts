import { NextRequest, NextResponse } from 'next/server';
import { calculateSimpleBazi, FIVE_ELEMENTS_MAP } from '@/app/lib/bazi-calculator';

// 接口类型定义
type BaziFallbackResponse = {
  pillars: {
    year: string;
    month: string;
    day: string;
  };
  zodiac: string;
  fiveElements: {
    metal: number;
    wood: number;
    water: number;
    fire: number;
    earth: number;
  };
  primaryElement: string;
  missingElements: string[];
  isFallback: boolean;
};

type ErrorResponse = {
  error: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<BaziFallbackResponse | ErrorResponse>> {
  try {
    const body = await request.json();
    const { birthday } = body;

    // 验证生日格式
    if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      return NextResponse.json({ error: '生日格式无效，请使用YYYY-MM-DD格式' }, { status: 400 });
    }

    // 解析日期
    const dateTimeStr = `${birthday} 12:00`;
    const dateTime = new Date(dateTimeStr);

    // 验证日期有效性
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json({ error: '无效的日期' }, { status: 400 });
    }

    // 提取年月日
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const day = dateTime.getDate();

    // 使用我们的函数计算八字
    const baziResult = calculateSimpleBazi(year, month, day);
    
    // 提取年月日柱
    const yearPillar = baziResult.tianGan.year + baziResult.diZhi.year;
    const monthPillar = baziResult.tianGan.month + baziResult.diZhi.month;
    const dayPillar = baziResult.tianGan.day + baziResult.diZhi.day;
    
    // 获取生肖
    const zodiac = baziResult.zodiac;

    // 计算五行统计
    const fiveElementsCount = {
      metal: 0,
      wood: 0,
      water: 0,
      fire: 0,
      earth: 0
    };

    // 统计年月日柱中各五行的数量
    const allCharacters = [
      baziResult.tianGan.year, baziResult.diZhi.year,   // 年柱天干地支
      baziResult.tianGan.month, baziResult.diZhi.month, // 月柱天干地支
      baziResult.tianGan.day, baziResult.diZhi.day      // 日柱天干地支
    ];

    allCharacters.forEach(char => {
      const element = FIVE_ELEMENTS_MAP[char];
      if (element) {
        fiveElementsCount[element as keyof typeof fiveElementsCount]++;
      }
    });

    // 确定主导五行和缺失五行
    const elementsEntries = Object.entries(fiveElementsCount);
    elementsEntries.sort((a, b) => b[1] - a[1]);
    
    const primaryElement = elementsEntries[0][0];
    const missingElements = elementsEntries
      .filter(([_, count]) => count === 0)
      .map(([element, _]) => element);

    // 构建响应
    const response: BaziFallbackResponse = {
      pillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar
      },
      zodiac,
      fiveElements: fiveElementsCount,
      primaryElement,
      missingElements,
      isFallback: true  // 恒为true，表示简化版
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('八字计算错误:', error);
    return NextResponse.json({ error: '八字计算失败' }, { status: 400 });
  }
} 