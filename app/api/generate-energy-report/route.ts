// MOCK CODE FOR BUILD
// This prevents Prisma initialization errors during build
// The real implementation will be used at runtime
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  // Skip Prisma initialization during build
  const mockOpenAI = { chat: { completions: { create: async () => ({ choices: [{ message: { content: '{}' } }] }) } } };
  const originalExport = globalThis.exports;
  globalThis.exports = {
    ...originalExport,
    getOpenAiApiKey: () => 'sk-mock-key-for-build',
    validateAdminToken: async () => true,
    PrismaClient: function() {
      return { $connect: async () => {}, $disconnect: async () => {} };
    }
  };
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { SubscriptionTier } from '@/app/types/subscription';
import { 
  getModelForTier, 
  getMaxTokensForTier, 
  hasRemainingRequests,
  generatePromptTemplate 
} from '@/app/lib/subscription-service';
import {
  generateCacheKey,
  findReportInDatabase,
  saveReportToDatabase
} from '@/app/lib/report-cache-service';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: getOpenAiApiKey(),
});

/**
 * 从请求或会话中获取用户的订阅级别
 * 注意：实际项目中应从数据库和认证系统获取
 */
async function getUserSubscriptionTier(request: NextRequest): Promise<SubscriptionTier> {
  try {
    // 从请求头获取认证信息
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return 'free';
    
    // 尝试获取订阅信息（简化版，实际情况应验证token并从数据库查询）
    // 这里只是示例，假设auth header包含tier=xxx
    if (authHeader.includes('tier=monthly')) return 'monthly';
    if (authHeader.includes('tier=yearly')) return 'yearly';
    
    return 'free';
  } catch (error) {
    console.error('获取用户订阅信息出错:', error);
    return 'free'; // 默认为免费用户
  }
}

/**
 * 获取用户当月已使用的请求次数
 * 注意：实际项目中应从数据库获取
 */
async function getUserRequestCount(userId: string): Promise<number> {
  // 实际项目应从数据库获取用户本月的请求次数
  // 这里简化处理，返回固定值
  return 0;
}

/**
 * 更新用户的请求次数
 * 注意：实际项目中应更新数据库
 */
async function updateUserRequestCount(userId: string): Promise<void> {
  // 实际项目应更新数据库中的用户请求次数
  // 这里只是示例，无实际操作
  console.log(`更新用户 ${userId} 的请求次数`);
}

/**
 * 生成能量报告的API端点
 * 接收出生日期，使用八字计算和当前能量数据生成综合分析
 */
