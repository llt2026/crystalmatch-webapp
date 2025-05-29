import { getBaziFromLunar } from './getBaziFromLunar';
import { ElementType, ElementValues, calculateElementsScore, calculateExtendedElementsScore, determineTrend } from './fiveElementsScore';

// 元素类型别名，与原有系统兼容
export type Elem = ElementType;
export type ElementRecord = Record<Elem, number>;

// 月度能量计算输入参数
export interface MonthlyEnergyInput {
  birthday: string;          // YYYY-MM-DD格式
  dateRef?: Date;            // 默认为今天
  prevMonthScores?: ElementRecord | null;  // 上个月的分数
  // 未来可添加月相、日照等影响因素
  moonPhase?: number;        // 月相影响 (0-1)
  sunlight?: number;         // 日照时长影响
}

// 月度能量计算输出结果
export interface MonthlyEnergyOutput {
  monthScores: ElementRecord;   // 当月五行元素分数
  baseScores: ElementRecord;    // 基础八字五行元素分数
  diffScores: ElementRecord;    // 与上月或基础分数的差异
  energyChange: number;         // 综合能量变化值 (-25到25)
  trend: 'up' | 'down' | 'stable'; // 总体趋势
  trendMsg: string;             // 趋势描述
  detail: {                     // 详细数据
    baseElements: ElementValues;  // 基础五行分布
    currentElements: ElementValues; // 当月五行分布
    totalCount: number;         // 总计数量
  };
}

/**
 * 增强版月度能量计算函数
 * 使用新的五行分数计算方法
 */
