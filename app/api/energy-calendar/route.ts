import { NextRequest, NextResponse } from 'next/server';
import { calculateEnergyCalendar } from '@/app/lib/energyCalculation2025';

/**
 * 能量日历API端点
 * 根据出生日期返回未来12个月的能量变化日历
 * @route GET /api/energy-calendar
 * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
 * @returns {Promise<NextResponse>} - 能量日历数据
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const birthDate = searchParams.get('birthDate');
    
    if (!birthDate) {
      return NextResponse.json({ error: "Birth date is required" }, { status: 400 });
    }
    
    // 验证日期格式
    const birthDateTime = new Date(birthDate);
    if (isNaN(birthDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid birth date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    
    // 获取能量日历数据
    const calendarData = await calculateEnergyCalendar(birthDate);
    
    // 返回数据
    return NextResponse.json({
      birthDate,
      totalMonths: calendarData.length,
      calendarData
    });
    
  } catch (error) {
    console.error('Error in energy calendar API:', error);
    return NextResponse.json({ error: "Failed to calculate energy calendar" }, { status: 500 });
  }
} 