export async function POST(request: NextRequest) {
  try {
    // 从请求体中获取数据
    const data = await request.json();
    const { birthDate, currentDate: currentDateStr, userId = 'anonymous', forceRefresh = false } = data;
    
    // 获取用户的订阅级别和使用次数
    const subscriptionTier = await getUserSubscriptionTier(request);
    const userRequestCount = await getUserRequestCount(userId);
    
    // 检查用户是否还有剩余请求次数
    if (!hasRemainingRequests(subscriptionTier, userRequestCount)) {
      return NextResponse.json({ 
        error: "已达到本月请求次数上限，请升级订阅计划",
        currentTier: subscriptionTier,
        upgradeOptions: true
      }, { status: 403 });
    }
    
    if (!birthDate) {
      return NextResponse.json({ error: "Birth date is required" }, { status: 400 });
    }
    
    // 解析日期
    const birthDateTime = new Date(birthDate);
    const currentDate = currentDateStr ? new Date(currentDateStr) : new Date();
    
    if (isNaN(birthDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid birth date format" }, { status: 400 });
    }
    
    // 生成缓存键
    const cacheKey = generateCacheKey(userId, birthDateTime, currentDate, subscriptionTier);
    
    // 除非强制刷新，否则先尝试从数据库/缓存获取报告
    if (!forceRefresh) {
      console.log('尝试从缓存/数据库获取报告...');
      const cachedReport = await findReportInDatabase(cacheKey);
      
      if (cachedReport) {
        console.log('从缓存/数据库中找到报告');
        // 返回缓存的报告，不消耗用户请求次数
        return NextResponse.json({
          report: cachedReport.report,
          energyContext: cachedReport.energyContext,
          tier: subscriptionTier,
          fromCache: true,
          usage: {
            total: userRequestCount,
            remaining: subscriptionTier === 'free' ? 3 - userRequestCount : null
          }
        });
      }
      
      console.log('缓存/数据库中未找到报告，需要生成新报告');
    } else {
      console.log('已请求强制刷新，跳过缓存检查');
    }
    
    // 获取能量上下文数据
    const energyContext = getFullEnergyContext(birthDateTime, currentDate);
    
    if (!energyContext) {
      return NextResponse.json({ error: "Failed to calculate energy context" }, { status: 500 });
    }
    
    // 开始生成能量报告
    try {
      // 检查API密钥
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
        console.log('使用模拟数据，因为未配置有效的OpenAI API密钥');
        
        // 即使使用模拟数据，也保存到缓存/数据库
        const mockReport = generateMockReport(energyContext, subscriptionTier);
        await saveReportToDatabase(cacheKey, mockReport, energyContext);
        
        return NextResponse.json({ 
          error: "OpenAI API key not configured", 
          mockData: mockReport,
          tier: subscriptionTier,
          fromCache: false
        }, { status: 500 });
      }
      
      console.log('正在生成新报告，调用OpenAI API...');
      
      // 根据订阅级别获取适合的提示词
      const prompt = generatePromptTemplate(subscriptionTier, energyContext);
      
      // 获取适合订阅级别的模型和token限制
      const model = getModelForTier(subscriptionTier);
      const maxTokens = getMaxTokensForTier(subscriptionTier);
      
      // 调用OpenAI API
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system", 
            content: subscriptionTier === 'yearly' ? 
              "你是一位精通八字和能量分析的高级咨询师，专长于提供深度年度能量预测和个性化指导。你的分析极其全面，包含季度能量变化、关键日期和高级能量平衡方法。请提供详尽的年度能量报告，重点关注用户的能量周期、关键转折点和个性化的平衡策略。" : 
              "你是一位专业的能量咨询师，擅长分析八字和当前能量，给予用户实用的能量平衡建议。"
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      });
      
      // 处理回复
      const content = completion.choices[0].message.content || '';
      
      // 解析回复内容
      const report = parseGptResponse(content, energyContext, subscriptionTier);
      
      // 保存报告到数据库/缓存
      console.log('保存报告到数据库/缓存...');
      await saveReportToDatabase(cacheKey, report, energyContext);
      
      // 更新用户的请求次数（实际项目中需要更新数据库）
      await updateUserRequestCount(userId);
      
      return NextResponse.json({ 
        report,
        energyContext,
        tier: subscriptionTier,
        fromCache: false,
        usage: {
          total: userRequestCount + 1,
          remaining: subscriptionTier === 'free' ? 3 - (userRequestCount + 1) : null
        }
      });
      
    } catch (apiError) {
      console.error('OpenAI API调用错误:', apiError);
      
      // 生成模拟数据
      const mockReport = generateMockReport(energyContext, subscriptionTier);
      
      // 即使是模拟数据，也保存到缓存/数据库以供未来使用
      await saveReportToDatabase(cacheKey, mockReport, energyContext);
      
      // 更新用户的请求次数（实际项目中需要更新数据库）
      await updateUserRequestCount(userId);
      
      // 返回模拟数据
      return NextResponse.json({ 
        warning: "Error calling OpenAI API, using mock data", 
        report: mockReport,
        energyContext,
        tier: subscriptionTier,
        fromCache: false
      });
    }
    
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json({ error: '生成能量报告失败' }, { status: 500 });
  }
}

/**
 * 解析GPT响应，提取结构化信息
 */
