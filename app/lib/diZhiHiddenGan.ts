/**
 * 地支藏干映射表
 * 每个地支可能藏有一个或多个天干
 */

// 天干类型
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 地支类型
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// 地支藏干对应表
// 格式：地支 -> [藏干数组]
export const DI_ZHI_HIDDEN_GAN: Record<DiZhi, TianGan[]> = {
  '子': ['癸'],             // 子水藏癸水
  '丑': ['己', '辛', '癸'], // 丑土藏己土、辛金、癸水
  '寅': ['甲', '丙', '戊'], // 寅木藏甲木、丙火、戊土
  '卯': ['乙'],             // 卯木藏乙木
  '辰': ['戊', '乙', '癸'], // 辰土藏戊土、乙木、癸水
  '巳': ['丙', '庚', '戊'], // 巳火藏丙火、庚金、戊土
  '午': ['丁', '己'],       // 午火藏丁火、己土
  '未': ['己', '丁', '乙'], // 未土藏己土、丁火、乙木
  '申': ['庚', '壬', '戊'], // 申金藏庚金、壬水、戊土
  '酉': ['辛'],             // 酉金藏辛金
  '戌': ['戊', '辛', '丁'], // 戌土藏戊土、辛金、丁火
  '亥': ['壬', '甲']        // 亥水藏壬水、甲木
};

// 地支藏干权重表（三分法）
// 正官：100% 偏官：60% 建禄：40%
export const DI_ZHI_HIDDEN_GAN_WEIGHTS: Record<DiZhi, number[]> = {
  '子': [1.0],                // 癸100%
  '丑': [0.6, 0.4, 0.0],      // 己60%、辛40%、癸0%
  '寅': [0.6, 0.3, 0.1],      // 甲60%、丙30%、戊10%
  '卯': [1.0],                // 乙100%
  '辰': [0.6, 0.3, 0.1],      // 戊60%、乙30%、癸10%
  '巳': [0.6, 0.3, 0.1],      // 丙60%、庚30%、戊10%
  '午': [0.7, 0.3],           // 丁70%、己30%
  '未': [0.6, 0.3, 0.1],      // 己60%、丁30%、乙10%
  '申': [0.6, 0.3, 0.1],      // 庚60%、壬30%、戊10%
  '酉': [1.0],                // 辛100%
  '戌': [0.6, 0.3, 0.1],      // 戊60%、辛30%、丁10%
  '亥': [0.7, 0.3]            // 壬70%、甲30%
};

/**
 * 地支藏干结果类型
 */
export interface HiddenGanWithWeight {
  gan: TianGan;
  weight: number;
}

/**
 * 获取地支藏干
 * @param diZhi 地支字符
 * @returns 藏干数组
 */
export function getHiddenGan(diZhi: DiZhi): TianGan[] {
  return DI_ZHI_HIDDEN_GAN[diZhi] || [];
}

/**
 * 获取地支藏干及其权重
 * @param diZhi 地支字符
 * @returns 藏干及权重数组
 */
export function getHiddenGanWithWeights(diZhi: DiZhi): HiddenGanWithWeight[] {
  const gans = DI_ZHI_HIDDEN_GAN[diZhi] || [];
  const weights = DI_ZHI_HIDDEN_GAN_WEIGHTS[diZhi] || [];
  
  return gans.map((gan, index) => ({
    gan,
    weight: weights[index] || 0
  }));
}

/**
 * 获取地支所藏全部天干的五行向量
 * 考虑权重，返回加权后的五行计数
 * @param diZhi 地支字符
 * @returns 五行向量 {wood, fire, earth, metal, water}
 */
export function getHiddenGanFiveElements(diZhi: DiZhi): { wood: number; fire: number; earth: number; metal: number; water: number } {
  const hiddenGans = getHiddenGanWithWeights(diZhi);
  
  // 初始化五行向量
  const elements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  // 天干五行对应表
  const ganToElement: Record<TianGan, keyof typeof elements> = {
    '甲': 'wood', '乙': 'wood',
    '丙': 'fire', '丁': 'fire',
    '戊': 'earth', '己': 'earth',
    '庚': 'metal', '辛': 'metal',
    '壬': 'water', '癸': 'water'
  };
  
  // 累加每个藏干的五行，考虑权重
  hiddenGans.forEach(({ gan, weight }) => {
    const element = ganToElement[gan];
    if (element) {
      elements[element] += weight;
    }
  });
  
  return elements;
} 