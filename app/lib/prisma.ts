/**
 * Prisma 客户端单例 - 使用 require 避免初始化问题
 */

// 使用 require 而不是 import 来避免 Vercel 上的初始化问题
// @ts-ignore - 忽略 TypeScript 错误
const { PrismaClient } = require('@prisma/client');

// 简单直接的单例模式
let prisma: any;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // 防止开发环境中创建多个实例
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
export default prisma; 