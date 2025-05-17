import { Redis } from '@upstash/redis';

// 调试信息
console.log('Redis环境变量状态:', {
  SKIP_REDIS: process.env.SKIP_REDIS,
  URL_SET: !!process.env.UPSTASH_REDIS_REST_URL,
  TOKEN_SET: !!process.env.UPSTASH_REDIS_REST_TOKEN
});

// 当符合以下任一条件时使用内存存储:
// 1. 显式设置SKIP_REDIS=true (字符串比较)
// 2. 未设置Redis URL或Token
const skipRedis = process.env.SKIP_REDIS === 'true' || 
                  !process.env.UPSTASH_REDIS_REST_URL || 
                  !process.env.UPSTASH_REDIS_REST_TOKEN;

console.log('是否跳过Redis连接:', skipRedis);

// 创建Redis客户端或使用null
export const redis = skipRedis
  ? null
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }); 