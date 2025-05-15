/**
 * 能量类型映射表（从中国传统五行到西化能量类型）
 */
export const energyTypes = {
  wood: { type: 'growth', name: '生长能量', description: '激发创造力，推动行动力' },
  fire: { type: 'passion', name: '热情能量', description: '点燃自信与勇气' },
  earth: { type: 'stability', name: '稳固能量', description: '帮助你脚踏实地，增强安全感' },
  metal: { type: 'clarity', name: '清晰能量', description: '理清思路，提高决策力' },
  water: { type: 'fluid', name: '流动能量', description: '助你灵活应对，情绪顺畅' },
};

/**
 * 生肖映射
 */
export const zodiacMapping = {
  rat: { name: '鼠', personality: '机智灵活，适应力强' },
  ox: { name: '牛', personality: '勤劳踏实，性格坚韧' },
  tiger: { name: '虎', personality: '勇敢自信，充满活力' },
  rabbit: { name: '兔', personality: '温和谨慎，善解人意' },
  dragon: { name: '龙', personality: '热情开朗，充满创造力' },
  snake: { name: '蛇', personality: '神秘内敛，思维敏锐' },
  horse: { name: '马', personality: '活泼乐观，追求自由' },
  goat: { name: '羊', personality: '温顺善良，富有艺术天赋' },
  monkey: { name: '猴', personality: '聪明机智，适应力强' },
  rooster: { name: '鸡', personality: '勤奋自信，注重细节' },
  dog: { name: '狗', personality: '忠诚可靠，正直善良' },
  pig: { name: '猪', personality: '诚实善良，享受生活' }
};

/**
 * 星座映射
 */
export const westernZodiacMapping = {
  aries: { name: '白羊座', traits: '勇敢、自信、充满活力' },
  taurus: { name: '金牛座', traits: '可靠、耐心、务实' },
  gemini: { name: '双子座', traits: '好奇、适应力强、交际能力佳' },
  cancer: { name: '巨蟹座', traits: '富有同情心、直觉敏锐、重视家庭' },
  leo: { name: '狮子座', traits: '自信、慷慨、有领导力' },
  virgo: { name: '处女座', traits: '细心、实际、分析能力强' },
  libra: { name: '天秤座', traits: '和谐、外交、公平' },
  scorpio: { name: '天蝎座', traits: '热情、坚韧、洞察力强' },
  sagittarius: { name: '射手座', traits: '乐观、自由、诚实' },
  capricorn: { name: '摩羯座', traits: '自律、责任感强、踏实' },
  aquarius: { name: '水瓶座', traits: '独立、创新、人道主义' },
  pisces: { name: '双鱼座', traits: '富有同情心、直觉敏锐、善良' }
};

/**
 * 根据年份获取生肖
 */
export function getChineseZodiac(year) {
  const zodiacSigns = ['monkey', 'rooster', 'dog', 'pig', 'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat'];
  return zodiacSigns[(year - 4) % 12];
}

/**
 * 根据生日获取星座
 */
export function getWesternZodiac(month, day) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
} 