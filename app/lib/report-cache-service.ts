import { SubscriptionTier } from "../types/subscription";
import { PrismaClient } from '@prisma/client';

// 初始化Prisma客户端（实际项目中应使用全局单例实例）
// 注意：此处创建的新实例仅用于演示，实际项目应使用共享实例
const prisma = new PrismaClient();

// 报告缓存键的结构定义
interface ReportCacheKey {
  userId: string;
  birthDate: string;  // ISO格式的日期字符串 YYYY-MM-DD
  reportMonth: string; // 格式为 YYYY-MM
  tier: SubscriptionTier;
}

// 内存缓存，用于快速访问（可选，作为数据库缓存层）
const reportCache: Map<string, any> = new Map();

/**
 * 生成报告缓存键
 */
export function generateCacheKey(userId: string, birthDate: Date, currentDate: Date, tier: SubscriptionTier): ReportCacheKey {
  // 格式化日期为ISO字符串并截取日期部分 YYYY-MM-DD
  const birthDateStr = birthDate.toISOString().split('T')[0];
  
  // 获取年月作为报告月份 YYYY-MM
  const reportMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    userId,
    birthDate: birthDateStr,
    reportMonth,
    tier
  };
}

/**
 * 从缓存键生成唯一字符串，用于内存缓存的键
 */
function cacheKeyToString(key: ReportCacheKey): string {
  return `${key.userId}:${key.birthDate}:${key.reportMonth}:${key.tier}`;
}

/**
 * 从数据库中查找报告
 */
export async function findReportInDatabase(key: ReportCacheKey): Promise<{ report: any; energyContext: any } | null> {
  try {
    // 首先尝试从内存缓存获取（如果启用）
    const cacheKey = cacheKeyToString(key);
    if (reportCache.has(cacheKey)) {
      console.log('从内存缓存中获取报告');
      return reportCache.get(cacheKey);
    }
    
    // 从数据库中获取
    const report = await prisma.energyReportCache.findFirst({
      where: {
        userId: key.userId,
        birthDate: key.birthDate,
        reportMonth: key.reportMonth,
        tier: key.tier,
        expiresAt: {
          gt: new Date()  // 确保报告未过期
        }
      }
    });
    
    if (!report) return null;
    
    // 解析存储的JSON字符串
    const reportData = JSON.parse(report.report);
    const energyContextData = JSON.parse(report.energyContext);
    
    // 缓存到内存中（如果启用）
    const result = { report: reportData, energyContext: energyContextData };
    reportCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('从数据库查找报告出错:', error);
    return null;
  }
}

/**
 * 保存报告到数据库
 */
export async function saveReportToDatabase(
  key: ReportCacheKey, 
  report: any, 
  energyContext: any
): Promise<boolean> {
  try {
    // 计算过期时间（默认1个月后）
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    // 保存到数据库
    await prisma.energyReportCache.upsert({
      where: {
        report_unique_constraint: {
          userId: key.userId,
          birthDate: key.birthDate,
          reportMonth: key.reportMonth,
          tier: key.tier
        }
      },
      update: {
        report: JSON.stringify(report),
        energyContext: JSON.stringify(energyContext),
        generatedAt: now,
        updatedAt: now,
        expiresAt: expiresAt
      },
      create: {
        userId: key.userId,
        birthDate: key.birthDate,
        reportMonth: key.reportMonth,
        tier: key.tier,
        report: JSON.stringify(report),
        energyContext: JSON.stringify(energyContext),
        generatedAt: now,
        updatedAt: now,
        expiresAt: expiresAt
      }
    });
    
    // 更新内存缓存（如果启用）
    const cacheKey = cacheKeyToString(key);
    reportCache.set(cacheKey, { report, energyContext });
    
    return true;
  } catch (error) {
    console.error('保存报告到数据库出错:', error);
    return false;
  }
}

/**
 * 清除用户的特定报告
 */
export async function deleteUserReport(userId: string, reportMonth?: string): Promise<boolean> {
  try {
    // 构建查询条件
    const where: any = { userId };
    if (reportMonth) {
      where.reportMonth = reportMonth;
    }
    
    // 从数据库中删除
    await prisma.energyReportCache.deleteMany({ where });
    
    // 从内存缓存中清除
    // 当指定月份时，只清除该月份的缓存；否则清除用户的所有缓存
    for (const [key, _] of reportCache.entries()) {
      const [userId_, _, reportMonth_] = key.split(':');
      if (userId_ === userId && (!reportMonth || reportMonth_ === reportMonth)) {
        reportCache.delete(key);
      }
    }
    
    return true;
  } catch (error) {
    console.error('删除用户报告出错:', error);
    return false;
  }
}

/**
 * 清除过期的报告缓存
 */
export async function clearExpiredReports(): Promise<number> {
  try {
    // 从数据库中删除过期的报告
    const result = await prisma.energyReportCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    // 清除内存缓存
    // 注意：这是一个简化的实现，实际项目可能需要更复杂的缓存失效策略
    reportCache.clear();
    
    return result.count;
  } catch (error) {
    console.error('清除过期报告缓存出错:', error);
    return 0;
  }
}

/**
 * 获取用户报告统计信息
 */
export async function getUserReportStats(userId: string): Promise<{ 
  totalReports: number; 
  currentMonthReports: number;
  oldestReport?: Date;
  newestReport?: Date;
}> {
  try {
    // 获取当前月份
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 获取总报告数
    const totalReports = await prisma.energyReportCache.count({
      where: { userId }
    });
    
    // 获取当月报告数
    const currentMonthReports = await prisma.energyReportCache.count({
      where: { 
        userId,
        reportMonth: currentMonth
      }
    });
    
    // 获取最早和最新的报告日期
    const reports = await prisma.energyReportCache.findMany({
      where: { userId },
      orderBy: { generatedAt: 'asc' },
      take: 1,
      select: { generatedAt: true }
    });
    
    const latestReports = await prisma.energyReportCache.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
      take: 1,
      select: { generatedAt: true }
    });
    
    return {
      totalReports,
      currentMonthReports,
      oldestReport: reports.length > 0 ? reports[0].generatedAt : undefined,
      newestReport: latestReports.length > 0 ? latestReports[0].generatedAt : undefined
    };
  } catch (error) {
    console.error('获取用户报告统计信息出错:', error);
    return { totalReports: 0, currentMonthReports: 0 };
  }
} 