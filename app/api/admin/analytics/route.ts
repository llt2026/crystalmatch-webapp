import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/app/middleware/adminAuth';
import { getOnlineStats, getVisitStats } from '@/app/lib/analytics';

export async function GET(request: NextRequest) {
  // Verify admin token
  const authError = await verifyAdminToken(request);
  if (authError) return authError;

  try {
    const onlineStats = getOnlineStats();
    const visitStats = getVisitStats();

    return NextResponse.json({
      online: onlineStats,
      visits: visitStats
    });
  } catch (error) {
    console.error('Failed to retrieve analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
} 