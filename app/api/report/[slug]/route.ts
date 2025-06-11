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
    console.log('🔍 Received request for slug:', params.slug);
    console.log('🔍 Full URL:', req.url);
    console.log('🔍 Search params:', Object.fromEntries(req.nextUrl.searchParams.entries()));
    
    const birthDate = req.nextUrl.searchParams.get('birthDate');
    if (!birthDate) {
      console.log('❌ Missing birthDate parameter');
      return NextResponse.json({ error:'Missing birthDate' }, { status:400 });
    }
    console.log('🔍 Original birthDate:', birthDate);

    // Convert ISO date to YYYY-MM-DD format if needed
    let formattedBirthDate = birthDate;
    
    // Check if it's an ISO date format
    if (birthDate.includes('T') || birthDate.includes('Z')) {
      try {
        const dateObj = new Date(birthDate);
        if (!isNaN(dateObj.getTime())) {
          formattedBirthDate = dateObj.toISOString().split('T')[0]; // Extract YYYY-MM-DD
          console.log('🔄 Converted birthDate to:', formattedBirthDate);
        } else {
          console.log('⚠️ Date parsing resulted in invalid date');
        }
      } catch (e) {
        console.error('❌ Error parsing date:', e);
        // If parsing fails, continue with original validation
      }
    }

    // Validate birthDate format (now should be YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedBirthDate)) {
      console.log('❌ Invalid birthDate format after processing:', formattedBirthDate);
      return NextResponse.json({ 
        error: 'Invalid birthDate format', 
        message: 'Birth date must be in YYYY-MM-DD format or valid ISO format',
        details: { provided: birthDate, processed: formattedBirthDate }
      }, { status: 400 });
    }

    // Validate birth date is realistic
    const birthDateObj = new Date(formattedBirthDate);
    if (isNaN(birthDateObj.getTime())) {
      console.log('❌ Invalid date object after parsing:', formattedBirthDate);
      return NextResponse.json({ 
        error: 'Invalid birthDate', 
        message: 'Birth date is not a valid date',
        details: { provided: birthDate, processed: formattedBirthDate }
      }, { status: 400 });
    }

    // Validate slug format and convert to YYYY-MM if needed
    const slug = params.slug;                
    let formattedSlug = slug;
    
    console.log('🔍 Processing slug:', slug);
    
    // Support both formats: YYYY-MM (like 2025-05) and month-YYYY (like may-2025)
    if (/^\d{4}-\d{2}$/.test(slug)) {
      // Already in YYYY-MM format
      formattedSlug = slug;
      console.log('✅ Slug already in YYYY-MM format:', formattedSlug);
    } else if (/^([a-z]+)-\d{4}$/i.test(slug)) {
      // Convert month-YYYY to YYYY-MM format
      const [monthName, year] = slug.split('-');
      const monthMap: Record<string, string> = {
        'january': '01', 'jan': '01',
        'february': '02', 'feb': '02',
        'march': '03', 'mar': '03',
        'april': '04', 'apr': '04',
        'may': '05',
        'june': '06', 'jun': '06',
        'july': '07', 'jul': '07',
        'august': '08', 'aug': '08',
        'september': '09', 'sep': '09',
        'october': '10', 'oct': '10',
        'november': '11', 'nov': '11',
        'december': '12', 'dec': '12'
      };
      const monthNum = monthMap[monthName.toLowerCase()];
      if (monthNum) {
        formattedSlug = `${year}-${monthNum}`;
        console.log('🔄 Converted slug to YYYY-MM format:', formattedSlug);
      } else {
        console.log('❌ Invalid month name in slug:', monthName);
        return NextResponse.json({ 
          error: 'Invalid month name in slug', 
          message: 'Month name not recognized',
          details: { provided: monthName, expected: 'jan/january, feb/february, etc.' }
        }, { status:400 });
      }
    } else {
      console.log('❌ Slug format not recognized:', slug);
      return NextResponse.json({ 
        error:'Invalid slug format', 
        message: 'Expected YYYY-MM (e.g., 2025-05) or month-YYYY (e.g., may-2025) format',
        details: { provided: slug }
      }, { status:400 });
    }

    console.log(`📅 Processing monthly report request: ${slug} -> ${formattedSlug}, birth date: ${formattedBirthDate}`);
    
    const startDate = new Date(`${formattedSlug}-01`);
    if (isNaN(startDate.getTime())) {
      console.log('❌ Invalid date after formatting slug:', formattedSlug);
      return NextResponse.json({ 
        error:'Invalid date in slug', 
        details: { slug, formattedSlug, resultDate: `${formattedSlug}-01` }
      }, { status:400 });
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
    try {
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
    } catch (gptError: any) {
      console.error('❌ GPT API call failed:', gptError);
      
      // 使用静态回退内容，而不是抛出错误
      const fallbackReport = `# May 2025 Energy Report

## Overview
Due to temporary technical issues, we're providing a simplified report for May 2025.

## Key Dates
- May 1-5: Focus on planning and organization
- May 15-20: Good energy for social activities
- May 25-30: Ideal for completing projects

## Recommendations
- Practice mindfulness daily
- Stay hydrated and maintain regular exercise
- Schedule important meetings in the morning hours

*A complete personalized report will be available soon.*`;

      console.log('Using fallback report content');
      
      // 返回包含回退内容的响应
      return NextResponse.json({ 
        overview, 
        daily, 
        hourly, 
        report: fallbackReport,
        error_info: {
          type: 'gpt_error_with_fallback',
          message: 'Using simplified report due to temporary API issues',
          original_error: gptError.message
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Monthly report generation failed:', error);
    return NextResponse.json({ 
      error: 'api_error',
      message: 'Monthly report generation service temporarily unavailable',
      details: error.message 
    }, { status: 500 });
  }
} 