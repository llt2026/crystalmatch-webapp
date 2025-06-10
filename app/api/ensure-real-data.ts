/**
 * 确保使用真实数据的辅助函数
 * 在应用的任何地方都可以引入使用
 */

// 强制设置为不使用模拟数据，忽略环境变量
export function useRealData(): boolean {
  return true;
}

// 检查OpenAI API key是否设置
export function isOpenAIConfigured(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!apiKey && apiKey.trim() !== '';
}

// 获取OpenAI API key
export function getOpenAIApiKey(): string {
  return process.env.OPENAI_API_KEY || '';
}

// 检查是否配置了数据库
export function isDatabaseConfigured(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  return !!dbUrl && dbUrl.trim() !== '';
}

// 检查是否处于生产环境
export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
} 