/**
 * 数据库连接管理
 * 使用直接 require 方式加载 Prisma
 */

// 使用 require 直接加载 Prisma
// @ts-ignore - 忽略类型错误
const { PrismaClient } = require('@prisma/client');

// 声明全局变量用于保存 Prisma 实例
declare global {
  var _dbClient: any;
}

// 创建或获取 Prisma 客户端
function getClient() {
  try {
    if (process.env.NODE_ENV === 'production') {
      // 生产环境：创建新实例
      return new PrismaClient();
    } else {
      // 开发环境：重用全局实例
      if (!global._dbClient) {
        global._dbClient = new PrismaClient();
      }
      return global._dbClient;
    }
  } catch (error) {
    console.error('无法创建数据库客户端:', error);
    // 如果在初始化过程中出错，尝试无参数创建
    return new PrismaClient();
  }
}

export const prisma = getClient();

/**
 * 健康检查函数，验证数据库连接是否正常
 * @returns 连接状态和响应时间
 */
export async function checkDBConnection(): Promise<{ isConnected: boolean, responseTime?: number }> {
  const startTime = Date.now();
  try {
    // 执行一个简单查询来测试连接
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    return { isConnected: true, responseTime };
  } catch (error) {
    console.error('数据库连接失败:', error);
    return { isConnected: false };
  }
}

/**
 * 连接数据库并执行函数
 * @param callback 回调函数
 * @returns 结果
 */
export async function connectDB<T>(callback: (client: any) => Promise<T>): Promise<T> {
  try {
    return await callback(prisma);
  } catch (error) {
    console.error('数据库操作失败:', error);
    throw error;
  }
}

export default prisma; 