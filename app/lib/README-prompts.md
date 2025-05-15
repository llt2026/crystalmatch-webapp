# 能量报告提示词生成器

本目录包含CrystalMatch项目用于生成能量报告的提示词构建函数。

## 文件说明

- `buildMonthlyReportPrompt.ts` - 生成月度能量报告的提示词（Markdown格式）
- `buildForecastPrompt.ts` - 生成年度能量评分表的提示词（根据订阅级别生成不同格式）

## 类型定义

相关类型定义位于 `app/types/forecast.ts`：

```typescript
interface ForecastContext {
  bazi: BaziInfo;
  currentMonth: MonthInfo;
  userElements: UserElements;
  currentYear?: {
    pillar: string;
    zodiac: string;
  };
}
```

## 使用方法

### 1. 月度报告提示词

生成Markdown格式的月度能量报告，包含能量洞察、挑战、水晶推荐、仪式建议和月度指导。

```typescript
import { buildMonthlyReportPrompt } from '../lib/buildMonthlyReportPrompt';
import { ForecastContext } from '../types/forecast';

// 准备上下文数据
const context: ForecastContext = {
  // ...填充数据...
};

// 生成提示词
const prompt = buildMonthlyReportPrompt(context);

// 发送到OpenAI API
const completion = await openai.chat.completions.create({
  model: "gpt-4.1-nano",
  messages: [
    {
      role: "system", 
      content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
    },
    { 
      role: "user", 
      content: prompt 
    }
  ],
  temperature: 0.7,
});

// 使用结果 - 这是Markdown格式
const report = completion.choices[0].message.content;
```

### 2. 年度报告提示词

根据用户订阅状态生成不同复杂度的年度能量评分表。

```typescript
import { buildForecastPrompt } from '../lib/buildForecastPrompt';
import { ForecastContext } from '../types/forecast';

// 准备上下文数据
const context: ForecastContext = {
  // ...填充数据...
};

// 生成提示词 - 根据用户是否为订阅用户
const isSubscriber = true; // 或 false
const prompt = buildForecastPrompt(context, isSubscriber);

// 发送到OpenAI API
const completion = await openai.chat.completions.create({
  model: "gpt-4.1-nano",
  messages: [
    {
      role: "system", 
      content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
    },
    { 
      role: "user", 
      content: prompt 
    }
  ],
  temperature: 0.7,
});

// 使用结果 - 这是Markdown格式
const forecast = completion.choices[0].message.content;
```

## 测试

可以使用以下命令测试提示词生成函数：

```bash
# 运行测试脚本
npm run test-prompts
```

这将生成测试提示词并将它们保存到 `test-output` 目录中：

- `monthly-prompt.txt` - 月度报告提示词
- `free-forecast-prompt.txt` - 免费用户年度报告提示词
- `paid-forecast-prompt.txt` - 订阅用户年度报告提示词

## 提示词格式

### 月度报告格式

月度报告以Markdown格式输出，包含以下部分：

```markdown
# 🔮 [月份名] [年份] — [能量类型] Rising

## 🌟 Energy Insight
[能量洞察描述]

## ⚠️ Challenges
- [挑战1]
- [挑战2]
- [挑战3]

## 💎 Monthly Crystals
- [水晶1] — [功效描述]
- [水晶2] — [功效描述]

## ✨ Ritual / Behavior
[建议的仪式或行为]

## 🧭 Monthly Guidance
✅ [应该做什么]
✅ [应该做什么]
🚫 [避免做什么]
🚫 [避免做什么]
```

### 年度报告格式

年度报告以Markdown表格格式输出，根据用户的订阅状态有不同的列：

**免费用户表格**:
```
| Month | Energy Type | Score (1-5) | Vibe Summary |
```

**订阅用户表格**:
```
| Month | Energy Type | Score (1-5) | Vibe Summary | Boost Strategy | Recommended Crystals |
``` 