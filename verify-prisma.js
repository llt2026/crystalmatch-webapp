/**
 * 验证 Prisma 是否正确生成和可导入
 * 这个脚本可以在 Vercel 部署后直接运行
 */

try {
  // 尝试导入 @prisma/client
  console.log('尝试导入 @prisma/client...');
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ @prisma/client 导入成功');
  
  // 尝试创建 PrismaClient 实例
  console.log('尝试创建 PrismaClient 实例...');
  const prisma = new PrismaClient();
  console.log('✅ PrismaClient 实例创建成功');
  
  // 展示版本信息
  const clientVersion = prisma._clientVersion || '未知';
  console.log(`Prisma 客户端版本: ${clientVersion}`);
  
  // 输出模块路径
  console.log('模块路径:', require.resolve('@prisma/client'));
  
  console.log('验证成功 👍');
} catch (error) {
  console.error('❌ Prisma 验证失败:', error);
  
  // 检查 node_modules/@prisma/client 目录
  const fs = require('fs');
  const path = require('path');
  
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  if (fs.existsSync(prismaClientPath)) {
    console.log('📁 @prisma/client 目录存在');
    console.log('文件列表:', fs.readdirSync(prismaClientPath));
  } else {
    console.log('❓ @prisma/client 目录不存在');
  }
  
  process.exit(1);
} 