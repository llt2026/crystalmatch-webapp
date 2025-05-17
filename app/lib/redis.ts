import Redis from 'ioredis';
import { env } from 'process';

// Redis client singleton
let redisClient: Redis | null = null;
let redisDisabled = process.env.SKIP_REDIS === 'true';

// 启用更详细的日志记录
const DEBUG = true;

// 创建全局的内存验证码存储实例，确保只有一个实例
export const globalMemoryStorage = new Map<string, { code: string; expiry: number }>();
export const globalRateLimits = new Map<string, number>();

// Log Redis status
console.log(`Redis status: ${redisDisabled ? 'DISABLED' : 'ENABLED'}`);
console.log(`SKIP_REDIS=${process.env.SKIP_REDIS}`);

// Error with code property interface
interface RedisError extends Error {
  code?: string;
}

// Get Redis client instance
export function getRedisClient(): Redis {
  // If Redis is disabled due to connection issues or by environment variable, throw error to fallback to memory storage
  if (redisDisabled) {
    if (DEBUG) console.log('Redis is disabled, using memory storage instead');
    throw new Error('Redis is disabled due to connection issues or by configuration');
  }

  if (!redisClient) {
    try {
      const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
      
      if (DEBUG) console.log(`Attempting to connect to Redis at ${redisUrl}`);
      
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1, // Reduced from 3 to 1
        retryStrategy: (times) => {
          // Only retry twice, then give up
          if (times > 2) {
            console.log('Too many Redis connection attempts, disabling Redis');
            redisDisabled = true;
            return null; // Don't retry anymore
          }
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        connectTimeout: 5000, // Reduced from 10000 to 5000
        enableOfflineQueue: false, // Don't queue commands when offline
        reconnectOnError: (err) => {
          console.log('Redis error, deciding whether to reconnect:', err.message);
          // Only reconnect for specific errors, not for connection refused
          const targetError = err.message.includes('READONLY') || 
                              err.message.includes('ETIMEDOUT');
          return targetError ? 1 : false;
        }
      });

      redisClient.on('error', (err: RedisError) => {
        console.error('Redis connection error:', err.message);
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
          console.log('Redis connection refused or timed out, disabling Redis');
          redisDisabled = true;
          if (redisClient) {
            redisClient.disconnect();
            redisClient = null;
          }
        }
      });

      redisClient.on('connect', () => {
        console.log('Redis connection successful');
        redisDisabled = false;
      });

      console.log('Redis client initialized');
    } catch (e) {
      console.error('Failed to initialize Redis client:', e);
      redisDisabled = true;
      throw e;
    }
  }
  
  return redisClient;
}

// Verification code methods
export const VerificationCode = {
  // Redis key prefixes
  CODE_PREFIX: 'verification:code:',
  RATE_LIMIT_PREFIX: 'verification:limit:',
  
  // Verification code expiry (seconds)
  CODE_EXPIRY: 15 * 60, // 15 minutes
  
  // Save verification code to Redis
  async saveCode(email: string, code: string): Promise<{success: boolean, expirySeconds: number}> {
    if (redisDisabled) {
      if (DEBUG) console.log(`Redis is disabled, not saving code to Redis: ${code} for ${email}`);
      throw new Error('Redis is disabled');
    }

    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      // Set code with expiry
      await redis.set(key, code, 'EX', this.CODE_EXPIRY);
      console.log(`Verification code saved for ${email}, expires in ${this.CODE_EXPIRY} seconds`);
      return { success: true, expirySeconds: this.CODE_EXPIRY };
    } catch (error) {
      console.error('Failed to save verification code:', error);
      throw error; // Rethrow to trigger fallback
    }
  },
  
  // Check rate limiting
  async checkRateLimit(email: string): Promise<{ allowed: boolean; remainingTime?: number }> {
    if (redisDisabled) {
      if (DEBUG) console.log(`Redis is disabled, not checking rate limit in Redis for ${email}`);
      throw new Error('Redis is disabled');
    }

    try {
      const redis = getRedisClient();
      const key = this.RATE_LIMIT_PREFIX + email;
      
      // Get current limit status
      const ttl = await redis.ttl(key);
      
      // If key doesn't exist or has expired
      if (ttl <= 0) {
        return { allowed: true };
      }
      
      return { 
        allowed: false,
        remainingTime: ttl 
      };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      throw error; // Rethrow to trigger fallback
    }
  },
  
  // Set rate limit
  async setRateLimit(email: string): Promise<boolean> {
    if (redisDisabled) {
      if (DEBUG) console.log(`Redis is disabled, not setting rate limit in Redis for ${email}`);
      throw new Error('Redis is disabled');
    }

    try {
      const redis = getRedisClient();
      const key = this.RATE_LIMIT_PREFIX + email;
      
      // Set 60 second limit
      await redis.set(key, '1', 'EX', 60);
      return true;
    } catch (error) {
      console.error('Failed to set rate limit:', error);
      throw error; // Rethrow to trigger fallback
    }
  },
  
  // Verify code
  async verifyCode(email: string, code: string): Promise<{success: boolean, reason?: string}> {
    if (redisDisabled) {
      if (DEBUG) console.log(`Redis is disabled, not verifying code in Redis for ${email}`);
      throw new Error('Redis is disabled');
    }

    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      // Get stored code
      const storedCode = await redis.get(key);
      
      // Code doesn't exist
      if (!storedCode) {
        console.log(`Verification code for ${email} not found or expired`);
        return { success: false, reason: 'code_not_found' };
      }
      
      // Code doesn't match
      if (storedCode !== code) {
        console.log(`Verification code mismatch for ${email}: got ${code}, expected ${storedCode}`);
        return { success: false, reason: 'code_mismatch' };
      }
      
      // Delete code after successful verification (one-time use)
      await redis.del(key);
      console.log(`Verification successful for ${email}, code deleted`);
      return { success: true };
    } catch (error) {
      console.error('Verification code verification failed:', error);
      throw error; // Rethrow to trigger fallback
    }
  },
  
  // Get stored code info (for queries) and expiration time
  async getCodeInfo(email: string): Promise<{code: string | null, ttl: number | null}> {
    if (redisDisabled) {
      if (DEBUG) console.log(`Redis is disabled, not getting code info from Redis for ${email}`);
      throw new Error('Redis is disabled');
    }

    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      const code = await redis.get(key);
      const ttl = await redis.ttl(key);
      
      return { code, ttl: ttl > 0 ? ttl : null };
    } catch (error) {
      console.error('Failed to get verification code info:', error);
      throw error; // Rethrow to trigger fallback
    }
  }
};

