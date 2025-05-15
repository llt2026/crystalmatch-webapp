/**
 * Vercel 部署特定的 Prisma 初始化脚本
 * 此文件在 Vercel 构建过程中执行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('🚀 正在为 Vercel 部署执行 Prisma 生成...');
  
  // 强制执行 Prisma 生成
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 验证生成的文件
  const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  const generatedPath = path.join(process.cwd(), 'generated', 'prisma');
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  
  // 确保 node_modules/@prisma/client 存在
  if (!fs.existsSync(prismaClientPath)) {
    console.warn('⚠️ @prisma/client 目录不存在，创建它...');
    fs.mkdirSync(prismaClientPath, { recursive: true });
  }
  
  if (fs.existsSync(clientPath)) {
    console.log('✅ Prisma 客户端已正确生成在 node_modules/.prisma/client');
    
    // 列出一些文件以确认
    const files = fs.readdirSync(clientPath);
    console.log('文件清单:', files.slice(0, 5));
    
    // 复制 schema.prisma 到客户端目录
    const schemaSource = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaTarget = path.join(prismaClientPath, 'schema.prisma');
    try {
      fs.copyFileSync(schemaSource, schemaTarget);
      console.log('✅ 已复制 schema.prisma 到 @prisma/client 目录');
    } catch (e) {
      console.warn('⚠️ 复制 schema.prisma 失败:', e.message);
    }
    
    // 创建一个 index.js 文件，直接从 .prisma/client 重新导出
    const indexContent = `
// 该文件由 vercel-deploy.js 自动生成
// 直接导出 .prisma/client 
module.exports = require('../../.prisma/client');
    `;
    try {
      fs.writeFileSync(path.join(prismaClientPath, 'index.js'), indexContent);
      console.log('✅ 已创建 @prisma/client/index.js');
    } catch (e) {
      console.warn('⚠️ 创建 index.js 失败:', e.message);
    }
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