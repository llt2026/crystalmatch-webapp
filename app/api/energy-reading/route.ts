import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: getOpenAiApiKey(),
});

// 能量类型映射表（从中国传统五行到西化能量类型）
const energyTypes = {
  wood: { type: 'growth', name: '生长能量', description: '激发创造力，推动行动力' },
  fire: { type: 'passion', name: '热情能量', description: '点燃自信与勇气' },
  earth: { type: 'stability', name: '稳固能量', description: '帮助你脚踏实地，增强安全感' },
  metal: { type: 'clarity', name: '清晰能量', description: '理清思路，提高决策力' },
  water: { type: 'fluid', name: '流动能量', description: '助你灵活应对，情绪顺畅' },
};

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

// 生成水晶推荐
function getCrystalRecommendations(elements: { [key: string]: number }): any[] {
  // 根据五行强弱推荐水晶
  const sortedElements = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  const dominantElement = sortedElements[0][0];
  const weakestElement = sortedElements[4][0];
  
  // 水晶数据库
  const crystalDb: { [key: string]: Array<{ name: string; reason: string; tip: string }> } = {
    wood: [
      { 
        name: '绿幽灵水晶', 
        reason: '增强生长能量，激发创造力', 
        tip: '放在工作区域，每天触摸3-5分钟，有助于激发创新思维' 
      },
      { 
        name: '绿色碧玺', 
        reason: '补充生长能量，增强生命力', 
        tip: '佩戴在项链或手链上，靠近心脏位置，增强活力' 
      }
    ],
    fire: [
      { 
        name: '红纹石', 
        reason: '提升热情能量，增强自信心', 
        tip: '早晨冥想时握住它，设定积极的日常目标' 
      },
      { 
        name: '太阳石', 
        reason: '激活热情能量，促进乐观思维', 
        tip: '放在阳光充足的窗台，每天吸收10分钟的阳光' 
      }
    ],
    earth: [
      { 
        name: '黄水晶', 
        reason: '强化稳固能量，增强安全感', 
        tip: '放在家中或办公室的中央位置，创造稳定的环境' 
      },
      { 
        name: '虎眼石', 
        reason: '平衡稳固能量，增强决策力', 
        tip: '重要决策前，将它放在左手掌心，深呼吸5次' 
      }
    ],
    metal: [
      { 
        name: '白水晶', 
        reason: '提升清晰能量，增强思维能力', 
        tip: '在思考或冥想时，将它放在额头前方，帮助理清思路' 
      },
      { 
        name: '月光石', 
        reason: '增强清晰能量，提高直觉', 
        tip: '入睡前放在枕边，有助于解决梦中的问题' 
      }
    ],
    water: [
      { 
        name: '海蓝宝', 
        reason: '增强流动能量，促进情绪顺畅', 
        tip: '洗澡时，将它放在浴室，帮助释放压力和情绪' 
      },
      { 
        name: '蓝碧玺', 
        reason: '活化流动能量，增强沟通能力', 
        tip: '在沟通困难时，将它轻握在手中，帮助表达流畅' 
      }
    ]
  };
  
  // 选择2-3颗水晶
  const recommendations: Array<{ name: string; reason: string; tip: string }> = [];
  
  // 选择一颗强化主导能量的水晶
  const dominantCrystal = crystalDb[dominantElement][0];
  recommendations.push(dominantCrystal);
  
  // 选择一颗补充最弱能量的水晶
  const complementaryCrystal = crystalDb[weakestElement][0];
  recommendations.push(complementaryCrystal);
  
  // 如果主导和最弱不同，随机选择一颗平衡的水晶
  if (dominantElement !== weakestElement && Math.random() > 0.5) {
    const balanceElement = sortedElements[2][0];
    const balanceCrystal = crystalDb[balanceElement][1];
    recommendations.push(balanceCrystal);
  }
  
  return recommendations;
}

