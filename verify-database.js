/**
 * 数据库连接验证脚本
 * 用于检查数据库连接和查询是否正常
 */

// 设置测试环境变量 - 仅用于演示
// Neon PostgreSQL连接字符串示例
// 实际使用时应使用环境变量或.env文件
if (!process.env.DATABASE_URL) {
  console.log('未找到环境变量DATABASE_URL，使用示例连接串进行测试');
  // 这不是真实的连接字符串，仅作演示
  process.env.DATABASE_URL = "postgresql://user:password@ep-cool-fire-12345.us-east-1.aws.neon.tech/crystalmatch?sslmode=require";
}

// 直接导入生成的Prisma客户端
const { PrismaClient } = require('@prisma/client');

async function verifyDatabaseConnection() {
  console.log('开始数据库连接验证...');
  
  // 创建没有日志的Prisma客户端
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    console.log('连接数据库...');
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
    
    // 获取数据库连接信息
    const dbInfo = process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || '未知'
      : '未知';
    console.log(`数据库服务器: ${dbInfo}`);
    
    // 测试基本查询
    console.log('执行用户表查询...');
    const userCount = await prisma.user.count();
    console.log(`✅ 查询成功 - 用户表记录数: ${userCount}`);
    
    console.log('尝试查询用户表详细信息...');
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    if (users.length > 0) {
      console.log(`✅ 成功获取 ${users.length} 条用户记录`);
      console.log('样本记录:', users[0]);
    } else {
      console.log('⚠️ 用户表为空');
    }
    
    // 测试订阅表查询
    console.log('执行订阅表查询...');
    const subscriptionCount = await prisma.subscription.count();
    console.log(`✅ 查询成功 - 订阅表记录数: ${subscriptionCount}`);
    
    console.log('数据库连接验证完成 ✅');
  } catch (error) {
    console.error('❌ 数据库验证失败:', error);
  } finally {
    // 确保关闭连接
    await prisma.$disconnect();
  }
}

// 立即执行
verifyDatabaseConnection(); 