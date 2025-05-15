/**
 * 修复'use client'指令顺序问题
 * 将所有文件中的'use client'指令移到文件顶部
 */

const fs = require('fs');
const path = require('path');

// 应用目录
const appDir = path.join(process.cwd(), 'app');

// 处理单个文件
function processFile(filePath) {
  try {
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否同时包含'use client'和dynamic导出
    const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
    const hasDynamic = content.includes("export const dynamic = 'force-dynamic'");
    
    if (hasUseClient && hasDynamic) {
      // 方法1: 移除dynamic,保留use client并置顶
      content = content.replace(/export const dynamic = 'force-dynamic';\s*/g, '');
      content = content.replace(/'use client';\s*/g, '');
      content = "'use client';\n\n" + content;
      
      console.log(`✓ 修复文件 (移除dynamic): ${filePath}`);
    } else if (hasUseClient) {
      // 方法2: 只处理'use client'位置
      content = content.replace(/'use client';\s*/g, '');
      content = "'use client';\n\n" + content;
      
      console.log(`✓ 修复文件 (调整use client位置): ${filePath}`);
    } else if (hasDynamic) {
      // 无需处理,只有dynamic没有use client
      console.log(`✓ 保持不变 (只有dynamic): ${filePath}`);
      return false;
    } else {
      // 无需处理
      return false;
    }
    
    // 写入修改后的内容
    fs.writeFileSync(filePath, content, 'utf8');
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
  console.log('开始修复\'use client\'指令问题...');
  
  let processed = 0;
  
  // 遍历app目录处理所有文件
  traverseDirectory(appDir, (filePath) => {
    const result = processFile(filePath);
    if (result) processed++;
  });
  
  console.log(`完成! 修复了 ${processed} 个文件`);
}

// 执行主函数
main(); 