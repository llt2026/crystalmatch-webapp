import { parseISO, format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import type { MonthlyContext, SectionScores } from '../types/forecast'

// 指令与风格常量，供所有月度报告共享
const BASE_PROMPT_GUIDELINES = `CRITICAL INSTRUCTIONS: You are an English-speaking energy consultant for US customers.
Respond in warm AMERICAN ENGLISH. Do NOT add any apology sentences like "I'm sorry" or language declarations.

You are a supportive energy consultant providing personalized insights and gentle guidance.
Create a monthly energy report with a conversational, friendly tone that offers possibilities rather than directives.

Note: You are only responsible for writing content, do not attempt any energy calculations. All energy data has been pre-calculated by the system.

Tone & Approach Guidelines (stick to ALL):
1. Avoid commanding language — use gentle suggestions instead of "you should" / "you must".
2. Use uncertainty phrases abundantly — "might", "perhaps", "maybe", "seems like", "could be".
3. Frame everything as gentle exploration — "if you try…"  not "do this…".
4. Avoid definitive statements — "this might unfold" not "this will happen".
5. Use questions & invitations — "Have you considered…?", "What if…?".
6. Offer choices, not directives — "One possibility is…".
7. Position as companion, not authority — "I'm wondering…".
8. Keep a warm, supportive tone.

Content Rules:
• Do NOT mention Five Elements, BaZi, birth charts or similar Chinese metaphysics terms.
• No Chinese characters.
• Each life-area section must be UNIQUE and 2-3 paragraphs.
`;

export function buildMonthlyReportPrompt(ctx: Partial<MonthlyContext>): string {
  // ---------- 默认值 ----------
  const defaultScores: SectionScores = {
    finance: 50, social: 50, mood: 50, health: 50, growth: 50
  };
  const defaultOverview = {
    title: 'Monthly Energy',
    energyScore: 0,
    periodStart: '',
    sectionScores: defaultScores
  };

  // ---------- 合并上下文 ----------
  const overview = { ...defaultOverview, ...(ctx.overview ?? {}) };
  const sectionScores: SectionScores = { ...defaultScores, ...overview.sectionScores };

  // ---------- 日期解析 ----------
  const dateObj = overview.periodStart ? parseISO(overview.periodStart) : new Date();
  const monthNameRaw = format(dateObj, 'LLLL', { locale: enUS });
  // 简单去除可能的 markdown 特殊字符（理论上月名只有字母，但加稳健）
  const monthName = monthNameRaw.replace(/[^A-Za-z]/g, '');
  const year = dateObj.getFullYear();

  // ---------- 生成 Prompt ----------
  return `
${BASE_PROMPT_GUIDELINES}

# 🔮 ${monthName} ${year} — Monthly Energy Insights

## 💰 Money Flow (Finance & Career)
<Write 2-3 paragraphs with gentle, open-ended observations about finances & career, based on a score of ${sectionScores.finance}/100.>

## 👥 Social Vibes (Relationships)
<Write 2-3 paragraphs about relationships, friendships, community — based on a score of ${sectionScores.social}/100.>

## 🌙 Mood Balance (Emotional Well-being)
<Write 2-3 paragraphs about emotional peaks & valleys plus a simple practice suggestion — based on a score of ${sectionScores.mood}/100.>

## 🔥 Body Fuel (Health & Vitality)
<Write 2-3 paragraphs about physical vitality, sleep, nutrition, exercise — based on a score of ${sectionScores.health}/100.>

## 🚀 Growth Track (Personal Growth)
<Write 2-3 paragraphs about learning, goals, creativity, personal challenges — based on a score of ${sectionScores.growth}/100.>

IMPORTANT: Start directly with English content; never apologise about language.
`;
} 