// 根据AI生成能量报告
async function generateEnergyReport(
  birthInfo: any, 
  elementProportions: { [key: string]: number },
  zodiacSign: string,
  westernSign: string
): Promise<any> {
  try {
    // 准备提示词
    const sortedElements = Object.entries(elementProportions)
      .sort((a, b) => b[1] - a[1])
      .map(([element, value]) => ({ 
        type: element, 
        name: energyTypes[element as keyof typeof energyTypes].name,
        description: energyTypes[element as keyof typeof energyTypes].description,
        strength: value 
      }));
      
    const primaryEnergy = sortedElements[0];
    const secondaryEnergy = sortedElements[1];
    const weakestEnergy = sortedElements[4];
    
    // 获取生肖和星座信息
    const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
    const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
    
    // 使用OpenAI生成更个性化的描述和提示
    let aiResponse = '';
    
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
      console.log('使用模拟数据，因为未配置有效的OpenAI API密钥');
      throw new Error('OpenAI API密钥未配置');
    }
    
    try {
      // 添加超时控制
      const timeout = 10000; // 10秒
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const prompt = `
      我需要为一位用户生成一份个性化的能量报告。请基于以下信息生成具体的描述和建议：
      
      1. 出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]}
      2. 性别：${birthInfo.gender}
      3. 生肖：${zodiacInfo.name}（${zodiacInfo.personality}）
      4. 星座：${westernInfo.name}（${westernInfo.traits}）
      5. 能量分布：
         - 主导能量：${primaryEnergy.name}（${primaryEnergy.strength}%）- ${primaryEnergy.description}
         - 次要能量：${secondaryEnergy.name}（${secondaryEnergy.strength}%）- ${secondaryEnergy.description}
         - 最弱能量：${weakestEnergy.name}（${weakestEnergy.strength}%）- ${weakestEnergy.description}
      
      请为这些内容填写更具体的描述：
      1. 针对主导能量的小提示（日常可实践的建议）
      2. 针对次要能量的小提示
      3. 针对最弱能量的补充建议
      4. 2025年的生肖运势简述
      5. 本月星象建议
      6. 生肖相关的小提示
      7. 星座相关的小提示
      8. 4个简单的每日能量仪式（如：晨起冥想、饮水仪式等）
      
      全部内容请用简体中文回答，必须简洁明了，每条建议不超过30字。
      `;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system", 
            content: "你是一位专业的能量咨询师，擅长将东方五行与西方星座融合，给予客户简洁实用的能量建议。"
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
      
      clearTimeout(timeoutId);
      aiResponse = completion.choices[0].message.content || '';
    } catch (apiError) {
      console.error('OpenAI API调用错误:', apiError);
      // 使用备选数据
      aiResponse = getMockAIResponse(primaryEnergy, secondaryEnergy, weakestEnergy, zodiacInfo, westernInfo);
    }
    
    // 解析AI响应
    const lines = aiResponse.split('\n').filter(line => line.trim() !== '');
    
    // 提取关键信息
    let primaryTip = lines.find(line => line.includes('主导能量'))?.replace(/.*主导能量.*?[:：]/, '').trim() || '保持身体活动，每天伸展运动10分钟';
    let secondaryTip = lines.find(line => line.includes('次要能量'))?.replace(/.*次要能量.*?[:：]/, '').trim() || '每天深呼吸5分钟，平衡情绪';
    let weakestTip = lines.find(line => line.includes('最弱能量'))?.replace(/.*最弱能量.*?[:：]/, '').trim() || '增加相关活动来强化薄弱环节';
    let zodiacForecast = lines.find(line => line.includes('2025') || line.includes('运势'))?.replace(/.*2025.*?[:：]/, '').trim() || '新的一年充满机遇，保持开放心态';
    let monthlyTip = lines.find(line => line.includes('星象') || line.includes('本月'))?.replace(/.*本月.*?[:：]/, '').trim() || '本月适合关注自我照顾与成长';
    let zodiacTip = lines.find(line => line.includes('生肖相关'))?.replace(/.*生肖相关.*?[:：]/, '').trim() || '佩戴红色物品，为生肖带来好运';
    let westernTip = lines.find(line => line.includes('星座相关'))?.replace(/.*星座相关.*?[:：]/, '').trim() || '每周一次冥想，与星座能量共振';
    
    // 提取行动步骤
    const actionStepsPattern = /每日能量仪式[:：]?([\s\S]*?)(?=\n\n|$)/;
    const actionStepsMatch = aiResponse.match(actionStepsPattern);
    let actionStepsText = actionStepsMatch ? actionStepsMatch[1].trim() : '';
    
    let actionSteps: string[] = [];
    if (actionStepsText) {
      actionSteps = actionStepsText.split(/\d+[\.、]/).filter(s => s.trim()).map(s => s.trim());
    }
    
    if (actionSteps.length === 0) {
      actionSteps = [
        '空腹起床后喝250ml温水',
        '每天用5分钟写下当日三件感恩小事',
        '在工作台放置一颗小水晶',
        '每隔2小时，做3分钟深呼吸冥想'
      ];
    }
    
    // 更新水晶的详细描述
    const crystals = getCrystalRecommendations(elementProportions);
    
    // 组装最终报告
    const finalReport = {
      greeting: `嗨，朋友！这是你的能量快照`,
      overview: `出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]} | ${zodiacInfo.name} | ${westernInfo.name}`,
      
      primaryEnergy: {
        ...primaryEnergy,
        tip: primaryTip
      },
      
      secondaryEnergy: {
        ...secondaryEnergy,
        tip: secondaryTip
      },
      
      energyRanking: sortedElements.map((element, index) => {
        return {
          ...element,
          tip: index === 4 ? weakestTip : ''
        };
      }),
      
      zodiac: {
        name: zodiacInfo.name,
        personality: zodiacInfo.personality,
        forecast: zodiacForecast,
        tip: zodiacTip
      },
      
      westernAstrology: {
        sign: westernInfo.name,
        traits: westernInfo.traits,
        monthlyTip: monthlyTip,
        tip: westernTip
      },
      
      crystalRecommendations: crystals,
      actionSteps: actionSteps
    };
    
    return finalReport;
  } catch (error) {
    console.error('生成报告出错:', error);
    // 返回默认报告
    return createDefaultReport(birthInfo, elementProportions, zodiacSign, westernSign);
  }
}

