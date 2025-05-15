/**
 * 应用启动引导脚本
 * 确保Prisma和其他服务在应用启动时正确初始化
 */

import { PrismaClient } from '@prisma/client';
import prisma from './prisma';
import { getDatabaseUrl } from './db.config';

let isBootstrapped = false;

/**
 * 初始化数据库连接
 * 在启动应用之前预热Prisma客户端
 */
export async function bootstrapDatabase() {
  if (isBootstrapped) return;

  try {
    console.log('🚀 预热Prisma客户端...');
    console.log(`🔌 数据库URL: ${maskConnectionString(getDatabaseUrl())}`);
    
    // 尝试执行简单查询以验证连接
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ 数据库连接成功:', result);
    
    // 标记为已初始化
    isBootstrapped = true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    
    // 尝试重新创建客户端
    console.log('🔄 尝试重新创建Prisma客户端...');
    try {
      const newClient = new PrismaClient();
      await newClient.$connect();
      console.log('✅ 重新创建客户端成功');
    } catch (retryError) {
      console.error('❌ 重新创建客户端失败:', retryError);
    }
  }
}

/**
 * 隐藏连接字符串中的敏感信息
 * 用于日志记录
 */
function maskConnectionString(connectionString: string): string {
  try {
    // 安全地检查是否为有效URL
    if (!connectionString || !connectionString.includes('://')) {
      return '(invalid connection string)';
    }
    
    // 使用正则表达式隐藏用户名和密码
    return connectionString.replace(
      /(postgresql|mysql):\/\/([^:]+):([^@]+)@/,
      '$1://$2:****@'
    );
  } catch (error) {
    return '(error masking connection string)';
  }
}

// 如果在生产环境中但不是在构建阶段，则自动初始化
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  bootstrapDatabase().catch(err => {
    console.error('启动脚本执行失败:', err);
  });
}

export default bootstrapDatabase; 