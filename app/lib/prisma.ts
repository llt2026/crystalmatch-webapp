/**
 * Prisma 客户端单例
 * 专门处理 Vercel 部署环境中的 Prisma 初始化问题
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl, getLogLevel } from './db.config';

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
const prismaLogLevels = LOG_LEVELS[logLevel as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;

// 声明全局变量用于保存 Prisma 实例
declare global {
  var prisma: PrismaClient | undefined;
}

// 为 Vercel Serverless 函数环境优化连接管理
const getPrismaClient = () => {
  const databaseUrl = getDatabaseUrl();
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // 创建 Prisma 客户端实例
  return new PrismaClient({
    log: prismaLogLevels.map(level => level as 'query' | 'info' | 'warn' | 'error'),
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
};

// 防止在开发环境中创建多个 Prisma 实例
// 在 Vercel 服务器函数中，这有助于减少连接数
export const prisma = global.prisma || getPrismaClient();

// 仅在非生产环境下缓存 Prisma 实例到全局对象
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// 对外提供清理连接的方法
export const disconnectPrisma = async () => {
  try {
    await global.prisma?.$disconnect();
  } catch (e) {
    console.error('Error disconnecting from database', e);
  }
};

export default prisma; 