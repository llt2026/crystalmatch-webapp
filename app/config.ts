/**
 * 应用全局配置文件
 * 负责加载和验证环境变量
 */
import 'dotenv/config';

// 验证必需的环境变量
function validateEnv() {
  const requiredEnvVars = [
    'DATABASE_URL'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️ 缺少以下环境变量: ${missingEnvVars.join(', ')}`);
    if (missingEnvVars.includes('DATABASE_URL')) {
      console.error('❌ 无法连接数据库: 缺少 DATABASE_URL');
    }
  }
}

// 初始化配置
export function initConfig() {
  // 验证环境变量
  validateEnv();
  
  // 输出配置信息
  console.info(`🚀 应用已启动 - 环境: ${process.env.NODE_ENV || 'development'}`);
  console.info(`📊 数据库: PostgreSQL (Neon)`);
}

// 自动初始化
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  initConfig();
}

export default { 
  initConfig,
  validateEnv
}; 