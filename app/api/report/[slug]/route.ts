import { NextRequest, NextResponse } from 'next/server';
import { getBaseBaziVector } from '@/app/lib/energyCalculation2025';
import { calculateProReportEnergy } from '@/app/lib/proReportCalculation';
import { getDailyEnergyForRange, getHourlyEnergyHeatmap, calculateSectionScores } from '@/app/lib/energyCalculation2025';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import OpenAI from 'openai';
import { getModelConfig } from '@/app/lib/gptModelsConfig';

// This is a Vercel auto-deployment test
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
    const energyResult = calculateProReportEnergy(subscriptionDate, baseBazi);
    
    // Calculate section-specific scores
    console.log('🔢 Calculating section scores...');
    const sectionScores = calculateSectionScores(baseBazi);
    console.log('Section scores:', sectionScores);
    
    // Transform energy result to match expected overview structure
    const overview = {
      title: `${energyResult.energyMode} ${energyResult.energyEmoji}`,
      energyScore: energyResult.score,
      strongestElement: energyResult.dominantElement.toLowerCase(),
      weakestElement: energyResult.weakestElement.toLowerCase(),
      periodStart: startDate.toISOString().split('T')[0],
      periodEnd: new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).toISOString().split('T')[0],
      vector: baseBazi, // Include the base bazi vector for element calculations
      sectionScores // Add section scores
    };

    // Get daily energy data
    console.log('📈 Getting daily energy data...');
    const monthDays = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0).getDate();
    const dailyRaw = await getDailyEnergyForRange(formattedBirthDate, subscriptionDate, monthDays);

    // Add score 0-100 for UI and GPT
    const dailyWithScore = dailyRaw;

    // Get hourly energy data
    console.log('⏰ Getting hourly energy data...');
    const hourlyRaw = await getHourlyEnergyHeatmap(formattedBirthDate, subscriptionDate); // Only first day, optional

    const hourlyWithScore = hourlyRaw;

    // Build prompt - only pass minimal, English-safe fields
    console.log('📝 Building GPT prompt...');

    const safeOverview = {
      title: overview.title,
      energyScore: overview.energyScore,
      periodStart: overview.periodStart,
      periodEnd: overview.periodEnd,
      sectionScores: overview.sectionScores // Add section scores to prompt
    };

    const safeDaily = dailyWithScore.map(({ score, trend }) => ({ score, trend }));
    const safeHourly = hourlyWithScore.map(({ hour, score, trend }) => ({ hour, score, trend }));

    const promptText = buildMonthlyReportPrompt({ overview: safeOverview, daily: safeDaily, hourly: safeHourly });
    
    // Direct OpenAI API call instead of using gptService
    console.log('🤖 Calling OpenAI API directly...');
    try {
      // Get model configuration
      const modelConfig = getModelConfig('monthlyReportPro');
      
      // Get API key
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      // Create OpenAI client
      const openai = new OpenAI({ apiKey });
      
      // Call OpenAI API directly
      const completion = await openai.chat.completions.create({
        model: modelConfig.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are an English-speaking energy consultant for US customers. Always reply in warm American English (no apologies, no language notes). Your report MUST contain each of the following section headers, in this exact Markdown form: ## 💰 Money Flow, ## 👥 Social Vibes, ## 🌙 Mood Balance, ## 🔥 Body Fuel, ## 🚀 Growth Track. Under each header write 2-3 unique paragraphs tailored to that life area. Do not add extra top-level sections.' 
          },
          { role: 'user', content: promptText }
        ],
        temperature: 0.3,
        max_tokens: modelConfig.maxTokens,
        user: 'anonymous'
      });

      const reportText = completion.choices[0]?.message?.content || '';
      
      // Log the first part of the report for debugging
      console.log('GPT PREVIEW >>>', reportText.substring(0, 500));
      
      // Check if response contains proper section headers
      const requiredSections = [
        '## 💰 Money Flow',
        '## 👥 Social Vibes',
        '## 🌙 Mood Balance',
        '## 🔥 Body Fuel',
        '## 🚀 Growth Track'
      ];
      
      const containsAllSections = requiredSections.every(section => 
        reportText.includes(section)
      );
      
      if (!containsAllSections) {
        console.warn('⚠️ Warning: Generated report is missing some required section headers');
        console.log('Required sections:', requiredSections);
        console.log('Response sections check:', requiredSections.map(section => ({ 
          section, 
          found: reportText.includes(section) 
        })));
      }
      
      console.log(`✅ Report generated successfully, content length: ${reportText.length} characters`);

      return NextResponse.json({ 
        overview, 
        daily: dailyWithScore, 
        hourly: hourlyWithScore, 
        report: reportText,
        tokens: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0
        }
      });
    } catch (gptError: any) {
      console.error('❌ Direct OpenAI API call failed:', gptError);
      
      // 直接返回错误信息，不使用静态回退内容
      return NextResponse.json({ 
        error: 'openai_api_error',
        message: 'Monthly report generation service temporarily unavailable',
        details: gptError.message
      }, { status: 503 });
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