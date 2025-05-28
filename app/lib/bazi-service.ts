interface BaziInfo {
  year: { tian: string; di: string; };
  month: { tian: string; di: string; };
  day: { tian: string; di: string; };
  hour: { tian: string; di: string; };
  wuxing: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  nayin: string[];
  shishen: string[];
}

interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
}

// 天干地支映射
const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行属性映射
const tianGanWuxing: { [key: string]: string } = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire', 
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

const diZhiWuxing: { [key: string]: string } = {
  '子': 'water', '亥': 'water',
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '申': 'metal', '酉': 'metal',
  '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth'
};

/**
 * 计算八字信息
 * @param birthInfo 出生信息
 * @returns 八字详细信息
 */
export function calculateBazi(birthInfo: BirthInfo): BaziInfo {
  try {
    // 如果有外部八字API，优先使用外部API
    // return await callExternalBaziAPI(birthInfo);
    
    // 本地计算八字（简化版）
    return calculateLocalBazi(birthInfo);
  } catch (error) {
    console.error('八字计算错误:', error);
    // 回退到本地计算
    return calculateLocalBazi(birthInfo);
  }
}

/**
 * 本地八字计算（简化版）
 */
function calculateLocalBazi(birthInfo: BirthInfo): BaziInfo {
  const { year, month, day, hour } = birthInfo;
  
  // 年柱计算 (以立春为界)
  const yearTianGanIndex = (year - 4) % 10;
  const yearDiZhiIndex = (year - 4) % 12;
  const yearTianGan = tianGan[yearTianGanIndex];
  const yearDiZhi = diZhi[yearDiZhiIndex];
  
  // 月柱计算 (需要考虑节气，这里简化处理)
  const monthTianGanIndex = (yearTianGanIndex * 2 + month) % 10;
  const monthDiZhiIndex = (month + 1) % 12;
  const monthTianGan = tianGan[monthTianGanIndex];
  const monthDiZhi = diZhi[monthDiZhiIndex];
  
  // 日柱计算 (需要使用万年历算法，这里简化)
  const dayOffset = Math.floor((new Date(year, month - 1, day).getTime() - new Date(1900, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const dayTianGanIndex = (dayOffset + 9) % 10;
  const dayDiZhiIndex = (dayOffset + 1) % 12;
  const dayTianGan = tianGan[dayTianGanIndex];
  const dayDiZhi = diZhi[dayDiZhiIndex];
  
  // 时柱计算
  const hourIndex = Math.floor((hour + 1) / 2) % 12;
  const hourTianGanIndex = (dayTianGanIndex * 2 + hourIndex) % 10;
  const hourTianGan = tianGan[hourTianGanIndex];
  const hourDiZhi = diZhi[hourIndex];
  
  // 计算五行分布
  const wuxing = calculateWuxingDistribution([
    yearTianGan, yearDiZhi,
    monthTianGan, monthDiZhi, 
    dayTianGan, dayDiZhi,
    hourTianGan, hourDiZhi
  ]);
  
  return {
    year: { tian: yearTianGan, di: yearDiZhi },
    month: { tian: monthTianGan, di: monthDiZhi },
    day: { tian: dayTianGan, di: dayDiZhi },
    hour: { tian: hourTianGan, di: hourDiZhi },
    wuxing,
    nayin: [
      getNayin(yearTianGan, yearDiZhi),
      getNayin(monthTianGan, monthDiZhi),
      getNayin(dayTianGan, dayDiZhi),
      getNayin(hourTianGan, hourDiZhi)
    ],
    shishen: [] // 这里需要更复杂的十神计算
  };
}

/**
 * 计算五行分布
 */
function calculateWuxingDistribution(ganZhiArray: string[]): BaziInfo['wuxing'] {
  const distribution = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  
  ganZhiArray.forEach(ganZhi => {
    const wuxing = tianGanWuxing[ganZhi] || diZhiWuxing[ganZhi];
    if (wuxing) {
      distribution[wuxing as keyof typeof distribution]++;
    }
  });
  
  // 转换为百分比
  const total = ganZhiArray.length;
  return {
    wood: Math.round(distribution.wood / total * 100),
    fire: Math.round(distribution.fire / total * 100),
    earth: Math.round(distribution.earth / total * 100),
    metal: Math.round(distribution.metal / total * 100),
    water: Math.round(distribution.water / total * 100)
  };
}

/**
 * 获取纳音
 */
function getNayin(tianGan: string, diZhi: string): string {
  // 简化的纳音对照表
  const nayinTable: { [key: string]: string } = {
    '甲子': '海中金', '乙丑': '海中金',
    '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木',
    '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金',
    // ... 完整的纳音表需要60个组合
  };
  
  const ganZhi = tianGan + diZhi;
  return nayinTable[ganZhi] || '未知纳音';
}

/**
 * 调用外部八字API（如果需要更准确的计算）
 */
async function callExternalBaziAPI(birthInfo: BirthInfo): Promise<BaziInfo> {
  // 这里可以调用挖数据等八字API
  // 示例：
  // const response = await fetch('https://api.wapi.cn/bazi', {
  //   method: 'POST',
  //   headers: { 'Authorization': 'your-api-key' },
  //   body: JSON.stringify(birthInfo)
  // });
  // const data = await response.json();
  // return parseBaziResponse(data);
  
  throw new Error('外部API暂未实现');
} 