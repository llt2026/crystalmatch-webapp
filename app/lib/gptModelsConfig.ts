/**
 * GPT model configuration file
 * Defines models and related parameters for different sections
 * Updated for Vercel deployment testing
 */

// Model type definition
export type ModelType = 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o';

// Model configuration interface
export interface ModelConfig {
  model: ModelType;
  temperature: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Model configurations for different sections
export const modelConfigs: Record<string, ModelConfig> = {
  // Annual report
  'yearlyReport': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: 'You are an expert astrologer specializing in Chinese metaphysics and energy analysis.'
  },
  
  // Monthly report (Pro)
  'monthlyReportPro': {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 3000,
    systemPrompt: 'You are an expert English-speaking energy analyst for US customers. Always respond in English only. You specialize in monthly energy patterns and predictions.'
  },
  
  // Monthly report (Plus)
  'monthlyReportPlus': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are an energy forecaster specializing in monthly trends and personalized guidance.'
  },
  
  // Daily energy analysis
  'dailyEnergyAnalysis': {
    model: 'gpt-4-turbo',
    temperature: 0.6,
    maxTokens: 1500,
    systemPrompt: 'You are a daily energy advisor providing personalized insights based on energy calculations.'
  },
  
  // Hourly energy insights
  'hourlyEnergyInsights': {
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    maxTokens: 1000,
    systemPrompt: 'You are an hourly energy expert providing short, practical tips based on energy peaks and valleys.'
  },
  
  // Default configuration
  'default': {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are an energy advisor providing insights based on five elements theory.'
  }
};

// Get model configuration for specific section
export function getModelConfig(section: string): ModelConfig {
  return modelConfigs[section] || modelConfigs.default;
} 