// 执行所有测试的脚本
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 执行命令并打印结果
function runCommand(cmd, title) {
  console.log(`\n${colors.blue}============= ${title} ==============${colors.reset}`);
  try {
    const output = execSync(cmd, { encoding: 'utf8' });
    console.log(output);
    console.log(`${colors.green}✓ ${title}完成${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ ${title}失败${colors.reset}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

console.log(`${colors.magenta}====================================${colors.reset}`);
console.log(`${colors.magenta}      八字计算测试套件             ${colors.reset}`);
console.log(`${colors.magenta}====================================${colors.reset}`);

// 1. 检查文件是否存在
const baziTsFile = path.join(__dirname, 'app', 'lib', 'getBaziFromLunar.ts');
if (!fs.existsSync(baziTsFile)) {
  console.error(`${colors.red}错误: 找不到文件 ${baziTsFile}${colors.reset}`);
  process.exit(1);
}

// 2. 运行基本测试
console.log(`\n${colors.yellow}开始测试...${colors.reset}`);

// 测试1: 直接使用原始测试文件
runCommand('node test-getBazi.js', '运行原始测试');

// 测试2: 尝试编译TypeScript文件
const isCompiled = runCommand('node compile-ts.js getBaziFromLunar.ts', '编译TypeScript文件');

// 测试3: 使用ESM模块格式测试
runCommand('node test-getBazi.mjs', '运行ESM模块测试');

// 测试4: 如果编译成功，则运行更完整的测试
if (isCompiled) {
  runCommand('node build-test.js', '运行完整测试');
}

console.log(`\n${colors.magenta}====================================${colors.reset}`);
console.log(`${colors.magenta}      测试流程结束                 ${colors.reset}`);
console.log(`${colors.magenta}====================================${colors.reset}`);