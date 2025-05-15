"use strict";
/**
 * 数据库配置
 * 为应用提供数据库连接信息
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = void 0;
exports.getDatabaseUrl = getDatabaseUrl;
exports.getDbConnectionOptions = getDbConnectionOptions;
exports.getJwtSecret = getJwtSecret;
exports.getJwtExpiresIn = getJwtExpiresIn;
exports.getAppUrl = getAppUrl;
exports.getOpenAiApiKey = getOpenAiApiKey;
exports.getLogLevel = getLogLevel;
// MongoDB连接参数
exports.DB_CONFIG = {
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
function getDatabaseUrl() {
    return exports.DB_CONFIG.DATABASE_URL;
}
/**
 * 获取数据库连接选项
 * @returns 数据库连接选项对象
 */
function getDbConnectionOptions() {
    return {
        maxPoolSize: exports.DB_CONFIG.MAX_POOL_SIZE,
        minPoolSize: exports.DB_CONFIG.MIN_POOL_SIZE,
        maxIdleTimeMS: exports.DB_CONFIG.MAX_IDLE_TIME_MS,
        retryWrites: exports.DB_CONFIG.RETRY_WRITES,
        retryReads: exports.DB_CONFIG.RETRY_READS
    };
}
/**
 * 获取JWT密钥
 * @returns JWT密钥
 */
function getJwtSecret() {
    return exports.DB_CONFIG.JWT_SECRET;
}
/**
 * 获取JWT过期时间
 * @returns JWT过期时间
 */
function getJwtExpiresIn() {
    return exports.DB_CONFIG.JWT_EXPIRES_IN;
}
/**
 * 获取应用URL
 * @returns 应用URL
 */
function getAppUrl() {
    return exports.DB_CONFIG.APP_URL;
}
/**
 * 获取OpenAI API密钥
 * @returns OpenAI API密钥
 */
function getOpenAiApiKey() {
    return exports.DB_CONFIG.OPENAI_API_KEY;
}
/**
 * 获取日志级别
 * @returns 日志级别
 */
function getLogLevel() {
    return exports.DB_CONFIG.LOG_LEVEL;
}
