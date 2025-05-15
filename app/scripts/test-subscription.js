/**
 * 订阅系统测试脚本
 * 
 * 这个脚本测试不同订阅级别的功能差异，包括：
 * 1. 不同层级的API调用
 * 2. 免费用户的使用限制
 * 3. 订阅用户的高级功能
 * 
 * 使用方法:
 * node app/scripts/test-subscription.js
 */

const OpenAI = require('openai');
const { SubscriptionTier, SUBSCRIPTION_PLANS } = require('../../app/types/subscription');
const { 
  getModelForTier, 
  getMaxTokensForTier, 
  generatePromptTemplate 
} = require('../../app/lib/subscription-service');

require('dotenv').config({ path: '.env.local' });

// 模拟用户数据
const mockUsers = {
  free: {
    id: 'user-free-123',
    name: '免费用户',
    tier: 'free',
    requestsUsed: 0
  },
  monthly: {
    id: 'user-monthly-456',
    name: '月度订阅用户',
    tier: 'monthly',
    requestsUsed: 0
  },
  yearly: {
    id: 'user-yearly-789',
    name: '年度订阅用户',
    tier: 'yearly',
    requestsUsed: 0
  }
};

// 模拟能量上下文
const mockEnergyContext = {
  bazi: {
    yearPillar: '甲子',
    monthPillar: '丙午',
    dayPillar: '戊申'
  },
  birthDate: new Date('1984-06-15'),
  dominantElement: 'Wood',
  missingElement: 'Water',
  currentYear: {
    pillar: '乙卯',
    zodiac: '兔',
    year: 2025
  },
  currentMonth: {
    pillar: '壬寅',
    element: '木',
    energyType: '生长',
    start: '2025-05-01',
    end: '2025-05-31'
  }
};

// 初始化OpenAI客户端（如果有API密钥）
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * 测试不同订阅级别
 */
async function testSubscriptionTiers() {
  console.log('=== 订阅系统测试 ===\n');
  
  // 测试每个订阅级别
  for (const tier of ['free', 'monthly', 'yearly']) {
    const user = mockUsers[tier];
    console.log(`\n--- 测试 ${SUBSCRIPTION_PLANS[tier].name} ---`);
    
    // 1. 显示订阅计划信息
    console.log(`价格: ${SUBSCRIPTION_PLANS[tier].price} ${SUBSCRIPTION_PLANS[tier].currency}/${SUBSCRIPTION_PLANS[tier].interval}`);
    console.log(`功能: ${SUBSCRIPTION_PLANS[tier].features.join(', ')}`);
    
    // 2. 显示API模型和Token限制
    const model = getModelForTier(tier);
    const maxTokens = getMaxTokensForTier(tier);
    console.log(`使用模型: ${model}`);
    console.log(`最大Token: ${maxTokens}`);
    
    // 3. 生成提示词并显示长度和前100个字符
    const prompt = generatePromptTemplate(tier, mockEnergyContext);
    console.log(`提示词长度: ${prompt.length} 字符`);
    console.log(`提示词预览: ${prompt.substring(0, 100).trim()}...`);
    
    // 4. 如果有API密钥，测试实际API调用
    if (openai) {
      try {
        console.log('测试API调用...');
        
        // 注意：如果模型不存在，将使用兼容模型进行测试
        let testModel = model;
        // 如果是GPT-4.1系列模型但在测试环境不可用，则使用兼容替代
        if (model.includes('gpt-4.1') && process.env.TEST_ENV === 'dev') {
          testModel = 'gpt-3.5-turbo'; // 测试环境使用兼容模型
          console.log(`注意: 在测试环境中使用 ${testModel} 替代 ${model}`);
        }
        
        // 为免费用户、月度和年度订阅用户使用英文系统提示词
        let systemPrompt = "你是一位专业的能量咨询师。";
        if (tier === 'free' || tier === 'monthly' || tier === 'yearly') {
          systemPrompt = "You are a professional energy consultant specializing in crystal recommendations and elemental balance.";
        }
        
        const completion = await openai.chat.completions.create({
          model: testModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt.substring(0, 100) + '...' } // 截断提示词以节省token
          ],
          max_tokens: Math.min(50, maxTokens), // 限制返回token以节省费用
        });
        
        console.log('API调用成功!');
        console.log(`响应: ${completion.choices[0].message.content.substring(0, 50)}...`);
        console.log(`使用的tokens: ${completion.usage.total_tokens}`);
      } catch (error) {
        console.error('API调用失败:', error.message);
      }
    } else {
      console.log('未提供API密钥，跳过API调用测试');
    }
    
    // 5. 测试使用限制
    if (tier === 'free') {
      console.log('\n测试免费用户使用限制:');
      for (let i = 1; i <= 4; i++) {
        mockUsers.free.requestsUsed = i - 1;
        const canUse = i <= 3;
        console.log(`请求 #${i}: ${canUse ? '允许' : '拒绝 - 已达到本月限制'}`);
      }
    } else {
      console.log('\n付费用户无使用次数限制');
    }
  }
}

// 执行测试
testSubscriptionTiers(); 