function parseGptResponse(content: string, context: any, tier: SubscriptionTier): any {
  // 分割段落
  const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
  
  // 基本结构化数据
  const result: any = {
    analysis: '',
    monthlyTips: [],
    crystalRecommendations: [],
    rawContent: content
  };
  
  // 添加订阅特有字段
  if (tier === 'monthly' || tier === 'yearly') {
    result.energyCycle = '';
    result.energyMethods = [];
    result.rituals = [];
  }
  
  // 添加年度订阅特有的字段
  if (tier === 'yearly') {
    result.keyDates = [];
    result.strengths = [];
    result.challenges = [];
    result.quarterlyForecast = '';
    result.balancingPlan = [];
    result.advancedRituals = [];
    result.crystalPlan = {};
    result.growthPath = '';
    
    // 新版年度订阅特有字段
    result.yearSummary = '';
    result.quarterSnapshots = [];
    result.monthSummaryTable = [];
    result.keyEnergyDays = [];
    result.navigationNote = '';
  }
  
  // 解析逻辑 - 免费版
  if (tier === 'free') {
    // 为新的英文格式提示词添加解析逻辑
    // 尝试提取能量分析段落（第一部分）
    const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
    if (paragraphs.length > 0) {
      // 第一个非表格的段落通常是能量分析
      for (const para of paragraphs) {
        if (!para.includes('|') && !para.includes('Month') && para.length > 20) {
          result.analysis = para.trim();
          break;
        }
      }
    }
    
    // 尝试提取水晶推荐
    const crystalMatch = content.match(/([A-Za-z\s]+crystal[^\.]+\.)/i) || 
                         content.match(/([A-Za-z\s]+ crystal[^\.]+\.)/i) ||
                         content.match(/([A-Za-z\s]+\w+ite[^\.]+\.)/i) ||
                         content.match(/([A-Za-z\s]+\w+yst[^\.]+\.)/i);
    if (crystalMatch) {
      result.crystalRecommendations = [crystalMatch[0].trim()];
    }
    
    // 尝试提取月度能量表格
    const tableMatch = content.match(/Month\s*\|\s*Energy Type\s*\|\s*Score[\s\S]*?(?=\n\n|$)/i);
    if (tableMatch) {
      const tableLines = tableMatch[0].split('\n').filter(line => line.includes('|'));
      // 从表格中提取月度提示
      result.monthlyTips = tableLines.slice(1).map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          return `${parts[0]}: ${parts[1]} (${parts[2]})`;
        }
        return line.trim();
      });
    }
  }
  
  // 解析逻辑 - 月度订阅 (新版本 - 英文格式)
  else if (tier === 'monthly') {
    // 尝试提取12个月能量表格
    const tableMatch = content.match(/Month\s*\|\s*Energy Type\s*\|\s*Score[\s\S]*?(?=\n\n|$)/i);
    if (tableMatch) {
      const tableLines = tableMatch[0].split('\n').filter(line => line.includes('|'));
      // 从表格中提取月度提示
      result.monthlyTips = tableLines.slice(1).map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 3) {
          return `${parts[0]}: ${parts[1]} (${parts[2]})`;
        }
        return line.trim();
      });
    }
    
    // 尝试提取当前月份深入洞察
    const insightMatch = content.match(/Current-Month Deep Insight[\s\S]*?(?=\n\n---|\n---|\n\n\n|$)/i);
    if (insightMatch) {
      const insightText = insightMatch[0].trim();
      
      // 提取情绪和焦点段落
      const emotionMatch = insightText.match(/(?:emotions|focus|describing)[\s\S]*?(?=\d+\.|[A-Za-z]+\s*crystal|recommended crystals|energy-boost|lucky color|$)/i);
      if (emotionMatch) {
        result.analysis = emotionMatch[0].replace(/^[a-z]\.\s*/i, '').trim();
      }
      
      // 提取水晶推荐
      const crystalMatch = insightText.match(/(?:crystal|crystals)[^\.]+\.[^\.]+\./gi);
      if (crystalMatch) {
        result.crystalRecommendations = crystalMatch.map(c => c.trim());
      } else {
        // 尝试其他格式的水晶推荐
        const altCrystalMatch = insightText.match(/([A-Za-z\s]+crystal[^\.]+\.)/i) || 
                               insightText.match(/([A-Za-z\s]+ crystal[^\.]+\.)/i);
        if (altCrystalMatch) {
          result.crystalRecommendations = [altCrystalMatch[0].trim()];
        }
      }
      
      // 提取能量提升行动
      const actionsMatch = insightText.match(/(?:energy-boost actions|simple energy-boost)[\s\S]*?(?=lucky color|daily energy|$)/i);
      if (actionsMatch) {
        const actionsText = actionsMatch[0].replace(/^[a-z]\.\s*(?:energy-boost actions|simple energy-boost)[^:]*:\s*/i, '').trim();
        result.energyMethods = actionsText.split(/\d+\.|\n/).filter(s => s.trim()).map(a => a.trim());
      }
      
      // 提取幸运色彩/穿着氛围
      const colorMatch = insightText.match(/lucky color[\s\S]*?(?=daily energy|sample daily|$)/i);
      if (colorMatch) {
        const colorText = colorMatch[0].replace(/^[a-z]\.\s*lucky color[^:]*:\s*/i, '').trim();
        // 添加到能量方法中
        result.energyMethods.push(`Lucky color/outfit: ${colorText}`);
      }
      
      // 提取每日能量提醒
      const remindersMatch = insightText.match(/(?:daily energy reminders|sample daily)[\s\S]*?$/i);
      if (remindersMatch) {
        const remindersText = remindersMatch[0].replace(/^[a-z]\.\s*(?:daily energy reminders|sample daily)[^:]*:\s*/i, '').trim();
        result.rituals = remindersText.split(/\d+\.|\n/).filter(s => s.trim()).map(r => r.trim());
      }
    }
    
    // 如果没有找到当前月份深入洞察，尝试从整个内容中提取
    if (!result.analysis) {
      // 尝试提取第一个非表格的段落作为分析
      for (const para of paragraphs) {
        if (!para.includes('|') && !para.includes('Month') && para.length > 20) {
          result.analysis = para.trim();
          break;
        }
      }
    }
  }
  
  // 解析逻辑 - 年度订阅
  else if (tier === 'yearly') {
    // 尝试提取年度总结
    const yearSummaryMatch = content.match(/Year Summary[\s\S]*?(?=Quarter Snapshots|$)/i);
    if (yearSummaryMatch) {
      result.yearSummary = yearSummaryMatch[0].replace(/^[A-Z]\.\s*\*\*Year Summary\*\*\s*/i, '').trim();
      // 主要分析部分作为analysis字段
      result.analysis = result.yearSummary;
    }
    
    // 尝试提取季度快照
    const quarterMatch = content.match(/Quarter Snapshots[\s\S]*?(?=12-Month Summary|$)/i);
    if (quarterMatch) {
      const quarterText = quarterMatch[0].replace(/^[A-Z]\.\s*\*\*Quarter Snapshots\*\*\s*\(Q1-Q4\)\s*/i, '').trim();
      
      // 提取每个季度的快照
      const q1Match = quarterText.match(/Q1[^:]*:([^Q]*)/i);
      const q2Match = quarterText.match(/Q2[^:]*:([^Q]*)/i);
      const q3Match = quarterText.match(/Q3[^:]*:([^Q]*)/i);
      const q4Match = quarterText.match(/Q4[^:]*:([^Q]*)/i);
      
      result.quarterSnapshots = [
        q1Match ? `Q1: ${q1Match[1].trim()}` : '',
        q2Match ? `Q2: ${q2Match[1].trim()}` : '',
        q3Match ? `Q3: ${q3Match[1].trim()}` : '',
        q4Match ? `Q4: ${q4Match[1].trim()}` : ''
      ].filter(q => q);
      
      // 季度预测作为quarterlyForecast字段
      result.quarterlyForecast = result.quarterSnapshots.join('\n\n');
    }
    
    // 尝试提取月度总结表格
    const tableMatch = content.match(/Month\s*\|\s*Energy Type\s*\|\s*Score\s*\|\s*Primary Focus\s*\|\s*.*?Crystals\s*\|\s*Simple Ritual[\s\S]*?(?=Key Energy Days|$)/i);
    if (tableMatch) {
      const tableText = tableMatch[0];
      const tableLines = tableText.split('\n').filter(line => line.includes('|'));
      
      // 解析表格内容
      let currentMonth = '';
      let bridgeTip = '';
      
      for (let i = 1; i < tableLines.length; i++) {
        const line = tableLines[i];
        
        // 检查是否是月份行或桥接提示行
        if (line.match(/^\s*\|\s*[A-Za-z]+\s*\|/i)) {
          // 月份行
          const parts = line.split('|').map(p => p.trim()).filter(p => p);
          if (parts.length >= 5) {
            currentMonth = parts[0];
            
            // 添加到月度提示
            result.monthlyTips.push(`${parts[0]}: ${parts[1]} (${parts[2]})`);
            
            // 添加到月度总结表格
            result.monthSummaryTable.push({
              month: parts[0],
              energyType: parts[1],
              score: parts[2],
              focus: parts[3],
              crystals: parts[4],
              ritual: parts.length > 5 ? parts[5] : ''
            });
            
            // 从水晶列中提取水晶推荐
            const crystalText = parts[4];
            if (crystalText && !result.crystalRecommendations.includes(crystalText)) {
              result.crystalRecommendations.push(crystalText);
            }
          }
        } else if (line.match(/^\s*\|\s*Bridge\s*➜/i)) {
          // 桥接提示行
          bridgeTip = line.replace(/^\s*\|\s*Bridge\s*➜\s*/i, '').replace(/\|\s*$/i, '').trim();
          
          // 将桥接提示添加到上一个月的记录中
          if (result.monthSummaryTable.length > 0) {
            result.monthSummaryTable[result.monthSummaryTable.length - 1].bridgeTip = bridgeTip;
          }
        }
      }
    }
    
    // 尝试提取关键能量日期
    const keyDaysMatch = content.match(/Key Energy Days[\s\S]*?(?=Navigation Note|$)/i);
    if (keyDaysMatch) {
      const keyDaysText = keyDaysMatch[0].replace(/^[A-Z]\.\s*\*\*Key Energy Days\*\*\s*/i, '').trim();
      
      // 提取高能量日和低能量日
      const highDaysMatch = keyDaysText.match(/High-Power Days?[^:]*:([^Low]*)/i);
      const lowDaysMatch = keyDaysText.match(/Low-Energy[^:]*:([^$]*)/i);
      
      if (highDaysMatch) {
        const highDays = highDaysMatch[1].trim().split(/\d+\.|\n/).filter(s => s.trim()).map(d => `High: ${d.trim()}`);
        result.keyDates = [...result.keyDates, ...highDays];
      }
      
      if (lowDaysMatch) {
        const lowDays = lowDaysMatch[1].trim().split(/\d+\.|\n/).filter(s => s.trim()).map(d => `Low: ${d.trim()}`);
        result.keyDates = [...result.keyDates, ...lowDays];
      }
      
      // 保存完整的关键能量日文本
      result.keyEnergyDays = keyDaysText;
    }
    
    // 尝试提取导航说明
    const navMatch = content.match(/Navigation Note[\s\S]*?$/i);
    if (navMatch) {
      result.navigationNote = navMatch[0].replace(/^[A-Z]\.\s*\*\*Navigation Note\*\*\s*/i, '').trim();
    }
    
    // 从年度总结中提取优势和挑战
    if (result.yearSummary) {
      // 尝试提取优势
      const strengthsMatch = result.yearSummary.match(/opportunities?[^\.]+\./i);
      if (strengthsMatch) {
        result.strengths = [strengthsMatch[0].trim()];
      }
      
      // 尝试提取挑战
      const challengesMatch = result.yearSummary.match(/challenges?[^\.]+\./i);
      if (challengesMatch) {
        result.challenges = [challengesMatch[0].trim()];
      }
      
      // 尝试提取平衡建议
      const balanceMatch = result.yearSummary.match(/balancing[^\.]+\./i);
      if (balanceMatch) {
        result.balancingPlan = [balanceMatch[0].trim()];
      }
    }
  }
  
  // 如果未能正确解析，提取第一段作为分析
  if (!result.analysis && paragraphs.length > 0) {
    result.analysis = paragraphs[0];
  }
  
  // 为确保各订阅级别有默认值
  const defaultValues = {
    free: {
      analysis: 'Your dominant element creates a strong foundation for growth in 2025, while your missing element presents an opportunity for balance through intentional practices.',
      monthlyTips: [
        'January: Growth Energy (75)',
        'February: Passion Energy (60)',
        'March: Stability Energy (80)'
      ],
      crystalRecommendations: ['Clear Quartz: Amplifies your natural energy while helping to balance areas where you may feel depleted.']
    },
    monthly: {
      analysis: 'This month brings a blend of creative inspiration and practical focus. Your natural Wood energy resonates well with May\'s growth patterns, making this an excellent time for new projects and personal development.',
      energyCycle: 'May shows strong energy peaks around the 15th and 22nd, perfect for important decisions or starting new initiatives.',
      energyMethods: [
        'Morning sun meditation: Spend 5 minutes facing the sunrise with eyes closed, breathing deeply to activate your personal energy field',
        'Green tea ritual: Replace one coffee with green tea daily, sipping slowly while visualizing your goals',
        'Lucky color/outfit: Wear emerald green or turquoise accessories for enhanced communication and creativity'
      ],
      rituals: [
        'Remember that your sensitivity is actually your superpower today',
        'Trust your intuition when making decisions - your inner compass is calibrated correctly',
        'Your energy affects others more than you realize - set positive intentions before meetings'
      ],
      crystalRecommendations: [
        'Green Aventurine: Amplifies growth energy and attracts new opportunities in both career and relationships',
        'Clear Quartz: Clarifies thinking and amplifies your intentions during this high-potential month'
      ]
    },
    yearly: {
      yearSummary: '2025 brings a powerful blend of Wood and Water energies that align well with your dominant Wood element, creating opportunities for growth and expansion in both personal and professional realms. The first half of the year emphasizes creative projects and relationship building, while the second half shifts toward implementation and consolidation of gains. To balance your missing Water element, establish a consistent meditation practice with blue crystals nearby, ideally near a small water feature in your home or office.',
      quarterSnapshots: [
        'Q1: Strong creative energy with peaks in February. Focus on brainstorming and laying foundations for major projects.',
        'Q2: Communication and networking phase. Excellent for presentations, negotiations, and forming new partnerships.',
        'Q3: Implementation period with steady energy. Convert plans into concrete actions and establish routines.',
        'Q4: Reflection and consolidation. Evaluate progress, celebrate achievements, and prepare for next year\'s energy shifts.'
      ],
      analysis: '2025 brings a powerful blend of Wood and Water energies that align well with your dominant Wood element, creating opportunities for growth and expansion in both personal and professional realms. The first half of the year emphasizes creative projects and relationship building, while the second half shifts toward implementation and consolidation of gains. To balance your missing Water element, establish a consistent meditation practice with blue crystals nearby, ideally near a small water feature in your home or office.',
      monthlyTips: [
        'January: Growth Energy (75)',
        'February: Passion Energy (82)',
        'March: Stability Energy (68)'
      ],
      keyDates: [
        'High: February 15 - Peak creative energy, ideal for launching important projects',
        'High: May 8 - Strong communication energy, perfect for presentations or negotiations',
        'Low: August 22 - Energy dip, schedule lighter workload and prioritize rest'
      ],
      strengths: ['Opportunities for growth and expansion in both personal and professional realms.'],
      challenges: ['Balancing your missing Water element requires consistent attention.'],
      quarterlyForecast: 'Q1: Strong creative energy with peaks in February. Focus on brainstorming and laying foundations for major projects.\n\nQ2: Communication and networking phase. Excellent for presentations, negotiations, and forming new partnerships.\n\nQ3: Implementation period with steady energy. Convert plans into concrete actions and establish routines.\n\nQ4: Reflection and consolidation. Evaluate progress, celebrate achievements, and prepare for next year\'s energy shifts.',
      balancingPlan: ['To balance your missing Water element, establish a consistent meditation practice with blue crystals nearby, ideally near a small water feature in your home or office.'],
      crystalRecommendations: [
        'Blue Lace Agate: Enhances communication and brings calming water energy',
        'Green Aventurine: Amplifies growth and opportunity in career matters',
        'Citrine: Boosts confidence and manifestation power during key decision points'
      ],
      monthSummaryTable: [
        {
          month: 'January',
          energyType: 'Growth',
          score: '75',
          focus: 'Planning & Vision',
          crystals: 'Clear Quartz',
          ritual: 'Morning intention setting',
          bridgeTip: 'Bridge ➜ Prepare for February\'s creative surge by clearing your schedule for deep work.'
        },
        {
          month: 'February',
          energyType: 'Passion',
          score: '82',
          focus: 'Creative Projects',
          crystals: 'Carnelian',
          ritual: 'Candle meditation',
          bridgeTip: 'Bridge ➜ Document February\'s creative insights to implement during March\'s stable energy.'
        }
      ],
      navigationNote: 'Tap any month to open its full in-depth report.',
      energyCycle: '',
      energyMethods: [],
      rituals: [],
      advancedRituals: [],
      crystalPlan: {
        crystals: [],
        usage: '',
        cleansing: '',
        placement: ''
      },
      growthPath: ''
    }
  };
  
  // 根据订阅级别补充默认值
  if (tier === 'free') {
    if (!result.analysis) result.analysis = defaultValues.free.analysis;
    if (result.monthlyTips.length === 0) result.monthlyTips = defaultValues.free.monthlyTips;
    if (result.crystalRecommendations.length === 0) result.crystalRecommendations = defaultValues.free.crystalRecommendations;
  } else if (tier === 'monthly') {
    if (!result.analysis) result.analysis = defaultValues.monthly.analysis;
    if (!result.energyCycle) result.energyCycle = defaultValues.monthly.energyCycle;
    if (result.monthlyTips.length === 0) result.monthlyTips = defaultValues.free.monthlyTips;
    if (result.energyMethods.length === 0) result.energyMethods = defaultValues.monthly.energyMethods;
    if (result.rituals.length === 0) result.rituals = defaultValues.monthly.rituals;
    if (result.crystalRecommendations.length === 0) result.crystalRecommendations = defaultValues.monthly.crystalRecommendations;
  } else if (tier === 'yearly') {
    if (!result.analysis) result.analysis = defaultValues.yearly.analysis;
    if (!result.yearSummary) result.yearSummary = defaultValues.yearly.yearSummary;
    if (result.quarterSnapshots.length === 0) result.quarterSnapshots = defaultValues.yearly.quarterSnapshots;
    if (result.monthlyTips.length === 0) result.monthlyTips = defaultValues.yearly.monthlyTips;
    if (result.keyDates.length === 0) result.keyDates = defaultValues.yearly.keyDates;
    if (result.strengths.length === 0) result.strengths = defaultValues.yearly.strengths;
    if (result.challenges.length === 0) result.challenges = defaultValues.yearly.challenges;
    if (!result.quarterlyForecast) result.quarterlyForecast = defaultValues.yearly.quarterlyForecast;
    if (result.balancingPlan.length === 0) result.balancingPlan = defaultValues.yearly.balancingPlan;
    if (result.crystalRecommendations.length === 0) result.crystalRecommendations = defaultValues.yearly.crystalRecommendations;
    if (result.monthSummaryTable.length === 0) result.monthSummaryTable = defaultValues.yearly.monthSummaryTable;
    if (!result.navigationNote) result.navigationNote = defaultValues.yearly.navigationNote;
    if (!result.energyCycle) result.energyCycle = defaultValues.yearly.energyCycle;
    if (result.energyMethods.length === 0) result.energyMethods = defaultValues.yearly.energyMethods;
    if (result.rituals.length === 0) result.rituals = defaultValues.yearly.rituals;
    if (result.advancedRituals.length === 0) result.advancedRituals = defaultValues.yearly.advancedRituals;
    if (!result.crystalPlan || Object.keys(result.crystalPlan).length === 0) {
      result.crystalPlan = defaultValues.yearly.crystalPlan;
    } else {
      if (!result.crystalPlan.crystals || result.crystalPlan.crystals.length === 0) {
        result.crystalPlan.crystals = defaultValues.yearly.crystalPlan.crystals;
      }
      if (!result.crystalPlan.usage) result.crystalPlan.usage = defaultValues.yearly.crystalPlan.usage;
      if (!result.crystalPlan.cleansing) result.crystalPlan.cleansing = defaultValues.yearly.crystalPlan.cleansing;
      if (!result.crystalPlan.placement) result.crystalPlan.placement = defaultValues.yearly.crystalPlan.placement;
    }
    if (!result.growthPath) result.growthPath = defaultValues.yearly.growthPath;
  }
  
  return result;
}

