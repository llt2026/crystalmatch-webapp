/**
 * 2025新模型能量计算测试脚本
 */

import { 
  getBaseBaziVector, 
  calculateMonthEnergy, 
  calculateDayEnergy, 
  calculateHourEnergy,
  calculateEnergyCalendar 
} from '../lib/energyCalculation2025';

async function testEnergyCalculation() {
  console.log('===== 2025新模型能量计算测试 =====');
  
  // 示例出生日期
  const birthDate = '1990-10-05';
  console.log(`测试出生日期: ${birthDate}`);
  
  // 计算基础八字五行向量
  const baseBazi = getBaseBaziVector(birthDate);
  console.log('基础八字五行向量:', baseBazi);
  
  // 测试日期
  const testDate = new Date();
  testDate.setHours(12, 0, 0, 0);
  console.log(`测试日期: ${testDate.toLocaleDateString()}`);
  
  // 计算月能量
  console.log('\n===== 月能量 =====');
  const monthEnergy = calculateMonthEnergy(baseBazi, testDate);
  console.log('月能量向量:', monthEnergy.vector);
  console.log('月能量分数:', monthEnergy.score);
  console.log('月能量变化:', monthEnergy.diff);
  
  // 计算日能量
  console.log('\n===== 日能量 =====');
  const dayEnergy = calculateDayEnergy(baseBazi, testDate);
  console.log('日能量向量:', dayEnergy.vector);
  console.log('日能量分数:', dayEnergy.score);
  console.log('日能量变化:', dayEnergy.diff);
  
  // 计算小时能量 (当前时间)
  const now = new Date();
  console.log(`\n===== 小时能量 (${now.getHours()}:00) =====`);
  const hourEnergy = calculateHourEnergy(baseBazi, now);
  console.log('小时能量向量:', hourEnergy.vector);
  console.log('小时能量分数:', hourEnergy.score);
  console.log('小时能量变化:', hourEnergy.diff);
  
  // 测试24小时变化
  console.log('\n===== 24小时能量变化 =====');
  for (let hour = 0; hour < 24; hour += 3) {
    const hourDate = new Date(testDate);
    hourDate.setHours(hour, 0, 0, 0);
    const hourlyEnergy = calculateHourEnergy(baseBazi, hourDate);
    console.log(`${hour}:00 - 能量变化: ${hourlyEnergy.diff.toFixed(2)}`);
  }
  
  // 测试能量日历
  console.log('\n===== 能量日历 =====');
  try {
    const calendar = await calculateEnergyCalendar(birthDate);
    console.log(`获取了 ${calendar.length} 个节气段的能量变化`);
    calendar.forEach((item, index) => {
      console.log(`${index + 1}. ${item.month}: 能量变化 ${item.energyChange}, 趋势 ${item.trend}, 水晶 ${item.crystal}`);
    });
  } catch (err) {
    console.error('计算能量日历失败:', err);
  }
}

// 运行测试
testEnergyCalculation().catch(err => {
  console.error('测试过程中出错:', err);
}); 