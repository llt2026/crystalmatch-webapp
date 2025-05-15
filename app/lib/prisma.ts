/**
 * Prisma 客户端单例 - 使用全局变量和多种容错机制确保稳定初始化
 */

// 声明全局变量类型
declare global {
  var prisma: any | undefined;
}

// 安全初始化函数
function createPrismaClient() {
  try {
    // 使用动态导入以避免构建时问题
    const { PrismaClient } = require('@prisma/client');
    
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
  } catch (e) {
    console.error('Prisma 客户端创建失败:', e);
    // 返回一个模拟客户端以避免应用崩溃
    return {
      $connect: async () => {},
      $disconnect: async () => {},
      // 为常用模型添加模拟方法
      user: {
        findUnique: async () => null,
        findMany: async () => [],
        create: async () => ({}),
        update: async () => ({}),
      },
      // 其他必要的模拟方法...
    };
  }
}

// 创建 Prisma 客户端实例
let prisma: any;

// 跳过构建阶段的初始化
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('⚠️ 跳过构建阶段的 Prisma 初始化');
  // 构建阶段使用模拟客户端
  prisma = {
    $connect: async () => {},
    $disconnect: async () => {},
  };
} else {
  // 运行时正常初始化
  if (process.env.NODE_ENV === 'production') {
    prisma = createPrismaClient();
  } else {
    // 防止开发环境中创建多个实例
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    prisma = global.prisma;
  }
}

export { prisma };
export default prisma; 