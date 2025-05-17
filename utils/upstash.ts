import { Redis } from '@upstash/redis';

// 创建 Redis 客户端
// 如果设置了SKIP_REDIS环境变量，则使用内存存储
export const redis = process.env.SKIP_REDIS === 'true'
  ? null 
  : new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

// 用于内存存储的Map（开发环境使用）
// @ts-ignore - 使用全局存储确保热重载不丢失数据
const memoryStore: Map<string, {value: any, expires: number}> = 
  globalThis.__UPSTASH_MEMORY_STORE || (globalThis.__UPSTASH_MEMORY_STORE = new Map());

/**
 * 保存验证码
 * @param email 邮箱地址
 * @param code 验证码
 * @param ttl 过期时间(秒)
 */
export async function saveCode(email: string, code: string, ttl = 600) {
  const key = `vcode:${email.toLowerCase().trim()}`;
  
  try {
    if (redis) {
      await redis.set(key, code, { ex: ttl });
      console.log(`[Upstash] 验证码已保存: ${email} -> ${code}, 有效期${ttl}秒`);
      return true;
    }
  } catch (error) {
    console.error(`[Upstash] 保存验证码错误:`, error);
  }
  
  // 使用内存存储(本地开发或Redis错误时)
  memoryStore.set(key, {
    value: code,
    expires: Date.now() + ttl * 1000
  });
  console.log(`[Memory] 验证码已保存: ${email} -> ${code}, 有效期${ttl}秒`);
  return true;
}

/**
 * 获取验证码
 * @param email 邮箱地址
 */
export async function getCode(email: string) {
  const key = `vcode:${email.toLowerCase().trim()}`;
  
  try {
    if (redis) {
      const code = await redis.get<string>(key);
      console.log(`[Upstash] 获取验证码: ${email} -> ${code}`);
      return code;
    }
  } catch (error) {
    console.error(`[Upstash] 获取验证码错误:`, error);
  }
  
  // 从内存获取
  const item = memoryStore.get(key);
  if (!item) {
    console.log(`[Memory] 验证码不存在: ${email}`);
    return null;
  }
  
  // 检查是否过期
  if (item.expires < Date.now()) {
    console.log(`[Memory] 验证码已过期: ${email}`);
    memoryStore.delete(key);
    return null;
  }
  
  console.log(`[Memory] 获取验证码: ${email} -> ${item.value}`);
  return item.value;
}

/**
 * 删除验证码
 * @param email 邮箱地址
 */
export async function deleteCode(email: string) {
  const key = `vcode:${email.toLowerCase().trim()}`;
  
  try {
    if (redis) {
      await redis.del(key);
      console.log(`[Upstash] 验证码已删除: ${email}`);
    }
  } catch (error) {
    console.error(`[Upstash] 删除验证码错误:`, error);
  }
  
  memoryStore.delete(key);
  console.log(`[Memory] 验证码已删除: ${email}`);
  return true;
}

/**
 * 检查验证码
 * @param email 邮箱地址
 * @param code 验证码
 * @returns 验证结果(true/false)
 */
export async function checkCode(email: string, code: string) {
  const storedCode = await getCode(email);
  
  if (!storedCode) {
    console.log(`[验证] 验证码不存在: ${email}`);
    return false;
  }
  
  // 确保字符串比较，防止前导零问题
  const isValid = String(storedCode) === String(code);
  
  if (isValid) {
    // 验证成功后删除验证码(一次性使用)
    await deleteCode(email);
    console.log(`[验证] 验证成功: ${email}`);
  } else {
    console.log(`[验证] 验证失败: ${email}, 期望=${storedCode}, 实际=${code}`);
  }
  
  return isValid;
}

/**
 * 检查发送频率限制
 * @param email 邮箱地址
 * @param limitSeconds 限制时间(秒)
 */
export async function checkRateLimit(email: string, limitSeconds = 60) {
  const key = `limit:${email.toLowerCase().trim()}`;
  const now = Date.now();
  
  try {
    if (redis) {
      const lastSent = await redis.get<number>(key);
      if (lastSent) {
        const elapsed = Math.floor((now - lastSent) / 1000);
        if (elapsed < limitSeconds) {
          return {
            allowed: false,
            remainingTime: limitSeconds - elapsed
          };
        }
      }
      
      await redis.set(key, now, { ex: limitSeconds });
      return { allowed: true };
    }
  } catch (error) {
    console.error(`[Upstash] 检查频率限制错误:`, error);
  }
  
  // 使用内存存储
  const item = memoryStore.get(key);
  if (item && item.expires > now) {
    const elapsed = Math.floor((now - parseInt(String(item.value))) / 1000);
    if (elapsed < limitSeconds) {
      return {
        allowed: false,
        remainingTime: limitSeconds - elapsed
      };
    }
  }
  
  // 更新最后发送时间
  memoryStore.set(key, {
    value: now,
    expires: now + limitSeconds * 1000
  });
  
  return { allowed: true };
}

/**
 * 获取所有验证码(仅开发使用)
 */
export function getAllCodes() {
  if (process.env.NODE_ENV === 'production') {
    return { warning: '生产环境不可用' };
  }
  
  const result: Record<string, any> = {};
  const now = Date.now();
  
  memoryStore.forEach((data, key) => {
    if (key.startsWith('vcode:')) {
      const email = key.substring(6);
      result[email] = {
        code: data.value,
        expires: new Date(data.expires).toISOString(),
        expiresIn: Math.ceil((data.expires - now) / 1000),
        isExpired: now > data.expires
      };
    }
  });
  
  return {
    storage: redis ? 'Upstash Redis' : 'Memory',
    codes: result
  };
} 