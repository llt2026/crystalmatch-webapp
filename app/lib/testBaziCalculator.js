/**
 * 2025新模型能量计算测试脚本
 * 特别测试2025年6月庚午月的月能量计算
 */

// 我们需要手动设置基础八字五行向量来进行测试
const baseVector = {
  wood: 3/8,   // 木 = 3
  fire: 2/8,   // 火 = 2
  earth: 1/8,  // 土 = 1
  metal: 1/8,  // 金 = 1
  water: 1/8   // 水 = 1
};

// 2025年是乙巳年
const yearPillar = ['乙', '巳'];
// 6月是庚午月
const monthPillar = ['庚', '午'];

// 手动计算流年五行向量
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
  
  console.log('流年(乙巳)五行向量:', yearVector);
  
  // 标准化为总和为1
  const total = yearVector.wood + yearVector.fire + yearVector.earth + yearVector.metal + yearVector.water;
  const normalizedVector = {
    wood: yearVector.wood / total,
    fire: yearVector.fire / total,
    earth: yearVector.earth / total,
    metal: yearVector.metal / total,
    water: yearVector.water / total
  };
  
  console.log('流年五行向量(标准化):', normalizedVector);
  return normalizedVector;
}

// 手动计算流月五行向量
function calculateMonthVector() {
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
  
  console.log('流月(庚午)五行向量:', monthVector);
  
  // 标准化为总和为1
  const total = monthVector.wood + monthVector.fire + monthVector.earth + monthVector.metal + monthVector.water;
  const normalizedVector = {
    wood: monthVector.wood / total,
    fire: monthVector.fire / total,
    earth: monthVector.earth / total,
    metal: monthVector.metal / total,
    water: monthVector.water / total
  };
  
  console.log('流月五行向量(标准化):', normalizedVector);
  return normalizedVector;
}

// 计算月能量分数
function calculateMonthEnergy() {
  console.log('\n===== 步骤1: 基础数据 =====');
  // 基础八字
  console.log('基础八字五行向量:', baseVector);
  
  // 流年五行向量
  const yearVector = calculateYearVector();
  
  // 流月五行向量
  const monthVector = calculateMonthVector();
  
  console.log('\n===== 步骤2: 计算合并权重 =====');
  // 权重配置: 八字60% + 流年15% + 流月25%
  const combined = {
    wood: baseVector.wood * 0.6 + yearVector.wood * 0.15 + monthVector.wood * 0.25,
    fire: baseVector.fire * 0.6 + yearVector.fire * 0.15 + monthVector.fire * 0.25,
    earth: baseVector.earth * 0.6 + yearVector.earth * 0.15 + monthVector.earth * 0.25,
    metal: baseVector.metal * 0.6 + yearVector.metal * 0.15 + monthVector.metal * 0.25,
    water: baseVector.water * 0.6 + yearVector.water * 0.15 + monthVector.water * 0.25
  };
  
  console.log('合并后权重向量:', combined);
  
  console.log('\n===== 步骤3: 缩放到总和为8 =====');
  // 缩放到总和为8
  const total = combined.wood + combined.fire + combined.earth + combined.metal + combined.water;
  const scaledVector = {
    wood: (combined.wood / total) * 8,
    fire: (combined.fire / total) * 8,
    earth: (combined.earth / total) * 8,
    metal: (combined.metal / total) * 8,
    water: (combined.water / total) * 8
  };
  
  console.log('缩放到总和为8:', scaledVector);
  console.log('验证总和:', scaledVector.wood + scaledVector.fire + scaledVector.earth + scaledVector.metal + scaledVector.water);
  
  console.log('\n===== 步骤4: 计算偏差 =====');
  // 计算偏差
  const ideal = 1.6; // 理想值 = 8 / 5
  const deviation = 
    Math.abs(scaledVector.wood - ideal) +
    Math.abs(scaledVector.fire - ideal) +
    Math.abs(scaledVector.earth - ideal) +
    Math.abs(scaledVector.metal - ideal) +
    Math.abs(scaledVector.water - ideal);
  
  console.log('总偏差:', deviation);
  
  console.log('\n===== 步骤5: 计算分数 =====');
  // 计算分数
  const score = 100 - (deviation / 12.8 * 100);
  console.log('月能量分数:', score);
  
  console.log('\n===== 步骤6: 计算基础分数 =====');
  // 计算基础分数
  const baseScaledVector = {
    wood: baseVector.wood * 8,
    fire: baseVector.fire * 8,
    earth: baseVector.earth * 8,
    metal: baseVector.metal * 8,
    water: baseVector.water * 8
  };
  
  console.log('基础八字缩放到总和为8:', baseScaledVector);
  
  const baseDeviation = 
    Math.abs(baseScaledVector.wood - ideal) +
    Math.abs(baseScaledVector.fire - ideal) +
    Math.abs(baseScaledVector.earth - ideal) +
    Math.abs(baseScaledVector.metal - ideal) +
    Math.abs(baseScaledVector.water - ideal);
  
  console.log('基础偏差:', baseDeviation);
  
  const baseScore = 100 - (baseDeviation / 12.8 * 100);
  console.log('基础八字分数:', baseScore);
  
  console.log('\n===== 步骤7: 计算能量变化 =====');
  // 计算能量变化
  const energyChange = score - baseScore;
  console.log('能量变化值:', energyChange);
  
  return { score, baseScore, energyChange };
}

// 执行测试
console.log('===== 2025年6月庚午月能量计算测试 =====');
calculateMonthEnergy(); 