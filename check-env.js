require('dotenv').config({ path: '.env.local' });

console.log('=== 环境变量检查 ===');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.log('❌ OPENAI_API_KEY 未配置');
    process.exit(1);
}

console.log('✅ OPENAI_API_KEY 已配置');
console.log('密钥长度:', apiKey.length);
console.log('密钥格式:', apiKey.startsWith('sk-') ? '正确' : '错误');
console.log('密钥前缀:', apiKey.substring(0, 7) + '...');

// 简单测试API连接
async function testAPI() {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ API连接成功');
        } else {
            console.log('❌ API连接失败, 状态码:', response.status);
            const text = await response.text();
            console.log('错误信息:', text);
        }
    } catch (error) {
        console.log('❌ 网络错误:', error.message);
    }
}

testAPI(); 