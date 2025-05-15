/**
 * 自动为所有页面添加dynamic导出
 * 解决Next.js构建时的静态预渲染错误
 */

const fs = require('fs');
const path = require('path');

// 页面路径
const pagesDir = path.join(process.cwd(), 'app');

// 标记出来的问题页面
const problemPages = [
  '/page.tsx',
  '/admin/dashboard/page.tsx',
  '/admin/login/page.tsx',
  '/admin/orders/page.tsx',
  '/admin/users/page.tsx',
  '/auth/register/page.tsx',
  '/bazi-test/page.tsx',
  '/birth-info/page.tsx',
  '/dashboard/page.tsx',
  '/energy-reading/page.tsx',
  '/energy-reading/report/page.tsx',
  '/login/page.tsx',
  '/orders/page.tsx',
  '/payment/page.tsx',
  '/privacy/page.tsx',
  '/profile/edit/page.tsx',
  '/profile/page.tsx',
  '/share/page.tsx',
  '/subscription/cancel/page.tsx',
  '/subscription/page.tsx',
  '/subscription/success/page.tsx',
  '/subscription/test/page.tsx',
  '/terms/page.tsx',
  '/test-bazi/page.tsx',
  '/test-pillars/page.tsx',
  '/test-view/page.tsx',
  '/test/page.tsx',
];

// 导出语句
const dynamicExport = "export const dynamic = 'force-dynamic';\n\n";

// 处理单个文件
function processFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否已经有dynamic导出
    if (content.includes("export const dynamic")) {
      console.log(`✓ 已有dynamic导出: ${filePath}`);
      return;
    }
    
    // 添加dynamic导出
    const newContent = dynamicExport + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✓ 添加dynamic导出: ${filePath}`);
  } catch (error) {
    console.error(`✗ 处理文件失败: ${filePath}`, error);
  }
}

// 主函数
function main() {
  console.log('开始添加dynamic导出到问题页面...');
  
  let processed = 0;
  
  // 处理每个问题页面
  for (const pagePath of problemPages) {
    const fullPath = path.join(pagesDir, pagePath);
    
    if (fs.existsSync(fullPath)) {
      processFile(fullPath);
      processed++;
    } else {
      console.warn(`⚠ 文件不存在: ${fullPath}`);
    }
  }
  
  console.log(`完成! 处理了 ${processed} 个页面`);
}

// 执行主函数
main(); 