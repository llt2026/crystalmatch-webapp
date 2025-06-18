#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🚀 CrystalMatch 测试环境启动器');

// 检查环境变量配置
function checkEnvConfig() {
    console.log('\n📋 检查环境变量配置...');
    
    if (!fs.existsSync('.env.local')) {
        console.log('❌ .env.local 文件不存在');
        console.log('ℹ️  请创建 .env.local 文件并配置以下变量:');
        console.log(`
DATABASE_URL="mongodb://localhost:27017/crystalmatch"
JWT_SECRET="crystalmatch-secure-jwt-secret-key-2025"
SKIP_MAIL_SENDING=true
MAIL_HOST="smtp.ethereal.email"
PAYPAL_ENV="sandbox"
PAYPAL_CLIENT_ID="AYiPC9BjuuLNzjHHACtpRF6OqtnWdkzREDhHEGGN6zzDd4BG4biAqmbXVELegUP5DO27HAkS5cnP5nKz"
NEXT_PUBLIC_PAYPAL_CLIENT_ID="AYiPC9BjuuLNzjHHACtpRF6OqtnWdkzREDhHEGGN6zzDd4BG4biAqmbXVELegUP5DO27HAkS5cnP5nKz"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
        `);
        return false;
    }
    
    console.log('✅ .env.local 文件存在');
    return true;
}

// 启动开发服务器
function startDevServer() {
    console.log('\n🌐 启动开发服务器...');
    
    const server = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });
    
    server.on('error', (err) => {
        console.error('❌ 服务器启动失败:', err);
    });
    
    return server;
}

// 等待服务器启动
async function waitForServer(port = 3001) {
    console.log(`\n⏳ 等待服务器在端口 ${port} 上启动...`);
    
    for (let i = 0; i < 30; i++) {
        try {
            const response = await fetch(`http://localhost:${port}/api/test-env`);
            if (response.ok) {
                console.log('✅ 服务器已启动');
                return true;
            }
        } catch (error) {
            // 继续等待
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.stdout.write('.');
    }
    
    console.log('\n❌ 服务器启动超时');
    return false;
}

// 运行测试
async function runTests() {
    console.log('\n🧪 运行测试...');
    
    try {
        const testProcess = spawn('node', ['test-email-paypal.js'], {
            stdio: 'inherit',
            shell: true
        });
        
        return new Promise((resolve) => {
            testProcess.on('close', (code) => {
                resolve(code === 0);
            });
        });
    } catch (error) {
        console.error('❌ 测试执行失败:', error);
        return false;
    }
}

// 主函数
async function main() {
    console.log('开始启动测试环境...\n');
    
    // 检查配置
    if (!checkEnvConfig()) {
        process.exit(1);
    }
    
    // 启动服务器
    const server = startDevServer();
    
    // 等待服务器启动
    const serverReady = await waitForServer();
    
    if (!serverReady) {
        console.log('❌ 服务器启动失败');
        server.kill();
        process.exit(1);
    }
    
    // 运行测试
    const testPassed = await runTests();
    
    if (testPassed) {
        console.log('\n🎉 所有测试通过！');
        console.log('\n📍 测试地址:');
        console.log('🌐 应用首页: http://localhost:3001');
        console.log('📧 邮件登录: http://localhost:3001/auth/login');
        console.log('💳 付费订阅: http://localhost:3001/subscription');
        console.log('💰 PayPal支付: http://localhost:3001/payment');
        console.log('\n🛑 按 Ctrl+C 停止服务器');
    } else {
        console.log('\n❌ 测试失败');
        server.kill();
        process.exit(1);
    }
    
    // 保持服务器运行
    process.on('SIGINT', () => {
        console.log('\n🛑 停止服务器...');
        server.kill();
        process.exit(0);
    });
}

main().catch(error => {
    console.error('💥 启动过程中发生错误:', error);
    process.exit(1);
}); 