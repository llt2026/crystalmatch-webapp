/**
 * Prisma 客户端工厂
 * 提供安全获取 Prisma 客户端的方法
 */

import { PrismaClient } from '@prisma/client';

// 类型声明
declare global {
  var _prisma: PrismaClient | undefined;
}

// 安全地获取 Prisma 客户端
export function getPrismaClient(): PrismaClient {
  // 尝试创建一个 Prisma 客户端实例
  try {
    // 在开发环境中重用客户端，在生产环境中创建新客户端
    if (process.env.NODE_ENV === 'production') {
      // 生产环境: 全新客户端
      return new PrismaClient({
        log: ['error'],
        errorFormat: 'pretty'
      });
    } else {
      // 开发环境: 重用全局实例
      if (!global._prisma) {
        global._prisma = new PrismaClient({
          log: ['query', 'error', 'warn'],
          errorFormat: 'pretty'
        });
      }
      return global._prisma;
    }
  } catch (error) {
    console.error('Prisma 初始化失败：', error);
    
    // 绝对紧急情况: 不带任何选项尝试创建客户端
    try {
      return new PrismaClient();
    } catch (fallbackError) {
      console.error('最终 Prisma 初始化失败：', fallbackError);
      throw new Error('无法初始化数据库连接');
    }
  }
} 