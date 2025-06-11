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

    // Convert ISO date to YYYY-MM-DD format if needed
    let formattedBirthDate = birthDate;
    
    // Check if it's an ISO date format
    if (birthDate.includes('T') || birthDate.includes('Z')) {
      try {
        const dateObj = new Date(birthDate);
        if (!isNaN(dateObj.getTime())) {
          formattedBirthDate = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD
        }
      } catch (e) {
        // If parsing fails, continue with original validation
      }
    }

    // Validate birthDate format (now should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedBirthDate)) {
      return NextResponse.json({ 
        error: 'Invalid birthDate format', 
        message: 'Birth date must be in YYYY-MM-DD format or valid ISO format',
        details: { provided: birthDate, processed: formattedBirthDate }
      }, { status: 400 });
    }

    // Validate birth date is realistic
    const birthDateObj = new Date(formattedBirthDate);
    if (isNaN(birthDateObj.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid birthDate', 
        message: 'Birth date is not a valid date',
        details: { provided: birthDate, processed: formattedBirthDate }
      }, { status: 400 });
    }

    // Validate slug format and convert to YYYY-MM if needed
    const slug = params.slug;                
    let formattedSlug = slug;
    
    // Support both formats: YYYY-MM (like 2025-05) and month-YYYY (like may-2025)
    if (/^\d{4}-\d{2}$/.test(slug)) {
      // Already in YYYY-MM format
      formattedSlug = slug;
    } else if (/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{4}$/i.test(slug)) {
      // Convert month-YYYY to YYYY-MM format
      const [monthName, year] = slug.split('-');
      const monthMap: Record<string, string> = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      const monthNum = monthMap[monthName.toLowerCase()];
      if (monthNum) {
        formattedSlug = `${year}-${monthNum}`;
      } else {
        return NextResponse.json({ error:'Invalid month name in slug' }, { status:400 });
      }
    } else {
      return NextResponse.json({ 
        error:'Invalid slug format', 
        message: 'Expected YYYY-MM (e.g., 2025-05) or month-YYYY (e.g., may-2025) format',
        details: { provided: slug }
      }, { status:400 });
    }

    console.log(`📅 Processing monthly report request: ${slug} -> ${formattedSlug}, birth date: ${formattedBirthDate}`);
    
    const startDate = new Date(`${formattedSlug}-01`);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error:'Invalid date in slug' }, { status:400 });
    }

    const subscriptionDate = new Date(startDate);
    subscriptionDate.setDate(subscriptionDate.getDate() + 1);   // Subscription date + 1 day

    // Calculate base data
    console.log('🧮 Calculating base bazi data...');
    const baseBazi = getBaseBaziVector(formattedBirthDate);
    
    console.log('🔄 Calculating monthly energy overview...');
    const overview = calculateProReportEnergy(subscriptionDate, baseBazi);

    // Get daily energy data
    console.log('📈 Getting daily energy data...');
    const monthDays = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0).getDate();
    const daily = await getDailyEnergyForRange(formattedBirthDate, subscriptionDate, monthDays);

    // Get hourly energy data
    console.log('⏰ Getting hourly energy data...');
    const hourly = await getHourlyEnergyHeatmap(formattedBirthDate, subscriptionDate); // Only first day, optional

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