import Redis from 'ioredis';
import { env } from 'process';

// Redis client singleton
let redisClient: Redis | null = null;

// Get Redis client instance
export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      connectTimeout: 10000, // Increased connection timeout
      enableOfflineQueue: true // Queue requests when offline
    });

    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
      // In production environment, for application robustness, we don't throw fatal errors
      // but instead fall back to memory storage
    });

    redisClient.on('connect', () => {
      console.log('Redis connection successful');
    });

    console.log('Redis client initialized successfully');
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
    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      // Set code with expiry
      await redis.set(key, code, 'EX', this.CODE_EXPIRY);
      console.log(`Verification code saved for ${email}, expires in ${this.CODE_EXPIRY} seconds`);
      return { success: true, expirySeconds: this.CODE_EXPIRY };
    } catch (error) {
      console.error('Failed to save verification code:', error);
      return { success: false, expirySeconds: this.CODE_EXPIRY };
    }
  },
  
  // Check rate limiting
  async checkRateLimit(email: string): Promise<{ allowed: boolean; remainingTime?: number }> {
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
      // If Redis fails, allow the request to ensure application availability
      return { allowed: true };
    }
  },
  
  // Set rate limit
  async setRateLimit(email: string): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const key = this.RATE_LIMIT_PREFIX + email;
      
      // Set 60 second limit
      await redis.set(key, '1', 'EX', 60);
      return true;
    } catch (error) {
      console.error('Failed to set rate limit:', error);
      return false;
    }
  },
  
  // Verify code
  async verifyCode(email: string, code: string): Promise<{success: boolean, reason?: string}> {
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
      return { success: false, reason: 'server_error' };
    }
  },
  
  // Get stored code info (for queries) and expiration time
  async getCodeInfo(email: string): Promise<{code: string | null, ttl: number | null}> {
    try {
      const redis = getRedisClient();
      const key = this.CODE_PREFIX + email;
      
      const code = await redis.get(key);
      const ttl = await redis.ttl(key);
      
      return { code, ttl: ttl > 0 ? ttl : null };
    } catch (error) {
      console.error('Failed to get verification code info:', error);
      return { code: null, ttl: null };
    }
  }
};

// Memory fallback storage (used when Redis is unavailable)
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
  
  public saveCode(email: string, code: string): {success: boolean, expirySeconds: number} {
    // Keep same expiry as Redis
    const expirySeconds = VerificationCode.CODE_EXPIRY;
    const expiry = Date.now() + expirySeconds * 1000;
    this.codes.set(email, { code, expiry });
    console.log(`[Memory] Verification code saved for ${email}, expires in ${expirySeconds} seconds`);
    return { success: true, expirySeconds };
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
    // 60 second limit
    this.rateLimits.set(email, Date.now() + 60 * 1000);
  }
  
  public verifyCode(email: string, code: string): {success: boolean, reason?: string} {
    const data = this.codes.get(email);
    
    if (!data) {
      console.log(`[Memory] Verification code for ${email} not found`);
      return { success: false, reason: 'code_not_found' };
    }
    
    // Check if expired
    if (Date.now() > data.expiry) {
      console.log(`[Memory] Verification code for ${email} has expired`);
      this.codes.delete(email);
      return { success: false, reason: 'code_expired' };
    }
    
    // Code match
    if (data.code !== code) {
      console.log(`[Memory] Verification code mismatch for ${email}: got ${code}, expected ${data.code}`);
      return { success: false, reason: 'code_mismatch' };
    }
    
    // Delete code after success
    this.codes.delete(email);
    console.log(`[Memory] Verification successful for ${email}, code deleted`);
    return { success: true };
  }
  
  public getCodeInfo(email: string): {code: string | null, ttl: number | null} {
    const data = this.codes.get(email);
    
    if (!data) {
      return { code: null, ttl: null };
    }
    
    // Check if expired
    if (Date.now() > data.expiry) {
      this.codes.delete(email);
      return { code: null, ttl: null };
    }
    
    // Calculate remaining seconds
    const ttlMs = data.expiry - Date.now();
    return { 
      code: data.code, 
      ttl: ttlMs > 0 ? Math.floor(ttlMs / 1000) : null 
    };
  }
} 