import { prisma } from '../prisma';
import { saveReportToDatabase, type ReportCacheKey } from '../report-cache-service';
import { generateMonthlyReportData } from '../mockReportData';
import {
  getBaseBaziVector,
  calculateMonthEnergy,
  getDailyEnergyForRange
} from '../energyCalculation2025';

export interface UserSubscriptionInfo {
  userId: string;
  tier: 'plus' | 'pro';
  planId: string;
}

/**
 * 简化的报告生成函数
 */
async function generateSimpleReport(tier: 'plus' | 'pro', birthDate: string) {
  // 当前时间及本月信息
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const daysInMonth = new Date(year, month, 0).getDate();

  // 1. 生成静态段落/文案（仍复用 mockReportData 便于文案多样性）
  const reportData = generateMonthlyReportData(year, month, daysInMonth);

  // 2. 计算本月总体能量分数
  const baseVector = getBaseBaziVector(birthDate);
  const monthEnergy = calculateMonthEnergy(baseVector, now);
  const energyScore = Math.round(monthEnergy.score);

  // 3. 计算每日能量（含得分）
  const monthStart = new Date(year, month - 1, 1);
  const dailyEnergyRaw = await getDailyEnergyForRange(birthDate, monthStart, daysInMonth);

  const dailyEnergy = dailyEnergyRaw.map((d) => ({
    date: d.date.toISOString().split('T')[0],
    energyChange: d.energyChange,
    trend: d.trend,
    score: Math.round(d.score),
    crystal: d.crystal
  }));

  // 4. 确定最强/最弱元素
  const sortedEntries = Object.entries(monthEnergy.vector).sort((a, b) => b[1] - a[1]);
  const strongestElement = sortedEntries[0][0];
  const weakestElement = sortedEntries[sortedEntries.length - 1][0];

  // 5. 组装 LegacyReport 结构，确保前端兼容
  return {
    basicInfo: {
      birthDate: new Date(birthDate).toLocaleDateString('en-US'),
      energySignature: `${tier.toUpperCase()} Energy Profile`,
      tier
    },
    sections: [
      {
        title: 'Monthly Energy Overview',
        content: reportData.monthlyOverview.overview
      },
      {
        title: 'Energy Phases',
        content: reportData.monthlyOverview.phases.map((p) => `${p.title}: ${p.description}`).join('\n\n')
      }
    ],
    crystals: [
      {
        name: 'Amethyst',
        purpose: 'Enhances spiritual awareness and intuition'
      },
      {
        name: 'Rose Quartz',
        purpose: 'Promotes love and emotional healing'
      },
      {
        name: 'Clear Quartz',
        purpose: 'Amplifies energy and clarity'
      }
    ],
    // 新增真实能量数据
    energyScore,
    strongestElement,
    weakestElement,
    dailyEnergy,
    notifications: reportData.notifications,
    weeklyForecast: reportData.weeklyForecast
  };
}

/**
 * 为用户生成月度报告
 */
export async function generateMonthlyReportForUser(
  userId: string, 
  tier: 'plus' | 'pro'
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    // 1. 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        birthInfo: true
      }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 2. 提取生日信息（统一从 birthInfo 中解析）
    let birthDate: string | undefined;
    if (user.birthInfo) {
      try {
        const birthInfo = typeof user.birthInfo === 'string'
          ? JSON.parse(user.birthInfo as unknown as string)
          : (user.birthInfo as any);

        birthDate = birthInfo.birthdate || birthInfo.date || birthInfo.birthDate;
      } catch (e) {
        console.error('Failed to parse birthInfo JSON:', e);
      }
    }

    if (!birthDate) {
      return { success: false, error: 'User birth date not found' };
    }

    // 3. 计算当前月份（报告月份）
    const now = new Date();
    // 使用美式日期格式，如 "June 19, 2025"
    const reportMonth = now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric' 
    });

    // 4. 检查是否已存在该月份和等级的报告
    const formattedBirthDate = new Date(birthDate).toISOString().split('T')[0]; // 确保格式一致
    const existingReport = await prisma.energyReportCache.findFirst({
      where: {
        userId,
        birthDate: formattedBirthDate,
        reportMonth,
        tier,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingReport) {
      console.log(`Report already exists for user ${userId}, tier ${tier}, month ${reportMonth}`);
      return { success: true, reportId: existingReport.id };
    }

    // 5. 生成报告内容（包含真实能量计算）
    const report = await generateSimpleReport(tier, birthDate);
    const energyContext = {
      tier,
      birthDate,
      generatedAt: now.toISOString(),
      energyScore: (report as any).energyScore
    };

    // 6. 保存到数据库
    const cacheKey = {
      userId,
      birthDate: formattedBirthDate, // 使用相同的格式化生日
      reportMonth,
      tier
    } as ReportCacheKey;

    const saveSuccess = await saveReportToDatabase(cacheKey, report, energyContext);
    
    if (!saveSuccess) {
      return { success: false, error: 'Failed to save report to database' };
    }

    // 7. 获取刚保存的报告ID
    const savedReport = await prisma.energyReportCache.findFirst({
      where: {
        userId,
        birthDate: formattedBirthDate,
        reportMonth,
        tier,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });

    console.log(`Report generated successfully for user ${userId}, tier ${tier}, month ${reportMonth}`);

    return { 
      success: true, 
      reportId: savedReport?.id || 'unknown'
    };

  } catch (error) {
    console.error('Error generating monthly report:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 处理订阅状态变更后的报告生成
 */
export async function handleSubscriptionChange(
  userId: string,
  newTier: 'free' | 'plus' | 'pro',
  oldTier?: 'free' | 'plus' | 'pro'
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    console.log(`Handling subscription change for user ${userId}: ${oldTier || 'unknown'} -> ${newTier}`);

    // 免费用户不生成报告
    if (newTier === 'free') {
      console.log(`User ${userId} downgraded to free, no report generation needed`);
      return { success: true };
    }

    // 为付费用户生成报告
    const result = await generateMonthlyReportForUser(userId, newTier);
    
    if (result.success) {
      console.log(`Report generated for user ${userId} with tier ${newTier}`);
    } else {
      console.error(`Failed to generate report for user ${userId}: ${result.error}`);
    }

    return result;

  } catch (error) {
    console.error('Error handling subscription change:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 获取用户订阅等级
 */
export function mapPlanIdToTier(planId: string): 'plus' | 'pro' | 'free' {
  const planIdLower = planId.toLowerCase();
  
  if (planIdLower.includes('pro')) {
    return 'pro';
  } else if (planIdLower.includes('plus')) {
    return 'plus';
  } else {
    return 'free';
  }
}
