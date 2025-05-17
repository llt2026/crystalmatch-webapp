import { redis } from './redis';
import { getAllStoredCodes } from './redis-alternative';

// 全局内存存储只用于调试，现在主要依赖文件存储
// @ts-ignore
const LOCAL_MAP = globalThis.__CODE_CACHE__ || (globalThis.__CODE_CACHE__ = new Map<string, { code: string; expires: number }>());
const TTL = 600; // 秒

export async function saveCode(email: string, code: string) {
  // 标准化email地址（转为小写）
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = String(code); // 确保code是字符串
  
  try {
    console.log(`[SaveCode] 保存验证码: ${normalizedEmail} -> ${normalizedCode}`);
    
    if (redis) {
      // 直接使用redis客户端或本地文件存储
      await redis.set(`vcode:${normalizedEmail}`, normalizedCode, { ex: TTL });
      console.log(`[Storage] 验证码存储成功: ${normalizedEmail}, 过期时间: ${TTL}秒`);
      
      // 验证存储是否成功
      try {
        const storedCode = await redis.get(`vcode:${normalizedEmail}`);
        console.log(`[Storage] 验证存储: ${normalizedEmail}, 期望=${normalizedCode}, 实际=${storedCode}, 匹配=${storedCode === normalizedCode}`);
      } catch (verifyError) {
        console.error('[Storage] 验证存储失败:', verifyError);
      }
    } else {
      // 兜底情况，使用内存存储 (不应该发生)
      console.warn('[SaveCode] Redis为null, 使用内存存储 (这不应该发生)');
      LOCAL_MAP.set(normalizedEmail, { code: normalizedCode, expires: Date.now() + TTL * 1000 });
    }
  } catch (error) {
    console.error('[SaveCode] 发生错误:', error);
    // 出错时回退到内存存储
    LOCAL_MAP.set(normalizedEmail, { code: normalizedCode, expires: Date.now() + TTL * 1000 });
    console.log(`[Memory-Fallback] 验证码存储到内存: ${normalizedEmail} -> ${normalizedCode}`);
  }
}

export async function checkCode(email: string, code: string) {
  // 标准化email地址和验证码
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = String(code); // 确保code是字符串
  
  console.log(`[CheckCode] 验证码检查: ${normalizedEmail}, code=${normalizedCode}, type=${typeof normalizedCode}`);
  
  try {
    if (redis) {
      // 使用redis客户端或本地文件存储
      const storedCode = await redis.get(`vcode:${normalizedEmail}`);
      
      console.log(`[CheckCode] 存储的验证码: ${storedCode}, 类型: ${typeof storedCode}`);
      console.log(`[CheckCode] 输入的验证码: ${normalizedCode}, 类型: ${typeof normalizedCode}`);
      
      // 确保字符串比较
      const isValid = String(storedCode) === String(normalizedCode);
      
      // 成功验证后删除验证码（一次性使用）
      if (isValid) {
        await redis.del(`vcode:${normalizedEmail}`);
        console.log(`[Storage] 验证成功, 已删除验证码: ${normalizedEmail}`);
      } else {
        console.log(`[Storage] 验证失败: ${normalizedEmail}, 期望=${storedCode}, 实际=${normalizedCode}`);
      }
      
      return isValid;
    }
  } catch (error) {
    console.error('[CheckCode] 存储操作出错:', error);
    // 如果Redis出错，回退到内存存储
    console.log(`[CheckCode] 回退到内存存储检查: ${normalizedEmail}`);
  }
  
  // 内存存储逻辑 (不应该运行到这里)
  console.warn('[CheckCode] 回退到内存存储 (这不应该发生)');
  const record = LOCAL_MAP.get(normalizedEmail);
  
  if (!record) {
    console.log(`[Memory] 验证码不存在: ${normalizedEmail}`);
    return false;
  }
  
  if (Date.now() >= record.expires) {
    console.log(`[Memory] 验证码已过期: ${normalizedEmail}`);
    LOCAL_MAP.delete(normalizedEmail);
    return false;
  }
  
  // 确保字符串比较
  const isValid = String(record.code) === String(normalizedCode);
  
  if (isValid) {
    // 成功验证后删除验证码（一次性使用）
    LOCAL_MAP.delete(normalizedEmail);
    console.log(`[Memory] 验证成功, 已删除验证码: ${normalizedEmail}`);
  } else {
    console.log(`[Memory] 验证失败: ${normalizedEmail}, 期望=${record.code}, 实际=${normalizedCode}`);
  }
  
  return isValid;
}

// 调试用：获取所有存储的验证码
export function getAllLocalCodes() {
  // 本地内存中的验证码
  const memoryResult: Record<string, any> = {};
  const now = Date.now();
  
  LOCAL_MAP.forEach((data: { code: string; expires: number }, email: string) => {
    memoryResult[email] = {
      code: data.code,
      expires: new Date(data.expires).toISOString(),
      expiresIn: Math.ceil((data.expires - now) / 1000),
      isExpired: now > data.expires
    };
  });
  
  // 尝试从文件存储获取验证码
  let fileStoredCodes = {};
  try {
    fileStoredCodes = getAllStoredCodes();
  } catch (error) {
    console.error('获取文件存储的验证码失败:', error);
  }
  
  return {
    memory: {
      total: LOCAL_MAP.size,
      codes: memoryResult
    },
    fileStorage: fileStoredCodes
  };
} 