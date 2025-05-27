import { elementTraits } from '../data/elementTraits';

type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
type ElementDistribution = { element: ElementType; value: number }[];

interface ElementTraitsResult {
  strength: {
    element: string;
    traits: string[];
  };
  weakness: {
    element: string;
    traits: string[];
  };
}

/**
 * 根据用户ID和五行元素分布获取4组优点和4组缺点特质
 * 优点对应五行中最强的元素，缺点对应五行中最弱的元素
 * 使用用户ID作为种子确保同一用户多次查看结果一致
 * 
 * @param userId 用户ID，用于生成稳定的随机数
 * @param elementDistribution 用户的五行元素分布
 * @returns 优点和缺点特质
 */
export function getUserElementTraits(userId: string, elementDistribution: ElementDistribution): ElementTraitsResult {
  // 找出最强和最弱的元素
  const sortedElements = [...elementDistribution].sort((a, b) => b.value - a.value);
  const strongestElement = sortedElements[0].element.toLowerCase() as ElementType;
  const weakestElement = sortedElements[sortedElements.length - 1].element.toLowerCase() as ElementType;
  
  // 使用用户ID作为种子生成伪随机数
  const getSeededRandom = (seed: string, index: number) => {
    const combinedSeed = seed + index.toString();
    let hash = 0;
    for (let i = 0; i < combinedSeed.length; i++) {
      const char = combinedSeed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash) / 2147483647; // 标准化到0~1之间
  };
  
  // 从特质列表中随机选择4个
  function selectRandomTraits(traits: string[], count: number, seed: string): string[] {
    const indices = Array.from({ length: traits.length }, (_, i) => i);
    const result: string[] = [];
    
    // Fisher-Yates 洗牌算法，使用种子确保相同的随机序列
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(getSeededRandom(seed, i) * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]]; // 交换元素
    }
    
    // 选择前count个特质
    for (let i = 0; i < count; i++) {
      if (i < indices.length) {
        result.push(traits[indices[i]]);
      }
    }
    
    return result;
  }
  
  // 选择4个优点和4个缺点
  const strengthTraits = selectRandomTraits(
    elementTraits[strongestElement].strengths,
    4, 
    userId + '_strength'
  );
  
  const weaknessTraits = selectRandomTraits(
    elementTraits[weakestElement].weaknesses,
    4, 
    userId + '_weakness'
  );
  
  // 格式化元素名称
  const formatElementName = (element: string): string => {
    const capitalizedElement = element.charAt(0).toUpperCase() + element.slice(1);
    const elementTypeMap = {
      'wood': 'Growth Energy (Wood)',
      'fire': 'Passion Energy (Fire)',
      'earth': 'Stability Energy (Earth)',
      'metal': 'Clarity Energy (Metal)',
      'water': 'Fluid Energy (Water)'
    };
    
    return elementTypeMap[element as ElementType] || `${capitalizedElement} Energy`;
  };
  
  return {
    strength: {
      element: formatElementName(strongestElement),
      traits: strengthTraits
    },
    weakness: {
      element: formatElementName(weakestElement),
      traits: weaknessTraits
    }
  };
} 