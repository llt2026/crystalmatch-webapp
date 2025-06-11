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

// Energy calculation configuration constants
export const ENERGY_CONFIG = {
  // Thresholds for energy calculations
  HOUR_THRESHOLD: 80,           // Minimum score for high-energy hours
  ELEMENT_THRESHOLD: 1.2,       // Threshold for element deficiency
  
  // UI display settings
  MAX_PEAK_DAYS: 3,            // Number of peak energy days to show
  MAX_LOW_DAYS: 2,             // Number of low energy days to show
  MAX_HIGH_ENERGY_HOURS: 3,    // Number of high-energy hours to display
  
  // Element-based activity suggestions
  ELEMENT_ACTIVITIES: {
    'fire': ['presentations', 'networking', 'creative sessions'],
    'water': ['strategic planning', 'negotiations', 'deep work'],
    'earth': ['project management', 'team building', 'documentation'],
    'metal': ['contracts', 'analysis', 'organizing'],
    'wood': ['brainstorming', 'innovation', 'growth planning']
  } as const,
  
  // Exercise recommendations by element
  ELEMENT_EXERCISES: {
    'fire': 'cardio exercise',
    'water': 'meditation/yoga',
    'earth': 'strength training',
    'metal': 'breathing exercises',
    'wood': 'flexibility/stretching'
  } as const,
  
  // Challenge activities by element
  ELEMENT_CHALLENGES: {
    'wood': { activity: 'Write 200 words daily', description: 'creativity guidance' },
    'metal': { activity: 'Organize for 20 mins daily', description: 'clarity guidance' },
    'fire': { activity: 'Express gratitude daily', description: 'passion guidance' },
    'water': { activity: 'Meditate for 15 mins daily', description: 'flow guidance' },
    'earth': { activity: 'Ground yourself outdoors', description: 'stability guidance' }
  } as const,

  // Week days configuration for UI display
  WEEK_DAYS: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const
} as const;

export type ElementType = 'water' | 'fire' | 'earth' | 'metal' | 'wood'; 