import { redis } from './redis';

const LOCAL_MAP = new Map<string, { code: string; expires: number }>();
const TTL = 600; // 秒

export async function saveCode(email: string, code: string) {
  // 标准化email地址（转为小写）
  const normalizedEmail = email.toLowerCase().trim();
  
  if (redis) {
    await redis.set(`vcode:${normalizedEmail}`, code, { ex: TTL });
    console.log(`[Redis] Verification code saved for ${normalizedEmail}, expires in ${TTL} seconds, code: ${code}`);
  } else {
    LOCAL_MAP.set(normalizedEmail, { code, expires: Date.now() + TTL * 1000 });
    console.log(`[Memory] Verification code saved for ${normalizedEmail}, expires in ${TTL} seconds, code: ${code}`);
    
    // 调试用：打印当前内存中的所有验证码
    console.log('[Memory] Current codes in memory:');
    LOCAL_MAP.forEach((value, key) => {
      console.log(`- ${key}: ${value.code}, expires in ${Math.ceil((value.expires - Date.now()) / 1000)} seconds`);
    });
  }
}

export async function checkCode(email: string, code: string) {
  // 标准化email地址
  const normalizedEmail = email.toLowerCase().trim();
  
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
  
  LOCAL_MAP.forEach((data, email) => {
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