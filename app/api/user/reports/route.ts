import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '../../../lib/prisma';

/**
 * 获取用户的已生成报告列表
 * GET /api/user/reports
 */
export async function GET(request: NextRequest) {
  try {
    // 尝试从 Authorization 头或 cookie 中获取 JWT
    let token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';

    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 验证 JWT
    let payload;
    try {
      const result = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
      );
      payload = result.payload;
    } catch (joseError) {
      console.log('JOSE verification failed, trying jsonwebtoken...');
      
      // 如果jose失败，尝试使用jsonwebtoken库
      const jwt = require('jsonwebtoken');
      payload = jwt.verify(token, process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key');
    }
    
    const userId = (payload.userId || payload.sub) as string;
    
    // 从数据库获取用户的所有有效报告
    const reports = await prisma.energyReportCache.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date() // 只获取未过期的报告
        }
      },
      select: {
        id: true,
        reportMonth: true,
        tier: true,
        generatedAt: true,
        birthDate: true
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });

    // 格式化报告数据
    const formattedReports = reports.map((report: any) => {
      const date = new Date(report.generatedAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return {
        id: report.id,
        title: `${formattedDate} Energy Report`,
        tier: report.tier,
        generatedAt: report.generatedAt,
        reportMonth: report.reportMonth,
        slug: `generated-${report.id}` // 用于URL路径
      };
    });

    return NextResponse.json({
      reports: formattedReports
    });

  } catch (error) {
    console.error('获取用户报告列表失败:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reports' },
      { status: 500 }
    );
  }
}
