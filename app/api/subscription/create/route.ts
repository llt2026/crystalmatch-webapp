import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Create subscription - mock implementation for build purposes
 * POST /api/subscription/create
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user identity
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify JWT
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
      );
      
      // Get request data
      const { planId } = await request.json();
      
      // Validate plan ID
      if (!planId) {
        return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
      }

      // Extract user info from token
      const userEmail = payload.email as string;
      const userId = payload.sub || 'user-123';

      // Mock subscription creation
      const mockResult = {
        id: `sub_${Date.now()}`,
        userId: userId.toString(),
        planId,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add payment-related info
        paymentIntent: {
          id: `pi_${Date.now()}`,
          status: 'requires_payment_method',
          clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`
        }
      };

      // Return mock result
      return NextResponse.json(mockResult);
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
} 