/**
 * 能量计算配置管理模块
 * 定义不同场景下使用的能量计算模型
 */

export type CalculationModelType = 'original' | 'model_a' | 'model_b' | 'model_c';

export interface EnergyCalculationConfig {
  monthEnergy: CalculationModelType;
  dayEnergy: CalculationModelType;
  hourEnergy: CalculationModelType;
}

export const energyConfig: Record<string, EnergyCalculationConfig> = {
  // 年度报告2025使用原始实现
  'annualReport2025': {
    monthEnergy: 'original',
    dayEnergy: 'original',
    hourEnergy: 'original'
  },
  
  // 月度报告使用原始实现
  'monthlyReport': {
    monthEnergy: 'original',
    dayEnergy: 'original',
    hourEnergy: 'original'
  },
  
  // 日常预测可以使用不同模型
  'dailyForecast': {
    monthEnergy: 'original', // 暂时保持一致，未来可替换
    dayEnergy: 'original',
    hourEnergy: 'original'
  },
  
  // 默认配置
  'default': {
    monthEnergy: 'original',
    dayEnergy: 'original',
    hourEnergy: 'original'
  }
};

// 获取特定场景的配置
export function getScenarioConfig(scenario: string): EnergyCalculationConfig {
  return energyConfig[scenario] || energyConfig.default;
} 