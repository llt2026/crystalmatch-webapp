# Vercel 部署指南

本指南将帮助您在 Vercel 上成功部署 Crystal Match 应用程序，解决 Prisma 初始化问题。

## Prisma 初始化问题

当您在 Vercel 上遇到以下错误时：
```
Error: @prisma/client did not initialize yet. Please run "prisma generate"
```

这是因为 Prisma 客户端需要在部署过程中正确生成和初始化。我们已经进行了以下改进以解决此问题：

1. 创建了专门的 `prisma.ts` 文件作为 Prisma 客户端单例
2. 修改了 `package.json` 添加了 `postinstall` 和更新了 `build` 脚本
3. 添加了 `vercel.json` 配置文件
4. 添加了 Prisma 连接池优化配置
5. 创建了 Neon 数据库连接优化插件

## 重要更新（2025-05-15）

我们进行了以下额外优化，以解决持久化的 Prisma 初始化问题：

1. 优化了 Prisma schema 配置，添加了必要的扩展和预览功能
2. 重构了 Prisma 客户端单例模式，更好地处理 Vercel Serverless 环境
3. 修复了健康检查 API 端点，使用真实数据库连接检查
4. 简化了 vercel.json 配置，避免冲突

## 部署步骤

### 1. 设置 Vercel 环境变量

在 Vercel 控制台中，为您的项目设置以下环境变量：

- `DATABASE_URL`: Neon PostgreSQL 数据库连接字符串（格式：`postgresql://username:password@hostname.neon.tech/neondb?sslmode=require`）
- `OPENAI_API_KEY`: 您的 OpenAI API 密钥（如果需要）
- `JWT_SECRET`: 用于签名 JWT 的安全密钥
- `NEXT_PUBLIC_APP_URL`: 应用的生产 URL
- `LOG_LEVEL`: 日志级别（建议生产环境使用 `error`）

> **重要**: 确保使用 Neon 的 "Pooled Connection" 连接字符串，它包含 `-pooler` 在主机名中。这可以大大提高 Vercel Serverless 环境中的性能。

### 2. 部署配置

确保您的 Vercel 项目的 "Build & Development Settings" 设置正确：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. 部署应用

1. 将代码推送到连接的 Git 仓库
2. Vercel 将自动检测推送并开始构建过程
3. 构建过程中将生成 Prisma 客户端

### 4. 排查部署问题

如果部署仍然失败：

1. 检查 Vercel 构建日志，寻找与 Prisma 相关的错误
2. 确保 `DATABASE_URL` 环境变量正确设置
3. 尝试在本地执行 `npm run build` 验证构建过程
4. 确认 Neon 数据库允许从 Vercel 的 IP 地址连接

## 连接到 Neon 数据库的注意事项

1. **使用连接池**：确保您的 Neon PostgreSQL 数据库使用 "Pooled connections"，主机名中应包含 `-pooler`
2. **配置 SSL**：确保连接字符串中包含 `?sslmode=require`
3. **IP 限制**：在 Neon 控制台启用 IP 限制时，添加 Vercel 的 IP 范围
4. **优化查询**：避免长时间运行的查询，Serverless 函数有执行时间限制

## 验证部署

部署成功后，您可以通过以下方式验证数据库连接：

1. 访问应用中的健康检查端点（例如 `/api/health`）
2. 查看 Vercel 的函数日志，检查数据库连接信息
3. 尝试进行需要数据库的操作（如登录、查看数据）

## 常见问题与解决方案

### 1. Prisma 客户端未初始化

如果看到 "Prisma Client did not initialize yet" 错误：
- 确保 `build` 和 `postinstall` 脚本包含 `prisma generate`
- 检查 Vercel 是否能访问您的 Neon 数据库
- 验证环境变量是否正确设置

### 2. 连接错误

如果看到 "Can't reach database server" 错误：
- 确认 Neon 数据库是否运行
- 检查连接字符串中的凭据
- 确保 Neon 实例允许从 Vercel 的 IP 地址连接

### 3. 性能问题

如果应用响应缓慢：
- 使用 Neon 的连接池功能
- 检查和优化数据库查询
- 考虑使用 Prisma 的连接池设置

如果您遇到任何问题，请检查 Vercel 日志并参考本指南进行故障排除。 