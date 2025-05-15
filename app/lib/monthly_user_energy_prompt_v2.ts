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

✨ This personalized energy forecast combines:
- The Five Elements from your Chinese birth chart
- Your Western Zodiac and elemental alignment
- Monthly seasonal energy and emotional resonance

Our goal: clarity, alignment, and inner growth.

---

Immutable facts (do NOT change):
• Birthdate: ${birthdate}
• Dominant Energy: ${energyContext.dominantElement || 'Wood'}
• Missing Energy: ${energyContext.missingElement || 'Water'}
• Current Month: ${currentMonth}
• Monthly Energy Table: ${JSON.stringify(monthlyScoresTable)}

Generate the MONTHLY report body in American English:

1. **12-Month Energy Table**  
   - Columns: Month | Energy Type | Score (0-100).  
   - No explanations inside the table.

2. **Current-Month Deep Insight** (only for ${currentMonth})  
   a. One concise paragraph describing emotions & focus this month.  
   b. 1-2 recommended crystals (name + 1-sentence benefit).  
   c. 2-3 simple energy-boost actions (e.g., salt-water hand rinse, grounding walk, candle).  
   d. Lucky color / outfit vibe.  
   e. Three sample daily energy reminders (one sentence each).

*Do NOT provide deep insights for other months.*

---

📝 Note:
Each person's core energy is influenced by the yearly and monthly elemental changes.  
Your energy may rise or dip depending on how these cycles interact with your birth chart.

👉 That's why it's essential to adjust monthly—with the right focus, crystals, and small rituals—to stay balanced and empowered.`;
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