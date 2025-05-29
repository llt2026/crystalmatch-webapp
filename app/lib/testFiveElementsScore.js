// 手动导入要测试的函数
const { calculateElementsScore } = require('./fiveElementsScore');

// 手动实现calculateEnergyChange和determineTrend函数用于测试
function calculateEnergyChange(currentElements, baseElements) {
  const currentScore = calculateElementsScore(currentElements);
  const baseScore = calculateElementsScore(baseElements);
  const rawDiff = currentScore - baseScore;
  const scaledChange = Math.round(rawDiff / 4);
  return Math.max(-25, Math.min(25, scaledChange));
}

function determineTrend(energyChange) {
  if (energyChange >= 3) return 'up';
  if (energyChange <= -3) return 'down';
  return 'stable';
}

// 测试函数
function runTests() {
  console.log('开始测试五行分数计算函数...');
  
  // 测试1: 完全均衡的情况 [1.6,1.6,1.6,1.6,1.6]
  const perfectBalance = [1.6, 1.6, 1.6, 1.6, 1.6];
  const score1 = calculateElementsScore(perfectBalance);
  console.log(`测试1 - 完全均衡 [1.6,1.6,1.6,1.6,1.6]:`);
  console.log(`  期望分数: 100`);
  console.log(`  实际分数: ${score1.toFixed(2)}`);
  console.log(`  通过: ${Math.abs(score1 - 100) < 0.01 ? '✅' : '❌'}`);

  // 测试2: 示例数据 [2,1.5,1.6,1.7,1.2]
  const example = [2, 1.5, 1.6, 1.7, 1.2];
  const score2 = calculateElementsScore(example);
  console.log(`测试2 - 示例数据 [2,1.5,1.6,1.7,1.2]:`);
  console.log(`  期望分数: 约92.19`);
  console.log(`  实际分数: ${score2.toFixed(2)}`);
  console.log(`  通过: ${Math.abs(score2 - 92.19) < 0.1 ? '✅' : '❌'}`);

  // 测试3: 极端不均衡 [8,0,0,0,0]
  const extreme = [8, 0, 0, 0, 0];
  const score3 = calculateElementsScore(extreme);
  console.log(`测试3 - 极端不均衡 [8,0,0,0,0]:`);
  console.log(`  期望分数: 0`);
  console.log(`  实际分数: ${score3.toFixed(2)}`);
  console.log(`  通过: ${Math.abs(score3) < 0.01 ? '✅' : '❌'}`);

  // 测试4: 使用对象形式
  const objectForm = {
    wood: 2,
    fire: 1.5,
    earth: 1.6,
    metal: 1.7,
    water: 1.2
  };
  const score4 = calculateElementsScore(objectForm);
  console.log(`测试4 - 对象形式输入:`);
  console.log(`  期望分数: 约92.19 (与测试2相同)`);
  console.log(`  实际分数: ${score4.toFixed(2)}`);
  console.log(`  通过: ${Math.abs(score4 - score2) < 0.01 ? '✅' : '❌'}`);

  // 测试5: 能量变化计算
  const base = {
    wood: 1.6,
    fire: 1.6,
    earth: 1.6,
    metal: 1.6,
    water: 1.6
  }; // 完全均衡

  const current = {
    wood: 2.5,
    fire: 3.0,
    earth: 1.0,
    metal: 1.0,
    water: 0.5
  }; // 不均衡
  
  const baseScore = calculateElementsScore(base);
  const currentScore = calculateElementsScore(current);
  const energyChange = calculateEnergyChange(current, base);
  const trend = determineTrend(energyChange);

  console.log(`测试5 - 能量变化计算:`);
  console.log(`  基础分数: ${baseScore.toFixed(2)}`);
  console.log(`  当前分数: ${currentScore.toFixed(2)}`);
  console.log(`  原始差异: ${(currentScore - baseScore).toFixed(2)}`);
  console.log(`  能量变化值: ${energyChange}`);
  console.log(`  趋势: ${trend}`);
  
  // 总结
  console.log('\n测试总结:');
  console.log('='.repeat(40));
  console.log(`  • 均衡测试: ${Math.abs(score1 - 100) < 0.01 ? '通过' : '失败'}`);
  console.log(`  • 示例数据测试: ${Math.abs(score2 - 92.19) < 0.1 ? '通过' : '失败'}`);
  console.log(`  • 极端情况测试: ${Math.abs(score3) < 0.01 ? '通过' : '失败'}`);
  console.log(`  • 对象输入测试: ${Math.abs(score4 - score2) < 0.01 ? '通过' : '失败'}`);
  console.log('='.repeat(40));
}

// 运行测试
console.log('\n---------- 五行分数计算函数测试 ----------\n');
runTests();
console.log('\n----------      测试结束      ----------\n'); 