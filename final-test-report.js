#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🎯 CrystalMatch 系统最终测试报告');
console.log('=================================');
console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
console.log(`测试环境: ${process.env.NODE_ENV || 'development'}`);
console.log(`服务器地址: http://localhost:3000\n`);

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('🧪 运行最终系统验证...\n');
    
    const tests = [
        { name: '邮件验证', endpoint: '/api/auth/send-code', method: 'POST', data: { email: 'test@final.com' } },
        { name: 'PayPal配置', endpoint: '/api/test-paypal', method: 'GET' },
        { name: 'PayPal订单', endpoint: '/api/paypal/create-order', method: 'POST', data: { planId: 'plus', amount: '4.99' } }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        try {
            const options = {
                method: test.method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (test.data) {
                options.body = JSON.stringify(test.data);
            }
            
            const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
            const result = await response.json();
            
            if (response.ok) {
                console.log(`✅ ${test.name}: 测试通过`);
                passed++;
            } else {
                console.log(`❌ ${test.name}: 测试失败`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: 连接失败`);
        }
    }
    
    console.log(`\n📊 测试结果: ${passed}/${tests.length} 通过`);
    
    if (passed === tests.length) {
        console.log('\n🎉 系统测试完成！所有功能正常运行。\n');
        console.log('📍 本次测试地址汇总:');
        console.log(`🌐 应用首页: ${BASE_URL}`);
        console.log(`📧 邮件登录: ${BASE_URL}/auth/login`);
        console.log(`💳 订阅页面: ${BASE_URL}/subscription`);
        console.log(`💰 支付页面: ${BASE_URL}/payment`);
        console.log(`🏠 八字分析: ${BASE_URL}/birth-info`);
    }
}

main(); 