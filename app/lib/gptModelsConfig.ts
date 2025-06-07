/**
 * GPT模型配置文件
 * 定义不同部分使用的模型和相关参数
 */

// 模型类型定义
export type ModelType = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o';

// 模型配置接口
export interface ModelConfig {
  model: ModelType;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// 不同部分的模型配置
export const modelConfigs: Record<string, ModelConfig> = {
  // 年度报告
  'yearlyReport': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: 'You are an expert astrologer specializing in Chinese metaphysics and energy analysis.'
  },
  
  // 月度报告 (Pro)
  'monthlyReportPro': {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 3000,
    systemPrompt: 'You are an expert energy analyst specializing in monthly energy patterns and predictions.'
  },
  
  // 月度报告 (Plus)
  'monthlyReportPlus': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are an energy forecaster specializing in monthly trends and personalized guidance.'
  },
  
  // 日能量分析
  'dailyEnergyAnalysis': {
    model: 'gpt-4-turbo',
    temperature: 0.6,
    maxTokens: 1500,
    systemPrompt: 'You are a daily energy advisor providing personalized insights based on energy calculations.'
  },
  
  // 小时能量洞察
  'hourlyEnergyInsights': {
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 1000,
    systemPrompt: 'You are an hourly energy expert providing short, practical tips based on energy peaks and valleys.'
  },
  
  // 默认配置
  'default': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are an energy advisor providing insights based on five elements theory.'
  }
};

// 获取特定部分的模型配置
export function getModelConfig(section: string): ModelConfig {
  return modelConfigs[section] || modelConfigs.default;
} 