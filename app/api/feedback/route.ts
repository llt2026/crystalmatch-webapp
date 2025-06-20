﻿import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 初始化Prisma客户端
const prisma = new PrismaClient();

/**
 * 处理用户反馈提交
 * POST /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, feedbackType, reportType, content, options } = data;

    // 基本验证
    if (!feedbackType) {
      return NextResponse.json({ error: '反馈类型不能为空' }, { status: 400 });
    }

    // 创建反馈记录
    const feedback = await prisma.feedback.create({
      data: {
        userId: userId || 'anonymous',
        feedbackType,
        reportType: reportType || '',
        content: content || '',
        options: options || [],
        createdAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json(
      { error: '提交反馈失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取用户反馈列表
 * GET /api/feedback
 */
export async function GET(request: NextRequest) {
  try {
    // 检查是否是管理员权限（这里应该根据您的认证系统进行调整）
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 获取反馈总数
    const totalCount = await prisma.feedback.count();
    
    // 获取分页的反馈列表
    const feedbacks = await prisma.feedback.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      feedbacks,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    return NextResponse.json(
      { error: '获取反馈列表失败' },
      { status: 500 }
    );
  }
}
