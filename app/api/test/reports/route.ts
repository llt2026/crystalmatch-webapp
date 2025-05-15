import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 用于读取测试报告的API路由
 * 
 * 参数:
 * - type: "monthly" | "yearly" - 要读取的报告类型
 * 
 * 返回JSON:
 * { content: "报告内容" }
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  
  // 验证参数
  if (!type || (type !== 'monthly' && type !== 'yearly')) {
    return NextResponse.json(
      { error: 'Invalid report type. Use "monthly" or "yearly".' }, 
      { status: 400 }
    );
  }
  
  // 定义文件路径
  const filename = type === 'monthly' 
    ? 'monthly-report-response.md' 
    : 'yearly-report-response.md';
  
  const filePath = path.join(process.cwd(), 'test-output', filename);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Report file not found. Run tests first.` }, 
        { status: 404 }
      );
    }
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error(`Error reading report file:`, error);
    return NextResponse.json(
      { error: 'Failed to read report file.' }, 
      { status: 500 }
    );
  }
} 