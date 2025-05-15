// 编译TypeScript文件到JavaScript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  console.log('开始编译TypeScript文件...');
  
  // 确保目标目录存在
  const libDir = path.join(__dirname, 'app', 'lib');
  if (!fs.existsSync(libDir)) {
    console.error(`目录不存在: ${libDir}`);
    process.exit(1);
  }
  
  // 获取所有TypeScript文件
  const tsFiles = fs.readdirSync(libDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(libDir, file));
  
  if (tsFiles.length === 0) {
    console.log('没有找到TypeScript文件需要编译');
    process.exit(0);
  }
  
  console.log(`找到 ${tsFiles.length} 个TypeScript文件需要编译:`);
  tsFiles.forEach(file => console.log(`- ${file}`));
  
  // 编译特定文件或全部文件
  const specificFile = process.argv[2];
  const filesToCompile = specificFile 
    ? [path.join(libDir, specificFile)]
    : tsFiles;
  
  // 使用tsc编译文件
  filesToCompile.forEach(file => {
    if (!fs.existsSync(file)) {
      console.error(`文件不存在: ${file}`);
      return;
    }
    
    console.log(`正在编译: ${file}`);
    try {
      execSync(`npx tsc --allowJs --esModuleInterop --target ES2020 --module CommonJS "${file}"`, {
        encoding: 'utf8',
        stdio: 'inherit'
      });
      console.log(`成功编译: ${file}`);
    } catch (err) {
      console.error(`编译失败: ${file}`);
      throw err;
    }
  });
  
  console.log('编译完成');
} catch (error) {
  console.error('编译过程中发生错误:', error.message);
  process.exit(1);
}