# 环境变量配置说明

本文档列出了应用程序运行所需的所有环境变量及其配置说明。

## 数据库配置

```
# PostgreSQL数据库连接字符串
DATABASE_URL="postgresql://user:password@hostname:5432/dbname"
```

## 身份验证

```
# JWT密钥，用于签名和验证令牌
JWT_SECRET="your-secure-jwt-secret-key"

# JWT令牌过期时间
JWT_EXPIRES_IN="7d"
```

## 邮件服务

```
# SMTP服务器配置
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=user@example.com
MAIL_PASS=password
MAIL_FROM=noreply@example.com
```

## Redis缓存 (新增)

```
# Redis连接URL，用于验证码存储和速率限制
REDIS_URL="redis://username:password@hostname:6379"
```

> **注意**: 在Vercel或其他无状态部署环境中，Redis是必需的，以确保验证码和速率限制功能正常工作。

## 应用配置

```
# 应用公共URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# OpenAI API密钥(如果使用AI功能)
OPENAI_API_KEY="your-openai-api-key"

# 日志级别
LOG_LEVEL="info"
```

## Vercel部署注意事项

1. 确保在Vercel项目设置中配置所有必要的环境变量
2. 对于Redis，建议使用Upstash或Redis Labs等托管服务
3. 数据库建议使用Neon PostgreSQL等支持无服务器连接池的服务

## 本地开发

对于本地开发，将这些变量添加到`.env.local`文件中。该文件默认被Git忽略，可以安全地存储敏感信息。