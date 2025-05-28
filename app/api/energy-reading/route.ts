import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { calculateBazi } from '@/app/lib/bazi-service';
import { getActiveSubscription } from '@/app/lib/repositories/subscriptionRepository';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: getOpenAiApiKey(),
});

// 生肖映射
const zodiacMapping = {
  rat: { name: '鼠', personality: '机智灵活，适应力强' },
  ox: { name: '牛', personality: '勤劳踏实，性格坚韧' },
  tiger: { name: '虎', personality: '勇敢自信，充满活力' },
  rabbit: { name: '兔', personality: '温和谨慎，善解人意' },
  dragon: { name: '龙', personality: '热情开朗，充满创造力' },
  snake: { name: '蛇', personality: '神秘内敛，思维敏锐' },
  horse: { name: '马', personality: '活泼乐观，追求自由' },
  goat: { name: '羊', personality: '温顺善良，富有艺术天赋' },
  monkey: { name: '猴', personality: '聪明机智，适应力强' },
  rooster: { name: '鸡', personality: '勤奋自信，注重细节' },
  dog: { name: '狗', personality: '忠诚可靠，正直善良' },
  pig: { name: '猪', personality: '诚实善良，享受生活' }
};

// 星座映射
const westernZodiacMapping = {
  aries: { name: '白羊座', traits: '勇敢、自信、充满活力' },
  taurus: { name: '金牛座', traits: '可靠、耐心、务实' },
  gemini: { name: '双子座', traits: '好奇、适应力强、交际能力佳' },
  cancer: { name: '巨蟹座', traits: '富有同情心、直觉敏锐、重视家庭' },
  leo: { name: '狮子座', traits: '自信、慷慨、有领导力' },
  virgo: { name: '处女座', traits: '细心、实际、分析能力强' },
  libra: { name: '天秤座', traits: '和谐、外交、公平' },
  scorpio: { name: '天蝎座', traits: '热情、坚韧、洞察力强' },
  sagittarius: { name: '射手座', traits: '乐观、自由、诚实' },
  capricorn: { name: '摩羯座', traits: '自律、责任感强、踏实' },
  aquarius: { name: '水瓶座', traits: '独立、创新、人道主义' },
  pisces: { name: '双鱼座', traits: '富有同情心、直觉敏锐、善良' }
};

// 根据生日获取星座
function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

// 根据年份获取生肖
function getChineseZodiac(year: number): string {
  const zodiacSigns = ['monkey', 'rooster', 'dog', 'pig', 'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat'];
  return zodiacSigns[(year - 4) % 12];
}

// 根据生辰八字计算五行属性（简化版）
function calculateChineseElements(birthDate: Date, gender: string): { [key: string]: number } {
  // 这是一个非常简化的版本，实际上需要更复杂的算法
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const hour = birthDate.getHours();
  
  // 随机生成五行比例 - 实际应用中应替换为真实的计算公式
  const total = 100;
  const woodPercent = Math.floor(Math.random() * 30) + 10;
  const firePercent = Math.floor(Math.random() * 30) + 10;
  const earthPercent = Math.floor(Math.random() * 20) + 10;
  const metalPercent = Math.floor(Math.random() * 20) + 10;
  const waterPercent = total - woodPercent - firePercent - earthPercent - metalPercent;
  
  return {
    wood: woodPercent,
    fire: firePercent,
    earth: earthPercent,
    metal: metalPercent,
    water: waterPercent
  };
}

// 判断用户订阅等级
function getUserTier(subscription: any): 'free' | 'monthly' | 'yearly' {
  if (!subscription || subscription.status !== 'active') {
    return 'free';
  }
  
  const planId = subscription.planId || subscription.plan?.id;
  if (planId?.includes('monthly') || planId?.includes('month')) {
    return 'monthly';
  } else if (planId?.includes('yearly') || planId?.includes('year')) {
    return 'yearly';
  }
  
  return 'free';
}

