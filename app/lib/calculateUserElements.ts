/**
 * 根据用户八字计算五行元素分布
 * 这是系统的核心算法之一，用于个性化GPT报告生成
 */

// 天干五行对应表
const TIANGAN_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火', 
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行对应表（地支有藏干，这里简化处理）
const DIZHI_ELEMENTS: Record<string, string> = {
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '丑': '土', '辰': '土', '未': '土', '戌': '土'
};

// 五行强度权重（天干为主，地支为辅）
const TIANGAN_WEIGHT = 70; // 天干权重
const DIZHI_WEIGHT = 30;   // 地支权重

export interface UserElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

/**
 * 从八字计算用户五行元素分布
 * @param bazi 八字对象，包含年柱、月柱、日柱
 * @returns 五行元素分布，范围1-100
 */
export function calculateUserElements(bazi: {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
}): UserElements {
  console.log('开始计算用户五行元素分布:', bazi);
  
  // 初始化五行计数
  const elementCounts = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  // 解析三柱的天干地支
  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar];
  
  pillars.forEach((pillar, pillarIndex) => {
    if (pillar && pillar.length >= 2) {
      const tiangan = pillar[0];
      const dizhi = pillar[1];
      
      // 获取天干对应的五行
      const tianganElement = TIANGAN_ELEMENTS[tiangan];
      if (tianganElement) {
        const elementKey = getElementKey(tianganElement);
        if (elementKey) {
          // 日柱天干权重更高（代表日主）
          const weight = pillarIndex === 2 ? TIANGAN_WEIGHT * 1.5 : TIANGAN_WEIGHT;
          elementCounts[elementKey] += weight;
          console.log(`${pillar}天干${tiangan}(${tianganElement}) +${weight}`);
        }
      }
      
      // 获取地支对应的五行
      const dizhiElement = DIZHI_ELEMENTS[dizhi];
      if (dizhiElement) {
        const elementKey = getElementKey(dizhiElement);
        if (elementKey) {
          elementCounts[elementKey] += DIZHI_WEIGHT;
          console.log(`${pillar}地支${dizhi}(${dizhiElement}) +${DIZHI_WEIGHT}`);
        }
      }
    }
  });
  
  console.log('原始五行分数:', elementCounts);
  
  // 计算总分
  const totalScore = Object.values(elementCounts).reduce((sum, score) => sum + score, 0);
  
  // 转换为百分比并标准化到1-100范围
  const normalizedElements: UserElements = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  if (totalScore > 0) {
    Object.keys(elementCounts).forEach(element => {
      const elementKey = element as keyof UserElements;
      const percentage = (elementCounts[elementKey] / totalScore) * 100;
      // 确保最低为5，最高为95，避免极端值
      normalizedElements[elementKey] = Math.max(5, Math.min(95, Math.round(percentage)));
    });
  } else {
    // 如果没有计算出分数，使用平均分布
    console.warn('未能计算出五行分数，使用平均分布');
    Object.keys(normalizedElements).forEach(element => {
      const elementKey = element as keyof UserElements;
      normalizedElements[elementKey] = 20; // 平均分布
    });
  }
  
  console.log('标准化后的五行分布:', normalizedElements);
  
  return normalizedElements;
}

/**
 * 将中文五行名称转换为英文键
 */
function getElementKey(chineseElement: string): keyof UserElements | null {
  const elementMap: Record<string, keyof UserElements> = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };
  
  return elementMap[chineseElement] || null;
}

/**
 * 获取用户的主要五行和次要五行
 */
export function getPrimaryAndSecondaryElements(elements: UserElements): {
  primary: string;
  secondary: string;
  primaryScore: number;
  secondaryScore: number;
} {
  const sortedElements = Object.entries(elements)
    .sort((a, b) => b[1] - a[1]);
  
  return {
    primary: sortedElements[0][0],
    secondary: sortedElements[1][0],
    primaryScore: sortedElements[0][1],
    secondaryScore: sortedElements[1][1]
  };
} 