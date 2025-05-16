import Redis from 'ioredis';
import { env } from 'process';

// Redis客户端单例
let redisClient: Redis | null = null;

// 获取Redis客户端实例
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis连接错误:', err);
      // 在生产环境中，为了应用的健壮性，错误时不抛出致命错误
      // 而是降级到内存存储
    });

    console.log('Redis客户端初始化成功');
  }
  
  return redisClient;
}

// 验证码相关方法
export const VerificationCode = {
  // 验证码前缀，用于Redis键名
  CODE_PREFIX: 'verification:code:',
  RATE_LIMIT_PREFIX: 'verification:limit:',
  
  // 保存验证码到Redis
  async saveCode(email: string, code: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      // 设置验证码，5分钟过期
      await redis.set(key, code, 'EX', 300); // 300秒 = 5分钟
      return true;
    } catch (error) {
      console.error('保存验证码失败:', error);
      return false;
    }
  },
  
  // 检查发送频率限制
  async checkRateLimit(email: string): Promise<{ allowed: boolean; remainingTime?: number }> {
    try {
      const redis = getRedisClient();
      const key = this.RATE_LIMIT_PREFIX + email;
      
      // 获取当前限制状态
      const ttl = await redis.ttl(key);
      
      // 如果键不存在或已过期
      if (ttl <= 0) {
        return { allowed: true };
      }
      
      return { 
        allowed: false,
        remainingTime: ttl 
      };
    } catch (error) {
      console.error('检查频率限制失败:', error);
      // 如果Redis失败，允许请求通过以确保应用可用性
      return { allowed: true };
    }
  },
  
  // 设置发送频率限制
  async setRateLimit(email: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = this.RATE_LIMIT_PREFIX + email;
      
      // 设置60秒的限制
      await redis.set(key, '1', 'EX', 60);
      return true;
    } catch (error) {
      console.error('设置频率限制失败:', error);
      return false;
    }
  },
  
  // 验证并获取验证码
  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      // 获取存储的验证码
      const storedCode = await redis.get(key);
      
      // 验证成功后删除验证码(一次性使用)
      if (storedCode && storedCode === code) {
        await redis.del(key);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('验证码验证失败:', error);
      return false;
    }
  },
  
  // 获取存储的验证码（用于查询）
  async getCode(email: string): Promise<string | null> {
    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      return await redis.get(key);
    } catch (error) {
      console.error('获取验证码失败:', error);
      return null;
    }
  }
};

// 内存回退存储 (Redis不可用时使用)
export class MemoryVerificationCodes {
  private static instance: MemoryVerificationCodes;
  private codes: Map<string, { code: string; expiry: number }>;
  private rateLimits: Map<string, number>;
  
  private constructor() {
    this.codes = new Map();
    this.rateLimits = new Map();
  }
  
  public static getInstance(): MemoryVerificationCodes {
    if (!MemoryVerificationCodes.instance) {
      MemoryVerificationCodes.instance = new MemoryVerificationCodes();
    }
    return MemoryVerificationCodes.instance;
  }
  
  public saveCode(email: string, code: string): void {
    // 5分钟过期
    const expiry = Date.now() + 5 * 60 * 1000;
    this.codes.set(email, { code, expiry });
  }
  
  public checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
    const limit = this.rateLimits.get(email);
    
    if (!limit || limit < Date.now()) {
      return { allowed: true };
    }
    
    return { 
      allowed: false,
      remainingTime: Math.ceil((limit - Date.now()) / 1000)
    };
  }
  
  public setRateLimit(email: string): void {
    // 60秒限制
    this.rateLimits.set(email, Date.now() + 60 * 1000);
  }
  
  public verifyCode(email: string, code: string): boolean {
    const data = this.codes.get(email);
    
    if (!data) {
      return false;
    }
    
    // 检查是否过期
    if (Date.now() > data.expiry) {
      this.codes.delete(email);
      return false;
    }
    
    // 验证码匹配
    if (data.code === code) {
      this.codes.delete(email);
      return true;
    }
    
    return false;
  }
  
  public getCode(email: string): { code: string; expiry: number } | null {
    const data = this.codes.get(email);
    
    if (!data) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > data.expiry) {
      this.codes.delete(email);
      return null;
    }
    
    return data;
  }
} 