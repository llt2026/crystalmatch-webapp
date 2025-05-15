/**
 * 测试提示词生成器脚本
 * 
 * 运行方式:
 * - 直接通过 ts-node: npx ts-node app/scripts/test-prompts.ts
 * - 或者编译后运行: npm run compile-ts && node dist/scripts/test-prompts.js
 */

import { buildMonthlyReportPrompt } from '../lib/buildMonthlyReportPrompt';
import { buildForecastPrompt } from '../lib/buildForecastPrompt';
import { ForecastContext } from '../types/forecast';
import * as fs from 'fs';
import * as path from 'path';

// 创建一个模拟的ForecastContext对象用于测试
const mockContext: ForecastContext = {
  bazi: {
    yearPillar: '甲子',
    monthPillar: '丙午',
    dayPillar: '戊申'
  },
  currentMonth: {
    name: 'July',
    year: 2025,
    energyType: 'Passion',
    element: 'Fire'
  },
  userElements: {
    wood: 25,
    fire: 15,
    earth: 30,
    metal: 20,
    water: 10
  },
  currentYear: {
    pillar: '乙卯',
    zodiac: 'Rabbit'
  }
};

// 创建测试输出目录
const testDir = path.join(__dirname, '../../test-output');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// 测试月度报告提示词
console.log('\n========= 测试月度报告提示词 =========');
try {
  const monthlyPrompt = buildMonthlyReportPrompt(mockContext);
  console.log('月度报告提示词生成成功，长度:', monthlyPrompt.length);
  
  // 将提示词保存到文件
  fs.writeFileSync(path.join(testDir, 'monthly-prompt.txt'), monthlyPrompt);
  console.log('已保存到:', path.join(testDir, 'monthly-prompt.txt'));
} catch (error) {
  console.error('月度报告提示词生成失败:', error);
}

// 测试免费用户年度报告提示词
console.log('\n========= 测试免费用户年度报告提示词 =========');
try {
  const freeForecastPrompt = buildForecastPrompt(mockContext, false);
  console.log('免费用户年度报告提示词生成成功，长度:', freeForecastPrompt.length);
  
  // 将提示词保存到文件
  fs.writeFileSync(path.join(testDir, 'free-forecast-prompt.txt'), freeForecastPrompt);
  console.log('已保存到:', path.join(testDir, 'free-forecast-prompt.txt'));
} catch (error) {
  console.error('免费用户年度报告提示词生成失败:', error);
}

// 测试订阅用户年度报告提示词
console.log('\n========= 测试订阅用户年度报告提示词 =========');
try {
  const paidForecastPrompt = buildForecastPrompt(mockContext, true);
  console.log('订阅用户年度报告提示词生成成功，长度:', paidForecastPrompt.length);
  
  // 将提示词保存到文件
  fs.writeFileSync(path.join(testDir, 'paid-forecast-prompt.txt'), paidForecastPrompt);
  console.log('已保存到:', path.join(testDir, 'paid-forecast-prompt.txt'));
} catch (error) {
  console.error('订阅用户年度报告提示词生成失败:', error);
}

// 测试空值处理
console.log('\n========= 测试空值处理 =========');
const emptyContext = {} as ForecastContext;
try {
  const emptyPrompt = buildMonthlyReportPrompt(emptyContext);
  console.log('空值处理测试通过 (buildMonthlyReportPrompt)');
  
  const emptyForecast = buildForecastPrompt(emptyContext, true);
  console.log('空值处理测试通过 (buildForecastPrompt)');
} catch (error) {
  console.error('空值处理测试失败:', error);
}

// 测试异常情况
console.log('\n========= 测试异常情况 =========');
try {
  const nullContext = null as unknown as ForecastContext;
  const nullPrompt = buildMonthlyReportPrompt(nullContext);
  console.log('null值处理测试通过 (buildMonthlyReportPrompt)');
} catch (error) {
  console.error('null值处理测试失败 (buildMonthlyReportPrompt):', error);
}

try {
  const undefinedContext = undefined as unknown as ForecastContext;
  const undefinedPrompt = buildForecastPrompt(undefinedContext, true);
  console.log('undefined值处理测试通过 (buildForecastPrompt)');
} catch (error) {
  console.error('undefined值处理测试失败 (buildForecastPrompt):', error);
}

console.log('\n所有测试完成，你可以检查 test-output 目录查看生成的提示词。'); 