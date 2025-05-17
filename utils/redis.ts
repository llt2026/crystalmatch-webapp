import { Redis } from '@upstash/redis';

// dev 环境可用 SKIP_REDIS 跳过远程 Redis
export const redis = process.env.SKIP_REDIS
  ? null
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }); 