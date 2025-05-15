# 数据库配置和使用指南

CrystalMatch应用使用MongoDB作为数据库，通过Prisma ORM进行数据访问。本文档提供数据库配置和使用的详细说明。

## 设置指南

### 前提条件

1. 安装MongoDB（本地或使用云服务如MongoDB Atlas）
2. 在项目根目录创建`.env`文件配置数据库连接

### 环境变量配置

在`.env`文件中设置以下环境变量：

```
# 本地MongoDB
DATABASE_URL="mongodb://localhost:27017/crystalmatch"

# 或使用MongoDB Atlas
# DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/crystalmatch?retryWrites=true&w=majority"
```

### 初始化数据库

执行以下命令初始化数据库和模型：

```bash
# 生成Prisma客户端
npm run prisma:generate

# 将Schema推送到数据库
npm run db:push

# 运行种子脚本创建初始数据
npm run db:seed
```

## 数据模型

CrystalMatch应用包含以下主要数据模型：

### User（用户）

用户账户信息，包括个人资料和偏好设置。

```typescript
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  name          String?
  avatar        String?
  location      Json?     // 包含country, state, city
  birthInfo     Json?     // 包含date, time, location
  preferences   Json?     // 包含notifications, newsletter, language等设置
  role          String    @default("user")
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // 关联
  subscriptions Subscription[]
  orders        Order[]
}
```

### SubscriptionPlan（订阅计划）

可用的订阅计划配置。

```typescript
model SubscriptionPlan {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String?
  price       Float
  period      String   // monthly, yearly
  features    Json     // 包含计划特性的JSON对象
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关联
  subscriptions Subscription[]
}
```

### Subscription（用户订阅）

用户的订阅实例，关联用户和订阅计划。

```typescript
model Subscription {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  status       String   // active, cancelled, expired, trial
  startDate    DateTime @default(now())
  endDate      DateTime?
  renewalDate  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // 关联
  userId       String   @db.ObjectId
  user         User     @relation(fields: [userId], references: [id])
  planId       String   @db.ObjectId
  plan         SubscriptionPlan @relation(fields: [planId], references: [id])
  orders       Order[]
}
```

### Order（订单）

支付订单记录。

```typescript
model Order {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  amount        Float
  currency      String   @default("USD")
  status        String   // pending, completed, failed, refunded
  paymentMethod String?
  transactionId String?
  metadata      Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // 关联
  userId        String   @db.ObjectId
  user          User     @relation(fields: [userId], references: [id])
  subscriptionId String?  @db.ObjectId
  subscription  Subscription? @relation(fields: [subscriptionId], references: [id])
}
```

### EnergyReport（能量报告）

用户的能量分析报告。

```typescript
model EnergyReport {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  title      String
  birthData  Json
  content    Json
  crystals   Json[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 使用示例

### 用户操作

```typescript
import { findUserByEmail, createUser, updateUser } from '@/app/lib/repositories/userRepository';

// 查找用户
const user = await findUserByEmail('user@example.com');

// 创建用户
const newUser = await createUser({
  email: 'newuser@example.com',
  name: 'New User',
  location: {
    country: 'United States',
    state: 'California',
    city: 'San Francisco'
  }
});

// 更新用户信息
const updatedUser = await updateUser(userId, {
  name: 'Updated Name',
  birthInfo: {
    date: '1990-01-01',
    time: '12:00',
    location: 'New York, NY'
  }
});
```

### 订阅计划操作

```typescript
import { getAllPlans, getPlanById } from '@/app/lib/repositories/subscriptionRepository';

// 获取所有活跃的订阅计划
const plans = await getAllPlans(true);

// 获取特定计划详情
const premiumPlan = await getPlanById('plan_id_here');
```

### 创建订阅

```typescript
import { createSubscription, getActiveSubscription } from '@/app/lib/repositories/subscriptionRepository';

// 创建新订阅
const subscription = await createSubscription({
  userId: 'user_id_here',
  planId: 'plan_id_here',
  status: 'active',
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后
});

// 获取用户当前活跃订阅
const activeSubscription = await getActiveSubscription('user_id_here');
```

### 订单操作

```typescript
import { createOrder, getUserOrders } from '@/app/lib/repositories/orderRepository';

// 创建订单
const order = await createOrder({
  userId: 'user_id_here',
  subscriptionId: 'subscription_id_here',
  amount: 99.99,
  status: 'pending'
});

// 获取用户订单历史
const orderHistory = await getUserOrders('user_id_here');
```

## 数据库维护工具

### Prisma Studio

Prisma提供了一个GUI工具来查看和编辑数据库数据：

```bash
npm run db:studio
```

这将启动Prisma Studio，通常在 http://localhost:5555 访问。

### 数据库重置

在开发环境中，可以使用以下命令重置数据库：

```bash
npm run db:reset
```

**警告：** 此操作将删除所有数据并重新创建数据库架构，请谨慎使用。

## 数据迁移和备份

### 数据备份

定期备份MongoDB数据是个好习惯：

```bash
# 使用mongodump备份数据（需要MongoDB工具）
mongodump --uri="mongodb://localhost:27017/crystalmatch" --out=./backups/$(date +%Y-%m-%d)
```

### 数据恢复

需要时，可以使用mongorestore恢复数据：

```bash
# 恢复数据
mongorestore --uri="mongodb://localhost:27017/crystalmatch" ./backups/2023-12-01
```

## 故障排除

如果您遇到数据库连接问题，请检查：

1. MongoDB服务是否正在运行
2. `.env`文件中的连接字符串是否正确
3. 网络连接（如果使用远程数据库）
4. 数据库用户权限

您可以使用健康检查API验证数据库连接状态：

```
GET /api/health
``` 