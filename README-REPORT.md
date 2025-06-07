# 月度深度报告实现说明

## 概述

本项目实现了两个月度深度报告页面（May 2025和Apr 2025），分别对应Pro会员和Plus会员。报告页面包含多个能量分析模块，采用移动优先的响应式设计。

## 主要功能

1. **May 2025 (Pro)报告功能**：
   - 日能量表格：显示每日能量变化和趋势
   - 推送通知：重要能量变化提醒
   - 小时能量高峰：24小时能量分布热力图
   - 周预测：每周能量趋势和建议
   - 月概览：月度能量总结和阶段分析

2. **Apr 2025 (Plus)报告功能**：
   - 日能量表格：显示每日能量变化和趋势
   - 推送通知：重要能量变化提醒
   - 小时能量高峰：24小时能量分布热力图

## 文件结构

```
app/
├── components/
│   └── reports/
│       └── EnergyComponents.tsx  # 共享UI组件
├── lib/
│   ├── energyCalculationConfig.ts    # 能量计算配置
│   ├── energyCalculationService.ts   # 能量计算服务
│   ├── monthlyReportConfig.ts        # 月度报告配置
│   ├── mockReportData.ts             # 模拟数据生成器
│   └── subscriptionUtils.ts          # 订阅工具函数
├── profile/
│   └── monthly-reports/
│       ├── may-2025/
│       │   └── page.tsx              # Pro报告页面
│       └── apr-2025/
│           └── page.tsx              # Plus报告页面
└── services/
    └── reportService.ts              # 报告数据服务
```

## 技术实现

### 1. 能量计算模块

- 使用`energyCalculationService.ts`统一调用能量计算
- 根据配置选择不同的计算模型
- 保留了年度报告的计算方法，确保兼容性

### 2. 用户界面

- 共享组件设计，确保一致的UI体验
- 移动优先的响应式设计
- 适配不同屏幕尺寸的布局

### 3. 数据获取

- 实现了带fallback的API数据获取
- 支持模拟数据用于开发和测试
- 通过URL参数获取用户生日信息

### 4. 移动端适配

- 使用`-mx-4 sm:mx-0`等Tailwind类实现移动端溢出处理
- 小尺寸文本和紧凑布局适合移动设备
- 使用`grid`和`overflow-x-auto`处理小屏幕数据展示

### 5. 安全和权限

- 权限检查确保只有相应订阅级别的用户可访问
- 未登录用户重定向到登录页面
- 使用`credentials: 'include'`确保API认证

## 使用说明

1. 访问路径：
   - Pro报告：`/profile/monthly-reports/may-2025`
   - Plus报告：`/profile/monthly-reports/apr-2025`

2. URL参数：
   - `birthDate`: 用户出生日期，格式为`YYYY-MM-DD`

3. 环境变量：
   - `NEXT_PUBLIC_API_URL`: API基础URL
   - `NEXT_PUBLIC_USE_MOCK_DATA`: 是否使用模拟数据

## 待改进

1. 添加更多用户交互功能，如日期选择器
2. 实现报告数据缓存机制
3. 添加更多数据可视化图表
4. 优化API错误处理和重试机制 