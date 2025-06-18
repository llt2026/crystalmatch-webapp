import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import prisma from '../../../../lib/prisma';

/**
 * 获取用户的特定报告内容
 * GET /api/report/generated/[id]
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证用户身份
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证 JWT
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || 'crystalmatch-secure-jwt-secret-key')
    );
    
    const userId = payload.sub as string;
    const reportId = params.id.replace('generated-', ''); // 移除前缀
    
    // 从数据库获取报告
    const reportCache = await prisma.energyReportCache.findFirst({
      where: {
        id: reportId,
        userId,
        expiresAt: {
          gt: new Date() // 确保报告未过期
        }
      }
    });

    if (!reportCache) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // 解析报告内容
    const report = JSON.parse(reportCache.report);
    const energyContext = JSON.parse(reportCache.energyContext);

    return NextResponse.json({
      report,
      energyContext,
      tier: reportCache.tier,
      generatedAt: reportCache.generatedAt,
      fromCache: true
    });

  } catch (error) {
    console.error('获取报告失败:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