/**
 * 生成模拟报告（当API调用失败时使用）
 */
function generateMockReport(context: any, tier: SubscriptionTier): any {
  // 基础报告（免费版）
  const baseReport = {
    analysis: `根据您的八字 ${context.bazi.yearPillar}${context.bazi.monthPillar}${context.bazi.dayPillar} 与当前能量周期的互动关系，您正处于能量转变期。当前的${context.currentMonth.element}元素能量有助于您的成长和发展。`,
    monthlyTips: [
      `增强${context.currentMonth.element}元素能量，可多接触相关颜色和环境`,
      '保持规律作息，早睡早起增强身体能量循环',
      '注意情绪平衡，避免能量波动过大'
    ],
    crystalRecommendations: [
      `${context.currentMonth.element === '木' ? '绿幽灵' : 
        context.currentMonth.element === '火' ? '红玛瑙' : 
        context.currentMonth.element === '土' ? '黄水晶' : 
        context.currentMonth.element === '金' ? '白水晶' : '青金石'}：增强${context.currentMonth.energyType}能量，促进个人成长`
    ]
  };
  
  // 月度订阅附加内容
  if (tier === 'monthly' || tier === 'yearly') {
    Object.assign(baseReport, {
      energyCycle: `本月${context.currentMonth.pillar}能量呈现波动上升趋势，中旬将达到高峰。${context.currentMonth.start.substring(5)}日和${parseInt(context.currentMonth.start.substring(5)) + 15}日是关键能量日，适合重要决策和新开始。`,
      energyMethods: [
        '每天清晨进行5分钟的深呼吸练习，激活身体能量',
        `工作环境中摆放${context.currentMonth.element}元素相关物品，增强能量共振`,
        '饮食中增加应季食物，支持身体能量平衡',
        '每周至少安排两次户外活动，吸收自然能量'
      ],
      rituals: [
        '晨间能量唤醒：起床后，面向东方，双手捧水洗脸三次，同时默念"新的一天，新的能量"，帮助激活一天的活力',
        '夜间能量梳理：睡前点燃香薰蜡烛，冥想5分钟，回顾当天经历，释放负面能量，保留正面体验'
      ],
      crystalRecommendations: [
        `${context.currentMonth.element === '木' ? '绿幽灵' : 
          context.currentMonth.element === '火' ? '红玛瑙' : 
          context.currentMonth.element === '土' ? '黄水晶' : 
          context.currentMonth.element === '金' ? '白水晶' : '青金石'}：增强当前月份主导能量`,
        '紫水晶：提升精神能量，可放在床头或随身携带',
        '黑曜石：防御负能量，放在家门入口处'
      ]
    });
  }
  
  // 年度订阅附加内容
  if (tier === 'yearly') {
    Object.assign(baseReport, {
      strengths: [
        `创造性思维：您的${context.bazi.yearPillar}年柱与当前${context.currentYear.pillar}年能量形成良好互动，激发创新能力`,
        `适应能力：${context.bazi.monthPillar}月柱显示您有较强的适应能力，能够在变化环境中迅速调整`,
        `人际魅力：${context.bazi.dayPillar}日柱增强了您的人际魅力，有助于建立有价值的人际关系`
      ],
      challenges: [
        '情绪波动：当前能量可能导致情绪起伏，需要通过冥想等方式保持平衡',
        '决策压力：多重选择可能造成决策困难，建议设定明确标准',
        '能量分散：兴趣广泛可能导致精力分散，需要学会聚焦重点'
      ],
      quarterlyForecast: `根据当前${context.currentYear.pillar}年的能量走势，未来三个月整体能量呈上升趋势。${parseInt(context.currentMonth.start.substring(5)) + 30}日将是关键转折点，带来新的机遇；下月中旬可能面临挑战，需要保持警觉；两个月后将迎来能量高峰，适合重要项目的推进和完成。`,
      balancingPlan: [
        '饮食调整：增加应季食物摄入，减少刺激性食物，保持能量稳定',
        '运动建议：每周进行3次有氧运动和2次力量训练，平衡身体能量',
        `环境调整：在家中${context.currentMonth.element === '木' ? '东' : 
          context.currentMonth.element === '火' ? '南' : 
          context.currentMonth.element === '土' ? '中央' : 
          context.currentMonth.element === '金' ? '西' : '北'}方位摆放相应元素物品，增强能量场`,
        '社交策略：每月参与一次团体活动，增强人际能量交流',
        '工作安排：上午处理创意工作，下午处理常规任务，符合能量流动规律'
      ],
      advancedRituals: [
        '五行能量平衡仪式：准备五种代表五行的物品（木：绿植；火：蜡烛；土：水晶；金：金属物品；水：清水），每周日早晨摆放成五角形，点燃蜡烛，冥想15分钟，想象能量在体内平衡流动。',
        '满月能量净化：每月满月之夜，将重要水晶放在月光下充能，同时进行20分钟冥想，释放过去一个月积累的负面能量。',
        '季节转换仪式：在季节交替时（立春、立夏、立秋、立冬），准备与新季节对应的精油和花草，进行能量转换冥想，帮助身心适应新季节的能量变化。'
      ],
      crystalPlan: {
        crystals: [
          `${context.currentMonth.element === '木' ? '绿幽灵' : 
            context.currentMonth.element === '火' ? '红玛瑙' : 
            context.currentMonth.element === '土' ? '黄水晶' : 
            context.currentMonth.element === '金' ? '白水晶' : '青金石'}：增强当前月份主导能量`,
          '紫水晶：提升精神能量和直觉',
          '黄水晶：增强自信和个人魅力',
          '黑曜石：防御负能量',
          '月光石：增强直觉和梦境清晰度'
        ],
        usage: '将主要水晶组合使用，可以在家中不同区域摆放，形成能量场网络。工作场所可放置绿幽灵和黄水晶，卧室适合紫水晶和月光石，入口处放置黑曜石。',
        cleansing: '每月满月时，用流水冲洗所有水晶，然后放置在月光下充能。也可以使用鼠尾草熏烟净化，或埋入海盐中24小时。',
        placement: '主要水晶可随身佩戴，形成贴身能量保护。家中应在能量流动处（如窗台、门口、床头）摆放相应水晶，形成能量场。'
      },
      growthPath: `您的长期能量成长应聚焦于${context.currentMonth.element}元素的培养和${
        context.currentMonth.element === '木' ? '金' : 
        context.currentMonth.element === '火' ? '水' : 
        context.currentMonth.element === '土' ? '木' : 
        context.currentMonth.element === '金' ? '火' : '土'
      }元素的平衡。通过定期冥想和能量工作，逐步提升能量场的稳定性。每季度进行一次能量评估，关注直觉增强、情绪稳定性和创造力提升等指标。持之以恒，两年内可达到明显的能量场提升。`
    });
  }
  
  return baseReport;
} 