// 免费用户报告生成
async function generateFreeReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  const prompt = `
你是一位专业的命理师，基于用户的八字信息生成年度基础能量报告。

用户信息：
- 出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]}
- 性别：${birthInfo.gender}
- 八字：年柱${baziInfo.year.tian}${baziInfo.year.di}、月柱${baziInfo.month.tian}${baziInfo.month.di}、日柱${baziInfo.day.tian}${baziInfo.day.di}、时柱${baziInfo.hour.tian}${baziInfo.hour.di}
- 五行分布：木${baziInfo.wuxing.wood}%，火${baziInfo.wuxing.fire}%，土${baziInfo.wuxing.earth}%，金${baziInfo.wuxing.metal}%，水${baziInfo.wuxing.water}%
- 生肖：${zodiacInfo.name}（${zodiacInfo.personality}）
- 星座：${westernInfo.name}（${westernInfo.traits}）

请生成免费用户的年度基础报告，严格按照以下JSON格式返回：

{
  "reportType": "free",
  "greeting": "欢迎来到CrystalMatch！根据您的出生信息，我们为您准备了专属的年度能量报告。",
  "overview": "基于您${new Date(birthInfo.birthDate).toISOString().split('T')[0]}的出生信息分析，您的八字为${baziInfo.year.tian}${baziInfo.year.di} ${baziInfo.month.tian}${baziInfo.month.di} ${baziInfo.day.tian}${baziInfo.day.di} ${baziInfo.hour.tian}${baziInfo.hour.di}，生肖${zodiacInfo.name}，星座${westernInfo.name}。",
  "bazi": {
    "yearPillar": "${baziInfo.year.tian}${baziInfo.year.di}",
    "monthPillar": "${baziInfo.month.tian}${baziInfo.month.di}",
    "dayPillar": "${baziInfo.day.tian}${baziInfo.day.di}",
    "hourPillar": "${baziInfo.hour.tian}${baziInfo.hour.di}",
    "analysis": "基于八字的基础解读"
  },
  "primaryEnergy": {
    "type": "主导五行元素(wood/fire/earth/metal/water)",
    "name": "中文能量名称",
    "description": "基础能量描述",
    "strength": 数字,
    "traits": ["特质1", "特质2", "特质3"],
    "color": "对应颜色hex代码"
  },
  "yearlyForecast": {
    "year": ${nextYear},
    "overallTrend": "整体运势概括",
    "keyMonths": ["重点月份1", "重点月份2", "重点月份3"],
    "advice": "年度建议"
  },
  "monthlyEnergyTable": [
    {
      "month": "1月",
      "energy": "主要能量类型",
      "level": "能量强度(强/中/弱)",
      "focus": "本月重点"
    }
    // 12个月的数据
  ],
  "upgradePrompt": {
    "message": "想要获得更详细的月度能量分析和个性化建议吗？",
    "benefits": ["详细月度运势分析", "个性化水晶推荐", "专属能量仪式", "无限次查询"],
    "cta": "升级到月度会员，解锁完整功能"
  }
}

要求：
1. 基于真实八字信息生成内容，不要虚构
2. 月度能量表要包含12个月完整信息
3. 内容简洁实用，突出年度整体趋势
4. 引导用户升级，但不过分营销
5. 只返回JSON，不要其他文字

只返回JSON，不要有任何其他文字。
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "你是一位专业的命理师。请严格按照用户要求的JSON格式返回结果，确保所有字段完整且类型正确。"
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const aiResponse = completion.choices[0].message.content || '';
  return JSON.parse(aiResponse);
}

// 月订阅用户报告生成
async function generateMonthlyReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const prompt = `
你是一位专业的命理师，基于用户的八字信息生成详细的月度能量报告。

用户信息：
- 出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]}
- 性别：${birthInfo.gender}
- 八字：年柱${baziInfo.year.tian}${baziInfo.year.di}、月柱${baziInfo.month.tian}${baziInfo.month.di}、日柱${baziInfo.day.tian}${baziInfo.day.di}、时柱${baziInfo.hour.tian}${baziInfo.hour.di}
- 五行分布：木${baziInfo.wuxing.wood}%，火${baziInfo.wuxing.fire}%，土${baziInfo.wuxing.earth}%，金${baziInfo.wuxing.metal}%，水${baziInfo.wuxing.water}%
- 生肖：${zodiacInfo.name}（${zodiacInfo.personality}）
- 星座：${westernInfo.name}（${westernInfo.traits}）

当前分析月份：${currentYear}年${currentMonth}月

请生成月订阅用户的详细月度报告，严格按照以下JSON格式返回：

