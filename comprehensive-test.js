#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🧪 CrystalMatch 综合功能测试');
console.log('============================');

const BASE_URL = 'http://localhost:3000';

async function testEmailFlow() {
    console.log('\n📧 测试邮件验证流程...');
    
    try {
        const response = await fetch(`${BASE_URL}/api/auth/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        
        const data = await response.json();
        console.log('验证码发送结果:', data);
        return response.ok;
    } catch (error) {
        console.log('邮件测试失败:', error.message);
        return false;
    }
}

async function testPayPal() {
    console.log('\n💰 测试PayPal功能...');
    
    try {
        // 测试配置
        const configResponse = await fetch(`${BASE_URL}/api/test-paypal`);
        const configData = await configResponse.json();
        console.log('PayPal配置:', configData);
        
        // 测试订单创建
        const orderResponse = await fetch(`${BASE_URL}/api/paypal/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId: 'plus', amount: '4.99' })
        });
        
        const orderData = await orderResponse.json();
        console.log('订单创建结果:', orderData);
        
        return configResponse.ok && orderResponse.ok;
    } catch (error) {
        console.log('PayPal测试失败:', error.message);
        return false;
    }
}

async function main() {
    const emailTest = await testEmailFlow();
    const paypalTest = await testPayPal();
    
    console.log('\n📊 测试总结:');
    console.log(`📧 邮件验证: ${emailTest ? '✅ 通过' : '❌ 失败'}`);
    console.log(`💰 PayPal功能: ${paypalTest ? '✅ 通过' : '❌ 失败'}`);
    
    if (emailTest && paypalTest) {
        console.log('\n🎉 所有测试通过！');
        console.log('\n📍 可用测试地址:');
        console.log(`🌐 应用首页: ${BASE_URL}`);
        console.log(`📧 邮件登录: ${BASE_URL}/auth/login`);
        console.log(`💳 订阅页面: ${BASE_URL}/subscription`);
        console.log(`💰 支付页面: ${BASE_URL}/payment`);
        console.log(`🏠 八字分析: ${BASE_URL}/birth-info`);
    }
}

main(); 