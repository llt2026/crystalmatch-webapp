import { prisma } from '../prisma';
import { getFullEnergyContext } from '../energy-calc';
import { generateMockReport } from '../report-generator';
import { saveReportToDatabase } from '../report-cache-service';

export interface UserSubscriptionInfo {
  userId: string;
  tier: 'plus' | 'pro';
  planId: string;
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
        birthDate: true,
        birthInfo: true
      }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 2. 获取生日信息
    let birthDate: string;
    if (user.birthDate) {
      birthDate = user.birthDate;
    } else if (user.birthInfo && typeof user.birthInfo === 'object') {
      const birthInfo = user.birthInfo as any;
      birthDate = birthInfo.date || birthInfo.birthdate;
    } else {
      return { success: false, error: 'User birth date not found' };
    }

    if (!birthDate) {
      return { success: false, error: 'Birth date is required for report generation' };
    }

    // 3. 计算当前月份（报告月份）
    const now = new Date();
    const reportMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 4. 检查是否已存在该月份和等级的报告
    const existingReport = await prisma.energyReportCache.findFirst({
      where: {
        userId,
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

    // 5. 生成能量上下文
    const birthDateTime = new Date(birthDate);
    const energyContext = getFullEnergyContext(birthDateTime, now);

    if (!energyContext) {
      return { success: false, error: 'Failed to calculate energy context' };
    }

    // 6. 生成报告内容
    const report = generateMockReport(energyContext, tier);

    // 7. 保存到数据库
    const cacheKey = {
      userId,
      birthDate,
      reportMonth,
      tier
    };

    const saveSuccess = await saveReportToDatabase(cacheKey, report, energyContext);
    
    if (!saveSuccess) {
      return { success: false, error: 'Failed to save report to database' };
    }

    // 8. 获取刚保存的报告ID
    const savedReport = await prisma.energyReportCache.findFirst({
      where: {
        userId,
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
