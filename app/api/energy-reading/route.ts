import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { calculateBazi } from '@/app/lib/bazi-service';
import { getActiveSubscription } from '@/app/lib/repositories/subscriptionRepository';

// 初始化OpenAI客户端 - 已禁用
// const openai = new OpenAI({
//   apiKey: getOpenAiApiKey(),
// });

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

// 免费用户报告生成 - 使用模拟数据
async function generateFreeReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  console.log('⚠️ OpenAI API调用已禁用，使用模拟数据');
  
  // 返回模拟数据
  return {
    "reportType": "free",
    "greeting": "欢迎来到CrystalMatch！根据您的出生信息，我们为您准备了专属的年度能量报告。[模拟数据]",
    "overview": `基于您${new Date(birthInfo.birthDate).toISOString().split('T')[0]}的出生信息分析，您的八字为${baziInfo.year.tian}${baziInfo.year.di} ${baziInfo.month.tian}${baziInfo.month.di} ${baziInfo.day.tian}${baziInfo.day.di} ${baziInfo.hour.tian}${baziInfo.hour.di}，生肖${zodiacInfo.name}，星座${westernInfo.name}。[模拟数据]`,
    "bazi": {
      "yearPillar": `${baziInfo.year.tian}${baziInfo.year.di}`,
      "monthPillar": `${baziInfo.month.tian}${baziInfo.month.di}`,
      "dayPillar": `${baziInfo.day.tian}${baziInfo.day.di}`,
      "hourPillar": `${baziInfo.hour.tian}${baziInfo.hour.di}`,
      "analysis": "这是模拟的八字分析数据，实际API调用已禁用以节省费用。"
    },
    "primaryEnergy": {
      "type": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "wood" : "fire",
      "name": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "木" : "火",
      "description": "这是模拟的能量描述，实际API调用已禁用以节省费用。",
      "strength": 75,
      "traits": ["适应力强", "创造力强", "思维活跃"],
      "color": "#4CAF50"
    },
    "yearlyForecast": {
      "year": new Date().getFullYear() + 1,
      "overallTrend": "这是模拟的年度趋势，实际API调用已禁用以节省费用。",
      "keyMonths": ["3月", "7月", "11月"],
      "advice": "这是模拟的年度建议，实际API调用已禁用以节省费用。"
    },
    "monthlyEnergyTable": Array.from({length: 12}, (_, i) => ({
      "month": `${i+1}月`,
      "energy": ["木", "火", "土", "金", "水"][i % 5],
      "level": ["强", "中", "弱"][i % 3],
      "focus": ["事业", "财运", "感情", "健康"][i % 4]
    })),
    "upgradePrompt": {
      "message": "想要获得更详细的月度能量分析和个性化建议吗？",
      "benefits": ["详细月度运势分析", "个性化水晶推荐", "专属能量仪式", "无限次查询"],
      "cta": "升级到月度会员，解锁完整功能"
    }
  };
}

