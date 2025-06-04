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
    
    // 寻找默认的订阅计划或创建一个
    let planId = '';
    if (subscriptionStatus !== 'free') {
      // 查找匹配的订阅计划
      let plan = await prisma.subscriptionPlan.findFirst({
        where: { 
          name: { contains: subscriptionStatus, mode: 'insensitive' },
          isActive: true
        }
      });
      
      if (!plan) {
        // 如果找不到对应计划，则创建一个基本计划
        plan = await prisma.subscriptionPlan.create({
          data: {
            name: subscriptionStatus === 'plus' ? 'Plus Monthly' : 'Pro Monthly',
            description: `${subscriptionStatus === 'plus' ? 'Plus' : 'Pro'} membership`,
            price: subscriptionStatus === 'plus' ? 9.99 : 19.99,
            period: 'monthly',
            features: { access: subscriptionStatus === 'plus' ? 'plus' : 'pro' },
            isActive: true
          }
        });
      }
      planId = plan.id;
    }

    let expiresAt = null;
    if (subscriptionStatus === 'plus' || subscriptionStatus === 'pro') {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    
    // 取消现有的活跃订阅
    await prisma.subscription.updateMany({
      where: {
        userId: id,
        status: 'active',
        endDate: { gt: new Date() }
      },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    });
    
    // 如果不是免费会员，创建新的订阅
    if (subscriptionStatus !== 'free') {
      await prisma.subscription.create({
        data: {
          userId: id,
          planId: planId,
          status: 'active',
          startDate: new Date(),
          endDate: expiresAt,
          planType: subscriptionStatus  // 添加planType字段以便于查询
        }
      });
    }
    
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