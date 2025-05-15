# 数据库设置指南

本项目使用MongoDB作为数据库，并通过Prisma ORM进行数据库操作。以下是完整的设置步骤。

## 前置条件

1. 安装MongoDB（推荐4.4版本或更高）
   - [MongoDB官方下载页面](https://www.mongodb.com/try/download/community)
   - 或使用MongoDB Atlas云服务：[https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. 安装Node.js（推荐16.x或更高版本）

## 本地数据库设置

### 1. 启动MongoDB服务

**Windows:**
```
"C:\Program Files\MongoDB\Server\{version}\bin\mongod.exe" --dbpath="C:\data\db"
```

**macOS/Linux:**
```
mongod --dbpath /data/db
```

### 2. 创建数据库

启动MongoDB客户端并创建数据库：
```
mongo
> use crystalmatch
```

## 项目数据库配置

### 1. 设置环境变量

在项目根目录创建`.env`文件，添加数据库连接字符串：

```
# 本地MongoDB
DATABASE_URL="mongodb://localhost:27017/crystalmatch"

# 或MongoDB Atlas
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/crystalmatch?retryWrites=true&w=majority"
```

### 2. 安装Prisma CLI

```
npm install -g prisma
```

### 3. 生成Prisma客户端

```
npx prisma generate
```

### 4. 初始化数据库架构

```
npx prisma db push
```

### 5. 查看数据库结构（可选）

```
npx prisma studio
```
这将在浏览器中打开Prisma Studio，让您可以可视化地查看和编辑数据库内容。

## 数据库架构说明

本项目包含以下主要数据模型：

1. **User** - 用户信息和偏好
2. **SubscriptionPlan** - 订阅计划和特性
3. **Subscription** - 用户订阅状态
4. **Order** - 订单和支付信息
5. **EnergyReport** - 用户能量报告
6. **EnergyReportCache** - 报告缓存

完整的数据模型定义可在`prisma/schema.prisma`文件中查看。

## 初始数据填充

要填充初始数据（如订阅计划），可以运行：

```
npm run db:seed
```

这将执行`prisma/seed.ts`脚本，创建必要的初始数据。

## 数据库迁移

当更改数据模型时，需要执行以下步骤：

1. 更新`prisma/schema.prisma`文件
2. 运行数据库推送命令：
   ```
   npx prisma db push
   ```
3. 重新生成Prisma客户端：
   ```
   npx prisma generate
   ```

## 常见问题排解

1. **连接错误**
   - 检查MongoDB服务是否正在运行
   - 验证连接字符串是否正确
   - 确认网络设置允许连接（特别是使用Atlas时）

2. **权限问题**
   - 确保用户有足够的权限创建和修改数据库

3. **Prisma错误**
   - 尝试清除Prisma缓存：`npx prisma generate --no-engine`
   - 确保Prisma版本与项目兼容 