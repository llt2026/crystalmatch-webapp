/**
 * 数据库种子脚本
 * 初始化必要的数据，如订阅计划
 */

import { PrismaClient } from '../generated/prisma';
import { SUBSCRIPTION_PLANS } from '../app/types/subscription';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('开始填充订阅计划数据...');
  
  // 清除现有订阅计划
  await prisma.subscriptionPlan.deleteMany({});
  
  // 免费计划
  await prisma.subscriptionPlan.create({
    data: {
      name: SUBSCRIPTION_PLANS.free.name,
      description: SUBSCRIPTION_PLANS.free.description,
      price: SUBSCRIPTION_PLANS.free.price,
      period: SUBSCRIPTION_PLANS.free.interval,
      features: SUBSCRIPTION_PLANS.free.features,
      isActive: true
    }
  });
  
  // 月度订阅
  await prisma.subscriptionPlan.create({
    data: {
      name: SUBSCRIPTION_PLANS.monthly.name,
      description: SUBSCRIPTION_PLANS.monthly.description,
      price: SUBSCRIPTION_PLANS.monthly.price,
      period: SUBSCRIPTION_PLANS.monthly.interval,
      features: SUBSCRIPTION_PLANS.monthly.features,
      isActive: true
    }
  });
  
  // 年度订阅
  await prisma.subscriptionPlan.create({
    data: {
      name: SUBSCRIPTION_PLANS.yearly.name,
      description: SUBSCRIPTION_PLANS.yearly.description,
      price: SUBSCRIPTION_PLANS.yearly.price,
      period: SUBSCRIPTION_PLANS.yearly.interval,
      features: SUBSCRIPTION_PLANS.yearly.features,
      isActive: true
    }
  });
  
  console.log('订阅计划数据填充完成');
}

async function main() {
  try {
    // 填充订阅计划
    await seedSubscriptionPlans();
    
    // 其他数据初始化...
    
    console.log('数据库种子填充完成');
  } catch (error) {
    console.error('种子脚本执行出错:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 