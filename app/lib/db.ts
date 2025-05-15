import { PrismaClient } from '@prisma/client';
import { getDbConnectionOptions, getLogLevel } from './db.config';
import 'dotenv/config'; // 确保加载环境变量
import prisma from './prisma'; // 使用专门的 Prisma 单例

// 防止开发环境中创建多个Prisma实例
// 在生产环境中，这是不必要的，因为模块缓存工作正常

declare global {
  var prisma: PrismaClient | undefined;
}

// 日志级别配置
const LOG_LEVELS = {
  info: ['info', 'warn', 'error'],
  warn: ['warn', 'error'],
  error: ['error'],
  query: ['query', 'info', 'warn', 'error'],
  debug: ['query', 'info', 'warn', 'error']
};

// 获取日志级别
const logLevel = getLogLevel();
const dbOptions = getDbConnectionOptions();

// 配置Prisma日志级别
const prismaLogLevels = LOG_LEVELS[logLevel as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;

// 导出 Prisma 客户端实例
export { prisma };

/**
 * 连接数据库并执行函数
 * 这个方法可以用来包装数据库操作，确保连接正常
 * @param callback 执行的回调函数
 * @returns 回调函数的结果
 */
export async function connectDB<T>(callback: (client: PrismaClient) => Promise<T>): Promise<T> {
  const startTime = Date.now();
  try {
    // 执行数据库操作
    const result = await callback(prisma);
    
    // 记录操作时间（仅在开发环境或日志级别为debug时）
    if (process.env.NODE_ENV !== 'production' || logLevel === 'debug') {
      const duration = Date.now() - startTime;
      console.log(`数据库操作完成，耗时: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    // 记录错误
    const duration = Date.now() - startTime;
    console.error(`数据库操作失败，耗时: ${duration}ms`, error);
    
    // 根据错误类型处理
    if (error instanceof Error) {
      // PostgreSQL 特定错误处理
      if (error.message.includes('Connection') || error.message.includes('connect')) {
        console.error('数据库连接错误，尝试重新连接...');
        // 可以在这里添加重连逻辑
      }
    }
    
    throw error;
  }
}

/**
 * 健康检查函数，验证数据库连接是否正常
 * @returns 连接状态和响应时间
 */
export async function checkDBConnection(): Promise<{ isConnected: boolean, responseTime?: number }> {
  const startTime = Date.now();
  try {
    // 执行一个简单查询来测试连接 - PostgreSQL 兼容
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    return { isConnected: true, responseTime };
  } catch (error) {
    console.error('数据库连接失败:', error);
    return { isConnected: false };
  }
}

// 事务客户端类型定义
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>;

/**
 * 创建数据库事务
 * @param callback 在事务中执行的回调函数
 * @returns 事务执行结果
 */
export async function withTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx: TransactionClient) => {
    return await callback(tx);
  }, {
    // PostgreSQL 事务设置
    maxWait: 5000, // 最大等待时间 (ms)
    timeout: 10000 // 事务超时时间 (ms)
  });
} 