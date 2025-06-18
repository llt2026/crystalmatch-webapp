// MOCK CODE FOR BUILD
// This prevents Prisma initialization errors during build
// The real implementation will be used at runtime
// 跳过所有Prisma初始化相关代码
let isPrismaSkipped = false;

// 全局PrismaClient，如果初始化失败会使用模拟版本
const mockDBClient = {
  report: {
    findUnique: async () => null,
    upsert: async () => ({})
  },
  $queryRaw: async () => [{ connected: true }],
  $connect: async () => {},
  $disconnect: async () => {}
};

// 如果在构建阶段，使用模拟数据
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  console.log("⚠️ 构建阶段: 跳过 OpenAI 和 Prisma 初始化");
  isPrismaSkipped = true;
}

// 告诉 Next.js：这个接口完全动态，不要在构建期进行预渲染
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { SubscriptionTier } from '@/app/types/subscription';
import { 
  getModelForTier, 
  getMaxTokensForTier, 
  hasRemainingRequests,
  generatePromptTemplate 
} from '@/app/lib/subscription-service';

// 进行安全的prisma导入
let prismaClient: any;

try {
  // 只在非构建阶段尝试导入真实的Prisma
  if (!isPrismaSkipped) {
    // 动态导入prisma，避免构建时的初始化问题
    const { default: prisma } = require('@/app/lib/prisma');
    prismaClient = prisma;
  } else {
    // 构建阶段使用模拟客户端
    prismaClient = mockDBClient;
  }
} catch (error) {
  console.error('❌ Prisma导入失败:', error);
  // 出错时使用模拟客户端
  prismaClient = mockDBClient;
}

/**
 * 从缓存或数据库中查找报告
 */
async function findReportInDatabase(cacheKey: string) {
  try {
    // 如果正处于 Vercel 的 production build 阶段，直接跳过
    if (process.env.VERCEL && process.env.NEXT_PHASE === 'phase-production-build') {
      return null;
    }

    // **懒加载** Prisma —— 只有真正请求时才 import
    const { PrismaClient } = await import('@prisma/client');
    const prisma = globalThis.prisma ?? new PrismaClient();
    if (!globalThis.prisma) globalThis.prisma = prisma;   // 简易单例
    
    // 使用 try-catch 包装所有 Prisma 调用
    const report = await prisma.report.findUnique({
      where: { cacheKey },
    });
    return report;
  } catch (error) {
    console.error('查找报告出错:', error);
    return null;
  }
}

/**
 * 保存报告到数据库
 */
async function saveReportToDatabase(cacheKey: string, report: any, energyContext: any) {
  try {
    // 如果正处于 Vercel 的 production build 阶段，直接跳过
    if (process.env.VERCEL && process.env.NEXT_PHASE === 'phase-production-build') {
      return true;
    }

    // **懒加载** Prisma —— 只有真正请求时才 import
    const { PrismaClient } = await import('@prisma/client');
    const prisma = globalThis.prisma ?? new PrismaClient();
    if (!globalThis.prisma) globalThis.prisma = prisma;   // 简易单例
    
    // 使用 try-catch 包装所有 Prisma 调用
    await prisma.report.upsert({
      where: { cacheKey },
      update: {
        report: report,
        energyContext: energyContext,
        updatedAt: new Date()
      },
      create: {
        cacheKey,
        report: report,
        energyContext: energyContext,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('保存报告出错:', error);
    return false;
  }
}

/**
 * 生成缓存键
 */
function generateCacheKey(userId: string, birthDateTime: Date, currentDate: Date, tier: SubscriptionTier): string {
  return `${userId}_${birthDateTime.toISOString()}_${currentDate.toISOString()}_${tier}`;
}

// 初始化OpenAI客户端 - 已禁用
// const openai = new OpenAI({
//   apiKey: getOpenAiApiKey(),
// });

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
    if (authHeader.includes('tier=plus')) return 'plus';
    if (authHeader.includes('tier=pro')) return 'pro';
    
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
 * 注意：此API已禁用实际OpenAI调用，改为返回模拟数据
 */
export async function POST(request: NextRequest) {
  console.log('⚠️ OpenAI API调用已禁用，使用模拟数据');
  
  // 如果正处于 Vercel 的 production build 阶段，直接跳过
  if (process.env.VERCEL && process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ status: 'skipped during build' });
  }
  
  try {
    // 从请求体中获取数据
    const data = await request.json();
    const { birthDate, currentDate: currentDateStr, userId = 'anonymous', forceRefresh = false } = data;
    
    // 获取用户的订阅级别和使用次数
    const subscriptionTier = await getUserSubscriptionTier(request);
    const userRequestCount = await getUserRequestCount(userId);
    
    // 检查用户是否还有剩余请求次数
    if (!hasRemainingRequests(normalizeSubscriptionTier(subscriptionTier), userRequestCount)) {
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
          tier: normalizeSubscriptionTier(subscriptionTier),
          fromCache: true,
          usage: {
            total: userRequestCount,
            remaining: normalizeSubscriptionTier(subscriptionTier) === 'free' ? 3 - userRequestCount : null
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
    
    // 生成模拟报告
    const report = generateMockReport(energyContext, normalizeSubscriptionTier(subscriptionTier));
    
    // 保存报告到数据库/缓存
    console.log('保存报告到数据库/缓存...');
    await saveReportToDatabase(cacheKey, report, energyContext);
    
    // 更新用户的请求次数（实际项目中需要更新数据库）
    await updateUserRequestCount(userId);
    
    return NextResponse.json({ 
      report,
      energyContext,
      tier: normalizeSubscriptionTier(subscriptionTier),
      fromCache: false,
      usage: {
        total: userRequestCount + 1,
        remaining: normalizeSubscriptionTier(subscriptionTier) === 'free' ? 3 - (userRequestCount + 1) : null
      },
      isMockData: true
    });
    
  } catch (error) {
    console.error('处理请求出错:', error);
    return NextResponse.json({ error: '生成能量报告失败' }, { status: 500 });
  }
}

/**
 * 生成模拟报告
 */
function generateMockReport(context: any, tier: SubscriptionTier): any {
  const mockReport = {
    title: "能量报告 [模拟数据]",
    overview: "这是一个模拟的能量报告，实际API调用已禁用以节省费用。",
    energyScore: Math.floor(Math.random() * 30) + 70,
    elements: {
      wood: Math.floor(Math.random() * 30) + 60,
      fire: Math.floor(Math.random() * 30) + 50,
      earth: Math.floor(Math.random() * 30) + 40,
      metal: Math.floor(Math.random() * 30) + 30,
      water: Math.floor(Math.random() * 30) + 20
    },
    insights: "这是模拟的洞察内容，实际API调用已禁用以节省费用。",
    recommendations: [
      "这是模拟的建议1，实际API调用已禁用以节省费用。",
      "这是模拟的建议2，实际API调用已禁用以节省费用。",
      "这是模拟的建议3，实际API调用已禁用以节省费用。"
    ]
  };
  
  return mockReport;
}

/**
 * 标准化订阅等级
 */
function normalizeSubscriptionTier(tier: string): SubscriptionTier {
  const validTiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
  return validTiers.includes(tier as SubscriptionTier) ? tier as SubscriptionTier : 'free';
} 