/**
 * GPT服务层
 * 处理不同部分的GPT调用
 */

import { getModelConfig, ModelConfig } from './gptModelsConfig';

// GPT请求参数接口
export interface GptRequestParams {
  section: string;
  prompt: string;
  userContext?: any;
  overrideConfig?: Partial<ModelConfig>;
}

// GPT响应接口
export interface GptResponse {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * 获取API基础URL
 */
function getApiBaseUrl(): string {
  // 在服务器端环境中，需要使用完整的URL
  if (typeof window === 'undefined') {
    // 服务器端
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
  }
  // 客户端
  return '';
}

/**
 * 调用GPT模型生成内容
 * @param params 请求参数
 * @returns GPT响应
 */
export async function generateGptContent(params: GptRequestParams): Promise<GptResponse> {
  const { section, prompt, userContext, overrideConfig } = params;
  
  // 获取模型配置
  const baseConfig = getModelConfig(section);
  
  // 合并配置
  const config = {
    ...baseConfig,
    ...overrideConfig
  };
  
  // 准备请求数据
  const requestData = {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    messages: [
      { role: 'system', content: config.systemPrompt || '' },
      { role: 'user', content: prompt }
    ],
    user: userContext?.userId || 'anonymous'
  };
  
  try {
    // 构建完整的API URL
    const baseUrl = getApiBaseUrl();
    const apiUrl = `${baseUrl}/api/gpt-models/generate`;
    
    console.log('Calling GPT API:', apiUrl);
    
    // 调用API端点
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate content');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error generating GPT content:', error);
    throw error;
  }
}

/**
 * 生成年度报告内容
 * @param birthDate 出生日期
 * @param userContext 用户上下文
 * @returns 报告内容
 */
export async function generateYearlyReport(birthDate: string, userContext: any): Promise<string> {
  const prompt = `Generate a comprehensive yearly energy report for a person born on ${birthDate}.
  Include analysis of their base energy, yearly trends, and personalized advice.`;
  
  const response = await generateGptContent({
    section: 'yearlyReport',
    prompt,
    userContext
  });
  
  return response.content;
}

/**
 * 生成月度报告内容 (Pro版)
 * @param birthDate 出生日期
 * @param month 月份
 * @param userContext 用户上下文
 * @returns 报告内容
 */
export async function generateMonthlyReportPro(
  birthDate: string,
  month: string,
  userContext: any
): Promise<string> {
  const prompt = `Generate a detailed PRO monthly energy report for ${month} for a person born on ${birthDate}.
  Include daily energy analysis, peak times, and comprehensive personalized strategies.`;
  
  const response = await generateGptContent({
    section: 'monthlyReportPro',
    prompt,
    userContext
  });
  
  return response.content;
}

/**
 * 生成月度报告内容 (Plus版)
 * @param birthDate 出生日期
 * @param month 月份
 * @param userContext 用户上下文
 * @returns 报告内容
 */
export async function generateMonthlyReportPlus(
  birthDate: string,
  month: string,
  userContext: any
): Promise<string> {
  const prompt = `Generate a monthly energy report for ${month} for a person born on ${birthDate}.
  Include weekly highlights and practical advice for navigating the month's energy patterns.`;
  
  const response = await generateGptContent({
    section: 'monthlyReportPlus',
    prompt,
    userContext
  });
  
  return response.content;
}

/**
 * 生成日能量分析
 * @param birthDate 出生日期
 * @param date 日期
 * @param userContext 用户上下文
 * @returns 分析内容
 */
export async function generateDailyAnalysis(
  birthDate: string,
  date: string,
  userContext: any
): Promise<string> {
  const prompt = `Generate a daily energy analysis for ${date} for a person born on ${birthDate}.
  Include hourly guidance and specific recommendations.`;
  
  const response = await generateGptContent({
    section: 'dailyEnergyAnalysis',
    prompt,
    userContext
  });
  
  return response.content;
} 