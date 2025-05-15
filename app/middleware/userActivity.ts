import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { updateUserActivity } from '@/app/lib/analytics';

const JWT_SECRET = 'your-jwt-secret-key';

export async function trackUserActivity(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { 
          username: string;
          role?: string;
          subscription?: { status: string }
        };

        // 更新用户活动状态
        updateUserActivity(
          decoded.username,
          decoded.subscription?.status === 'premium' || decoded.role === 'admin'
        );
      } catch (error) {
        // 令牌无效，不追踪活动
        console.error('无效的用户令牌:', error);
      }
    }

    return null; // 继续处理请求
  } catch (error) {
    console.error('追踪用户活动失败:', error);
    return null; // 继续处理请求
  }
} 