# OpenAI API 配置指南

## 问题诊断

您遇到的问题是前端填写信息后无法获取报告，根本原因是：

1. **OpenAI API 密钥未配置**：系统检测到环境变量 `OPENAI_API_KEY` 未设置
2. **API 调用流程**：前端 → 后端 → OpenAI GPT API → 生成报告

## 应用代码逻辑说明

是的，您的理解正确！应用的工作流程是：

1. **前端收集数据**：
   - 用户在 `/birth-info` 页面填写出生日期、性别等信息
   - 数据存储在 localStorage，然后跳转到 `/energy-reading`

2. **后端处理逻辑**：
   - 前端调用 `/api/energy-reading` 或 `/api/generate-energy-report`
   - 后端使用出生信息计算八字、五行、生肖、星座等
   - 构建个性化的提示词 (prompt)
   - 调用 OpenAI GPT API 生成报告
   - 解析 GPT 响应并返回结构化数据

3. **报告生成**：
   - 免费用户：简化版报告
   - 月度会员：详细月度报告 + 12个月能量表
   - 年度会员：完整年度报告 + 季度分析 + 关键日期

## 解决步骤

### 1. 获取 OpenAI API 密钥

访问 [OpenAI Platform](https://platform.openai.com/api-keys) 获取您的 API 密钥。

### 2. 配置环境变量

编辑项目根目录的 `.env.local` 文件：

```bash
# OpenAI API 配置
OPENAI_API_KEY=sk-proj-你的真实API密钥

# 其他配置...
DATABASE_URL="mongodb://localhost:27017/crystalmatch"
JWT_SECRET="your-secret-key-should-be-very-long-and-random"
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```

### 3. 测试 API 连接

运行测试脚本验证配置：

```bash
# 测试 OpenAI API 连接
node app/scripts/test-api-connection.js

# 生成测试报告
npm run test:api
```

### 4. 重启开发服务器

```bash
npm run dev
```

## 代码关键部分

### API 检查逻辑
```typescript
// app/api/generate-energy-report/route.ts
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-openai-api-key') {
  console.log('使用模拟数据，因为未配置有效的OpenAI API密钥');
  return NextResponse.json({ 
    error: "OpenAI API key not configured", 
    mockData: mockReport
  }, { status: 500 });
}
```

### 前端 API 调用
```typescript
// app/energy-reading/page.tsx
const response = await fetch('/api/energy-reading', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(birthInfo),
});
```

## 常见问题

1. **API 密钥格式错误**：确保以 `sk-` 开头
2. **环境变量未生效**：重启开发服务器
3. **网络问题**：检查是否需要配置代理

## 验证方法

配置完成后，访问应用：
1. 填写出生信息
2. 查看浏览器开发者工具的网络选项卡
3. 确认 API 调用返回真实的 GPT 生成内容，而不是模拟数据 