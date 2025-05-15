"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDB = connectDB;
exports.checkDBConnection = checkDBConnection;
exports.withTransaction = withTransaction;
const client_1 = require("@prisma/client");
const db_config_1 = require("./db.config");
// 日志级别配置
const LOG_LEVELS = {
    info: ['info', 'warn', 'error'],
    warn: ['warn', 'error'],
    error: ['error'],
    query: ['query', 'info', 'warn', 'error'],
    debug: ['query', 'info', 'warn', 'error']
};
// 确保有可用的数据库URL
const databaseUrl = (0, db_config_1.getDatabaseUrl)();
const dbOptions = (0, db_config_1.getDbConnectionOptions)();
const logLevel = (0, db_config_1.getLogLevel)();
// 配置Prisma日志级别
const prismaLogLevels = LOG_LEVELS[logLevel] || LOG_LEVELS.info;
// 初始化Prisma客户端
exports.prisma = global.prisma || new client_1.PrismaClient({
    log: prismaLogLevels.map(level => level),
    datasources: {
        db: {
            url: databaseUrl
        }
    },
    // 配置连接池
    // @ts-ignore - Prisma类型定义可能不包含以下自定义参数
    __internal: {
        engine: {
            connectionLimit: dbOptions.maxPoolSize
        }
    }
});
// 在开发环境中保存Prisma实例到全局对象
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
/**
 * 连接数据库并执行函数
 * 这个方法可以用来包装数据库操作，确保连接正常
 * @param callback 执行的回调函数
 * @returns 回调函数的结果
 */
async function connectDB(callback) {
    const startTime = Date.now();
    try {
        // 执行数据库操作
        const result = await callback(exports.prisma);
        // 记录操作时间（仅在开发环境或日志级别为debug时）
        if (process.env.NODE_ENV !== 'production' || logLevel === 'debug') {
            const duration = Date.now() - startTime;
            console.log(`数据库操作完成，耗时: ${duration}ms`);
        }
        return result;
    }
    catch (error) {
        // 记录错误
        const duration = Date.now() - startTime;
        console.error(`数据库操作失败，耗时: ${duration}ms`, error);
        // 根据错误类型处理
        if (error instanceof Error) {
            // 检查是否是连接错误
            if (error.message.includes('Connection') || error.message.includes('connect')) {
                console.error('数据库连接错误，尝试重新连接...');
                // 可以在这里添加重连逻辑
            }
        }
        throw error;
    }
}
/**
 * 健康检查函数，验证数据库连接是否正常
 * @returns 连接状态和响应时间
 */
async function checkDBConnection() {
    const startTime = Date.now();
    try {
        // 执行一个简单查询来测试连接
        await exports.prisma.$queryRaw `SELECT 1`;
        const responseTime = Date.now() - startTime;
        return { isConnected: true, responseTime };
    }
    catch (error) {
        console.error('数据库连接失败:', error);
        return { isConnected: false };
    }
}
/**
 * 创建数据库事务
 * @param callback 在事务中执行的回调函数
 * @returns 事务执行结果
 */
async function withTransaction(callback) {
    return await exports.prisma.$transaction(async (tx) => {
        return await callback(tx);
    });
}
