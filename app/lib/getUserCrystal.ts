import { elementCrystals } from '../data/elementCrystals';

type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
type ElementDistribution = { element: ElementType; value: number }[];

export interface CrystalRecommendation {
  name: string;
  description: string;
  imageFile: string;
  planet?: string;
  effect?: string;
  year: number;
}

/**
 * 根据用户ID和五行元素分布获取年度推荐水晶
 * 推荐水晶来自用户最弱的元素对应水晶列表
 * 优先推荐列表中的第一个水晶，同一用户结果保持一致性
 * 
 * @param userId 用户ID，用于生成稳定的随机数
 * @param elementDistribution 用户的五行元素分布
 * @param year 当前年份（用于推荐信息展示）
 * @returns 推荐水晶信息
 */
export function getUserCrystal(
  userId: string, 
  elementDistribution: ElementDistribution,
  year: number = new Date().getFullYear()
): CrystalRecommendation {
  // 找出最弱的元素
  const sortedElements = [...elementDistribution].sort((a, b) => a.value - b.value);
  const weakestElement = sortedElements[0].element.toLowerCase() as ElementType;
  
  // 获取该元素对应的水晶列表
  const crystalList = elementCrystals[weakestElement];
  
  // 默认选择该元素下的第一个水晶（主推水晶）
  // 也可以基于用户ID使用伪随机选择其他水晶（次推水晶）
  let selectedCrystalIndex = 0;
  
  // 如果需要随机选择（例如基于某种条件），可以使用以下随机算法
  // 这里我们简单地检查用户ID的最后一位数字，如果大于5则选择次推水晶
  if (shouldSelectSecondaryCrystal(userId)) {
    selectedCrystalIndex = getSeededRandomIndex(userId, crystalList.length);
  }
  
  // 返回选中的水晶信息
  return {
    ...crystalList[selectedCrystalIndex],
    year // 添加年份信息
  };
}

/**
 * 确定是否应该推荐次要水晶而不是主要水晶
 * 这里使用用户ID的特征来决定
 */
function shouldSelectSecondaryCrystal(userId: string): boolean {
  // 示例：检查用户ID的最后一位数字是否大于5
  // 在实际应用中，可以基于更复杂的业务逻辑
  try {
    if (!userId) return false;
    
    // 生成稳定的哈希值
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // 使用哈希值的最后一位判断是否使用次要水晶
    // 大约30%的用户会获得次要推荐
    return Math.abs(hash % 10) > 7;
  } catch (e) {
    return false; // 出现错误时默认使用主要水晶
  }
}

/**
 * 根据用户ID生成稳定的随机索引
 * 确保同一用户每次都得到相同的推荐
 */
function getSeededRandomIndex(seed: string, max: number): number {
  if (max <= 1) return 0;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  // 确保生成1到max-1之间的索引（跳过索引0，因为0是主推水晶）
  return 1 + Math.abs(hash % (max - 1));
} 