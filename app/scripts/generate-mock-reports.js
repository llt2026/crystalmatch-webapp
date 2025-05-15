/**
 * 生成模拟报告脚本
 * 
 * 这个脚本生成模拟的月度和年度报告，用于测试HTML查看器
 */

const fs = require('fs');
const path = require('path');

// 创建测试输出目录
const testDir = path.join(__dirname, '../../test-output');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// 创建public/test-output目录
const publicTestDir = path.join(__dirname, '../../public/test-output');
if (!fs.existsSync(publicTestDir)) {
  fs.mkdirSync(publicTestDir, { recursive: true });
}

// 模拟月度报告内容
const mockMonthlyReport = `
# 🔮 July 2025 — Passion Energy Rising

## 🌟 Energy Insight
July brings a surge of bold Passion Energy that amplifies your natural stability. This creates a dynamic balance between action and grounding.

## ⚠️ Challenges
- Overthinking decisions when quick action is needed
- Balancing personal needs with others' expectations
- Managing emotional intensity during full moon periods

## 💎 Monthly Crystals
- Carnelian — boosts confidence and creative momentum
- Smoky Quartz — grounds excess energy and provides focus

## ✨ Ritual / Behavior
Light a red candle on Sunday evenings and write down one bold action to take that week

## 🧭 Monthly Guidance
✅ Trust your first instinct on creative decisions  
✅ Schedule regular movement breaks during work  
🚫 Avoid overthinking small choices  
🚫 Don't take on others' emotional burdens
`;

// 模拟年度报告内容
const mockYearlyReport = `
This personalized energy forecast combines:
- The Five Elements from the user's Chinese birth chart
- Western Zodiac influence and elemental alignment
- Seasonal energy shifts across the year

The goal is clarity and inner alignment, not superstition.

| Month | Energy Type | Score (1-5) | Vibe Summary | Boost Strategy | Recommended Crystals |
|-------|-------------|-------------|--------------|----------------|----------------------|
| January | Stability Energy | 3 | Grounded but slow momentum | Set small daily goals | Citrine — confidence boost |
| February | Growth Energy | 4 | Creative expansion phase | Focus on one project | Green Aventurine — opportunity |
| March | Fluid Energy | 5 | Intuitive and flowing | Trust your instincts | Moonstone — intuition amplifier |
| April | Passion Energy | 4 | Bold and energetic | Channel energy into exercise | Carnelian — motivation |
| May | Clarity Energy | 3 | Mental focus and precision | Make important decisions | Clear Quartz — mental clarity |
| June | Stability Energy | 2 | Slower pace, foundation building | Create routines | Hematite — grounding |
| July | Passion Energy | 5 | Dynamic and expressive | Take creative risks | Sunstone — confidence |
| August | Growth Energy | 4 | Expansion and abundance | Network and connect | Jade — growth and prosperity |
| September | Clarity Energy | 3 | Analytical and focused | Organize and plan | Fluorite — mental clarity |
| October | Fluid Energy | 4 | Intuitive and adaptable | Follow your instincts | Labradorite — intuition |
| November | Stability Energy | 3 | Steady and consistent | Build foundations | Black Tourmaline — protection |
| December | Passion Energy | 4 | Energetic and celebratory | Express yourself freely | Ruby — passion and vitality |

🔁 **Feeling seen?**  
Share this energy summary with a friend who needs a little clarity this month. 💫

📅 Want to explore more?  
Head back to [/report](#/report) to view your full 12-month energy table and unlock more guidance for each month. 🌙
`;

// 保存模拟报告
console.log('正在生成模拟月度报告...');
fs.writeFileSync(path.join(testDir, 'monthly-report-response.md'), mockMonthlyReport);
fs.writeFileSync(path.join(publicTestDir, 'monthly-report-response.md'), mockMonthlyReport);

console.log('正在生成模拟年度报告...');
fs.writeFileSync(path.join(testDir, 'yearly-report-response.md'), mockYearlyReport);
fs.writeFileSync(path.join(publicTestDir, 'yearly-report-response.md'), mockYearlyReport);

console.log('模拟报告生成完成！');
console.log(`报告已保存到: ${testDir}`);
console.log(`报告已复制到: ${publicTestDir}`);
console.log('您现在可以通过访问 /test-viewer.html 查看报告'); 