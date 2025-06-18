# 废弃的报告页面和GPT调用

本文档标记了不再使用的报告页面和GPT调用，仅保留当前活跃的报告页面。

## 当前活跃的报告页面

以下报告页面是当前活跃使用的，**不应被删除**：

1. **Pro月度报告**：`app/profile/monthly-reports/may-2025/page.tsx`
   - 使用调用：`app/lib/buildMonthlyReportPrompt.ts`
   - 端点：`app/api/generate-monthly-report/route.ts`

2. **Plus月度报告**：`app/profile/monthly-reports/apr-2025/page.tsx`
   - 使用调用：`app/lib/monthly_user_energy_prompt_v2.ts`
   - 通过：`app/lib/subscription-service.ts`的`generatePromptTemplate`函数

3. **年度报告**：`app/report/annual-premium/page.tsx`
   - 使用调用：`app/lib/annual_user_yearly_prompt.ts`
   - 通过：`app/lib/subscription-service.ts`的`generatePromptTemplate`函数

## 废弃的报告页面

以下报告页面或引用已废弃，**不再使用**：

1. **六月报告引用**：
   - 在`app/profile/page.tsx`中的引用：`onClick={() => navigateToReport('/profile/monthly-reports/jun-2025')}`
   - 在`app/lib/monthlyReportConfig.ts`中的配置

2. **通用报告页**：
   - `app/report/[slug]/page.tsx` (动态路由报告页，现在使用具体的报告页)

3. **报告API端点**：
   - 任何非`app/api/generate-monthly-report/route.ts`的报告API端点都应视为废弃

## 废弃的GPT调用

所有非以下几个文件的GPT提示词或调用都应视为废弃：

1. `app/lib/buildMonthlyReportPrompt.ts` - Pro月报提示词
2. `app/lib/monthly_user_energy_prompt_v2.ts` - Plus月报提示词
3. `app/lib/annual_user_yearly_prompt.ts` - 年度报告提示词
4. `app/lib/subscription-service.ts` - 提示词分派器

## 注意事项

在更新系统时，应确保：

1. 只有当前活跃的报告页面才会调用GPT API
2. 废弃的页面应避免在导航和链接中出现
3. 当创建新的报告页面时，应遵循当前活跃页面的模式
4. 所有GPT提示词应使用引导性而非指令性语气

## 2023年12月更新

- Apr 2025和May 2025报告现在使用相同的API调用
- Apr 2025作为Plus会员模板，May 2025作为Pro会员模板
- 两者的区别仅在于UI上锁定Pro专属内容，不再有单独的API调用 