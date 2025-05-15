"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildForecastPrompt = buildForecastPrompt;
/**
 * 构建年度评分报告的GPT提示词
 *
 * @param context 预测上下文，包含用户八字和相关信息
 * @param isSubscriber 用户是否为订阅用户
 * @returns 用于GPT的提示词字符串
 */
function buildForecastPrompt(context, isSubscriber) {
    // 从上下文提取关键信息，提供默认值以防空值
    var _a = context || {}, _b = _a.bazi, bazi = _b === void 0 ? { yearPillar: '', monthPillar: '', dayPillar: '' } : _b, _c = _a.currentMonth, currentMonth = _c === void 0 ? { name: '', year: new Date().getFullYear(), energyType: '', element: '' } : _c, _d = _a.userElements, userElements = _d === void 0 ? { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 } : _d, _e = _a.currentYear, currentYear = _e === void 0 ? { pillar: '', zodiac: '' } : _e;
    // 安全地处理userElements
    var safeElements = {
        wood: userElements.wood || 0,
        fire: userElements.fire || 0,
        earth: userElements.earth || 0,
        metal: userElements.metal || 0,
        water: userElements.water || 0
    };
    // 基础提示词
    var prompt = "\nYou are a professional energy consultant specializing in personalized energy forecasts.\nCreate a 12-month energy forecast table for a user based on their birth energy profile.\n\nCONTEXT INFORMATION (NOT TO BE MENTIONED DIRECTLY):\n- Birth Elements: ".concat(JSON.stringify(safeElements), "\n- Current Year: ").concat(currentYear.pillar, " (").concat(currentYear.zodiac, " Year)\n- Current Month: ").concat(currentMonth.name, " ").concat(currentMonth.year, "\n\nREPORT GUIDELINES:\n1. Write in American English with a warm, clear, gently therapeutic tone\n2. Be conversational and accessible like Co-Star/Human Design/Headspace\n3. Avoid technical terms, religious terminology, or superstitious expressions\n4. DO NOT mention \"birth chart\", \"five elements,\" \"bazi\" or any Chinese metaphysics terminology\n5. Create content that's optimized for mobile reading and social sharing\n6. Format the report in Markdown\n7. Be concise yet insightful for each monthly entry\n\nOUTPUT STRUCTURE:\nThe report should start with this exact introduction:\n\n\"\"\"\nThis personalized energy forecast combines:\n- The Five Elements from the user's Chinese birth chart\n- Western Zodiac influence and elemental alignment\n- Seasonal energy shifts across the year\n\nThe goal is clarity and inner alignment, not superstition.\n\"\"\"\n");
    // 表格结构 - 根据用户是否为订阅用户添加不同的表格格式
    if (isSubscriber) {
        // 订阅用户 - 完整表格
        prompt += "\nNext, generate a 12-month energy forecast table in Markdown format with these EXACT columns:\n| Month | Energy Type | Score (1-5) | Vibe Summary | Boost Strategy | Recommended Crystals |\n\nFor each month:\n1. Month: Standard month name (January through December)\n2. Energy Type: One of these ONLY: Growth Energy, Passion Energy, Fluid Energy, Clarity Energy, or Stability Energy\n3. Score: A number from 1-5 (5 being highest) representing energy intensity\n4. Vibe Summary: 4-6 word description of the month's emotional tone (like \"Creative flow and momentum\")\n5. Boost Strategy: One concise action recommendation (like \"Stay focused on one goal\")\n6. Recommended Crystals: 1-2 crystals with brief emotional support description (like \"Citrine \u2014 boosts confidence\")\n\nChoose crystals that complement the user's energy profile and monthly energy type. The crystal recommendations should address energy imbalances in the user's profile.\n";
    }
    else {
        // 免费用户 - 简化表格
        prompt += "\nNext, generate a 12-month energy forecast table in Markdown format with these EXACT columns:\n| Month | Energy Type | Score (1-5) | Vibe Summary |\n\nFor each month:\n1. Month: Standard month name (January through December)\n2. Energy Type: One of these ONLY: Growth Energy, Passion Energy, Fluid Energy, Clarity Energy, or Stability Energy\n3. Score: A number from 1-5 (5 being highest) representing energy intensity\n4. Vibe Summary: 4-6 word description of the month's emotional tone (like \"Creative flow and momentum\")\n\nDO NOT include crystal recommendations or boost strategies for non-subscribers.\n";
    }
    // 添加报告结尾
    prompt += "\nAfter the table, end your report with exactly this text:\n\n\"\"\"\n\uD83D\uDD01 **Feeling seen?**  \nShare this energy summary with a friend who needs a little clarity this month. \uD83D\uDCAB\n\n\uD83D\uDCC5 Want to explore more?  \nHead back to [/report](#/report) to view your full 12-month energy table and unlock more guidance for each month. \uD83C\uDF19\n\"\"\"\n\nIMPORTANT FINAL INSTRUCTIONS:\n1. Do NOT explain the methodology or how the report was generated\n2. Do NOT include any warnings about the limitations of the report\n3. Do NOT add any extra text beyond what was specified above\n4. Output ONLY in Markdown format\n5. Ensure the table is perfectly formatted with the specified columns\n";
    return prompt;
}