{
  "reportType": "monthly", 
  "greeting": "您的专属月度能量报告已准备就绪！",
  "overview": "基于您的八字与当月天象影响的深度分析",
  "bazi": {
    "yearPillar": "${baziInfo.year.tian}${baziInfo.year.di}",
    "monthPillar": "${baziInfo.month.tian}${baziInfo.month.di}",
    "dayPillar": "${baziInfo.day.tian}${baziInfo.day.di}",
    "hourPillar": "${baziInfo.hour.tian}${baziInfo.hour.di}",
    "analysis": "详细的八字解读，包含十神、纳音、五行旺衰分析"
  },
  "monthlyAnalysis": {
    "month": "${currentYear}年${currentMonth}月",
    "mainTheme": "本月主题",
    "energyShift": "能量变化趋势",
    "opportunities": ["机遇1", "机遇2", "机遇3"],
    "challenges": ["挑战1", "挑战2"],
    "recommendations": ["建议1", "建议2", "建议3"]
  },
  "detailedForecast": {
    "career": {
      "trend": "事业运势",
      "advice": "事业建议",
      "luckyDays": ["幸运日期1", "幸运日期2"]
    },
    "wealth": {
      "trend": "财运分析", 
      "advice": "理财建议",
      "investmentTip": "投资提示"
    },
    "relationships": {
      "trend": "感情运势",
      "advice": "人际关系建议",
      "romanticTip": "桃花运提示"
    },
    "health": {
      "trend": "健康状况",
      "advice": "养生建议",
      "warning": "需要注意的健康问题"
    }
  },
  "crystalRecommendations": [
    {
      "name": "水晶名称",
      "description": "功效描述",
      "benefits": ["益处1", "益处2", "益处3"],
      "usage": "使用方法",
      "placement": "摆放位置"
    }
    // 3-4个适合本月的水晶
  ],
  "energyRituals": {
    "morning": "晨间能量仪式",
    "evening": "晚间能量仪式", 
    "weekly": "每周特殊仪式",
    "fullMoon": "满月能量仪式"
  },
  "luckyElements": {
    "colors": ["幸运色1", "幸运色2"],
    "numbers": [数字1, 数字2, 数字3],
    "directions": ["方位1", "方位2"],
    "materials": ["材质1", "材质2"]
  },
  "shareQuote": "适合分享的月度能量金句"
}

要求：
1. 结合用户八字与当月流年月令的影响
2. 提供具体可行的建议和仪式
3. 水晶推荐要基于当月能量需求
4. 内容专业详细，体现月度会员价值
5. 只返回JSON，不要其他文字

只返回JSON，不要有任何其他文字。
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "你是一位专业的命理师。请严格按照用户要求的JSON格式返回结果，确保所有字段完整且类型正确。"
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 3500,
  });

  const aiResponse = completion.choices[0].message.content || '';
  return JSON.parse(aiResponse);
}

