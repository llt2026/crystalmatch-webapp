import { ForecastContext } from '../types/forecast';

/**
 * 构建月度能量报告的GPT提示词
 * 
 * @param context 预测上下文，包含用户八字和当前月份信息
 * @returns 用于GPT的提示词字符串
 */
function buildMonthlyReportPrompt(
  context: ForecastContext
): string {
  // 从上下文提取关键信息，提供默认值防止空值
  const {
    bazi = { yearPillar: '', monthPillar: '', dayPillar: '' },
    currentMonth = { name: '', year: new Date().getFullYear(), energyType: '', element: '' },
    userElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  } = context || {};
  
  // 安全地处理userElements
  const safeElements = {
    wood: userElements.wood || 0,
    fire: userElements.fire || 0,
    earth: userElements.earth || 0,
    metal: userElements.metal || 0,
    water: userElements.water || 0
  };
  
  // 构建主题提示词
  const prompt = `
You are a professional energy consultant specializing in energy readings and personalized guidance. 
Create a monthly energy report for a user based on their birth energy and current month's energy influence.

CONTEXT INFORMATION (NOT TO BE MENTIONED DIRECTLY):
- Birth Elements: ${JSON.stringify(safeElements)}
- Current Month: ${currentMonth.name} ${currentMonth.year} 
- Month Energy Type: ${currentMonth.energyType}
- Month Element: ${currentMonth.element}

REPORT GUIDELINES:
1. Create content in US English, conversational and accessible (like Headspace or Pattern app)
2. Be concise, light, and guidance-oriented
3. DO NOT mention Chinese metaphysics terminology or explain calculations
4. DO NOT mention "birth chart", "five elements," "bazi" or similar technical terms
5. Focus on practical guidance, not theory explanations
6. Write as if addressing this specific individual based on their energetic profile

FORMAT YOUR RESPONSE IN MARKDOWN WITH EXACTLY THESE SECTIONS:

# 🔮 ${currentMonth.name} ${currentMonth.year} — ${currentMonth.energyType} Rising

## 🌟 Energy Insight
[Brief description of this month's energy type and how it interacts with the user's natural energy. Never mention "birth chart" or technical terms. Be conversational and accessible. 2-3 sentences maximum.]

## ⚠️ Challenges
- [Challenge 1 in emotional or decision-making sphere, phrased casually like "Overthinking small decisions"]
- [Challenge 2]
- [Challenge 3 (optional)]

## 💎 Monthly Crystals
- [Crystal 1 recommendation] — [one sentence about its benefit]
- [Crystal 2 recommendation] — [one sentence about its benefit]

## ✨ Ritual / Behavior
[Suggest ONE simple action or ritual, like "Light a candle on Sunday and journal one weekly goal"]

## 🧭 Monthly Guidance
✅ [What to focus on, one concise line]  
✅ [Second focus area, optional]  
🚫 [What to avoid, one concise line]  
🚫 [Second avoidance area, optional]
`;

  return prompt;
}

export { buildMonthlyReportPrompt }; 