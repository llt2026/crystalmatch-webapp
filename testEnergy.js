// 测试1990年10月5日生人在2023年5月31日至6月9日的能量变化
// 注意：这个脚本需要设置Node环境，但在Web环境中有困难
// 生成一个示例计算

// 假设1990年10月5日出生者的基础八字数据
const baseVector = {wood: 2, fire: 1, earth: 3, metal: 1, water: 1};
// 基础分数计算
const baseBalance = calculateElementsScore(baseVector);
console.log('基础八字五行向量:', baseVector);
console.log('基础八字平衡分:', baseBalance);

// 计算每一天的五行数据(硬编码示例)
const dates = [
  {date: '2023-05-31', vector: {wood: 3, fire: 2, earth: 2, metal: 1, water: 0}},
  {date: '2023-06-01', vector: {wood: 2, fire: 3, earth: 2, metal: 1, water: 0}},
  {date: '2023-06-02', vector: {wood: 2, fire: 3, earth: 1, metal: 2, water: 0}},
  {date: '2023-06-03', vector: {wood: 1, fire: 4, earth: 1, metal: 2, water: 0}},
  {date: '2023-06-04', vector: {wood: 1, fire: 4, earth: 2, metal: 1, water: 0}},
  {date: '2023-06-05', vector: {wood: 1, fire: 3, earth: 3, metal: 1, water: 0}},
  {date: '2023-06-06', vector: {wood: 0, fire: 3, earth: 3, metal: 2, water: 0}},
  {date: '2023-06-07', vector: {wood: 0, fire: 2, earth: 3, metal: 3, water: 0}},
  {date: '2023-06-08', vector: {wood: 0, fire: 2, earth: 2, metal: 3, water: 1}},
  {date: '2023-06-09', vector: {wood: 0, fire: 1, earth: 2, metal: 3, water: 2}}
];

// 逐日计算
for (const entry of dates) {
  console.log(`\n===== ${entry.date} =====`);
  console.log('当日五行:', entry.vector);
  
  // 合并基础八字和当日八字
  const combined = {
    wood: baseVector.wood + entry.vector.wood,
    fire: baseVector.fire + entry.vector.fire,
    earth: baseVector.earth + entry.vector.earth,
    metal: baseVector.metal + entry.vector.metal,
    water: baseVector.water + entry.vector.water
  };
  console.log('合并后五行:', combined);
  
  // 计算当日平衡分
  const dailyBalance = calculateElementsScore(combined);
  console.log('当日平衡分:', dailyBalance);
  
  // 计算分数差值
  const diffRaw = dailyBalance - baseBalance;
  console.log('原始差值:', diffRaw);
  
  // 应用缩放
  let energyChange = scaleDiff(diffRaw);
  console.log('最终能量变化:', energyChange);
}

/**
 * 计算五行元素均衡分数
 */
function calculateElementsScore(elements) {
  // 将输入转换为数组形式
  const elementsArray = Array.isArray(elements)
    ? elements
    : Object.values(elements);

  // 确保有5个元素值
  if (elementsArray.length !== 5) {
    throw new Error('必须提供5个五行元素的数值');
  }

  // 计算总数量
  const total = elementsArray.reduce((sum, val) => sum + val, 0);
  
  // 当总数为0时，直接返回0分
  if (total === 0) {
    return 0;
  }
  
  // 理想均衡值：总数除以5
  const idealValue = total / 5;
  
  // 计算总偏差：每个元素与理想值的差的绝对值之和
  const totalDeviation = elementsArray.reduce(
    (sum, val) => sum + Math.abs(val - idealValue),
    0
  );
  
  // 计算最大可能偏差
  // 最大偏差出现在：一个元素占据所有格子，其他元素为0
  // 公式：4个元素的理想值之和 + |总数-理想值|
  const maxDeviation = 4 * idealValue + Math.abs(total - idealValue);
  
  // 防止除以0
  if (maxDeviation === 0) {
    return 0;
  }
  
  // 计算分数：100 - (总偏差/最大偏差)*100，确保不小于0
  let score = 100 - (totalDeviation / maxDeviation) * 100;
  if (Number.isNaN(score)) {
    score = 0;
  }
  
  // 返回不小于0的分数
  return Math.max(0, score);
}

function scaleDiff(raw) {
  // 防止NaN
  if (!Number.isFinite(raw)) {
    console.warn('scaleDiff: raw is not a number:', raw);
    return 0;
  }

  // 先缩放，避免分差过大
  let valRaw;
  const absRaw = Math.abs(raw);
  if (absRaw <= 50) valRaw = raw;        // 小差异不缩放
  else if (absRaw <= 100) valRaw = raw / 2; // 中等差异减半
  else valRaw = raw / 4;                    // 大于100再÷4

  let val = Math.round(valRaw * 10) / 10; // 保留1位小数
  if (Math.abs(val) < 1) val = val >= 0 ? 1 : -1;
  if (val > 25) val = 25;
  if (val < -25) val = -25;
  // 再次检查NaN
  if (!Number.isFinite(val)) {
    return 0;
  }
  return val;
} 