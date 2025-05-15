import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/app/middleware/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify admin token
  const authError = await verifyAdminToken(request);
  if (authError) return authError;

  try {
    const userId = params.id;

    // In a real application, this data would be fetched from a database
    // Using mock data for development purposes
    const mockUser = {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      subscription: {
        status: Math.random() > 0.7 ? 'premium' : 'free',
        expiresAt: Math.random() > 0.7 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        history: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
          planId: Math.random() > 0.5 ? 'premium' : 'premium-yearly',
          startDate: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: Math.random() > 0.5 ? 99 : 999
        }))
      },
      reports: Array.from({ length: Math.floor(Math.random() * 10) }, (_, i) => ({
        id: `report-${i + 1}`,
        date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        title: `Energy Report #${i + 1}`,
        summary: 'This is a detailed energy analysis report that includes the user\'s energy status and recommendations.'
      }))
    };

    if (!mockUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Failed to retrieve user details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user details' },
      { status: 500 }
    );
  }
} 