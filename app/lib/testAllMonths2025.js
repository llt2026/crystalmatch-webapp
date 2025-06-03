/**
 * 2025年6-10月能量计算测试
 * 计算2025年6月至10月五个月的能量分数
 * 基础八字：木3、火2、土1、金1、水1
 */

// 基础八字五行向量
const baseVector = {
  wood: 3/8,   // 木 = 3
  fire: 2/8,   // 火 = 2
  earth: 1/8,  // 土 = 1
  metal: 1/8,  // 金 = 1
  water: 1/8   // 水 = 1
};

// 2025年是乙巳年
// 计算流年五行向量
function calculateYearVector() {
  // 乙 = 木
  const yearGanElements = { wood: 1.0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 巳 = 火(本气) + 藏干(丙火0.6 + 庚金0.3 + 戊土0.1)
  const yearZhiMainElement = { wood: 0, fire: 1.0, earth: 0, metal: 0, water: 0 };
  const yearZhiHiddenElements = { wood: 0, fire: 0.6, earth: 0.1, metal: 0.3, water: 0 };
  
  // 合并天干地支元素，按权重计算
  const yearVector = {
    wood: yearGanElements.wood * 0.5 + yearZhiMainElement.wood * 0.2 + yearZhiHiddenElements.wood * 0.3,
    fire: yearGanElements.fire * 0.5 + yearZhiMainElement.fire * 0.2 + yearZhiHiddenElements.fire * 0.3,
    earth: yearGanElements.earth * 0.5 + yearZhiMainElement.earth * 0.2 + yearZhiHiddenElements.earth * 0.3,
    metal: yearGanElements.metal * 0.5 + yearZhiMainElement.metal * 0.2 + yearZhiHiddenElements.metal * 0.3,
    water: yearGanElements.water * 0.5 + yearZhiMainElement.water * 0.2 + yearZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = yearVector.wood + yearVector.fire + yearVector.earth + yearVector.metal + yearVector.water;
  const normalizedVector = {
    wood: yearVector.wood / total,
    fire: yearVector.fire / total,
    earth: yearVector.earth / total,
    metal: yearVector.metal / total,
    water: yearVector.water / total
  };
  
  return normalizedVector;
}

// 计算6月庚午月的五行向量
function calculateJuneVector() {
  // 庚 = 金
  const monthGanElements = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  
  // 午 = 火(本气) + 藏干(丁火0.6 + 己土0.4)
  const monthZhiMainElement = { wood: 0, fire: 1.0, earth: 0, metal: 0, water: 0 };
  const monthZhiHiddenElements = { wood: 0, fire: 0.6, earth: 0.4, metal: 0, water: 0 };
  
  // 合并天干地支元素，按权重计算
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  return normalizedVector;
}

// 计算7月辛未月的五行向量
function calculateJulyVector() {
  // 辛 = 金
  const monthGanElements = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  
  // 未 = 土(本气) + 藏干(己土0.5 + 丁火0.3 + 乙木0.2)
  const monthZhiMainElement = { wood: 0, fire: 0, earth: 1.0, metal: 0, water: 0 };
  const monthZhiHiddenElements = { wood: 0.2, fire: 0.3, earth: 0.5, metal: 0, water: 0 };
  
  // 合并天干地支元素，按权重计算
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  return normalizedVector;
}

// 计算8月壬申月的五行向量
function calculateAugustVector() {
  // 壬 = 水
  const monthGanElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 1.0 };
  
  // 申 = 金(本气) + 藏干(庚金0.6 + 壬水0.3 + 戊土0.1)
  const monthZhiMainElement = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  const monthZhiHiddenElements = { wood: 0, fire: 0, earth: 0.1, metal: 0.6, water: 0.3 };
  
  // 合并天干地支元素，按权重计算
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  return normalizedVector;
}

// 计算9月癸酉月的五行向量
function calculateSeptemberVector() {
  // 癸 = 水
  const monthGanElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 1.0 };
  
  // 酉 = 金(本气) + 藏干(辛金100%)
  const monthZhiMainElement = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  const monthZhiHiddenElements = { wood: 0, fire: 0, earth: 0, metal: 1.0, water: 0 };
  
  // 合并天干地支元素，按权重计算
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  return normalizedVector;
}

