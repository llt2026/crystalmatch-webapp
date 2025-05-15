/**
 * 自动为包含useSearchParams的页面添加'use client'指令
 */

const fs = require('fs');
const path = require('path');

// 页面路径
const pagesDir = path.join(process.cwd(), 'app');

// 需要处理的页面
const targetPages = [
  '/admin/dashboard/page.tsx',
  '/admin/login/page.tsx',
  '/admin/orders/page.tsx',
  '/admin/users/page.tsx',
  '/login/page.tsx',
  '/dashboard/page.tsx',
  '/orders/page.tsx',
  '/profile/page.tsx',
  '/profile/edit/page.tsx',
  '/subscription/page.tsx',
  '/subscription/cancel/page.tsx',
  '/subscription/success/page.tsx',
  '/birth-info/page.tsx',
  '/energy-reading/page.tsx',
  '/energy-reading/report/page.tsx',
  '/payment/page.tsx',
  '/terms/page.tsx',
  '/privacy/page.tsx'
];

// 客户端指令
const clientDirective = "'use client';\n\n";

// 处理单个文件
function processFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否已经有'use client'
    if (content.includes("'use client'") || content.includes('"use client"')) {
      console.log(`✓ 已有客户端指令: ${filePath}`);
      return;
    }
    
    // 添加客户端指令
    const newContent = clientDirective + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✓ 添加客户端指令: ${filePath}`);
  } catch (error) {
    console.error(`✗ 处理文件失败: ${filePath}`, error);
  }
}

// 检查文件是否包含useSearchParams
function hasSearchParamsUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('useSearchParams');
  } catch (error) {
    console.error(`✗ 检查文件失败: ${filePath}`, error);
    return false;
  }
}

// 主函数
function main() {
  console.log('开始添加客户端指令到页面...');
  
  let processed = 0;
  
  // 处理指定页面
  for (const pagePath of targetPages) {
    const fullPath = path.join(pagesDir, pagePath);
    
    if (fs.existsSync(fullPath)) {
      // 先检查文件是否使用了useSearchParams
      if (hasSearchParamsUsage(fullPath)) {
        processFile(fullPath);
        processed++;
      } else {
        console.log(`ℹ 无需处理: ${fullPath} (未使用useSearchParams)`);
      }
    } else {
      console.warn(`⚠ 文件不存在: ${fullPath}`);
    }
  }
  
  console.log(`完成! 处理了 ${processed} 个页面`);
}

// 执行主函数
main(); 