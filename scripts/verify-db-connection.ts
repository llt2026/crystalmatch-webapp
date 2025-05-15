/**
 * 数据库连接验证脚本
 * 用于验证 PostgreSQL 数据库连接是否正常
 */

import 'dotenv/config';
import { prisma } from '../app/lib/db';

async function main() {
  try {
    console.log('正在连接到 PostgreSQL 数据库...');
    console.log(`数据库 URL: ${process.env.DATABASE_URL?.replace(/\/\/([^:]+):[^@]+@/, '//********@')}`);
    
    // 简单的数据库查询测试
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as result`;
    const endTime = Date.now();
    
    console.log(`✅ 数据库连接成功! 响应时间: ${endTime - startTime}ms`);
    
    // 获取数据库版本
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    console.log(`📊 数据库版本: ${(versionResult as any)[0].version}`);
    
    // 检查表是否存在
    console.log('\n🔍 检查数据库表...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('📋 数据库中的表:');
      for (const table of tables) {
        console.log(`  - ${(table as any).table_name}`);
      }
    } else {
      console.log('⚠️ 没有找到任何表');
    }
    
    console.log('\n🔐 检查 Prisma 模型...');
    // 检查 User 模型
    const userCount = await prisma.user.count();
    console.log(`👤 用户表记录数: ${userCount}`);
    
    // 检查 SubscriptionPlan 模型
    const planCount = await prisma.subscriptionPlan.count();
    console.log(`📦 订阅计划表记录数: ${planCount}`);
    
    console.log('\n✅ 数据库连接验证完成!');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 