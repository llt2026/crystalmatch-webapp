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

✨ This personalized energy forecast explores:
- The Five Elements from your Chinese birth chart
- Your Western Zodiac and elemental alignment
- Monthly seasonal energy and emotional resonance

Our hope is to offer insights that might bring clarity, alignment, and possibilities for inner growth.

---

User constants (never change):
• Birthdate: ${birthdate}
• Dominant Energy: ${energyContext.dominantElement || 'Wood'}
• Missing Energy: ${energyContext.missingElement || 'Water'}
• Monthly Scores: ${JSON.stringify(monthlyScores)}

Generate the YEARLY OVERVIEW report in American English with a gentle, supportive tone:

A. **Year Patterns**  
   - 1 paragraph exploring potential themes, opportunities, and challenges using conditional language.  
   - Consider comparing first half vs. second half energy patterns.  
   - Suggest one possibility for balancing the missing element (using "might," "could," "consider").

B. **Quarter Reflections** (Q1-Q4)  
   - For each quarter, offer 2-3 sentences on possible energy trends and areas you might find beneficial to explore.

C. **12-Month Possibilities Table**  
   Columns: Month | Energy Type | Score | Potential Focus | Crystals to Consider | Practice to Explore  
   *After each month row, consider adding a gentle "Next-Month Bridge Tip" that suggests a way to prepare for the coming month.*  
   Example format inside the table cell:  
   \`Bridge ➜ Energy might shift in June; you could consider scheduling some downtime in the last week of May.\`

D. **Dates to Note**  
   - Suggest at least 2 potentially higher-energy days and 1 day when you might benefit from extra self-care (date + gentle note using conditional language).

E. **Navigation Note**  
   - End with one sentence sharing:  
     *"You might find it helpful to tap any month to explore its in-depth report."*  
   (Do NOT include the full monthly reports here.)

---

📝 Note:
Our energy patterns may shift with seasonal and yearly elemental changes.  
You might notice your energy rising or dipping at different times, which could be related to how these cycles interact with your natural patterns.

👉 Gentle adjustments with your monthly focus, supportive crystals, and simple practices might help you maintain balance and feel more connected to your natural rhythms.`;
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