// 计算10月甲戌月的五行向量
function calculateOctoberVector() {
  // 甲 = 木
  const monthGanElements = { wood: 1.0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 戌 = 土(本气) + 藏干(戊土0.6 + 辛金0.3 + 丁火0.1)
  const monthZhiMainElement = { wood: 0, fire: 0, earth: 1.0, metal: 0, water: 0 };
  const monthZhiHiddenElements = { wood: 0, fire: 0.1, earth: 0.6, metal: 0.3, water: 0 };
  
  // 合并天干地支元素，按权重计算
  const monthVector = {
    wood: monthGanElements.wood * 0.5 + monthZhiMainElement.wood * 0.2 + monthZhiHiddenElements.wood * 0.3,
    fire: monthGanElements.fire * 0.5 + monthZhiMainElement.fire * 0.2 + monthZhiHiddenElements.fire * 0.3,
    earth: monthGanElements.earth * 0.5 + monthZhiMainElement.earth * 0.2 + monthZhiHiddenElements.earth * 0.3,
    metal: monthGanElements.metal * 0.5 + monthZhiMainElement.metal * 0.2 + monthZhiHiddenElements.metal * 0.3,
    water: monthGanElements.water * 0.5 + monthZhiMainElement.water * 0.2 + monthZhiHiddenElements.water * 0.3
  };
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  return normalizedVector;
}

// 计算月能量分数
function calculateMonthEnergy(monthName, monthVector) {
  console.log(`===== 2025年${monthName}能量计算 =====`);
  
  // 流年五行向量 (乙巳)
  const yearVector = calculateYearVector();
  
  // 权重配置: 八字60% + 流年15% + 流月25%
  const combined = {
    wood: baseVector.wood * 0.6 + yearVector.wood * 0.15 + monthVector.wood * 0.25,
    fire: baseVector.fire * 0.6 + yearVector.fire * 0.15 + monthVector.fire * 0.25,
    earth: baseVector.earth * 0.6 + yearVector.earth * 0.15 + monthVector.earth * 0.25,
    metal: baseVector.metal * 0.6 + yearVector.metal * 0.15 + monthVector.metal * 0.25,
    water: baseVector.water * 0.6 + yearVector.water * 0.15 + monthVector.water * 0.25
  };
  
  // 缩放到总和为8
  const total = combined.wood + combined.fire + combined.earth + combined.metal + combined.water;
  const scaledVector = {
    wood: (combined.wood / total) * 8,
    fire: (combined.fire / total) * 8,
    earth: (combined.earth / total) * 8,
    metal: (combined.metal / total) * 8,
    water: (combined.water / total) * 8
  };
  
  // 计算偏差
  const ideal = 1.6; // 理想值 = 8 / 5
  const deviation = 
    Math.abs(scaledVector.wood - ideal) +
    Math.abs(scaledVector.fire - ideal) +
    Math.abs(scaledVector.earth - ideal) +
    Math.abs(scaledVector.metal - ideal) +
    Math.abs(scaledVector.water - ideal);
  
  // 计算分数
  const score = 100 - (deviation / 12.8 * 100);
  
  // 计算基础分数
  const baseScaledVector = {
    wood: baseVector.wood * 8,
    fire: baseVector.fire * 8,
    earth: baseVector.earth * 8,
    metal: baseVector.metal * 8,
    water: baseVector.water * 8
  };
  
  const baseDeviation = 
    Math.abs(baseScaledVector.wood - ideal) +
    Math.abs(baseScaledVector.fire - ideal) +
    Math.abs(baseScaledVector.earth - ideal) +
    Math.abs(baseScaledVector.metal - ideal) +
    Math.abs(baseScaledVector.water - ideal);
  
  const baseScore = 100 - (baseDeviation / 12.8 * 100);
  
  // 计算能量变化
  const energyChange = score - baseScore;
  
  console.log(`五行分布: 木=${scaledVector.wood.toFixed(2)}, 火=${scaledVector.fire.toFixed(2)}, 土=${scaledVector.earth.toFixed(2)}, 金=${scaledVector.metal.toFixed(2)}, 水=${scaledVector.water.toFixed(2)}`);
  console.log(`总偏差: ${deviation.toFixed(2)}`);
  console.log(`能量分数: ${score.toFixed(2)}`);
  console.log(`相比基础分数(${baseScore.toFixed(2)})的变化: ${energyChange > 0 ? '+' : ''}${energyChange.toFixed(2)}`);
  console.log('------------------------------');
  
  return { score, baseScore, energyChange };
}

// 执行测试
console.log('【2025年6-10月能量计算】');
console.log('基础八字五行: 木=3, 火=2, 土=1, 金=1, 水=1');
console.log('------------------------------');

// 存储每个月的结果
const monthlyResults = [];

// 计算6月庚午月能量
const juneVector = calculateJuneVector();
const juneResult = calculateMonthEnergy('6月庚午月', juneVector);
monthlyResults.push({ month: '6月庚午月', score: juneResult.score });

// 计算7月辛未月能量
const julyVector = calculateJulyVector();
const julyResult = calculateMonthEnergy('7月辛未月', julyVector);
monthlyResults.push({ month: '7月辛未月', score: julyResult.score });

// 计算8月壬申月能量
const augustVector = calculateAugustVector();
const augustResult = calculateMonthEnergy('8月壬申月', augustVector);
monthlyResults.push({ month: '8月壬申月', score: augustResult.score });

// 计算9月癸酉月能量
const septemberVector = calculateSeptemberVector();
const septemberResult = calculateMonthEnergy('9月癸酉月', septemberVector);
monthlyResults.push({ month: '9月癸酉月', score: septemberResult.score });

// 计算10月甲戌月能量
const octoberVector = calculateOctoberVector();
const octoberResult = calculateMonthEnergy('10月甲戌月', octoberVector);
monthlyResults.push({ month: '10月甲戌月', score: octoberResult.score });

// 计算环比变化
console.log('\n===== 月度能量环比变化 =====');
console.log('月份\t能量分数\t环比变化');
for (let i = 0; i < monthlyResults.length; i++) {
  const current = monthlyResults[i];
  
  if (i === 0) {
    console.log(`${current.month}\t${current.score.toFixed(2)}\t-`);
  } else {
    const previous = monthlyResults[i - 1];
    const change = current.score - previous.score;
    const percentage = (change / previous.score * 100).toFixed(2);
    const sign = change >= 0 ? '+' : '';
    console.log(`${current.month}\t${current.score.toFixed(2)}\t${sign}${percentage}%`);
  }
}
console.log('------------------------------'); 