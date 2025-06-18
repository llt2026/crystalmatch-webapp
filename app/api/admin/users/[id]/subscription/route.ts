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
    
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
    
    // 更新或创建订阅记录
    const existingSub = await prisma.subscription.findFirst({
      where: {
        userId: id,
        status: { in: ['active','trial'] }
      }
    });

    let newSubscription;
    if (subscriptionStatus === 'free') {
      // 将现有订阅设为取消
      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date()
          }
        });
      }
      newSubscription = null;
    } else {
      const subData = {
        userId: id,
        planId,
        status: 'active',
        startDate: new Date(),
        endDate: expiresAt
      };
      if (existingSub) {
        newSubscription = await prisma.subscription.update({
          where: { id: existingSub.id },
          data: subData
        });
      } else {
        newSubscription = await prisma.subscription.create({ data: subData });
      }
    }
    
    // 记录操作日志
    await prisma.log.create({
      data: {
        action: 'update_subscription',
        entity: 'user',
        entityId: id,
        details: { 
          status: subscriptionStatus,
          expiresAt: expiresAt?.toISOString()
        }
      }
    }).catch((err: unknown) => console.error('Failed to create log:', err));
    
    // 为付费会员生成报告（Plus升级Pro、续订等都应该生成新报告）
    let reportResult = null;
    if (subscriptionStatus === 'plus' || subscriptionStatus === 'pro') {
      try {
        console.log(`Generating report for user ${id} with subscription status: ${subscriptionStatus}`);
        
        // 动态导入报告生成服务
        const { handleSubscriptionChange } = await import('@/app/lib/services/report-generation');
        
        // 生成报告
        reportResult = await handleSubscriptionChange(
          id,
          subscriptionStatus as 'plus' | 'pro'
        );
        
        if (reportResult.success) {
          console.log(`Report generated for user ${id} with tier ${subscriptionStatus}, reportId: ${reportResult.reportId}`);
        } else {
          console.error(`Failed to generate report for user ${id}: ${reportResult.error}`);
        }
      } catch (reportError) {
        console.error('Error generating report after subscription update:', reportError);
        // 不阻止主流程，只记录错误
      }
    }
    
    console.log(`Admin updated user ${id} subscription to ${subscriptionStatus}`, expiresAt);
    
    return NextResponse.json({ 
      success: true, 
      userId: id, 
      status: subscriptionStatus,
      expiresAt,
      reportGenerated: !!reportResult?.success,
      reportId: reportResult?.reportId
    });
    
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 