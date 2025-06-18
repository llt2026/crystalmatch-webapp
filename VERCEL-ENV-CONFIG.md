# Vercel 环境变量配置指南

## 🎯 当前配置状态分析

### ✅ 您已正确配置的变量
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_ID` 
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS`
- `NEXT_PUBLIC_P_PAYPAL_PLAN_PRO`
- `PAYPAL_ENV`
- `NEXT_PUBLIC_APP_URL`
- `MAIL_SECURE=true`

### ❌ 关键遗漏的变量

## 必须添加的环境变量

### 1. 邮件服务配置 (必需)
```bash
# 邮件服务器配置
MAIL_HOST=smtp.zoho.com
MAIL_PORT=465
MAIL_USER=hello@crystalmatch.co
MAIL_PASS=c7E8w1B0v0U6
MAIL_FROM=CrystalMatch <hello@crystalmatch.co>

# 重要：不要删除这个！
SKIP_MAIL_SENDING=false
```

**⚠️ 删除`SKIP_MAIL_SENDING`是错误的！**

根据代码逻辑(`app/api/auth/send-code/route.ts:47-55`)：
```typescript
const skipMailSending = process.env.SKIP_MAIL_SENDING === 'true';
const hasMailConfig = process.env.MAIL_HOST && process.env.MAIL_PORT && 
                     process.env.MAIL_USER && process.env.MAIL_PASS;

if (!hasMailConfig && !skipMailSending) {
  return NextResponse.json({ error: 'Mail configuration incomplete' }, { status: 500 });
}
```

如果您删除了`SKIP_MAIL_SENDING`且邮件配置不完整，会导致500错误！

### 2. JWT和安全配置 (必需)
```bash
JWT_SECRET=crystalmatch-secure-jwt-secret-key-2025
```

### 3. 数据库配置 (必需)
```bash
DATABASE_URL=your-postgresql-connection-string
```

### 4. Redis配置 (生产环境强烈推荐)
```bash
# Upstash Redis (推荐)
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# 或者跳过Redis (不推荐生产环境)
SKIP_REDIS=true
```

## 🔧 完整的Vercel环境变量配置清单

### 核心系统变量
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://username:password@host:5432/database
JWT_SECRET=crystalmatch-secure-jwt-secret-key-2025
```

### 邮件服务变量
```bash
SKIP_MAIL_SENDING=false
MAIL_HOST=smtp.zoho.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=hello@crystalmatch.co
MAIL_PASS=c7E8w1B0v0U6
MAIL_FROM=CrystalMatch <hello@crystalmatch.co>
```

### PayPal配置变量
```bash
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
NEXT_PUBLIC_P_PAYPAL_PLAN_PLUS=your-plus-plan-id
NEXT_PUBLIC_P_PAYPAL_PLAN_PRO=your-pro-plan-id
```

### Redis配置变量 (推荐)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis-endpoint
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 可选变量
```bash
OPENAI_API_KEY=your-openai-api-key
LOG_LEVEL=info
```

## 🚨 重要注意事项

### 1. 关于SKIP_MAIL_SENDING
- **不要删除这个变量！**
- 设置为`false`启用真实邮件发送
- 如果邮件配置不完整，会导致应用崩溃

### 2. 邮件配置完整性检查
代码会检查以下4个变量是否都存在：
- `MAIL_HOST`
- `MAIL_PORT` 
- `MAIL_USER`
- `MAIL_PASS`

如果任何一个缺失且`SKIP_MAIL_SENDING`不为true，会返回500错误。

### 3. Redis的重要性
- 生产环境强烈推荐使用Redis
- 用于存储验证码和频率限制
- 如果不使用Redis，请设置`SKIP_REDIS=true`

### 4. PayPal环境
- 确认`PAYPAL_ENV=sandbox`用于测试
- 正式上线时改为`PAYPAL_ENV=production`

## 🎯 您需要立即添加的变量

基于您当前的配置，请立即在Vercel中添加：

```bash
# 修复邮件系统
SKIP_MAIL_SENDING=false
MAIL_HOST=smtp.zoho.com
MAIL_PORT=465
MAIL_USER=hello@crystalmatch.co
MAIL_PASS=c7E8w1B0v0U6
MAIL_FROM=CrystalMatch <hello@crystalmatch.co>

# 安全配置
JWT_SECRET=crystalmatch-secure-jwt-secret-key-2025

# 数据库 (如果还没有)
DATABASE_URL=your-postgresql-url

# Redis (推荐)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## 📋 检查清单

在Vercel部署前确认：
- [ ] 所有邮件变量已设置
- [ ] `SKIP_MAIL_SENDING=false`
- [ ] JWT_SECRET已设置
- [ ] 数据库URL已配置
- [ ] PayPal变量完整
- [ ] Redis配置（或SKIP_REDIS=true）

## 🔧 问题排查

如果遇到错误：

### "Mail configuration incomplete"
- 检查所有邮件变量是否都已设置
- 确认`SKIP_MAIL_SENDING=false`

### Redis连接错误
- 添加Upstash Redis配置
- 或设置`SKIP_REDIS=true`

### PayPal错误
- 确认所有PayPal变量已设置
- 检查PAYPAL_ENV设置

**结论：您的配置基本正确，但删除`SKIP_MAIL_SENDING`是错误的，需要立即添加回来！** 