import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken } from '../../../middleware/adminAuth';
import { prisma } from '@/app/lib/prisma';

// Mock online users data store
// In a real application, this would be stored in a database or Redis
let onlineUsers = Math.floor(Math.random() * 50) + 30; // Random number between 30-80

// Simulate real-time changes in online user count
setInterval(() => {
  // Random fluctuation between -5 and +5 users
  const change = Math.floor(Math.random() * 10) - 5;
  onlineUsers = Math.max(20, Math.min(100, onlineUsers + change)); // Keep between 20-100
}, 30000); // Update every 30 seconds

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const isAdmin = await validateAdminToken(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Generate date labels for the last six months
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    // ===== 使用真实数据库统计 =====
    let totalUsers = 0;
    let activeUsers = 0;
    let subscribedUsers = 0;
    try {
      totalUsers = await prisma.user.count();
      // 假设30天内 emailVerified 不为空视为活跃
      activeUsers = await prisma.user.count({
        where: {
          emailVerified: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });
      subscribedUsers = await prisma.user.count({
        where: {
          subscriptionStatus: 'premium',
        },
      });
    } catch (e) {
      console.error('查询数据库统计失败，使用mock', e);
      totalUsers = 1254;
      activeUsers = 876;
      subscribedUsers = 312;
    }

    // Subscription breakdown
    const monthlySubscribers = 198;
    const yearlySubscribers = 114;
    
    // Calculate conversion rate
    const conversionRate = (subscribedUsers / totalUsers * 100).toFixed(2);
    
    // Calculate monthly recurring revenue (MRR)
    const mrr = (monthlySubscribers * 4.99) + (yearlySubscribers * (49.90 / 12));
    
    // Calculate average revenue per user (ARPU)
    const arpu = (mrr / activeUsers).toFixed(2);

    // Build comprehensive statistics object
    const mockStats = {
      // User metrics
      totalUsers,
      activeUsers,
      onlineUsers,
      subscribedUsers,
      
      // Subscription metrics
      subscriptionBreakdown: {
        labels: ['Monthly Plan', 'Annual Plan', 'Free Tier'],
        data: [monthlySubscribers, yearlySubscribers, totalUsers - subscribedUsers]
      },
      
      // Financial metrics
      conversionRate: `${conversionRate}%`,
      revenue: {
        total: parseFloat((mrr * 12).toFixed(2)),
        mrr: parseFloat(mrr.toFixed(2)),
        arpu: parseFloat(arpu)
      },
      
      // Growth metrics
      userGrowth: {
        labels: lastSixMonths,
        data: [156, 235, 310, 489, 612, 754],
      },
      revenueGrowth: {
        labels: lastSixMonths,
        data: [1245, 1876, 2154, 3245, 4320, 5654],
      },
      
      // User segmentation
      userTypes: {
        labels: ['Free Users', 'Monthly Subscribers', 'Annual Subscribers'],
        data: [totalUsers - subscribedUsers, monthlySubscribers, yearlySubscribers],
      },
      
      // Engagement metrics
      engagementRate: '68%',
      averageSessionTime: '4.2 minutes',
      reportGenerationCount: 3876,
    };

    return NextResponse.json(mockStats);
  } catch (error) {
    console.error('Failed to get statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
} 