export function calculateEnhancedMonthlyEnergy(params: MonthlyEnergyInput): MonthlyEnergyOutput {
  const { birthday, dateRef = new Date(), prevMonthScores = null, moonPhase = 0, sunlight = 0 } = params;
  
  // 验证生日格式
  const birthdayDate = new Date(birthday);
  if (isNaN(birthdayDate.getTime())) {
    console.error("无效的生日日期格式:", birthday);
    throw new Error('Invalid birthday format. Expected YYYY-MM-DD format.');
  }
  
  console.log(`计算月度能量: 生日=${formatDate(birthdayDate)}, 参考日期=${formatDate(dateRef)}`);
  
  // 1. 获取基础八字五行分布
  const baseResult = getBaziFromLunar(birthdayDate);
  if (!baseResult || !baseResult.fiveElements) {
    console.error("无法计算八字基础数据:", birthday);
    throw new Error('Failed to calculate base eight characters data');
  }
  
  // 中文到英文五行映射
  const CHN_TO_ENG: Record<string, Elem> = {
    '木': 'wood',
    '火': 'fire',
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };

  // 映射函数
  function mapToElem(raw: string): Elem | null {
    if (!raw) return null;
    const lower = raw.toLowerCase();
    // 英文直接返回
    if (lower === 'wood' || lower === 'fire' || lower === 'earth' || 
        lower === 'metal' || lower === 'water') {
      return lower as Elem;
    }
    // 中文转换为英文
    if (CHN_TO_ENG[raw]) return CHN_TO_ENG[raw];
    return null;
  }
  
  // 初始化基础五行计数
  const baseElements: ElementValues = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // 计算基础八字五行出现次数
  const baseFiveElements = baseResult.fiveElements as any;
  ['year', 'month', 'day'].forEach(pillar => {
    baseFiveElements[pillar].forEach((element: string) => {
      const mapped = mapToElem(element);
      if (mapped) {
        baseElements[mapped]++;
      }
    });
  });
  
  console.log("八字基础五行分布:", JSON.stringify(baseElements));
  
  // 2. 获取当前年月的天干地支
  const nowResult = getBaziFromLunar(dateRef);
  if (!nowResult || !nowResult.fiveElements) {
    console.error("无法计算当前日期八字数据:", formatDate(dateRef));
    throw new Error('Failed to calculate current date eight characters data');
  }
  
  // 年月柱五行元素
  const yearMonthElements: ElementValues = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // 计算当前年月五行出现次数
  const nowFiveElements = nowResult.fiveElements as any;
  ['year', 'month'].forEach(pillar => {
    nowFiveElements[pillar].forEach((element: string) => {
      const mapped = mapToElem(element);
      if (mapped) {
        yearMonthElements[mapped]++;
      }
    });
  });
  
  console.log("当前年月五行分布:", JSON.stringify(yearMonthElements));
  
  // 3. 计算总五行分布（基础八字 + 当前年月）
  const currentElements: ElementValues = {
    wood: baseElements.wood + yearMonthElements.wood,
    fire: baseElements.fire + yearMonthElements.fire,
    earth: baseElements.earth + yearMonthElements.earth,
    metal: baseElements.metal + yearMonthElements.metal,
    water: baseElements.water + yearMonthElements.water
  };
  
  // 基础八字总数（通常为8）和当前总数（通常为12）
  const baseCount = Object.values(baseElements).reduce((sum, val) => sum + val, 0);
  const currentCount = Object.values(currentElements).reduce((sum, val) => sum + val, 0);
  
  console.log("五行总数: 基础八字:", baseCount, "当前:", currentCount);
  console.log("当前总五行分布:", JSON.stringify(currentElements));
  
  // 4. 使用新函数计算五行均衡分数
  // 基础分数不考虑月相日照因素
  const baseScore = calculateElementsScore(baseElements, baseCount);
  
  // 当月分数考虑月相日照因素
  const monthScore = calculateExtendedElementsScore(
    currentElements,
    moonPhase,  // 月相影响因子 (0-1)
    sunlight,   // 日照影响因子 (0-1)
    currentCount
  );
  
  console.log("基础分数:", baseScore.toFixed(2));
  console.log("当月分数:", monthScore.toFixed(2));
  console.log("月相影响:", moonPhase, "日照影响:", sunlight);
  
  // 5. 组装结果对象
  
  // 为了兼容旧接口，构建ElementRecord格式的分数
  const baseScores: ElementRecord = {
    wood: baseScore,
    fire: baseScore,
    earth: baseScore,
    metal: baseScore,
    water: baseScore
  };
  
  const monthScores: ElementRecord = {
    wood: monthScore,
    fire: monthScore,
    earth: monthScore,
    metal: monthScore,
    water: monthScore
  };
  
  // 计算分数差异
  const rawDiff = monthScore - baseScore;
  const energyChange = Math.max(-25, Math.min(25, Math.round(rawDiff / 4)));
  
  // 确定趋势
  const trend = determineTrend(energyChange);
  
  // 构建差异分数记录
  const diffScores: ElementRecord = {
    wood: monthScore - baseScore,
    fire: monthScore - baseScore,
    earth: monthScore - baseScore,
    metal: monthScore - baseScore,
    water: monthScore - baseScore
  };
  
  // 生成趋势描述
  const trendMsg = generateTrendMessage(trend, diffScores);
  
  return {
    monthScores,
    baseScores,
    diffScores,
    energyChange,
    trend,
    trendMsg,
    detail: {
      baseElements,
      currentElements,
      totalCount: currentCount
    }
  };
}

/**
 * 生成趋势描述文本
 */
function generateTrendMessage(trend: 'up' | 'down' | 'stable', diffScores: ElementRecord): string {
  const diffValue = diffScores.wood; // 所有元素差异值相同
  
  const elemNameMap: Record<string, string> = {
    'wood': 'Wood',
    'fire': 'Fire',
    'earth': 'Earth',
    'metal': 'Metal',
    'water': 'Water'
  };
  
  switch (trend) {
    case 'up':
      return `Your overall energy is rising this month, with all elements increasing by ${Math.abs(diffValue).toFixed(1)} points.`;
    case 'down':
      return `Your overall energy is decreasing this month, with all elements dropping by ${Math.abs(diffValue).toFixed(1)} points.`;
    default:
      return `Your five elements energy remains relatively stable this month.`;
  }
}

/**
 * 格式化日期为YYYY-MM-DD格式
 */
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
} 