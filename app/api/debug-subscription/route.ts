import { NextRequest, NextResponse } from 'next/server';
import { hasRemainingRequests, getModelForTier, getMaxTokensForTier } from '@/app/lib/subscription-service';
import { SubscriptionTier } from '@/app/types/subscription';

export const dynamic = 'force-dynamic';

/**
 * 测试订阅服务功能
 * GET /api/debug-subscription
 */
export async function GET(request: NextRequest) {
  try {
    const testResults: any = {};
    
    // 测试所有有效的订阅类型
    const validTiers: SubscriptionTier[] = ['free', 'plus', 'pro'];
    
    for (const tier of validTiers) {
      testResults[tier] = {
        hasRemainingRequests: hasRemainingRequests(tier, 0),
        model: getModelForTier(tier),
        maxTokens: getMaxTokensForTier(tier)
      };
    }
    
    // 测试无效的订阅类型
    try {
      // @ts-ignore - intentionally testing invalid tier
      hasRemainingRequests('invalid' as SubscriptionTier, 0);
      testResults.invalidTierTest = 'No error thrown';
    } catch (error: any) {
      testResults.invalidTierTest = `Error: ${error.message}`;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      testResults
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
} 