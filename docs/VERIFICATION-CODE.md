# 验证码功能实现说明

## 功能概述

本应用实现了基于邮箱验证码的用户注册/登录功能。核心功能包括：

1. **验证码发送**：向用户邮箱发送6位数字验证码
2. **验证码验证**：验证用户输入的验证码是否正确
3. **用户身份验证**：验证成功后创建或更新用户信息并发放JWT令牌
4. **前端验证码输入体验**：优化的验证码输入UI和交互

## 关键技术实现

### 验证码存储

验证码存储采用分层架构，优先使用Redis，降级使用内存存储：

1. **Redis存储**：
   - 用于生产环境
   - 确保多实例/无状态函数环境下的一致性
   - 支持自动过期（5分钟）
   - 键名格式：`verification:code:{email}`

2. **内存存储**：
   - 作为Redis不可用时的备用方案
   - 应用重启后数据会丢失
   - 单节点部署时可用

### 频率限制

实现了对同一邮箱的发送频率限制：

1. 同一邮箱60秒内限制只能发送一次验证码
2. 超过限制时返回HTTP 429状态码和剩余等待时间
3. 使用Redis实现频率限制计数

### 前端体验

优化的验证码输入体验：

1. 6个独立的输入框，一次输入一个数字
2. 支持自动聚焦下一个输入框
3. 支持粘贴完整的6位验证码
4. 60秒可视化倒计时，防止频繁请求
5. 重新发送按钮，在倒计时期间禁用

### API接口

1. **发送验证码**：
   - 端点：`POST /api/auth/send-code`
   - 请求体：`{ "email": "user@example.com" }`
   - 返回：`{ "success": true }` 或错误信息

2. **验证验证码**：
   - 端点：`POST /api/auth/verify-code`
   - 请求体：`{ "email": "user@example.com", "code": "123456" }`
   - 返回：`{ "success": true, "user": {...} }` 或错误信息
   - 成功后自动设置HTTP Cookie中的JWT令牌

3. **旧的验证接口**（保留向后兼容性）：
   - 端点：`GET /api/auth/send-code?email=user@example.com&code=123456`
   - 返回：`{ "verified": true }` 或错误信息

## 安全考虑

1. **验证码一次性使用**：验证成功后立即删除验证码
2. **过期机制**：验证码5分钟后自动过期
3. **频率限制**：防止暴力破解和滥用
4. **HTTP Only Cookie**：JWT令牌存储在HTTP Only Cookie中，防止XSS攻击
5. **安全的SMTP连接**：使用SSL/TLS加密邮件传输

## 使用示例

### 注册/登录流程

1. 用户输入邮箱地址
2. 点击"发送验证码"按钮
3. 用户在邮箱中收到6位数字验证码
4. 用户在应用中输入验证码
5. 验证成功后，用户自动登录并获取JWT令牌
6. 应用将用户重定向到仪表盘或主页

## 配置要求

确保以下环境变量已正确配置：

1. **邮件服务配置**：
   ```
   MAIL_HOST=smtp.example.com
   MAIL_PORT=465
   MAIL_USER=user@example.com
   MAIL_PASS=password
   MAIL_FROM=noreply@example.com
   ```

2. **Redis配置**（生产环境必需）：
   ```
   REDIS_URL=redis://username:password@hostname:6379
   ```

3. **JWT配置**：
   ```
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=7d
   ``` 