// app/lib/subscription/fix-planid-issue.ts
// 修复订阅计划外键问题
import { prisma } from '../prisma';

/**
 * 确保数据库中存在必要的订阅计划
 */
export async function ensureSubscriptionPlans() {
  try {
    console.log('🔧 检查并创建订阅计划...');

    // 检测是否为测试模式
    if (process.env.NODE_ENV === 'development' && process.env.PAYPAL_CLIENT_ID === 'test-client-id') {
      console.log('🧪 测试模式：跳过订阅计划创建');
      return { plusPlan: null, proPlan: null };
    }

    // 使用prisma客户端
    
    // 获取环境变量中的计划ID
    const plusPlanId = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS || 'P-plus-plan-default';
    const proPlanId = process.env.NEXT_PUBLIC_P_PAYPAL_PLAN_PRO || 'P-pro-plan-default';

    // 检查Plus计划是否存在
    let plusPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: plusPlanId }
    });

    if (!plusPlan) {
      plusPlan = await prisma.subscriptionPlan.create({
        data: {
          id: plusPlanId,
          name: 'Plus Plan',
          description: '基础月度能量报告和水晶推荐',
          price: 4.99,
          currency: 'USD',
          interval: 'month',
          period: 'month', // 添加必需的period字段
          features: [
            'Monthly Energy Report',
            'Basic Crystal Recommendations', 
            'Energy Score Tracking',
            'Email Support'
          ],
          isActive: true
        }
      });
      console.log('✅ Created Plus plan:', plusPlan.id);
    }

    // 检查Pro计划是否存在
    let proPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: proPlanId }
    });

    if (!proPlan) {
      proPlan = await prisma.subscriptionPlan.create({
        data: {
          id: proPlanId,
          name: 'Pro Plan',
          description: '高级年度能量报告和专业水晶指导',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          period: 'month', // 添加必需的period字段
          features: [
            'Advanced Monthly Reports',
            'Annual Energy Forecast',
            'Professional Crystal Matching',
            'Personalized Energy Rituals',
            'Priority Support',
            'Unlimited Report Generation'
          ],
          isActive: true
        }
      });
      console.log('✅ Created Pro plan:', proPlan.id);
    }

    console.log('✅ 订阅计划检查完成');
    return { plusPlan, proPlan };

  } catch (error) {
    console.error('❌ 订阅计划创建失败:', error);
    throw error;
  }
} 