// 生成默认的报告（当API调用失败时使用）
function createDefaultReport(birthInfo: any, elementProportions: { [key: string]: number }, zodiacSign: string, westernSign: string) {
  const sortedElements = Object.entries(elementProportions)
    .sort((a, b) => b[1] - a[1])
    .map(([element, value]) => ({ 
      type: element, 
      name: energyTypes[element as keyof typeof energyTypes].name,
      description: energyTypes[element as keyof typeof energyTypes].description,
      strength: value 
    }));
    
  const primaryEnergy = sortedElements[0];
  const secondaryEnergy = sortedElements[1];
  const weakestEnergy = sortedElements[4];
  
  // 获取生肖和星座信息
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  // 水晶推荐
  const crystals = getCrystalRecommendations(elementProportions);
  
  return {
    greeting: `嗨，朋友！这是你的能量快照`,
    overview: `出生日期：${new Date(birthInfo.birthDate).toISOString().split('T')[0]} | ${zodiacInfo.name} | ${westernInfo.name}`,
    
    primaryEnergy: {
      ...primaryEnergy,
      tip: '定期接触大自然，增强能量平衡'
    },
    
    secondaryEnergy: {
      ...secondaryEnergy,
      tip: '每天10分钟冥想，增强内在平静'
    },
    
    energyRanking: sortedElements.map((element, index) => {
      return {
        ...element,
        tip: index === 4 ? '通过使用对应的水晶提升这一能量' : ''
      };
    }),
    
    zodiac: {
      name: zodiacInfo.name,
      personality: zodiacInfo.personality,
      forecast: '今年将有机遇与挑战并存，保持积极心态很重要',
      tip: '每周做一次与生肖相关的冥想活动'
    },
    
    westernAstrology: {
      sign: westernInfo.name,
      traits: westernInfo.traits,
      monthlyTip: '本月关注自我成长和人际关系的平衡',
      tip: '关注直觉信号，选择适合自己的发展方向'
    },
    
    crystalRecommendations: crystals,
    actionSteps: [
      '每天早上喝一杯温水，唤醒身体',
      '定期接触自然，吸收地球能量',
      '晚上睡前冥想10分钟，清理杂念',
      '选择一颗水晶随身携带，增强能量'
    ] as string[]
  };
}

// 提供模拟AI响应的函数
function getMockAIResponse(
  primaryEnergy: { type: string; name: string; description: string; strength: number },
  secondaryEnergy: { type: string; name: string; description: string; strength: number },
  weakestEnergy: { type: string; name: string; description: string; strength: number },
  zodiacInfo: { name: string; personality: string },
  westernInfo: { name: string; traits: string }
): string {
  return `
1. 针对主导能量${primaryEnergy.name}的小提示：每天花10分钟接触大自然，增强${primaryEnergy.name}。
2. 针对次要能量${secondaryEnergy.name}的小提示：清晨喝一杯温水，激活体内${secondaryEnergy.name}。
3. 针对最弱能量${weakestEnergy.name}的补充建议：佩戴相应颜色的衣物，补充${weakestEnergy.name}。
4. 2025年的生肖运势简述：${zodiacInfo.name}今年整体运势平稳，人际关系有所提升。
5. 本月星象建议：保持稳定作息，避免冲动决定。
6. 生肖相关的小提示：多吃绿色蔬菜，有助于${zodiacInfo.name}的健康状态。
7. 星座相关的小提示：${westernInfo.name}近期应关注情绪波动，保持心态平衡。
8. 每日能量仪式：
   1. 晨起后喝一杯温开水，同时想象积极的一天
   2. 午餐后在户外散步5分钟，接触自然能量
   3. 晚上冥想10分钟，释放压力
   4. 睡前写下三件感恩的事，增强正能量
`;
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
    const birthMonth = birthDate.getMonth() + 1; // getMonth()返回0-11
    const birthDay = birthDate.getDate();
    const westernSign = getZodiacSign(birthMonth, birthDay);
    
    // 计算五行比例
    const elementProportions = calculateChineseElements(birthDate, birthInfo.gender);
    
    // 生成完整报告
    const report = await generateEnergyReport(birthInfo, elementProportions, zodiacSign, westernSign);
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json({ error: '生成能量报告失败' }, { status: 500 });
  }
} 