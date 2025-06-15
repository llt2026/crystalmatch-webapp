/**
 * 数据库种子脚本
 * 初始化必要的数据，如订阅计划
 */

import { PrismaClient } from '@prisma/client';
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
  
  // Plus计划（月度订阅）
  await prisma.subscriptionPlan.create({
    data: {
      name: SUBSCRIPTION_PLANS.plus.name,
      description: SUBSCRIPTION_PLANS.plus.description,
      price: SUBSCRIPTION_PLANS.plus.price,
      period: SUBSCRIPTION_PLANS.plus.interval,
      features: SUBSCRIPTION_PLANS.plus.features,
      paypalPlanId: 'P-1234PLUS5678', // PayPal Plus Plan ID
      isActive: true
    }
  });
  
  // Pro计划（年度订阅）
  await prisma.subscriptionPlan.create({
    data: {
      name: SUBSCRIPTION_PLANS.pro.name,
      description: SUBSCRIPTION_PLANS.pro.description,
      price: SUBSCRIPTION_PLANS.pro.price,
      period: SUBSCRIPTION_PLANS.pro.interval,
      features: SUBSCRIPTION_PLANS.pro.features,
      paypalPlanId: 'P-9999PRO8888', // PayPal Pro Plan ID
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