/**
 * Pro版能量计算API
 * 基于订阅日期第二天的月能量值计算Pro报告的Energy Overview得分
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateProReportEnergy } from '../../lib/proReportCalculation';
import { FiveElementVector } from '../../lib/energyCalculation2025';

// 示例基础八字五行向量（实际应从用户数据中获取）
const sampleBaseBazi: FiveElementVector = {
  wood: 0.3,
  fire: 0.15,
  earth: 0.2,
  metal: 0.25,
  water: 0.1
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 从查询参数获取必要信息
    const searchParams = req.nextUrl.searchParams;
    const subscriptionDateStr = searchParams.get('subscriptionDate') || new Date().toISOString().split('T')[0];
    
    // 计算Pro报告的Energy Overview得分
    const subscriptionDate = new Date(subscriptionDateStr);
    const result = calculateProReportEnergy(subscriptionDate, sampleBaseBazi);
    
    // 构造响应数据
    const response = {
      score: result.score,
      dominantElement: result.dominantElement,
      weakestElement: result.weakestElement,
      energyMode: result.energyMode,
      energyEmoji: result.energyEmoji,
      calculationMethod: 'Based on subscription date + 1 day'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error calculating pro energy:', error);
    return NextResponse.json(
      { error: 'Failed to calculate energy' },
      { status: 500 }
    );
  }
} 