"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMonthlyReportPrompt = buildMonthlyReportPrompt;
/**
 * 构建月度能量报告的GPT提示词
 *
 * @param context 预测上下文，包含用户八字和当前月份信息
 * @returns 用于GPT的提示词字符串
 */
function buildMonthlyReportPrompt(context) {
    // 从上下文提取关键信息，提供默认值防止空值
    var _a = context || {}, _b = _a.bazi, bazi = _b === void 0 ? { yearPillar: '', monthPillar: '', dayPillar: '' } : _b, _c = _a.currentMonth, currentMonth = _c === void 0 ? { name: '', year: new Date().getFullYear(), energyType: '', element: '' } : _c, _d = _a.userElements, userElements = _d === void 0 ? { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 } : _d;
    // 安全地处理userElements
    var safeElements = {
        wood: userElements.wood || 0,
        fire: userElements.fire || 0,
        earth: userElements.earth || 0,
        metal: userElements.metal || 0,
        water: userElements.water || 0
    };
    // 构建主题提示词
    var prompt = "\nYou are a professional energy consultant specializing in energy readings and personalized guidance. \nCreate a monthly energy report for a user based on their birth energy and current month's energy influence.\n\nCONTEXT INFORMATION (NOT TO BE MENTIONED DIRECTLY):\n- Birth Elements: ".concat(JSON.stringify(safeElements), "\n- Current Month: ").concat(currentMonth.name, " ").concat(currentMonth.year, " \n- Month Energy Type: ").concat(currentMonth.energyType, "\n- Month Element: ").concat(currentMonth.element, "\n\nREPORT GUIDELINES:\n1. Create content in US English, conversational and accessible (like Headspace or Pattern app)\n2. Be concise, light, and guidance-oriented\n3. DO NOT mention Chinese metaphysics terminology or explain calculations\n4. DO NOT mention \"birth chart\", \"five elements,\" \"bazi\" or similar technical terms\n5. Focus on practical guidance, not theory explanations\n6. Write as if addressing this specific individual based on their energetic profile\n\nFORMAT YOUR RESPONSE IN MARKDOWN WITH EXACTLY THESE SECTIONS:\n\n# \uD83D\uDD2E ").concat(currentMonth.name, " ").concat(currentMonth.year, " \u2014 ").concat(currentMonth.energyType, " Rising\n\n## \uD83C\uDF1F Energy Insight\n[Brief description of this month's energy type and how it interacts with the user's natural energy. Never mention \"birth chart\" or technical terms. Be conversational and accessible. 2-3 sentences maximum.]\n\n## \u26A0\uFE0F Challenges\n- [Challenge 1 in emotional or decision-making sphere, phrased casually like \"Overthinking small decisions\"]\n- [Challenge 2]\n- [Challenge 3 (optional)]\n\n## \uD83D\uDC8E Monthly Crystals\n- [Crystal 1 recommendation] \u2014 [one sentence about its benefit]\n- [Crystal 2 recommendation] \u2014 [one sentence about its benefit]\n\n## \u2728 Ritual / Behavior\n[Suggest ONE simple action or ritual, like \"Light a candle on Sunday and journal one weekly goal\"]\n\n## \uD83E\uDDED Monthly Guidance\n\u2705 [What to focus on, one concise line]  \n\u2705 [Second focus area, optional]  \n\uD83D\uDEAB [What to avoid, one concise line]  \n\uD83D\uDEAB [Second avoidance area, optional]\n");
    return prompt;
}
