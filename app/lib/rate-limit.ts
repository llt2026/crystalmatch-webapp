/**
 * API请求限流工具
 * 基于LRU缓存实现的简单限流机制
 */

import { LRUCache } from 'lru-cache';

export interface RateLimitOptions {
  interval: number; // 时间窗口（毫秒）
  uniqueTokenPerInterval: number; // 在时间窗口内存储的最大令牌数
}

export interface RateLimit {
  check: (limit: number, token: string) => Promise<void>;
}

export function rateLimit(options: RateLimitOptions): RateLimit {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (limit: number, token: string) => {
      const tokenKey = token;
      const now = Date.now();
      const windowStart = now - options.interval;

      // 获取当前token的请求记录
      const tokenTimestamps = tokenCache.get(tokenKey) || [];
      const validTimestamps = tokenTimestamps.filter((timestamp) => timestamp > windowStart);

      // 如果已经达到限制，则抛出错误
      if (validTimestamps.length >= limit) {
        throw new Error('Rate limit exceeded');
      }

      // 更新token的请求记录
      validTimestamps.push(now);
      tokenCache.set(tokenKey, validTimestamps);
    },
  };
} 