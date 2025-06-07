/**
 * 能量计算服务层
 * 根据配置调用不同的计算方法
 */

import { getScenarioConfig } from './energyCalculationConfig';
import { FiveElementVector, calculateMonthEnergy as originalMonthEnergy, 
         calculateDayEnergy as originalDayEnergy,
         calculateHourEnergy as originalHourEnergy } from './energyCalculation2025';
import { DiZhi, TianGan } from './diZhiHiddenGan';

// 计算月能量
export function calculateMonthEnergy(
  scenario: string,
  baseBazi: FiveElementVector, 
  date: Date
): { vector: FiveElementVector, score: number, diff: number } {
  const config = getScenarioConfig(scenario);
  
  switch(config.monthEnergy) {
    case 'original':
      return originalMonthEnergy(baseBazi, date);
    case 'model_a':
      // 未来可实现其他模型调用
      console.log('Model A not implemented yet, falling back to original');
      return originalMonthEnergy(baseBazi, date);
    default:
      return originalMonthEnergy(baseBazi, date);
  }
}

// 计算日能量
export function calculateDayEnergy(
  scenario: string,
  baseBazi: FiveElementVector, 
  date: Date
): { vector: FiveElementVector, score: number, diff: number } {
  const config = getScenarioConfig(scenario);
  
  switch(config.dayEnergy) {
    case 'original':
      return originalDayEnergy(baseBazi, date);
    case 'model_b':
      // 未来可实现其他模型调用
      console.log('Model B not implemented yet, falling back to original');
      return originalDayEnergy(baseBazi, date);
    default:
      return originalDayEnergy(baseBazi, date);
  }
}

// 计算小时能量
export function calculateHourEnergy(
  scenario: string,
  baseBazi: FiveElementVector, 
  date: Date
): { vector: FiveElementVector, score: number, diff: number } {
  const config = getScenarioConfig(scenario);
  
  switch(config.hourEnergy) {
    case 'original':
      return originalHourEnergy(baseBazi, date);
    case 'model_c':
      // 未来可实现其他模型调用
      console.log('Model C not implemented yet, falling back to original');
      return originalHourEnergy(baseBazi, date);
    default:
      return originalHourEnergy(baseBazi, date);
  }
}

// 获取指定日期范围内的每日能量变化
export async function getDailyEnergyForRange(
  scenario: string,
  birthDate: string, 
  startDate: Date, 
  days: number
): Promise<Array<{date: Date, energyChange: number, trend: 'up' | 'down' | 'stable'}>> {
  // 暂时直接调用原始方法，未来可根据配置调用不同实现
  const { getDailyEnergyForRange: originalDailyRange } = await import('./energyCalculation2025');
  return originalDailyRange(birthDate, startDate, days);
}

// 获取指定日期的24小时能量热力图数据
export async function getHourlyEnergyHeatmap(
  scenario: string,
  birthDate: string,
  date: Date
): Promise<Array<{hour: number, energyChange: number, trend: 'up' | 'down' | 'stable'}>> {
  // 暂时直接调用原始方法，未来可根据配置调用不同实现
  const { getHourlyEnergyHeatmap: originalHourlyHeatmap } = await import('./energyCalculation2025');
  return originalHourlyHeatmap(birthDate, date);
} 