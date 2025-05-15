/**
 * 数据库配置
 * 为应用提供数据库连接信息
 */

// MongoDB连接参数
export const DB_CONFIG = {
  // MongoDB连接字符串
  DATABASE_URL: process.env.DATABASE_URL || "mongodb://localhost:27017/crystalmatch",
  
  // 连接池配置
  MAX_POOL_SIZE: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "10"),
  MIN_POOL_SIZE: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5"),
  MAX_IDLE_TIME_MS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || "30000"),
  
  // 重试配置
  RETRY_WRITES: true,
  RETRY_READS: true,
  
  // JWT密钥
  JWT_SECRET: process.env.JWT_SECRET || "crystalmatch-secure-jwt-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // 应用URL
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // OpenAI API密钥
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "mock-key-for-development",
  
  // 日志级别
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
};

/**
 * 获取数据库连接URL
 * @returns 数据库连接URL
 */
export function getDatabaseUrl(): string {
  return DB_CONFIG.DATABASE_URL;
}

/**
 * 获取数据库连接选项
 * @returns 数据库连接选项对象
 */
export function getDbConnectionOptions() {
  return {
    maxPoolSize: DB_CONFIG.MAX_POOL_SIZE,
    minPoolSize: DB_CONFIG.MIN_POOL_SIZE,
    maxIdleTimeMS: DB_CONFIG.MAX_IDLE_TIME_MS,
    retryWrites: DB_CONFIG.RETRY_WRITES,
    retryReads: DB_CONFIG.RETRY_READS
  };
}

/**
 * 获取JWT密钥
 * @returns JWT密钥
 */
export function getJwtSecret(): string {
  return DB_CONFIG.JWT_SECRET;
}

/**
 * 获取JWT过期时间
 * @returns JWT过期时间
 */
export function getJwtExpiresIn(): string {
  return DB_CONFIG.JWT_EXPIRES_IN;
}

/**
 * 获取应用URL
 * @returns 应用URL
 */
export function getAppUrl(): string {
  return DB_CONFIG.APP_URL;
}

/**
 * 获取OpenAI API密钥
 * @returns OpenAI API密钥
 */
export function getOpenAiApiKey(): string {
  return DB_CONFIG.OPENAI_API_KEY;
}

/**
 * 获取日志级别
 * @returns 日志级别
 */
export function getLogLevel(): string {
  return DB_CONFIG.LOG_LEVEL;
} 