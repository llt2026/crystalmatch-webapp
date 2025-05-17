import { Redis } from '@upstash/redis';
import { localRedis } from './redis-alternative';

// 使用try-catch包装Redis初始化
function createRedisClient() {
  try {
    // 调试信息
    console.log('Redis环境变量状态:', {
      SKIP_REDIS: process.env.SKIP_REDIS,
      URL_SET: !!process.env.UPSTASH_REDIS_REST_URL,
      TOKEN_SET: !!process.env.UPSTASH_REDIS_REST_TOKEN
    });

    // 当符合以下任一条件时使用本地存储:
    // 1. 显式设置SKIP_REDIS=true (字符串比较)
    // 2. 未设置Redis URL或Token
    const skipRedis = process.env.SKIP_REDIS === 'true' || 
                     !process.env.UPSTASH_REDIS_REST_URL || 
                     !process.env.UPSTASH_REDIS_REST_TOKEN;

    console.log('是否跳过Redis连接:', skipRedis);

    // 创建Redis客户端或使用本地存储
    if (skipRedis) {
      console.log('使用本地文件存储代替Redis');
      return localRedis; // 改用文件系统存储
    }

    // 尝试创建Redis客户端
    console.log('初始化Redis客户端连接...');
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (error) {
    console.error('Redis初始化错误:', error);
    // 出错时使用本地文件存储作为备选
    console.log('Redis初始化失败，改用本地文件存储');
    return localRedis;
  }
}

// 创建Redis客户端
export const redis = createRedisClient(); 