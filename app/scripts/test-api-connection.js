/**
 * 测试OpenAI API连接
 * 
 * 这个脚本仅测试与OpenAI API的连接是否正常，不生成完整报告
 * 
 * 使用方法:
 * 1. 环境变量方式: 
 *    - 在.env.local文件中设置 OPENAI_API_KEY=您的密钥
 *    - 运行 node app/scripts/test-api-connection.js
 * 
 * 2. 命令行参数方式:
 *    - 运行 node app/scripts/test-api-connection.js 您的API密钥
 * 
 * 代理设置 (如果需要):
 * - 在.env.local中添加: HTTPS_PROXY=http://您的代理服务器:端口
 * - 或者设置环境变量: $env:HTTPS_PROXY="http://您的代理服务器:端口"
 */

const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

// 打印环境变量中的API密钥（如果存在）
console.log('环境变量中的API密钥:', process.env.OPENAI_API_KEY ? '已设置 (被隐藏)' : '未设置');
if (process.env.OPENAI_API_KEY) {
  // 检查API密钥格式
  const apiKeyFormat = process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length > 20;
  console.log('API密钥格式:', apiKeyFormat ? '看起来正确' : '可能不正确 (应以sk-开头)');
}

// 检查代理设置
if (process.env.HTTPS_PROXY) {
  console.log('代理服务器:', process.env.HTTPS_PROXY);
} else {
  console.log('代理服务器: 未设置');
}

// 获取API密钥 (优先使用命令行参数)
let apiKey = process.argv[2] || process.env.OPENAI_API_KEY;

// 检查API密钥
if (!apiKey) {
  console.error('错误: 未提供API密钥');
  console.log('\n使用方法:');
  console.log('1. 环境变量方式:');
  console.log('   - 在.env.local文件中设置 OPENAI_API_KEY=您的密钥');
  console.log('   - 运行 node app/scripts/test-api-connection.js');
  console.log('\n2. 命令行参数方式:');
  console.log('   - 运行 node app/scripts/test-api-connection.js 您的API密钥');
  console.log('\n如果需要使用代理:');
  console.log('   - 在.env.local中添加: HTTPS_PROXY=http://您的代理服务器:端口');
  console.log('   - 或者设置环境变量: $env:HTTPS_PROXY="http://您的代理服务器:端口"');
  process.exit(1);
}

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: apiKey,
});

async function testApiConnection() {
  console.log('正在测试OpenAI API连接...');
  
  try {
    // 发送一个最小化的API请求
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "你好" },
        { role: "user", content: "测试API连接" }
      ],
      max_tokens: 10, // 限制token数量，减少费用
    });
    
    console.log('✅ API连接成功!');
    console.log('模型响应:', completion.choices[0].message.content);
    console.log('使用的模型:', completion.model);
    console.log('完成原因:', completion.choices[0].finish_reason);
    console.log('使用的tokens:', completion.usage.total_tokens);
    
    return true;
  } catch (error) {
    console.error('❌ API连接失败!');
    console.error('错误信息:', error.message);
    
    // 详细错误诊断
    if (error.message.includes('API key')) {
      console.log('提示: 请检查您的API密钥是否正确');
    } else if (error.message.includes('network') || error.message.includes('Connection')) {
      console.log('提示: 可能是网络连接问题，请检查：');
      console.log('1. 您的网络连接是否正常');
      console.log('2. 是否需要配置代理服务器');
      console.log('3. 防火墙或安全软件是否阻止了连接');
      console.log('\n配置代理的方法:');
      console.log('- 在.env.local中添加: HTTPS_PROXY=http://您的代理服务器:端口');
      console.log('- 或者设置环境变量: $env:HTTPS_PROXY="http://您的代理服务器:端口"');
    } else if (error.message.includes('rate limit')) {
      console.log('提示: 您的API请求超出了速率限制，请稍后再试');
    } else if (error.message.includes('billing') || error.message.includes('account')) {
      console.log('提示: 可能是账户或计费问题，请检查您的OpenAI账户状态');
    }
    
    // 输出完整错误对象以便调试
    console.log('\n详细错误信息:');
    console.log(error);
    
    return false;
  }
}

// 执行测试
testApiConnection(); 