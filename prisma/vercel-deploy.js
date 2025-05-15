/**
 * Vercel 部署特定的 Prisma 初始化脚本
 * 此文件在 Vercel 构建过程中执行
 */

const { execSync } = require('child_process');

try {
  console.log('🚀 正在为 Vercel 部署执行 Prisma 生成...');
  
  // 强制执行 Prisma 生成
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 验证生成的文件
  const fs = require('fs');
  const path = require('path');
  
  const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  const generatedPath = path.join(process.cwd(), 'generated', 'prisma');
  
  if (fs.existsSync(clientPath)) {
    console.log('✅ Prisma 客户端已正确生成在 node_modules/.prisma/client');
    
    // 列出一些文件以确认
    const files = fs.readdirSync(clientPath);
    console.log('文件清单:', files.slice(0, 5));
  } else {
    console.warn('⚠️ 未找到 Prisma 客户端在 node_modules/.prisma/client');
  }
  
  if (fs.existsSync(generatedPath)) {
    console.log('✅ Prisma 客户端已正确生成在 generated/prisma');
    
    // 列出一些文件以确认
    const files = fs.readdirSync(generatedPath);
    console.log('文件清单:', files.slice(0, 5));
  } else {
    console.warn('⚠️ 未找到 Prisma 客户端在 generated/prisma');
  }
  
  console.log('✅ Prisma 验证完成');
} catch (error) {
  console.error('❌ Prisma 生成失败:', error);
  process.exit(1);
} 