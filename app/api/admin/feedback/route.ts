import { NextRequest, NextResponse } from 'next/server';
import { POST as feedbackPOST, GET as feedbackGET } from '../../feedback/route';

/**
 * 代理到 /api/feedback 以保持向后兼容
 * POST /api/admin/feedback
 */
export async function POST(req: NextRequest) {
  return feedbackPOST(req);
}

/**
 * 管理员获取反馈列表
 * GET /api/admin/feedback
 */
export async function GET(req: NextRequest) {
  return feedbackGET(req);
} 