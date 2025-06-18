// 完整流程测试 - 真实邮箱验证码 + PayPal沙箱
const BASE_URL = 'http://localhost:3000';

console.log('🚀 开始完整流程测试...\n');

// 1. 发送真实邮箱验证码
async function sendRealVerificationCode() {
    console.log('📧 1. 发送真实邮箱验证码...');
    
    // 请替换为您的真实邮箱地址
    const email = 'your-real-email@example.com'; // 请修改这里
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/send-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        console.log('发送结果:', data);
        
        if (response.ok) {
            console.log('✅ 验证码已发送到邮箱:', email);
            console.log('📱 请检查您的邮箱收取验证码\n');
            return { success: true, email };
        } else {
            console.log('❌ 发送失败:', data.error);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ 发送错误:', error.message);
        return { success: false };
    }
}

// 2. 验证码验证（需要手动输入收到的验证码）
async function verifyCode(email, code) {
    console.log('🔍 2. 验证验证码...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, code })
        });
        
        const data = await response.json();
        console.log('验证结果:', data);
        
        if (response.ok) {
            console.log('✅ 验证成功！JWT令牌已生成');
            console.log('🎯 用户信息:', data.user);
            console.log('🔑 登录状态: 已登录\n');
            return { success: true, token: data.token, user: data.user };
        } else {
            console.log('❌ 验证失败:', data.error);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ 验证错误:', error.message);
        return { success: false };
    }
}

// 3. 创建PayPal订单
async function createPayPalOrder(token) {
    console.log('💳 3. 创建PayPal沙箱订单...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/paypal/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                planId: 'plus',
                amount: '4.99',
                currency: 'USD'
            })
        });
        
        const data = await response.json();
        console.log('PayPal订单创建结果:', data);
        
        if (response.ok) {
            console.log('✅ PayPal订单创建成功！');
            console.log('🎫 订单ID:', data.orderId);
            console.log('🔗 支付链接:', data.approvalUrl);
            console.log('💡 请在浏览器中打开支付链接完成付款\n');
            return { success: true, orderId: data.orderId, approvalUrl: data.approvalUrl };
        } else {
            console.log('❌ 创建失败:', data.error);
            return { success: false };
        }
    } catch (error) {
        console.log('❌ 创建错误:', error.message);
        return { success: false };
    }
}

// 主测试流程
async function runCompleteTest() {
    console.log('=' .repeat(60));
    console.log('🧪 CrystalMatch 完整流程测试');
    console.log('=' .repeat(60));
    
    // 步骤1: 发送验证码
    const sendResult = await sendRealVerificationCode();
    if (!sendResult.success) {
        console.log('❌ 测试终止：验证码发送失败');
        return;
    }
    
    // 提示用户
    console.log('📋 下一步操作指南：');
    console.log('1. 检查您的邮箱收取验证码');
    console.log('2. 访问登录页面：http://localhost:3000/auth/login');
    console.log('3. 输入您的邮箱和收到的验证码');
    console.log('4. 登录后访问订阅页面：http://localhost:3000/subscription');
    console.log('5. 选择订阅计划并使用PayPal沙箱测试支付');
    console.log('\n💳 PayPal沙箱测试账号：');
    console.log('   买家账号：sb-buyer@business.example.com');
    console.log('   密码：password123');
    console.log('   信用卡：4111 1111 1111 1111');
    console.log('   到期日期：01/2030, CVV: 123');
    
    console.log('\n🌐 完整测试地址：');
    console.log('   应用首页：http://localhost:3000');
    console.log('   邮箱登录：http://localhost:3000/auth/login');
    console.log('   八字分析：http://localhost:3000/birth-info');
    console.log('   订阅管理：http://localhost:3000/subscription');
    console.log('   用户中心：http://localhost:3000/dashboard');
}

// 运行测试
if (require.main === module) {
    runCompleteTest().catch(console.error);
} 