/**
 * 强制生成 Prisma 客户端
 * 用于 Vercel 部署解决初始化问题
 */

const { execSync } = require('child_process');

console.log('⚙️ Forcing Prisma Client generation...');

try {
  // 强制执行 Prisma 生成
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generation successful!');
} catch (error) {
  console.error('❌ Prisma Client generation failed:', error.message);
  process.exit(1);
} 