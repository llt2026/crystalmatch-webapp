/**
 * 清理模拟数据脚本
 * 删除测试目录中的模拟数据文件，确保使用真实数据
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 测试目录路径
const testOutputDir = path.join(__dirname, '../test-output');
const publicTestDir = path.join(__dirname, '../public/test-output');

// 清理函数
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Cleaning directory: ${dir}`);
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        cleanDirectory(filePath);
      } else {
        console.log(`Removing file: ${filePath}`);
        fs.unlinkSync(filePath);
      }
    });
  } else {
    console.log(`Directory does not exist: ${dir}`);
  }
}

// 清理测试目录
console.log('Starting to clean mock data...');
cleanDirectory(testOutputDir);
cleanDirectory(publicTestDir);

// 创建必要的目录（如果不存在）
[testOutputDir, publicTestDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 创建一个占位文件，表示模拟数据已被清理
const placeholderContent = `# REAL DATA MODE
This application is configured to use real data.
Mock data files have been cleaned.
Date: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(testOutputDir, 'REAL_DATA_MODE.md'), placeholderContent);
fs.writeFileSync(path.join(publicTestDir, 'REAL_DATA_MODE.md'), placeholderContent);

// 设置环境变量（仅用于当前进程，不会持久化）
process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';

console.log('Mock data cleaning complete. Application is now set to use real data.');
console.log('Please ensure your environment variables are properly configured:');
console.log('1. OPENAI_API_KEY must be set for GPT report generation');
console.log('2. DATABASE_URL must be set for database access');
console.log('\nYou can run this script before deploying to ensure a clean state.');

// 退出成功
process.exit(0); 