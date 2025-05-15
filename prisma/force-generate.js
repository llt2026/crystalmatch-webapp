/**
 * 强制生成 Prisma 客户端
 * 在 Vercel 构建过程中直接调用 Prisma Generator
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始强制生成 Prisma 客户端...');

// 1. 确保 prisma/schema.prisma 文件存在
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma 文件不存在!');
  process.exit(1);
}

console.log('✅ schema.prisma 文件已找到');

// 2. 直接使用 node 执行 prisma generate 命令
const generateProcess = spawn('node', [
  './node_modules/prisma/build/index.js', 
  'generate'
], {
  stdio: 'inherit',
  shell: true
});

// 等待 prisma generate 完成
generateProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Prisma generate 失败，退出码: ${code}`);
    process.exit(1);
  }
  
  console.log('✅ Prisma 客户端生成完成!');
  
  // 3. 验证生成的文件
  const outputDir = path.join(process.cwd(), 'generated', 'prisma');
  
  if (fs.existsSync(outputDir)) {
    console.log('📁 检查生成的文件:');
    const files = fs.readdirSync(outputDir);
    console.log(`找到 ${files.length} 个文件`);
    
    // 4. 确保核心文件存在
    const requiredFiles = ['index.js', 'index.d.ts', 'schema.prisma'];
    const missingFiles = requiredFiles.filter(file => !files.includes(file));
    
    if (missingFiles.length > 0) {
      console.error(`❌ 缺少必要文件: ${missingFiles.join(', ')}`);
    } else {
      console.log('✅ 所有必要文件都已生成');
    }
    
    // 5. 复制到 node_modules
    try {
      const targetDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // 创建桥接模块
      const bridgeContent = `
// 这是一个由 force-generate.js 创建的桥接模块
// 它直接重定向到生成的 Prisma 客户端
module.exports = require('${outputDir.replace(/\\/g, '/')}');
`;
      fs.writeFileSync(path.join(targetDir, 'index.js'), bridgeContent);
      console.log('✅ 创建了桥接模块');
      
      // 复制 schema.prisma
      fs.copyFileSync(
        schemaPath,
        path.join(targetDir, 'schema.prisma')
      );
      console.log('✅ 复制了 schema.prisma');
      
      console.log('✅ Prisma 客户端安装完成!');
    } catch (err) {
      console.error('❌ 复制文件失败:', err);
    }
  } else {
    console.error('❌ 找不到生成的客户端目录!');
    process.exit(1);
  }
}); 