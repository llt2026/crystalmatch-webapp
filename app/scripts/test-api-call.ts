/**
 * 测试OpenAI API调用脚本
 * 
 * 运行前请确保设置了环境变量:
 * OPENAI_API_KEY=你的OpenAI API密钥
 * 
 * 运行方式:
 * npx ts-node app/scripts/test-api-call.ts
 */

import { buildMonthlyReportPrompt } from '../lib/buildMonthlyReportPrompt';
import { buildForecastPrompt } from '../lib/buildForecastPrompt';
import { ForecastContext } from '../types/forecast';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// 检查API密钥
if (!process.env.OPENAI_API_KEY) {
  console.error('错误: 请设置OPENAI_API_KEY环境变量');
  process.exit(1);
}

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建测试输出目录
const testDir = path.join(__dirname, '../../test-output');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// 模拟数据
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

// 测试月度报告提示词
async function testMonthlyReport() {
  console.log('\n========= 测试月度报告API调用 =========');
  try {
    // 生成提示词
    const prompt = buildMonthlyReportPrompt(mockContext);
    console.log('生成提示词成功，长度:', prompt.length);
    
    // 调用OpenAI API
    console.log('正在调用OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 使用可用的模型
      messages: [
        {
          role: "system", 
          content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
    });
    
    // 获取结果
    const report = completion.choices[0].message.content || '';
    console.log('API调用成功，响应长度:', report.length);
    
    // 保存结果
    fs.writeFileSync(path.join(testDir, 'monthly-report-response.md'), report);
    console.log('已保存响应到:', path.join(testDir, 'monthly-report-response.md'));
    
    return true;
  } catch (error) {
    console.error('月度报告API调用失败:', error);
    return false;
  }
}

// 测试年度报告提示词
async function testForecastReport() {
  console.log('\n========= 测试订阅用户年度报告API调用 =========');
  try {
    // 生成提示词
    const prompt = buildForecastPrompt(mockContext, true);
    console.log('生成提示词成功，长度:', prompt.length);
    
    // 调用OpenAI API
    console.log('正在调用OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 使用gpt-4o模型
      messages: [
        {
          role: "system", 
          content: "你是一位专业的能量咨询师，擅长分析能量和提供指导。"
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
    });
    
    // 获取结果
    const report = completion.choices[0].message.content || '';
    console.log('API调用成功，响应长度:', report.length);
    
    // 保存结果
    fs.writeFileSync(path.join(testDir, 'yearly-report-response.md'), report);
    console.log('已保存响应到:', path.join(testDir, 'yearly-report-response.md'));
    
    return true;
  } catch (error) {
    console.error('年度报告API调用失败:', error);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试OpenAI API调用...');
  
  const monthlySuccess = await testMonthlyReport();
  const forecastSuccess = await testForecastReport();
  
  if (monthlySuccess && forecastSuccess) {
    console.log('\n🎉 所有API测试成功完成！');
    console.log('你可以在 test-output 目录下查看生成的报告。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查错误信息。');
  }
}

// 执行测试
runTests(); 