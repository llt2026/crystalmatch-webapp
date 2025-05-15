/**
 * Prisma 客户端单例
 * 使用工厂函数创建安全的客户端
 */

import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from './prisma-factory';

// 导出单例客户端
export const prisma = getPrismaClient();

export default prisma; 