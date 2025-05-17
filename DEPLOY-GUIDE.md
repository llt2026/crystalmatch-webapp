# CrystalMatch 部署指南

本文档提供在服务器上部署 CrystalMatch 应用程序的步骤和注意事项。

## 准备工作

1. 确保服务器具有以下软件：
   - Node.js 18+ 和 npm
   - 可选：Redis 服务器（如果不想使用Redis，请配置`SKIP_REDIS=true`）
   - 可选：PM2或类似的进程管理器

2. 确保以下环境变量配置正确：
   ```
   # 系统设置
   SKIP_REDIS=true

   # Redis设置（可选，如果服务器上有Redis可以启用）
   # REDIS_URL=redis://localhost:6379

   # 邮件设置
   MAIL_HOST=smtp.example.com
   MAIL_PORT=587
   MAIL_USER=your-email@example.com
   MAIL_PASS=your-password
   MAIL_FROM=noreply@crystalmatch.com

   # 开发模式设置
   # 如果不需要实际发送邮件，可以启用此选项
   SKIP_MAIL_SENDING=true
   ```

## 部署选项1：使用Git部署

1. 在服务器上克隆仓库：
   ```bash
   git clone https://github.com/llt2026/crystalmatch-webapp.git
   cd crystalmatch-webapp
   ```

2. 创建`.env.local`配置文件：
   ```bash
   cp .env.example .env.local
   # 编辑.env.local文件，设置适当的值
   ```

3. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```

4. 使用PM2启动应用：
   ```bash
   pm2 start npm --name "crystalmatch" -- start
   ```

## 部署选项2：使用文件传输

1. 在本地机器上构建：
   ```bash
   npm run build
   ```

2. 将以下文件传输到服务器：
   ```
   .next/
   public/
   package.json
   package-lock.json
   next.config.js
   app/
   .env.local（确保包含正确的配置）
   middleware.ts
   ```

3. 在服务器上安装依赖：
   ```bash
   npm install --production
   ```

4. 使用PM2启动应用：
   ```bash
   pm2 start npm --name "crystalmatch" -- start
   ```

## 使用Nginx代理

如果使用Nginx作为前端代理服务器，配置如下：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Redis 注意事项

- 如果服务器上有Redis可用，可以移除`SKIP_REDIS=true`配置
- 如果没有Redis，保持`SKIP_REDIS=true`配置，应用将使用内存存储作为备份

## 部署后检查

1. 确保应用已成功启动：
   ```bash
   pm2 status
   ```

2. 检查日志中是否有错误：
   ```bash
   pm2 logs crystalmatch
   ```

3. 验证邮件验证系统是否正常工作（尝试注册）

4. 检查Redis连接是否正常（如果未跳过Redis）

## 故障排除

- **Redis连接错误**：如果看到大量Redis错误，请确保设置`SKIP_REDIS=true`
- **邮件发送问题**：检查邮件配置或启用`SKIP_MAIL_SENDING=true`进行测试
- **端口占用**：如果3000端口被占用，可以修改启动命令或配置不同端口

## 更新部署

当有新版本时，通过以下步骤更新：

1. 拉取最新代码：
   ```bash
   git pull origin main
   ```

2. 安装新依赖并重新构建：
   ```bash
   npm install
   npm run build
   ```

3. 重启服务：
   ```bash
   pm2 restart crystalmatch
   ``` 