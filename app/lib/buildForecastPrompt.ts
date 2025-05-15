import { ForecastContext } from '../types/forecast';

/**
 * 构建年度评分报告的GPT提示词
 * 
 * @param context 预测上下文，包含用户八字和相关信息
 * @param isSubscriber 用户是否为订阅用户
 * @returns 用于GPT的提示词字符串
 */
function buildForecastPrompt(
  context: ForecastContext,
  isSubscriber: boolean
): string {
  // 从上下文提取关键信息，提供默认值以防空值
  const {
    bazi = { yearPillar: '', monthPillar: '', dayPillar: '' },
    currentMonth = { name: '', year: new Date().getFullYear(), energyType: '', element: '' },
    userElements = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
    currentYear = { pillar: '', zodiac: '' }
  } = context || {};
  
  // 安全地处理userElements
  const safeElements = {
    wood: userElements.wood || 0,
    fire: userElements.fire || 0,
    earth: userElements.earth || 0,
    metal: userElements.metal || 0,
    water: userElements.water || 0
  };
  
  // 基础提示词
  let prompt = `
You are a professional energy consultant specializing in personalized energy forecasts.
Create a 12-month energy forecast table for a user based on their birth energy profile.

CONTEXT INFORMATION (NOT TO BE MENTIONED DIRECTLY):
- Birth Elements: ${JSON.stringify(safeElements)}
- Current Year: ${currentYear.pillar} (${currentYear.zodiac} Year)
- Current Month: ${currentMonth.name} ${currentMonth.year}

REPORT GUIDELINES:
1. Write in American English with a warm, clear, gently therapeutic tone
2. Be conversational and accessible like Co-Star/Human Design/Headspace
3. Avoid technical terms, religious terminology, or superstitious expressions
4. DO NOT mention "birth chart", "five elements," "bazi" or any Chinese metaphysics terminology
5. Create content that's optimized for mobile reading and social sharing
6. Format the report in Markdown
7. Be concise yet insightful for each monthly entry

OUTPUT STRUCTURE:
The report should start with this exact introduction:

"""
This personalized energy forecast combines:
- The Five Elements from the user's Chinese birth chart
- Western Zodiac influence and elemental alignment
- Seasonal energy shifts across the year

The goal is clarity and inner alignment, not superstition.
"""
`;

  // 表格结构 - 根据用户是否为订阅用户添加不同的表格格式
  if (isSubscriber) {
    // 订阅用户 - 完整表格
    prompt += `
Next, generate a 12-month energy forecast table in Markdown format with these EXACT columns:
| Month | Energy Type | Score (1-5) | Vibe Summary | Boost Strategy | Recommended Crystals |

For each month:
1. Month: Standard month name (January through December)
2. Energy Type: One of these ONLY: Growth Energy, Passion Energy, Fluid Energy, Clarity Energy, or Stability Energy
3. Score: A number from 1-5 (5 being highest) representing energy intensity
4. Vibe Summary: 4-6 word description of the month's emotional tone (like "Creative flow and momentum")
5. Boost Strategy: One concise action recommendation (like "Stay focused on one goal")
6. Recommended Crystals: 1-2 crystals with brief emotional support description (like "Citrine — boosts confidence")

Choose crystals that complement the user's energy profile and monthly energy type. The crystal recommendations should address energy imbalances in the user's profile.
`;
  } else {
    // 免费用户 - 简化表格
    prompt += `
Next, generate a 12-month energy forecast table in Markdown format with these EXACT columns:
| Month | Energy Type | Score (1-5) | Vibe Summary |

For each month:
1. Month: Standard month name (January through December)
2. Energy Type: One of these ONLY: Growth Energy, Passion Energy, Fluid Energy, Clarity Energy, or Stability Energy
3. Score: A number from 1-5 (5 being highest) representing energy intensity
4. Vibe Summary: 4-6 word description of the month's emotional tone (like "Creative flow and momentum")

DO NOT include crystal recommendations or boost strategies for non-subscribers.
`;
  }

  // 添加报告结尾
  prompt += `
After the table, end your report with exactly this text:

"""
🔁 **Feeling seen?**  
Share this energy summary with a friend who needs a little clarity this month. 💫

📅 Want to explore more?  
Head back to [/report](#/report) to view your full 12-month energy table and unlock more guidance for each month. 🌙
"""

IMPORTANT FINAL INSTRUCTIONS:
1. Do NOT explain the methodology or how the report was generated
2. Do NOT include any warnings about the limitations of the report
3. Do NOT add any extra text beyond what was specified above
4. Output ONLY in Markdown format
5. Ensure the table is perfectly formatted with the specified columns
`;

  return prompt;
}

export { buildForecastPrompt }; 