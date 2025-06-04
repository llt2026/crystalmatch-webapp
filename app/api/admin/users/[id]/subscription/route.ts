import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'changeme';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const adminKey = request.headers.get('x-admin-secret');
  if (adminKey !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { status = 'free', expiresAt } = await request.json();

  console.log(`Admin updated user ${id} subscription to ${status}`, expiresAt);

  return NextResponse.json({ success: true, userId: id, status, expiresAt });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { subscriptionStatus } = await request.json();
    
    const validStatuses = ['free', 'plus', 'pro', 'none'];
    if (!validStatuses.includes(subscriptionStatus)) {
      return NextResponse.json(
        { error: 'Invalid subscription status' }, 
        { status: 400 }
      );
    }
    
    let expiresAt = null;
    if (subscriptionStatus === 'plus' || subscriptionStatus === 'pro') {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        subscriptionStatus,
        subscriptionExpiresAt: expiresAt
      },
    });
    
    console.log(`Admin updated user ${id} subscription to ${subscriptionStatus}`, expiresAt);
    
    return NextResponse.json({ 
      success: true, 
      userId: id, 
      status: subscriptionStatus,
      expiresAt
    });
    
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status' }, 
      { status: 500 }
    );
  }
} 