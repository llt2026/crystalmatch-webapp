/**
 * 快速测试 OpenAI API 配置
 * 
 * 使用方法：
 * 1. 配置 .env.local 文件中的 OPENAI_API_KEY
 * 2. 运行: node quick-test.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== CrystalMatch OpenAI API 测试 ===\n');

// 检查环境变量
console.log('1. 检查环境变量配置:');
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置');

if (!process.env.OPENAI_API_KEY) {
  console.log('\n❌ 错误: 请在 .env.local 文件中配置 OPENAI_API_KEY');
  console.log('\n解决步骤:');
  console.log('1. 访问 https://platform.openai.com/api-keys 获取API密钥');
  console.log('2. 编辑 .env.local 文件，添加: OPENAI_API_KEY=sk-你的密钥');
  console.log('3. 重新运行此测试');
  process.exit(1);
}

// 检查密钥格式
const apiKey = process.env.OPENAI_API_KEY;
const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
console.log('   密钥格式:', isValidFormat ? '✅ 有效' : '❌ 无效 (应以sk-开头)');

if (!isValidFormat) {
  console.log('\n❌ API密钥格式错误，请检查是否正确复制了完整的密钥');
  process.exit(1);
}

// 测试API连接
console.log('\n2. 测试 OpenAI API 连接...');

async function testOpenAI() {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('   正在发送测试请求...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个测试助手"
        },
        {
          role: "user",
          content: "请简单回答：OpenAI API连接测试成功"
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content;
    console.log('   ✅ API连接成功!');
    console.log('   GPT响应:', response);
    
    console.log('\n3. 配置验证结果:');
    console.log('   ✅ OpenAI API 配置正确');
    console.log('   ✅ 可以正常生成报告');
    
    console.log('\n🎉 恭喜! 您的 CrystalMatch 应用现在可以正常工作了');
    console.log('\n下一步:');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 访问应用并测试报告生成功能');
    
  } catch (error) {
    console.log('   ❌ API连接失败');
    console.error('   错误信息:', error.message);
    
    if (error.code === 'invalid_api_key') {
      console.log('\n解决方案: 请检查API密钥是否正确');
    } else if (error.code === 'insufficient_quota') {
      console.log('\n解决方案: 请检查OpenAI账户余额');
    } else {
      console.log('\n可能的解决方案:');
      console.log('1. 检查网络连接');
      console.log('2. 检查API密钥是否有效');
      console.log('3. 检查OpenAI账户状态');
    }
  }
}

testOpenAI(); 