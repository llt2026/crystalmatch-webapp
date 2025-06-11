import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

import OpenAI from 'openai';
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

// Create OpenAI client
const openai = new OpenAI({ 
  apiKey: apiKey,
  timeout: 90000,  // Longer timeout
  maxRetries: 3    // Automatic retry count
});

interface PostBody {
  birthDate: string; // ISO
  year: number;
  month: number; // 1-12
  tier?: 'free' | 'plus' | 'pro';
  forceRefresh?: boolean;
  userId?: string;
}

export async function POST(request: NextRequest) {
  console.log('Received monthly report generation request');
  
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

    const prompt = buildMonthlyReportPrompt({ 
      ...(energyContext as any), 
      userElements,
      birthDate 
    });
    console.log('Prompt build successful, length:', prompt.length);

    try {
      const model = getModelForTier(safeTier);
      const maxTokens = getMaxTokensForTier(safeTier);
      console.log(`Using OpenAI to generate monthly report ${year}-${month}, membership tier: ${safeTier}, model: ${model}, max tokens: ${maxTokens}`);
      
      // Strictly check if API key is valid
      if (!apiKey || apiKey.trim() === '') {
        console.error('OpenAI API key not configured');
        throw new Error('OpenAI API key not configured');
      }
      
      if (!apiKey.startsWith('sk-')) {
        console.error('OpenAI API key format is incorrect, should start with sk-');
        throw new Error('OpenAI API key has invalid format, should start with sk-');
      }
      
      if (apiKey.length < 40) {
        console.error('OpenAI API key length is insufficient');
        throw new Error('OpenAI API key length is too short');
      }
      
      console.log('Starting OpenAI API call...');
      const completion = await openai.chat.completions.create({
        model: model,
        max_tokens: maxTokens,
        temperature: 0.8,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const content = completion.choices[0].message?.content || '';
      console.log(`✅ OpenAI API call successful! Generated report content length: ${content.length} characters`);
      console.log('First 100 characters of report:', content.substring(0, 100));
      
      // Validate that generated content is valid
      if (!content || content.length < 100) {
        throw new Error('Generated content is too short or empty');
      }
      
      return NextResponse.json({ 
        report: content,
        debug: {
          api_success: true,
          content_length: content.length,
          model_used: model
        }
      });
    } catch (err: any) {
      console.error('❌ OpenAI API call failed:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        code: err.code,
        status: err.status,
        type: err.type
      });
      
      // In production, return error information directly without using mock data
      console.error('API call error, returning error information');
      
      // Record detailed error information for debugging
      const errorDetails = {
        message: err.message,
        code: err.code || 'unknown',
        type: err.type || 'connection_error',
        cause: err.cause?.code || 'unknown'
      };
      
      console.log('Error details:', JSON.stringify(errorDetails));
      
      // Return standardized error response
      return NextResponse.json({ 
        error: 'api_error',
        message: 'Report generation service is temporarily unavailable. Please try again later.',
        details: {
          error_type: err.name || 'unknown',
          error_code: err.code || 'unknown',
          request_id: Math.random().toString(36).substring(2, 15),
          timestamp: new Date().toISOString()
        }
      }, { 
        status: 503, // Service Unavailable is more appropriate for temporary issues
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Retry-After': '300' // Suggest retry after 5 minutes
        }
      });
    }
  } catch (reqError: any) {
    console.error('Request processing error:', reqError);
    return NextResponse.json({ error: reqError.message, stack: reqError.stack?.substring(0, 500) }, { status: 500 });
  }
} 