/**
 * 强制生成 Prisma 客户端并执行 Next.js 构建
 * 用于 Vercel 部署解决初始化问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 设置环境变量以标记构建阶段
process.env.NEXT_PHASE = 'phase-production-build';

// 步骤 1: 检查Prisma文件结构
console.log('🔍 检查 Prisma 文件结构...');
const prismaDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaDir)) {
  console.log('✅ @prisma/client 目录存在');
  const files = fs.readdirSync(prismaDir);
  console.log(`📁 文件列表(${files.length}): ${files.join(', ')}`);
} else {
  console.log('⚠️ @prisma/client 目录不存在，将尝试生成');
}

// 步骤 2: 生成 Prisma 客户端
console.log('⚙️ 强制生成 Prisma 客户端...');

try {
  // 强制执行 Prisma 生成
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 客户端生成成功!');
  
  // 验证生成是否成功
  if (fs.existsSync(prismaDir)) {
    const generatedFiles = fs.readdirSync(prismaDir);
    console.log(`📁 生成后的文件(${generatedFiles.length}): ${generatedFiles.join(', ')}`);
    
    const indexPath = path.join(prismaDir, 'index.js');
    if (fs.existsSync(indexPath)) {
      console.log('✅ index.js 文件存在');
    } else {
      console.log('⚠️ index.js 文件不存在，客户端可能未正确生成');
    }
  }
  
  // 步骤 3: 执行 Next.js 构建
  console.log('🏗️ 开始 Next.js 构建...');
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js 构建完成!');
  
} catch (error) {
  console.error('❌ 构建过程失败:', error.message);
  process.exit(1);
} 