// 月订阅用户报告生成 - 使用模拟数据
async function generateMonthlyReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  console.log('⚠️ OpenAI API调用已禁用，使用模拟数据');
  
  // 返回月度会员模拟数据
  return {
    "reportType": "monthly",
    "greeting": "尊敬的月度会员，感谢您的支持！以下是您的专属能量报告。[模拟数据]",
    "overview": `基于您${new Date(birthInfo.birthDate).toISOString().split('T')[0]}的出生信息分析，您的八字为${baziInfo.year.tian}${baziInfo.year.di} ${baziInfo.month.tian}${baziInfo.month.di} ${baziInfo.day.tian}${baziInfo.day.di} ${baziInfo.hour.tian}${baziInfo.hour.di}，生肖${zodiacInfo.name}，星座${westernInfo.name}。[模拟数据]`,
    "bazi": {
      "yearPillar": `${baziInfo.year.tian}${baziInfo.year.di}`,
      "monthPillar": `${baziInfo.month.tian}${baziInfo.month.di}`,
      "dayPillar": `${baziInfo.day.tian}${baziInfo.day.di}`,
      "hourPillar": `${baziInfo.hour.tian}${baziInfo.hour.di}`,
      "analysis": "这是模拟的八字分析数据，实际API调用已禁用以节省费用。"
    },
    "primaryEnergy": {
      "type": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "wood" : "fire",
      "name": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "木" : "火",
      "description": "这是模拟的能量描述，实际API调用已禁用以节省费用。",
      "strength": 85,
      "traits": ["适应力强", "创造力强", "思维活跃", "活力充沛", "善于沟通"],
      "color": "#4CAF50"
    },
    "yearlyForecast": {
      "year": new Date().getFullYear() + 1,
      "overallTrend": "这是模拟的年度趋势，实际API调用已禁用以节省费用。",
      "keyMonths": ["3月", "7月", "11月"],
      "advice": "这是模拟的年度建议，实际API调用已禁用以节省费用。"
    },
    "monthlyEnergyTable": Array.from({length: 12}, (_, i) => ({
      "month": `${i+1}月`,
      "energy": ["木", "火", "土", "金", "水"][i % 5],
      "level": ["强", "中", "弱"][i % 3],
      "focus": ["事业", "财运", "感情", "健康"][i % 4],
      "crystal": ["绿幽灵", "红玛瑙", "虎眼石", "白水晶", "蓝玉髓"][i % 5]
    })),
    "crystalRecommendations": [
      {
        "name": "绿幽灵",
        "effect": "增强创造力和适应能力",
        "ritual": "每天早晨冥想5分钟，握住绿幽灵"
      },
      {
        "name": "白水晶",
        "effect": "净化能量场，增强直觉",
        "ritual": "满月之夜将白水晶放在窗台上充能"
      }
    ],
    "monthlyInsight": {
      "currentMonth": new Date().getMonth() + 1,
      "energy": "这是模拟的本月能量，实际API调用已禁用以节省费用。",
      "focus": "这是模拟的本月重点，实际API调用已禁用以节省费用。",
      "advice": "这是模拟的本月建议，实际API调用已禁用以节省费用。"
    },
    "upgradePrompt": {
      "message": "想要获得更全面的能量分析和个性化建议吗？",
      "benefits": ["详细年度能量规划", "个性化幸运色彩推荐", "高级能量仪式", "专属水晶搭配方案"],
      "cta": "升级到年度会员，解锁全部高级功能"
    }
  };
}

