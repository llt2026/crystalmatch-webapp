/**
 * 月度订阅用户能量报告提示词模板 v2
 * 
 * 该模板提供12个月能量表格和当前月份的深入解读
 * 输出语言为美式英语
 */

import { format } from 'date-fns';

/**
 * 生成月度订阅用户的能量报告提示词
 * 
 * @param energyContext 能量上下文数据
 * @returns 提示词字符串
 */
export function generateMonthlyUserPrompt(energyContext: any): string {
  // 格式化出生日期
  const birthdate = format(new Date(energyContext.birthDate), 'MMMM d, yyyy');
  
  // 获取当前月份
  const currentMonth = format(new Date(energyContext.currentMonth.start), 'MMMM');
  
  // 生成月度能量表格数据（示例）
  // 实际应用中，这部分数据应该从energyContext中提取或计算
  const monthlyScoresTable = generateMonthlyScoresTable(energyContext);
  
  return `# === CrystalMatch · Monthly Plan Prompt (v2) ===

✨ This personalized energy forecast explores:
- The Five Elements from your Chinese birth chart
- Your Western Zodiac and elemental alignment
- Monthly seasonal energy and emotional resonance

Our hope is to offer insights that might bring clarity, alignment, and possibilities for inner growth.

---

Immutable facts (do NOT change):
• Birthdate: ${birthdate}
• Dominant Energy: ${energyContext.dominantElement || 'Wood'}
• Missing Energy: ${energyContext.missingElement || 'Water'}
• Current Month: ${currentMonth}
• Monthly Energy Table: ${JSON.stringify(monthlyScoresTable)}

Generate the MONTHLY report body in American English with a gentle, guiding tone:

1. **12-Month Energy Table**  
   - Columns: Month | Energy Type | Score (0-100).  
   - No explanations inside the table.

2. **Current-Month Insights** (only for ${currentMonth})  
   a. One concise paragraph describing potential emotions & focus areas this month (use conditional language like "might," "could," "may").  
   b. 1-2 crystals you might consider (name + 1-sentence potential benefit with conditional language).  
   c. 2-3 simple practices you could explore (e.g., salt-water hand rinse, grounding walk, candle).  
   d. Colors or outfit elements that might resonate with you this month.  
   e. Three gentle daily reminders phrased as possibilities (one sentence each, using conditional language).

*Keep insights focused on the current month, presented as possibilities rather than certainties.*

---

📝 Note:
Our energy patterns may shift with seasonal and monthly elemental changes.  
You might notice your energy rising or dipping at different times, which could be related to how these cycles interact with your natural patterns.

👉 Gentle adjustments with your monthly focus, supportive crystals, and simple practices might help you maintain balance and feel more connected to your natural rhythms.`;
}

/**
 * 生成月度能量表格数据
 * 
 * @param energyContext 能量上下文数据
 * @returns 月度能量表格数据
 */
function generateMonthlyScoresTable(energyContext: any): Array<{month: string, type: string, score: number}> {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // 能量类型
  const energyTypes = ['Growth', 'Passion', 'Stability', 'Clarity', 'Fluid'];
  
  // 当前年份
  const currentYear = energyContext.currentYear.year;
  
  // 生成月度能量表格
  return months.map((month, index) => {
    // 基于用户的八字信息和月份，计算能量类型和分数
    // 这里使用简化的逻辑，实际应用中应该有更复杂的计算
    
    // 计算月份的能量类型索引（这里使用简单算法，实际应基于八字和五行）
    const typeIndex = (index + parseInt(energyContext.bazi?.yearPillar?.charCodeAt(0)?.toString().slice(-1) || '0')) % energyTypes.length;
    
    // 计算能量分数（基于八字和当前月份的关系）
    const baseScore = 50 + (index % 3) * 10;
    const yearInfluence = parseInt(energyContext.bazi?.yearPillar?.charCodeAt(0)?.toString().slice(-1) || '0') * 2;
    const monthInfluence = parseInt(energyContext.bazi?.monthPillar?.charCodeAt(0)?.toString().slice(-1) || '0') * 2;
    let score = baseScore + yearInfluence + monthInfluence;
    
    // 确保分数在0-100范围内
    score = Math.max(0, Math.min(100, score));
    
    return {
      month,
      type: energyTypes[typeIndex],
      score
    };
  });
} 