/**
 * 年度订阅用户能量报告提示词模板
 * 
 * 该模板提供年度概览、季度快照和12个月能量表格
 * 输出语言为美式英语
 */

import { format } from 'date-fns';

/**
 * 生成年度订阅用户的能量报告提示词
 * 
 * @param energyContext 能量上下文数据
 * @returns 提示词字符串
 */
export function generateAnnualUserPrompt(energyContext: any): string {
  // 格式化出生日期
  const birthdate = format(new Date(energyContext.birthDate), 'MMMM d, yyyy');
  
  // 生成月度能量分数字典
  const monthlyScores = generateMonthlyScoresDict(energyContext);
  
  return `# === CrystalMatch · Annual Plan Prompt (with Quarterly & Bridge Tips) ===

✨ This personalized energy forecast combines:
- The Five Elements from your Chinese birth chart
- Your Western Zodiac and elemental alignment
- Monthly seasonal energy and emotional resonance

Our goal: clarity, alignment, and inner growth.

---

User constants (never change):
• Birthdate: ${birthdate}
• Dominant Energy: ${energyContext.dominantElement || 'Wood'}
• Missing Energy: ${energyContext.missingElement || 'Water'}
• Monthly Scores: ${JSON.stringify(monthlyScores)}

Generate the YEARLY OVERVIEW report in American English:

A. **Year Summary**  
   - 1 paragraph summarizing overall themes, opportunities, challenges.  
   - Compare first half vs. second half energies.  
   - One long-term recommendation for balancing the missing element.

B. **Quarter Snapshots** (Q1-Q4)  
   - For each quarter, give 2-3 sentences on energy trend and best focus.

C. **12-Month Summary Table**  
   Columns: Month | Energy Type | Score | Primary Focus | 1-2 Crystals | Simple Ritual  
   *After each month row, add a single-line "Next-Month Bridge Tip" that prepares the user for the coming month.*  
   Example format inside the table cell:  
   \`Bridge ➜ Energy drops in June; schedule downtime in the last week of May.\`

D. **Key Energy Days**  
   - List at least 2 High-Power Days and 1 Low-Energy Caution Day (date + one-line note).

E. **Navigation Note**  
   - End with one sentence instructing:  
     *"Tap any month to open its full in-depth report."*  
   (Do NOT include the full monthly reports here.)

---

📝 Note:
Each person's core energy is influenced by the yearly and monthly elemental changes.  
Your energy may rise or dip depending on how these cycles interact with your birth chart.

👉 That's why it's essential to adjust monthly—with the right focus, crystals, and small rituals—to stay balanced and empowered.`;
}

/**
 * 生成月度能量分数字典
 * 
 * @param energyContext 能量上下文数据
 * @returns 月度能量分数字典
 */
function generateMonthlyScoresDict(energyContext: any): Record<string, number> {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // 当前年份
  const currentYear = energyContext.currentYear.year;
  
  // 生成月度能量分数字典
  const scoresDict: Record<string, number> = {};
  
  months.forEach((month, index) => {
    // 计算能量分数（基于八字和当前月份的关系）
    const baseScore = 50 + (index % 3) * 10;
    const yearInfluence = parseInt(energyContext.bazi?.yearPillar?.charCodeAt(0)?.toString().slice(-1) || '0') * 2;
    const monthInfluence = parseInt(energyContext.bazi?.monthPillar?.charCodeAt(0)?.toString().slice(-1) || '0') * 2;
    let score = baseScore + yearInfluence + monthInfluence;
    
    // 确保分数在0-100范围内
    score = Math.max(0, Math.min(100, score));
    
    scoresDict[month] = score;
  });
  
  return scoresDict;
} 