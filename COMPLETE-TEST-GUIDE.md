# CrystalMatch 完整本地测试指南

## 🎯 测试目标
- ✅ 真实邮箱接收验证码并成功登录
- ✅ PayPal沙箱环境完成订阅支付流程
- ✅ 验证所有功能模块正常工作

## 📋 前置条件检查

### 1. 服务器状态
```bash
# 检查3000端口是否运行
netstat -ano | findstr :3000
```

### 2. 环境配置确认
当前配置文件 `.env.local` 包含：
- ✅ 真实邮件服务器配置 (hello@crystalmatch.co)
- ✅ PayPal沙箱环境配置
- ✅ JWT密钥配置
- ✅ 数据库连接配置

## 🚀 完整测试流程

### 步骤1: 启用真实邮件发送
```bash
# 方法1：运行批处理文件
enable-real-mail.bat

# 方法2：PowerShell命令
$env:SKIP_MAIL_SENDING='false'
```

### 步骤2: 测试真实邮箱验证码
```bash
# 替换为您的真实邮箱地址
node test-real-email.js your-email@example.com
```

**预期结果：**
- ✅ 显示 "验证码已发送成功"
- ✅ 测试模式显示为 "否"
- ✅ 您的邮箱收到CrystalMatch验证码邮件

### 步骤3: 浏览器完整验证流程

#### 3.1 邮箱登录验证
1. 打开浏览器访问：`http://localhost:3000/auth/login`
2. 输入您的真实邮箱地址
3. 输入收到的6位验证码
4. 点击登录

**预期结果：**
- ✅ 成功登录并跳转到用户中心
- ✅ 显示用户邮箱信息
- ✅ JWT令牌正确设置

#### 3.2 功能模块测试
访问以下页面确认功能正常：

**基础功能：**
- 首页：`http://localhost:3000`
- 八字分析：`http://localhost:3000/birth-info`
- 用户中心：`http://localhost:3000/dashboard`

**付费功能：**
- 订阅管理：`http://localhost:3000/subscription`
- 支付页面：`http://localhost:3000/payment`

### 步骤4: PayPal沙箱支付测试

#### 4.1 访问订阅页面
1. 确保已登录状态
2. 访问：`http://localhost:3000/subscription`
3. 选择 "Plus" 或 "Pro" 订阅计划
4. 点击 "订阅" 或 "升级"

#### 4.2 PayPal沙箱支付
**测试账号信息：**
- 买家账号：`sb-buyer@business.example.com`
- 密码：`password123`
- 测试信用卡：`4111 1111 1111 1111`
- 到期日期：`01/2030`
- CVV：`123`

**支付流程：**
1. 在PayPal弹窗中选择 "Pay with Card"
2. 输入测试信用卡信息
3. 或者登录沙箱买家账号
4. 完成支付确认

#### 4.3 验证支付结果
**预期结果：**
- ✅ 支付成功后返回应用
- ✅ 订阅状态更新为 "Active"
- ✅ 可以访问付费功能
- ✅ 服务器日志显示Webhook处理成功

### 步骤5: 权限和功能验证

#### 5.1 免费用户限制测试
1. 登出当前账号
2. 用另一个邮箱注册（不付费）
3. 尝试访问付费功能
4. 确认被正确限制

#### 5.2 付费用户权限测试
1. 登录已付费账号
2. 访问所有功能模块
3. 确认付费功能正常开放

## 🧪 自动化测试脚本

### 邮箱验证码测试
```bash
# 发送真实验证码
node test-real-email.js your-email@example.com
```

### 系统健康检查
```bash
# 运行综合测试
node comprehensive-test.js
```

### PayPal功能测试
```bash
# 测试PayPal配置和订单创建
node test-paypal-webhook.js
```

## 📊 成功指标

### ✅ 邮件系统
- [ ] 验证码邮件成功发送到真实邮箱
- [ ] 邮件内容格式正确
- [ ] 验证码验证成功
- [ ] 用户登录状态正确

### ✅ PayPal系统
- [ ] 沙箱环境配置正确
- [ ] 订单创建成功
- [ ] 支付流程顺畅
- [ ] Webhook处理正常
- [ ] 订阅状态更新

### ✅ 应用功能
- [ ] 所有页面正常加载
- [ ] 权限控制正确
- [ ] 用户体验流畅
- [ ] 错误处理完善

## 🔧 故障排除

### 邮件发送问题
```bash
# 检查邮件配置
echo "MAIL_HOST: $env:MAIL_HOST"
echo "MAIL_USER: $env:MAIL_USER"
echo "SKIP_MAIL_SENDING: $env:SKIP_MAIL_SENDING"
```

### PayPal配置问题
```bash
# 检查PayPal配置
echo "PAYPAL_ENV: $env:PAYPAL_ENV"
echo "PAYPAL_CLIENT_ID: $env:PAYPAL_CLIENT_ID"
```

### 服务器连接问题
```bash
# 重启开发服务器
npm run dev
```

## 📞 支持信息

如果遇到问题：
1. 检查控制台日志
2. 确认环境变量配置
3. 验证网络连接
4. 查看服务器运行状态

---

## 🎉 完成测试后

一旦所有测试通过，您的CrystalMatch应用就完全可以在本地环境进行：
- 真实邮箱验证码登录
- PayPal沙箱支付测试
- 完整用户流程体验

**最终确认清单：**
- [ ] 真实邮箱验证码接收 ✅
- [ ] 登录流程完整 ✅
- [ ] PayPal沙箱支付成功 ✅
- [ ] 所有功能正常 ✅
- [ ] 权限控制正确 ✅ 