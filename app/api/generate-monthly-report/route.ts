/**
 * 月度报告生成API - 统一调用点
 * 所有月度报告都使用此API生成，包括May 2025(Pro模板)和Apr 2025(Plus模板)
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// import OpenAI from 'openai';
import { getOpenAiApiKey } from '@/app/lib/db.config';
import { getFullEnergyContext } from '@/app/lib/getFullEnergyContext';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { calculateUserElements } from '@/app/lib/calculateUserElements';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';
import { SubscriptionTier } from '@/app/types/subscription';

// Get API key and add debug information
const apiKey = getOpenAiApiKey();
console.log('OpenAI API key status:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  maskedKey: apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : 'No API key',
  hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r'),
  hasSpaces: apiKey?.includes(' '),
  startsWithPrefix: apiKey?.startsWith('sk-'),
  isEmpty: !apiKey || apiKey?.trim() === ''
});

// Validate API key format
if (!apiKey || !apiKey.startsWith('sk-') || apiKey.length < 50) {
  console.error('OpenAI API key format is incorrect or missing');
}

// Create OpenAI client - 已禁用
// const openai = new OpenAI({ 
//   apiKey: apiKey,
//   timeout: 90000,  // Longer timeout
//   maxRetries: 3    // Automatic retry count
// });

interface PostBody {
  birthDate: string; // ISO
  year: number;
  month: number; // 1-12
  tier?: 'free' | 'plus' | 'pro';
  forceRefresh?: boolean;
  userId?: string;
}

export async function POST(request: NextRequest) {
  console.log('Received monthly report generation request - DISABLED, USING MOCK DATA');
  
  try {
    const { birthDate, year, month, tier = 'free', forceRefresh = false, userId = 'anonymous' } = (await request.json()) as PostBody;

    console.log('Request parameters:', { birthDate, year, month, tier, forceRefresh, userId });

    if (!birthDate || !year || !month) {
      console.error('Missing required parameters');
      return NextResponse.json({ error: 'birthDate, year, month are required' }, { status: 400 });
    }

    // Validate subscription tier
    const validTiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
    const safeTier: SubscriptionTier = validTiers.includes(tier as SubscriptionTier) 
      ? tier as SubscriptionTier 
      : 'free';
    
    if (tier !== safeTier) {
      console.warn(`Subscription tier "${tier}" in request is invalid, converted to "${safeTier}"`);
    }

    // Check quota (example only, should query DB in production)
    if (!hasRemainingRequests(safeTier, 0)) {
      console.error('User quota exceeded');
      return NextResponse.json({ error: 'quota exceeded' }, { status: 429 });
    }

    // Build energy context
    const birthDateObj = new Date(birthDate);
    // Use the middle day of the month (15th) to ensure correct energy cycle matching
    const targetDateObj = new Date(year, month - 1, 15);
    
    console.log('Attempting to build energy context:', {
      birthDate: birthDateObj.toISOString(),
      targetDate: targetDateObj.toISOString(),
      year,
      month,
      targetDateString: targetDateObj.toISOString().slice(0, 10)
    });
    
    const energyContext = getFullEnergyContext(birthDateObj, targetDateObj);
    if (!energyContext) {
      console.error('Energy context build failed - Debug details:', {
        birthDateValid: !isNaN(birthDateObj.getTime()),
        targetDateValid: !isNaN(targetDateObj.getTime()),
        birthDateStr: birthDateObj.toString(),
        targetDateStr: targetDateObj.toString()
      });
      return NextResponse.json({ error: 'failed to build energy context' }, { status: 500 });
    }
    
    console.log('Energy context built successfully:', {
      bazi: energyContext.bazi,
      currentYear: energyContext.currentYear,
      currentMonth: energyContext.currentMonth
    });

    // Calculate user's actual five element distribution
    const userElements = calculateUserElements(energyContext.bazi);
    console.log('User five elements calculation complete:', userElements);

    // 构建提示词 - 仅用于记录，不会实际调用API
    const prompt = buildMonthlyReportPrompt({ 
      ...(energyContext as any), 
      userElements,
      birthDate 
    });
    console.log('Prompt build successful, length:', prompt.length);

    // 返回模拟数据
    console.log('⚠️ OpenAI API调用已禁用，返回模拟数据');
    
    // 根据不同订阅等级返回不同复杂度的模拟数据
    const mockContent = generateMockMonthlyReport(safeTier, month, year);
    
    return NextResponse.json({ 
      report: mockContent,
      debug: {
        api_success: true,
        content_length: mockContent.length,
        model_used: getModelForTier(safeTier),
        isMockData: true
      }
    });
  } catch (reqError: any) {
    console.error('Request processing error:', reqError);
    return NextResponse.json({ error: reqError.message, stack: reqError.stack?.substring(0, 500) }, { status: 500 });
  }
}

/**
 * 生成模拟的月度报告内容
 */
function generateMockMonthlyReport(tier: SubscriptionTier, month: number, year: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthName = monthNames[month - 1];
  
  // 基础模拟内容
  const baseContent = `# 🔮 ${monthName} ${year} — Monthly Energy Insights [模拟数据]

## 💰 Money Flow (Finance & Career)
This is mock data for finance and career insights. The actual OpenAI API call has been disabled to save costs. Your financial energy this month seems balanced with opportunities for growth. Consider focusing on long-term investments and career development.

## 👥 Social Vibes (Relationships)
This is mock data for relationship insights. The actual OpenAI API call has been disabled to save costs. Your social connections may strengthen this month. Take time to nurture important relationships and be open to new connections.

## 🌙 Mood Balance (Emotional Well-being)
This is mock data for emotional well-being insights. The actual OpenAI API call has been disabled to save costs. Your emotional energy shows potential for stability. Practice mindfulness and self-care to maintain balance.

## 🔥 Body Fuel (Health & Vitality)
This is mock data for health insights. The actual OpenAI API call has been disabled to save costs. Your physical energy may fluctuate this month. Focus on consistent exercise and proper nutrition to maintain vitality.

## 🚀 Growth Track (Personal Growth)
This is mock data for personal growth insights. The actual OpenAI API call has been disabled to save costs. Your growth potential is strong this month. Consider learning a new skill or starting a creative project.`;

  // Pro版本添加更多详细内容
  if (tier === 'pro') {
    return baseContent + `

## 🌟 Pro Exclusive: Weekly Energy Forecast
### Week 1: Exploration
This is a good time for trying new approaches and exploring possibilities.

### Week 2: Consolidation
Focus on strengthening what you've already started.

### Week 3: Reflection
Take time to evaluate progress and adjust plans as needed.

### Week 4: Implementation
Put insights into action with concrete steps forward.

## 💎 Crystal Recommendations
- **Green Aventurine**: For prosperity and opportunity
- **Clear Quartz**: For clarity and focus
- **Amethyst**: For spiritual growth and intuition

## 🎨 Color Influences
Primary colors for ${monthName}: Purple, Silver, and Deep Blue
Avoid: Bright red and neon colors this month`;
  }
  
  // Plus版本添加中等详细内容
  if (tier === 'plus') {
    return baseContent + `

## 💎 Crystal Recommendation
**Rose Quartz**: Carry this crystal to enhance emotional balance and relationship harmony this month.

## 🌟 Key Dates
- ${month}/10: Potential for unexpected opportunity
- ${month}/22: Good day for important decisions`;
  }
  
  // 免费版本仅返回基础内容
  return baseContent;
} 