// 年订阅用户报告生成 - 使用模拟数据
async function generateYearlyReport(birthInfo: any, baziInfo: any, zodiacSign: string, westernSign: string): Promise<any> {
  const zodiacInfo = zodiacMapping[zodiacSign as keyof typeof zodiacMapping];
  const westernInfo = westernZodiacMapping[westernSign as keyof typeof westernZodiacMapping];
  
  console.log('⚠️ OpenAI API调用已禁用，使用模拟数据');
  
  // 返回年度会员模拟数据
  return {
    "reportType": "yearly",
    "greeting": "尊敬的年度会员，感谢您的支持！以下是您的专属高级能量报告。[模拟数据]",
    "overview": `基于您${new Date(birthInfo.birthDate).toISOString().split('T')[0]}的出生信息分析，您的八字为${baziInfo.year.tian}${baziInfo.year.di} ${baziInfo.month.tian}${baziInfo.month.di} ${baziInfo.day.tian}${baziInfo.day.di} ${baziInfo.hour.tian}${baziInfo.hour.di}，生肖${zodiacInfo.name}，星座${westernInfo.name}。[模拟数据]`,
    "bazi": {
      "yearPillar": `${baziInfo.year.tian}${baziInfo.year.di}`,
      "monthPillar": `${baziInfo.month.tian}${baziInfo.month.di}`,
      "dayPillar": `${baziInfo.day.tian}${baziInfo.day.di}`,
      "hourPillar": `${baziInfo.hour.tian}${baziInfo.hour.di}`,
      "analysis": "这是模拟的八字分析数据，实际API调用已禁用以节省费用。"
    },
    "primaryEnergy": {
      "type": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "wood" : "fire",
      "name": baziInfo.wuxing.wood > baziInfo.wuxing.fire ? "木" : "火",
      "description": "这是模拟的能量描述，实际API调用已禁用以节省费用。",
      "strength": 95,
      "traits": ["适应力强", "创造力强", "思维活跃", "活力充沛", "善于沟通", "领导能力强"],
      "color": "#4CAF50"
    },
    "yearlyForecast": {
      "year": new Date().getFullYear() + 1,
      "overallTrend": "这是模拟的年度趋势，实际API调用已禁用以节省费用。",
      "keyMonths": ["3月", "7月", "11月"],
      "advice": "这是模拟的年度建议，实际API调用已禁用以节省费用。",
      "quarterlyInsights": [
        {
          "quarter": "Q1",
          "focus": "事业发展",
          "energy": "稳步上升",
          "advice": "这是模拟的第一季度建议"
        },
        {
          "quarter": "Q2",
          "focus": "人际关系",
          "energy": "波动较大",
          "advice": "这是模拟的第二季度建议"
        },
        {
          "quarter": "Q3",
          "focus": "健康管理",
          "energy": "平稳",
          "advice": "这是模拟的第三季度建议"
        },
        {
          "quarter": "Q4",
          "focus": "自我提升",
          "energy": "强势",
          "advice": "这是模拟的第四季度建议"
        }
      ]
    },
    "monthlyEnergyTable": Array.from({length: 12}, (_, i) => ({
      "month": `${i+1}月`,
      "energy": ["木", "火", "土", "金", "水"][i % 5],
      "level": ["强", "中", "弱"][i % 3],
      "focus": ["事业", "财运", "感情", "健康"][i % 4],
      "crystal": ["绿幽灵", "红玛瑙", "虎眼石", "白水晶", "蓝玉髓"][i % 5],
      "color": ["绿色", "红色", "黄色", "白色", "蓝色"][i % 5]
    })),
    "crystalRecommendations": [
      {
        "name": "绿幽灵",
        "effect": "增强创造力和适应能力",
        "ritual": "每天早晨冥想5分钟，握住绿幽灵",
        "placement": "书桌或工作区"
      },
      {
        "name": "白水晶",
        "effect": "净化能量场，增强直觉",
        "ritual": "满月之夜将白水晶放在窗台上充能",
        "placement": "卧室或冥想区"
      },
      {
        "name": "紫水晶",
        "effect": "提升精神能量，增强洞察力",
        "ritual": "每周日用清水冲洗，在阳光下晾干",
        "placement": "客厅或入口处"
      }
    ],
    "luckyColors": [
      {
        "season": "春季",
        "primary": "绿色",
        "secondary": "黄色",
        "unlucky": "黑色"
      },
      {
        "season": "夏季",
        "primary": "红色",
        "secondary": "粉色",
        "unlucky": "灰色"
      },
      {
        "season": "秋季",
        "primary": "金色",
        "secondary": "橙色",
        "unlucky": "蓝色"
      },
      {
        "season": "冬季",
        "primary": "白色",
        "secondary": "蓝色",
        "unlucky": "红色"
      }
    ],
    "monthlyInsight": {
      "currentMonth": new Date().getMonth() + 1,
      "energy": "这是模拟的本月能量，实际API调用已禁用以节省费用。",
      "focus": "这是模拟的本月重点，实际API调用已禁用以节省费用。",
      "advice": "这是模拟的本月建议，实际API调用已禁用以节省费用。",
      "luckyDays": [7, 14, 21, 28],
      "challengingDays": [4, 13, 22]
    }
  };
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