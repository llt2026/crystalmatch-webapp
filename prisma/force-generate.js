/**
 * 强制生成 Prisma 客户端并执行 Next.js 构建
 * 用于 Vercel 部署解决初始化问题
 */

const { execSync } = require('child_process');

// 步骤 1: 生成 Prisma 客户端
console.log('⚙️ Forcing Prisma Client generation...');

try {
  // 强制执行 Prisma 生成
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generation successful!');
  
  // 步骤 2: 执行 Next.js 构建
  console.log('🏗️ Starting Next.js build...');
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed!');
  
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
} 