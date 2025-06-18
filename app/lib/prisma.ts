/**
 * Prisma 客户端单例 - 使用最激进的方式防止初始化错误
 */

// 使用 try-catch 和 require 防止构建时的初始化
let PrismaClient: any;

// 定义模拟客户端类型
type MockClient = {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  user: {
    findUnique: (args?: any) => Promise<any>;
    findMany: (args?: any) => Promise<any[]>;
    create: (args?: any) => Promise<any>;
    update: (args?: any) => Promise<any>;
  };
  subscriptionPlan: {
    findFirst: (args?: any) => Promise<any>;
    create: (args?: any) => Promise<any>;
  };
  subscription: {
    findFirst: (args?: any) => Promise<any>;
    update: (args?: any) => Promise<any>;
    create: (args?: any) => Promise<any>;
  };
  energyReportCache: {
    findFirst: (args?: any) => Promise<any>;
    findMany: (args?: any) => Promise<any[]>;
    upsert: (args?: any) => Promise<any>;
    count: (args?: any) => Promise<number>;
    deleteMany: (args?: any) => Promise<{ count: number }>;
    findUnique: (args?: any) => Promise<any>;
  };
  log: {
    create: (args?: any) => Promise<any>;
  };
  report: {
    findUnique: () => Promise<any>;
    findMany: () => Promise<any[]>;
    create: () => Promise<any>;
    update: () => Promise<any>;
    upsert: () => Promise<any>;
  };
  $queryRaw: () => Promise<any[]>;
};

// 简单模拟客户端
const MockPrismaClient = function(): MockClient {
  // 模拟数据
  const mockUser = {
    id: 'mock-user-123',
    name: 'Mock User',
    email: 'mock@example.com',
    birthInfo: {
      birthdate: '1990-06-15',
      gender: 'other'
    }
  };

  const mockPlan = {
    id: 'mock-plan-123',
    name: 'Plus Monthly',
    description: 'Plus membership',
    price: 9.99,
    period: 'monthly',
    features: { access: 'plus' },
    isActive: true
  };

  const mockSubscription = {
    id: 'mock-sub-123',
    userId: 'mock-user-123',
    planId: 'mock-plan-123',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  const mockReport = {
    id: 'mock-report-123',
    userId: 'mock-user-123',
    birthDate: '1990-06-15',
    reportMonth: '2025-06',
    tier: 'plus',
    report: JSON.stringify({ basicInfo: { tier: 'plus' } }),
    energyContext: JSON.stringify({ tier: 'plus' }),
    generatedAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  };

  return {
    $connect: async () => {
      console.log('Mock Prisma: Connected');
    },
    $disconnect: async () => {
      console.log('Mock Prisma: Disconnected');
    },
    user: {
      findUnique: async (args?: any) => {
        console.log('Mock Prisma: user.findUnique', args?.where);
        return mockUser;
      },
      findMany: async (args?: any) => {
        console.log('Mock Prisma: user.findMany', args);
        return [mockUser];
      },
      create: async (args?: any) => {
        console.log('Mock Prisma: user.create', args?.data);
        return { ...mockUser, ...args?.data };
      },
      update: async (args?: any) => {
        console.log('Mock Prisma: user.update', args);
        return { ...mockUser, ...args?.data };
      },
    },
    subscriptionPlan: {
      findFirst: async (args?: any) => {
        console.log('Mock Prisma: subscriptionPlan.findFirst', args?.where);
        return mockPlan;
      },
      create: async (args?: any) => {
        console.log('Mock Prisma: subscriptionPlan.create', args?.data);
        return { ...mockPlan, ...args?.data, id: 'new-plan-' + Date.now() };
      },
    },
    subscription: {
      findFirst: async (args?: any) => {
        console.log('Mock Prisma: subscription.findFirst', args?.where);
        return null; // 模拟没有现有订阅
      },
      update: async (args?: any) => {
        console.log('Mock Prisma: subscription.update', args);
        return { ...mockSubscription, ...args?.data };
      },
      create: async (args?: any) => {
        console.log('Mock Prisma: subscription.create', args?.data);
        return { ...mockSubscription, ...args?.data, id: 'new-sub-' + Date.now() };
      },
    },
    energyReportCache: {
      findFirst: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.findFirst', args?.where);
        return null; // 模拟没有现有报告
      },
      findMany: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.findMany', args);
        return [mockReport];
      },
      upsert: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.upsert', args?.where);
        return { ...mockReport, ...args?.create, id: 'new-report-' + Date.now() };
      },
      count: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.count', args);
        return 1;
      },
      deleteMany: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.deleteMany', args);
        return { count: 1 };
      },
      findUnique: async (args?: any) => {
        console.log('Mock Prisma: energyReportCache.findUnique', args?.where);
        return mockReport;
      },
    },
    log: {
      create: async (args?: any) => {
        console.log('Mock Prisma: log.create', args?.data);
        return { id: 'log-' + Date.now(), ...args?.data };
      },
    },
    report: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({}),
      update: async () => ({}),
      upsert: async () => ({}),
    },
    $queryRaw: async () => [{ connected: true }]
  };
};

// 检查是否有有效的数据库连接
const hasValidDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL;
  return dbUrl && dbUrl.trim() !== '' && (
    dbUrl.startsWith('postgresql://') || 
    dbUrl.startsWith('postgres://') ||
    dbUrl.startsWith('mongodb://') ||
    dbUrl.startsWith('mysql://')
  );
};

// 跳过构建阶段的实际初始化
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('⚠️ 构建阶段: 使用模拟 Prisma 客户端');
  PrismaClient = MockPrismaClient;
} else if (!hasValidDatabaseUrl()) {
  console.log('⚠️ 没有有效的数据库连接: 使用模拟 Prisma 客户端');
  PrismaClient = MockPrismaClient;
} else {
  try {
    // 只在非构建阶段尝试加载真实的PrismaClient
    const { PrismaClient: RealPrismaClient } = require('@prisma/client');
    PrismaClient = RealPrismaClient;
    console.log('✅ Prisma 客户端导入成功');
  } catch (e) {
    console.error('❌ Prisma 客户端导入失败:', e);
    PrismaClient = MockPrismaClient;
  }
}

// 声明全局变量类型
declare global {
  var prisma: any | undefined;
}

// 创建 Prisma 客户端实例
let prisma: any;

try {
  if (process.env.NODE_ENV === 'production') {
    // 生产环境: 新建客户端
    console.log('🚀 生产环境: 创建新Prisma客户端');
    prisma = new (PrismaClient as any)({
      errorFormat: 'pretty',
    });
  } else {
    // 开发环境: 重用全局实例
    if (!global.prisma) {
      console.log('🚀 开发环境: 创建全局Prisma客户端');
      global.prisma = new (PrismaClient as any)({
        log: hasValidDatabaseUrl() ? ['error', 'warn'] : [],
        errorFormat: 'pretty',
      });
    }
    prisma = global.prisma;
  }
  console.log('✅ Prisma 客户端创建成功');
} catch (error) {
  console.error('❌ Prisma 客户端创建失败:', error);
  // 使用模拟客户端
  prisma = MockPrismaClient();
}

export { prisma };
export default prisma; 