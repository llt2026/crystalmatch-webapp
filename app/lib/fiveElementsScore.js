/**
 * 五行元素分数计算模块
 * 基于元素的均衡偏差计算五行分数
 */

/**
 * 计算五行元素均衡分数
 * @param {Object|Array} elements 五行元素出现次数对象或数组
 * @param {Number} totalCount 可选，指定总数量
 * @returns {Number} 0-100之间的均衡分数
 */
function calculateElementsScore(elements, totalCount) {
  // 将输入转换为数组形式
  const elementsArray = Array.isArray(elements)
    ? elements
    : Object.values(elements);

  // 确保有5个元素值
  if (elementsArray.length !== 5) {
    throw new Error('必须提供5个五行元素的数值');
  }

  // 计算总数量（如果未指定）
  const total = totalCount || elementsArray.reduce((sum, val) => sum + val, 0);
  
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
  
  // 计算分数：100 - (总偏差/最大偏差)*100，确保不小于0
  const score = 100 - (totalDeviation / maxDeviation) * 100;
  
  // 返回不小于0的分数
  return Math.max(0, score);
}

/**
 * 计算单个月份的五行能量变化
 * @param {Object|Array} currentElements 当前月五行分布
 * @param {Object|Array} baseElements 基础八字五行分布
 * @returns {Number} 能量变化指数 (-25 到 25之间)
 */
function calculateEnergyChange(currentElements, baseElements) {
  // 计算当前月和基础八字的分数
  const currentScore = calculateElementsScore(currentElements);
  const baseScore = calculateElementsScore(baseElements);
  
  // 计算分数差异，并映射到-25到25的范围
  const rawDiff = currentScore - baseScore;
  
  // 将差异映射到-25到25的范围
  // 最大理论差异是100分，我们将它压缩到25
  const scaledChange = Math.round(rawDiff / 4);
  
  // 确保在-25到25的范围内
  return Math.max(-25, Math.min(25, scaledChange));
}

/**
 * 决定能量变化趋势
 * @param {Number} energyChange 能量变化值
 * @returns {String} 趋势：'up'|'down'|'stable'
 */
function determineTrend(energyChange) {
  if (energyChange >= 3) {
    return 'up';
  } else if (energyChange <= -3) {
    return 'down';
  } else {
    return 'stable';
  }
}

/**
 * 完整示例：计算一个月的能量状态
 * @param {Object} current 当前月五行分布
 * @param {Object} base 基础八字五行分布
 * @returns {Object} 包含分数、变化和趋势的完整结果
 */
function calculateMonthlyElementEnergy(current, base) {
  const currentScore = calculateElementsScore(current);
  const baseScore = calculateElementsScore(base);
  const energyChange = calculateEnergyChange(current, base);
  const trend = determineTrend(energyChange);
  
  return {
    currentScore,
    baseScore,
    energyChange,
    trend,
    detail: {
      current,
      base
    }
  };
}

// 导出函数
module.exports = {
  calculateElementsScore,
  calculateEnergyChange,
  determineTrend,
  calculateMonthlyElementEnergy
}; 