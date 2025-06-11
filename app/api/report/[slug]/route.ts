import { NextRequest, NextResponse } from 'next/server';
import { getBaseBaziVector } from '@/app/lib/energyCalculation2025';
import { calculateProReportEnergy } from '@/app/lib/proReportCalculation';
import { getDailyEnergyForRange, getHourlyEnergyHeatmap } from '@/app/lib/energyCalculation2025';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { generateGptContent } from '@/app/lib/gptService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/report/[slug]
 * slug format: annual-basic-2025 | annual-premium-2025 | 2025-05
 * Note: This is copied from /api/reports/[slug], keep both functions synchronized
 */
export async function GET(req: NextRequest, { params }: { params:{ slug:string } }) {
  try {
    const birthDate = req.nextUrl.searchParams.get('birthDate');
    if (!birthDate) return NextResponse.json({ error:'Missing birthDate' }, { status:400 });

    // Validate slug format
    const slug = params.slug;                // Format like 2025-05
    if (!/^\d{4}-\d{2}$/.test(slug)) {
      return NextResponse.json({ error:'Invalid slug format, expected YYYY-MM' }, { status:400 });
    }

    console.log(`📅 Processing monthly report request: ${slug}, birth date: ${birthDate}`);
    
    const startDate = new Date(`${slug}-01`);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error:'Invalid date in slug' }, { status:400 });
    }

    const subscriptionDate = new Date(startDate);
    subscriptionDate.setDate(subscriptionDate.getDate() + 1);   // Subscription date + 1 day

    // Calculate base data
    console.log('🧮 Calculating base bazi data...');
    const baseBazi = getBaseBaziVector(birthDate);
    
    console.log('🔄 Calculating monthly energy overview...');
    const overview = calculateProReportEnergy(subscriptionDate, baseBazi);

    // Get daily energy data
    console.log('📈 Getting daily energy data...');
    const monthDays = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0).getDate();
    const daily = await getDailyEnergyForRange(birthDate, subscriptionDate, monthDays);

    // Get hourly energy data
    console.log('⏰ Getting hourly energy data...');
    const hourly = await getHourlyEnergyHeatmap(birthDate, subscriptionDate); // Only first day, optional

    // Build prompt
    console.log('📝 Building GPT prompt...');
    const promptText = buildMonthlyReportPrompt({ overview, daily, hourly });
    
    // Use generateGptContent instead of gptCall
    console.log('🤖 Calling GPT to generate report content...');
    const gptResponse = await generateGptContent({
      section: 'monthlyReportPro', 
      prompt: promptText,
      userContext: { userId: 'anonymous' }
    });

    // Extract content from GPT response
    const reportText = gptResponse.content;
    console.log(`✅ Report generated successfully, content length: ${reportText.length} characters, Tokens: ${gptResponse.totalTokens}`);

    return NextResponse.json({ 
      overview, 
      daily, 
      hourly, 
      report: reportText, // Return as report field to maintain consistency with original API
      tokens: {
        prompt: gptResponse.promptTokens,
        completion: gptResponse.completionTokens,
        total: gptResponse.totalTokens
      }
    });
  } catch (error: any) {
    console.error('❌ Monthly report generation failed:', error);
    return NextResponse.json({ 
      error: 'api_error',
      message: 'Monthly report generation service temporarily unavailable',
      details: error.message 
    }, { status: 500 });
  }
} 