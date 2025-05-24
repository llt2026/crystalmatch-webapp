import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

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

// 使用GPT生成完整的能量报告
async function generateEnergyReportWithGPT(
  birthInfo: any, 
  elementProportions: { [key: string]: number },
  zodiacSign: string,
  westernSign: string
): Promise<any> {
  try {
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
      console.log('未配置有效的OpenAI API密钥，返回错误');
      throw new Error('OpenAI API密钥未配置');
    }

    // 获取生肖和星座信息
    const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
    const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
    
    // 排序五行强度
    const sortedElements = Object.entries(elementProportions)
      .sort((a, b) => b[1] - a[1])
      .map(([element, value]) => ({ element, strength: value }));

    const prompt = `
你是一位专业的能量咨询师，擅长将中国传统五行学说与西方占星学融合，为用户提供个性化的能量分析报告。

用户信息：
- 出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]}
- 性别：${birthInfo.gender}
- 生肖：${zodiacInfo.name}（${zodiacInfo.personality}）
- 星座：${westernInfo.name}（${westernInfo.traits}）
- 五行能量分布：
  ${sortedElements.map(e => `  ${e.element}: ${e.strength}%`).join('\n')}

请生成一份完整的能量报告，必须严格按照以下JSON格式返回，所有字段都必须包含：

{
  "greeting": "个性化的问候语",
  "overview": "包含出生日期、生肖、星座的概述",
  "primaryEnergy": {
    "type": "主导五行元素(wood/fire/earth/metal/water)",
    "name": "中文能量名称",
    "description": "能量描述",
    "strength": 具体百分比数字,
    "traits": ["特质1", "特质2", "特质3", "特质4"],
    "color": "对应颜色hex代码",
    "tip": "针对此能量的个性化建议"
  },
  "secondaryEnergy": {
    "type": "次要五行元素",
    "name": "中文能量名称", 
    "description": "能量描述",
    "strength": 具体百分比数字,
    "traits": ["特质1", "特质2", "特质3", "特质4"],
    "color": "对应颜色hex代码",
    "tip": "针对此能量的个性化建议"
  },
  "energyRanking": [
    // 按强度排序的5个能量对象，每个包含type, name, description, strength, traits, color, tip字段
    // 只有最弱的能量(第5个)需要tip字段，其他tip可以为空字符串
  ],
  "zodiac": {
    "name": "生肖名称",
    "personality": "生肖性格特点",
    "forecast": "2025年运势预测",
    "tip": "生肖相关的实用建议"
  },
  "westernAstrology": {
    "sign": "星座名称",
    "traits": "星座特质",
    "monthlyTip": "本月星象建议",
    "tip": "星座相关的实用建议"
  },
  "crystalRecommendations": [
    {
      "name": "水晶名称",
      "description": "水晶功效描述",
      "benefits": ["功效1", "功效2", "功效3"],
      "usage": "使用方法建议"
    }
    // 推荐2-3颗适合用户五行能量的水晶
  ],
  "actionSteps": [
    "每日能量仪式步骤1",
    "每日能量仪式步骤2", 
    "每日能量仪式步骤3",
    "每日能量仪式步骤4"
  ]
}

要求：
1. 所有内容都要个性化，基于用户的具体五行分布、生肖、星座生成
2. 五行对应颜色：wood:#22c55e, fire:#ef4444, earth:#eab308, metal:#6b7280, water:#3b82f6
3. 水晶推荐要基于用户的五行强弱来选择最适合的
4. 所有文本内容使用简体中文，简洁实用
5. 确保JSON格式完全正确，可直接解析

只返回JSON，不要有任何其他文字。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "你是一位专业的能量咨询师。请严格按照用户要求的JSON格式返回结果，确保所有字段完整且类型正确。"
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0].message.content || '';
    
    try {
      // 尝试解析GPT返回的JSON
      const report = JSON.parse(aiResponse);
      return report;
    } catch (parseError) {
      console.error('解析GPT响应JSON失败:', parseError);
      console.error('GPT原始响应:', aiResponse);
      throw new Error('GPT返回的数据格式错误');
    }

  } catch (error) {
    console.error('GPT生成报告失败:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取请求数据
    const birthInfo = await request.json();
    
    if (!birthInfo || !birthInfo.birthDate || !birthInfo.gender) {
      return NextResponse.json({ error: '缺少必要的出生信息' }, { status: 400 });
    }
    
    // 解析出生日期
    const birthDate = new Date(birthInfo.birthDate);
    
    // 获取生肖
    const birthYear = birthDate.getFullYear();
    const zodiacSign = getChineseZodiac(birthYear);
    
    // 获取星座
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    const westernSign = getZodiacSign(birthMonth, birthDay);
    
    // 计算五行比例
    const elementProportions = calculateChineseElements(birthDate, birthInfo.gender);
    
    // 使用GPT生成完整报告
    const report = await generateEnergyReportWithGPT(birthInfo, elementProportions, zodiacSign, westernSign);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json({ 
      error: '生成能量报告失败，请稍后重试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 