// Memory fallback storage (used when Redis is unavailable)
export class MemoryVerificationCodes {
  private static instance: MemoryVerificationCodes;
  
  private constructor() {
    console.log('Memory verification code storage initialized');
    // 清空全局存储，确保初始状态为空
    globalMemoryStorage.clear();
    globalRateLimits.clear();
  }
  
  public static getInstance(): MemoryVerificationCodes {
    if (!MemoryVerificationCodes.instance) {
      MemoryVerificationCodes.instance = new MemoryVerificationCodes();
    }
    return MemoryVerificationCodes.instance;
  }
  
  public saveCode(email: string, code: string): {success: boolean, expirySeconds: number} {
    // Keep same expiry as Redis
    const expirySeconds = VerificationCode.CODE_EXPIRY;
    const expiry = Date.now() + expirySeconds * 1000;
    
    // 标准化email地址（转为小写）
    const normalizedEmail = email.toLowerCase().trim();
    
    // 存储到全局Map中
    globalMemoryStorage.set(normalizedEmail, { code, expiry });
    console.log(`[Memory] Verification code saved for ${normalizedEmail}, expires in ${expirySeconds} seconds, code: ${code}`);
    
    // 打印当前内存中的所有验证码（调试用）
    if (DEBUG) {
      console.log('[Memory] Current codes in memory:');
      globalMemoryStorage.forEach((value, key) => {
        console.log(`- ${key}: ${value.code}, expires in ${Math.ceil((value.expiry - Date.now()) / 1000)} seconds`);
      });
    }
    
    return { success: true, expirySeconds };
  }
  
  public checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
    // 标准化email地址
    const normalizedEmail = email.toLowerCase().trim();
    const limit = globalRateLimits.get(normalizedEmail);
    
    if (!limit || limit < Date.now()) {
      return { allowed: true };
    }
    
    return { 
      allowed: false,
      remainingTime: Math.ceil((limit - Date.now()) / 1000)
    };
  }
  
  public setRateLimit(email: string): void {
    // 标准化email地址
    const normalizedEmail = email.toLowerCase().trim();
    // 60 second limit
    globalRateLimits.set(normalizedEmail, Date.now() + 60 * 1000);
    console.log(`[Memory] Rate limit set for ${normalizedEmail}, expires in 60 seconds`);
  }
  
  public verifyCode(email: string, code: string): {success: boolean, reason?: string} {
    // 标准化email地址
    const normalizedEmail = email.toLowerCase().trim();
    const data = globalMemoryStorage.get(normalizedEmail);
    
    console.log(`[Memory] Verifying code for ${normalizedEmail}: input=${code}`);
    
    // 输出当前内存中所有验证码（调试用）
    if (DEBUG) {
      console.log('[Memory] Current codes during verification:');
      globalMemoryStorage.forEach((value, key) => {
        console.log(`- ${key}: ${value.code}, expires in ${Math.ceil((value.expiry - Date.now()) / 1000)} seconds`);
      });
    }
    
    if (!data) {
      console.log(`[Memory] Verification code for ${normalizedEmail} not found`);
      return { success: false, reason: 'code_not_found' };
    }
    
    // Check if expired
    if (Date.now() > data.expiry) {
      console.log(`[Memory] Verification code for ${normalizedEmail} has expired`);
      globalMemoryStorage.delete(normalizedEmail);
      return { success: false, reason: 'code_expired' };
    }
    
    // Code match
    if (data.code !== code) {
      console.log(`[Memory] Verification code mismatch for ${normalizedEmail}: got ${code}, expected ${data.code}`);
      return { success: false, reason: 'code_mismatch' };
    }
    
    // Delete code after success
    globalMemoryStorage.delete(normalizedEmail);
    console.log(`[Memory] Verification successful for ${normalizedEmail}, code deleted`);
    return { success: true };
  }
  
  public getCodeInfo(email: string): {code: string | null, ttl: number | null} {
    // 标准化email地址
    const normalizedEmail = email.toLowerCase().trim();
    const data = globalMemoryStorage.get(normalizedEmail);
    
    if (!data) {
      return { code: null, ttl: null };
    }
    
    // Check if expired
    if (Date.now() > data.expiry) {
      globalMemoryStorage.delete(normalizedEmail);
      return { code: null, ttl: null };
    }
    
    // Calculate remaining seconds
    const ttlMs = data.expiry - Date.now();
    return { 
      code: data.code, 
      ttl: ttlMs > 0 ? Math.floor(ttlMs / 1000) : null 
    };
  }
  
  // 添加调试方法，直接返回当前内存中所有验证码
  public getAllCodes(): Map<string, { code: string; expiry: number }> {
    return new Map(globalMemoryStorage);
  }
} 