import { NextRequest, NextResponse } from 'next/server';
import { getBaseBaziVector } from '@/app/lib/energyCalculation2025';
import { calculateProReportEnergy } from '@/app/lib/proReportCalculation';
import { getDailyEnergyForRange, getHourlyEnergyHeatmap } from '@/app/lib/energyCalculation2025';
import { buildMonthlyReportPrompt } from '@/app/lib/buildMonthlyReportPrompt';
import { generateGptContent } from '@/app/lib/gptService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/report/[slug]
 * slug 形式： annual-basic-2025 | annual-premium-2025 | 2025-05
 * 注意：这是从/api/reports/[slug]复制而来的，保持两者功能同步
 */
export async function GET(req: NextRequest, { params }: { params:{ slug:string } }) {
  try {
    const birthDate = req.nextUrl.searchParams.get('birthDate');
    if (!birthDate) return NextResponse.json({ error:'Missing birthDate' }, { status:400 });

    // 验证slug格式
    const slug = params.slug;                // 形如 2025-05
    if (!/^\d{4}-\d{2}$/.test(slug)) {
      return NextResponse.json({ error:'Invalid slug format, expected YYYY-MM' }, { status:400 });
    }

    console.log(`📅 处理月度报告请求: ${slug}, 出生日期: ${birthDate}`);
    
    const startDate = new Date(`${slug}-01`);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error:'Invalid date in slug' }, { status:400 });
    }

    const subscriptionDate = new Date(startDate);
    subscriptionDate.setDate(subscriptionDate.getDate() + 1);   // 订阅日+1 天

    // 计算基础数据
    console.log('🧮 计算基础八字数据...');
    const baseBazi = getBaseBaziVector(birthDate);
    
    console.log('🔄 计算月度能量概览...');
    const overview = calculateProReportEnergy(subscriptionDate, baseBazi);

    // 获取每日能量数据
    console.log('📈 获取每日能量数据...');
    const monthDays = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0).getDate();
    const daily = await getDailyEnergyForRange(birthDate, subscriptionDate, monthDays);

    // 获取小时能量数据
    console.log('⏰ 获取小时能量数据...');
    const hourly = await getHourlyEnergyHeatmap(birthDate, subscriptionDate); // 只取第一天，可选

    // 构建提示词
    console.log('📝 构建GPT提示词...');
    const promptText = buildMonthlyReportPrompt({ overview, daily, hourly });
    
    // 使用generateGptContent而不是gptCall
    console.log('🤖 调用GPT生成报告内容...');
    const gptResponse = await generateGptContent({
      section: 'monthlyReportPro', 
      prompt: promptText,
      userContext: { userId: 'anonymous' }
    });

    // 从GPT响应中提取内容
    const reportText = gptResponse.content;
    console.log(`✅ 报告生成成功，内容长度: ${reportText.length}字符, Token: ${gptResponse.totalTokens}`);

    return NextResponse.json({ 
      overview, 
      daily, 
      hourly, 
      report: reportText, // 返回为report字段，与原API保持一致
      tokens: {
        prompt: gptResponse.promptTokens,
        completion: gptResponse.completionTokens,
        total: gptResponse.totalTokens
      }
    });
  } catch (error: any) {
    console.error('❌ 生成月度报告失败:', error);
    return NextResponse.json({ 
      error: 'api_error',
      message: '月度报告生成服务暂时不可用',
      details: error.message 
    }, { status: 500 });
  }
} 