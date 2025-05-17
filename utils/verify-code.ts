import { redis } from './redis';

// 使用全局Map存储验证码，确保在开发环境热重载时不丢失数据
// @ts-ignore
const LOCAL_MAP = globalThis.__CODE_CACHE__ || (globalThis.__CODE_CACHE__ = new Map<string, { code: string; expires: number }>());
const TTL = 600; // 秒

export async function saveCode(email: string, code: string) {
  // 标准化email地址（转为小写）
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    if (redis) {
      await redis.set(`vcode:${normalizedEmail}`, code, { ex: TTL });
      console.log(`[Redis] Verification code saved for ${normalizedEmail}, expires in ${TTL} seconds, code: ${code}`);
    } else {
      LOCAL_MAP.set(normalizedEmail, { code, expires: Date.now() + TTL * 1000 });
      console.log(`[Memory] Verification code saved for ${normalizedEmail}, expires in ${TTL} seconds, code: ${code}`);
      
      // 调试用：打印当前内存中的所有验证码
      console.log('[Memory] Current codes in memory:');
      LOCAL_MAP.forEach((value: { code: string; expires: number }, key: string) => {
        console.log(`- ${key}: ${value.code}, expires in ${Math.ceil((value.expires - Date.now()) / 1000)} seconds`);
      });
    }
  } catch (error) {
    console.error('[验证码存储]发生错误:', error);
    // 出错时回退到内存存储
    LOCAL_MAP.set(normalizedEmail, { code, expires: Date.now() + TTL * 1000 });
    console.log(`[Memory-Fallback] Verification code saved after error: ${normalizedEmail}, code: ${code}`);
  }
}

export async function checkCode(email: string, code: string) {
  // 标准化email地址
  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    if (redis) {
      const storedCode = await redis.get<string>(`vcode:${normalizedEmail}`);
      const isValid = storedCode === code;
      
      // 成功验证后删除验证码（一次性使用）
      if (isValid) {
        await redis.del(`vcode:${normalizedEmail}`);
        console.log(`[Redis] Verification successful for ${normalizedEmail}, code deleted`);
      } else {
        console.log(`[Redis] Verification failed for ${normalizedEmail}: ${code} !== ${storedCode}`);
      }
      
      return isValid;
    }
  } catch (error) {
    console.error('[验证码检查]Redis操作出错:', error);
    // 如果Redis出错，回退到内存存储
    console.log(`[验证码检查]回退到内存存储检查: ${normalizedEmail}`);
  }
  
  // 内存存储逻辑（作为Redis的备份或SKIP_REDIS为true时使用）
  const record = LOCAL_MAP.get(normalizedEmail);
  
  if (!record) {
    console.log(`[Memory] Verification code for ${normalizedEmail} not found`);
    return false;
  }
  
  if (Date.now() >= record.expires) {
    console.log(`[Memory] Verification code for ${normalizedEmail} has expired`);
    LOCAL_MAP.delete(normalizedEmail);
    return false;
  }
  
  const isValid = record.code === code;
  
  if (isValid) {
    // 成功验证后删除验证码（一次性使用）
    LOCAL_MAP.delete(normalizedEmail);
    console.log(`[Memory] Verification successful for ${normalizedEmail}, code deleted`);
  } else {
    console.log(`[Memory] Verification code mismatch for ${normalizedEmail}: got ${code}, expected ${record.code}`);
  }
  
  return isValid;
}

// 调试用：获取所有存储在内存中的验证码
export function getAllLocalCodes() {
  const result: Record<string, any> = {};
  const now = Date.now();
  
  LOCAL_MAP.forEach((data: { code: string; expires: number }, email: string) => {
    result[email] = {
      code: data.code,
      expires: new Date(data.expires).toISOString(),
      expiresIn: Math.ceil((data.expires - now) / 1000),
      isExpired: now > data.expires
    };
  });
  
  return {
    total: LOCAL_MAP.size,
    codes: result
  };
} 