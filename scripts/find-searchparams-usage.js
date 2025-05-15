/**
 * 查找所有使用了useSearchParams的页面并添加'use client'指令
 */

const fs = require('fs');
const path = require('path');

// 页面路径
const appDir = path.join(process.cwd(), 'app');

// 客户端指令
const clientDirective = "'use client';\n\n";

// 处理单个文件
function processFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查文件是否使用了useSearchParams
    if (!content.includes('useSearchParams')) {
      return false;
    }
    
    console.log(`🔍 找到useSearchParams使用: ${filePath}`);
    
    // 检查文件是否已经有'use client'
    if (content.includes("'use client'") || content.includes('"use client"')) {
      console.log(`  ✓ 已有客户端指令`);
      return true;
    }
    
    // 添加客户端指令
    const newContent = clientDirective + content;
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`  ✓ 添加客户端指令`);
    return true;
  } catch (error) {
    console.error(`✗ 处理文件失败: ${filePath}`, error);
    return false;
  }
}

// 递归遍历目录
function traverseDirectory(dir, fileCallback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // 跳过node_modules和.next目录
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        traverseDirectory(fullPath, fileCallback);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      fileCallback(fullPath);
    }
  }
}

// 主函数
function main() {
  console.log('开始查找使用了useSearchParams的页面...');
  
  let processed = 0;
  let found = 0;
  const foundFiles = [];
  
  // 遍历app目录
  traverseDirectory(appDir, (filePath) => {
    const result = processFile(filePath);
    processed++;
    if (result) {
      found++;
      foundFiles.push(filePath);
    }
  });
  
  console.log('\n使用了useSearchParams的文件:');
  foundFiles.forEach(file => {
    console.log(` - ${file}`);
  });
  
  console.log(`\n完成! 检查了 ${processed} 个文件，找到 ${found} 个使用了useSearchParams的文件`);
}

// 执行主函数
main(); 