// 年订阅用户报告生成
async function generateYearlyReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  const prompt = `
你是一位顶级命理大师，基于用户的八字信息生成最详细的年度完整报告。

用户信息：
- 出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]}
- 性别：${birthInfo.gender}
- 八字：年柱${baziInfo.year.tian}${baziInfo.year.di}、月柱${baziInfo.month.tian}${baziInfo.month.di}、日柱${baziInfo.day.tian}${baziInfo.day.di}、时柱${baziInfo.hour.tian}${baziInfo.hour.di}
- 五行分布：木${baziInfo.wuxing.wood}%，火${baziInfo.wuxing.fire}%，土${baziInfo.wuxing.earth}%，金${baziInfo.wuxing.metal}%，水${baziInfo.wuxing.water}%
- 生肖：${zodiacInfo.name}（${zodiacInfo.personality}）
- 星座：${westernInfo.name}（${westernInfo.traits}）

分析年份：${nextYear}年

请生成年订阅用户的完整年度报告，严格按照以下JSON格式返回：

{
  "reportType": "yearly",
  "greeting": "恭喜您解锁完整的年度命理报告！这是基于您八字的最详细分析。",
  "overview": "基于您的命盘与${nextYear}年流年运势的综合分析",
  "bazi": {
    "fullAnalysis": "完整的八字命盘分析，包含格局、用神、十神关系等深度解读",
    "yearPillar": "${baziInfo.year.tian}${baziInfo.year.di}",
    "monthPillar": "${baziInfo.month.tian}${baziInfo.month.di}",
    "dayPillar": "${baziInfo.day.tian}${baziInfo.day.di}",
    "hourPillar": "${baziInfo.hour.tian}${baziInfo.hour.di}",
    "pattern": "命格类型",
    "useGod": "用神分析",
    "lifeStages": "人生阶段运势概览"
  },
  "yearlyOverview": {
    "year": ${nextYear},
    "theme": "年度主题",
    "overallRating": "整体运势评分(1-10)",
    "keyTrends": ["主要趋势1", "主要趋势2", "主要趋势3"],
    "majorEvents": ["重要事件预测1", "重要事件预测2"],
    "bestMonths": ["最佳月份1", "最佳月份2"],
    "challengingMonths": ["挑战月份1", "挑战月份2"]
  },
  "detailedMonthlyAnalysis": [
    {
      "month": "1月",
      "monthlyTheme": "月度主题",
      "energyLevel": "能量强度(1-10)",
      "career": "事业运势详解",
      "wealth": "财运分析",
      "relationships": "感情运势",
      "health": "健康状况",
      "opportunities": ["机会1", "机会2"],
      "warnings": ["注意事项1"],
      "advice": "月度建议",
      "luckyDays": ["吉日1", "吉日2"],
      "colors": ["幸运色1", "幸运色2"],
      "crystals": ["推荐水晶1", "推荐水晶2"]
    }
    // 12个月完整数据
  ],
  "lifeAspects": {
    "career": {
      "yearlyTrend": "年度事业趋势",
      "breakthroughPeriods": ["突破期1", "突破期2"],
      "strategies": ["策略1", "策略2", "策略3"],
      "networking": "人脉发展建议",
      "skillDevelopment": "技能提升方向"
    },
    "wealth": {
      "yearlyTrend": "年度财运趋势",
      "investmentPeriods": ["投资良机1", "投资良机2"],
      "riskPeriods": ["风险期1"],
      "strategies": ["理财策略1", "理财策略2"],
      "sideBusiness": "副业发展机会"
    },
    "relationships": {
      "yearlyTrend": "年度感情运势",
      "romanticPeaks": ["桃花旺期1", "桃花旺期2"],
      "familyHarmony": "家庭关系建议",
      "friendships": "友谊发展建议",
      "marriageAdvice": "婚姻关系维护"
    },
    "health": {
      "yearlyTrend": "年度健康趋势",
      "preventiveCare": ["预防保健1", "预防保健2"],
      "riskPeriods": ["健康注意期1"],
      "exerciseRecommendations": "运动建议",
      "mentalWellness": "心理健康维护"
    }
  },
  "spiritualGuidance": {
    "lifePhilosophy": "人生哲学指导",
    "meditation": "冥想练习建议",
    "energyWork": "能量修炼方法",
    "karma": "因果业力分析",
    "soulPurpose": "灵魂使命解读"
  },
  "premiumFeatures": {
    "personalizedRituals": "定制化仪式",
    "advancedCrystalGrid": "高级水晶阵法",
    "astrologicalTransits": "流年行星过境影响",
    "compatibilityAnalysis": "人际关系兼容性分析",
    "lifePath": "生命路径指引"
  }
}

要求：
1. 这是最高级别的报告，内容要极其详细和专业
2. 12个月分析要具体到每月的运势起伏
3. 结合八字学、紫微斗数、占星学等多维度分析
4. 提供实用的生活指导和精神修行建议
5. 体现年度会员的尊贵体验
6. 只返回JSON，不要其他文字

只返回JSON，不要有任何其他文字。
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system", 
        content: "你是一位顶级命理大师。请严格按照用户要求的JSON格式返回结果，确保所有字段完整且类型正确。"
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const aiResponse = completion.choices[0].message.content || '';
  return JSON.parse(aiResponse);
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求数据
    const requestData = await request.json();
    const { birthInfo, userId } = requestData;
    
    if (!birthInfo || !birthInfo.birthDate || !birthInfo.gender) {
      return NextResponse.json({ error: '缺少必要的出生信息' }, { status: 400 });
    }
    
    // 解析出生日期
    const birthDate = new Date(birthInfo.birthDate);
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const birthHour = birthDate.getHours();
    const birthMinute = birthDate.getMinutes();
    
    // 获取用户订阅状态
    let userSubscription = null;
    if (userId) {
      try {
        userSubscription = await getActiveSubscription(userId);
      } catch (error) {
        console.log('获取用户订阅状态失败，按免费用户处理');
      }
    }
    
    const userTier = getUserTier(userSubscription);
    console.log('用户订阅等级:', userTier);
    
    // 计算八字信息
    const baziInfo = calculateBazi({
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthHour,
      minute: birthMinute,
      gender: birthInfo.gender
    });
    
    // 获取生肖和星座
    const zodiacSign = getChineseZodiac(birthYear);
    const westernSign = getZodiacSign(birthMonth, birthDay);
    
    // 根据用户订阅等级生成不同的报告
    let report;
    
    switch (userTier) {
      case 'monthly':
        report = await generateMonthlyReport(birthInfo, baziInfo, zodiacSign, westernSign);
        break;
      case 'yearly':
        report = await generateYearlyReport(birthInfo, baziInfo, zodiacSign, westernSign);
        break;
      default: // free
        report = await generateFreeReport(birthInfo, baziInfo, zodiacSign, westernSign);
        break;
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json({ 
      error: '生成能量报告失败，请稍后重试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 