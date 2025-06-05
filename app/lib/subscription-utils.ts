/**
 * 会员订阅工具函数
 * 统一处理API返回的订阅状态到前端会员类型的映射
 */

/**
 * 将API返回的订阅状态映射为标准会员类型
 * 严格遵循三种会员: free, plus, pro
 */
export function mapSubscriptionToTier(status: string | undefined): 'free' | 'plus' | 'pro' {
  if (!status) return 'free';
  
  const statusLower = status.toLowerCase();
  
  // 精确匹配plus和pro
  if (statusLower === 'plus') return 'plus';
  if (statusLower === 'pro') return 'pro';
  
  // 特殊情况处理，可能的historical值
  if (statusLower.includes('premium')) return 'pro';
  if (statusLower.includes('monthly')) return 'plus';
  if (statusLower.includes('yearly')) return 'pro';
  
  // 默认为免费会员
  return 'free';
}

/**
 * 获取用户可访问的报告类型
 * 基于会员等级返回用户可以访问的报告类型
 */
export function getAccessibleReports(tier: 'free' | 'plus' | 'pro') {
  switch (tier) {
    case 'pro':
      return {
        canAccessBasicReport: true,
        canAccessPlusReport: true,
        canAccessProReport: true,
        canAccessMonthlyPlusReport: true,
        canAccessMonthlyProReport: true
      };
    case 'plus':
      return {
        canAccessBasicReport: true,
        canAccessPlusReport: true,
        canAccessProReport: false,
        canAccessMonthlyPlusReport: true,
        canAccessMonthlyProReport: false
      };
    default:
      return {
        canAccessBasicReport: true,
        canAccessPlusReport: false,
        canAccessProReport: false,
        canAccessMonthlyPlusReport: false,
        canAccessMonthlyProReport: false
      };
  }
}

/**
 * 测试订阅状态映射函数
 * 用于开发阶段验证会员等级映射的正确性
 */
export function testSubscriptionMapping(): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('===== 测试会员等级映射 =====');
  
  const testCases = [
    { input: undefined, expected: 'free', name: '未定义值' },
    { input: null, expected: 'free', name: 'null值' },
    { input: '', expected: 'free', name: '空字符串' },
    { input: 'free', expected: 'free', name: '免费会员' },
    { input: 'FREE', expected: 'free', name: '大写FREE' },
    { input: 'plus', expected: 'plus', name: 'plus会员' },
    { input: 'PLUS', expected: 'plus', name: '大写PLUS' },
    { input: 'pro', expected: 'pro', name: 'pro会员' },
    { input: 'PRO', expected: 'pro', name: '大写PRO' },
    { input: 'monthly', expected: 'plus', name: '旧版monthly' },
    { input: 'MONTHLY', expected: 'plus', name: '大写MONTHLY' },
    { input: 'yearly', expected: 'pro', name: '旧版yearly' },
    { input: 'YEARLY', expected: 'pro', name: '大写YEARLY' },
    { input: 'premium', expected: 'pro', name: 'premium' },
    { input: 'PREMIUM', expected: 'pro', name: '大写PREMIUM' },
    { input: 'annual-premium', expected: 'pro', name: 'annual-premium' },
    { input: 'unknown', expected: 'free', name: '未知类型' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(test => {
    // @ts-ignore 忽略null和undefined类型检查
    const result = mapSubscriptionToTier(test.input);
    const success = result === test.expected;
    
    if (success) {
      passed++;
      console.log(`✓ ${test.name}: ${test.input} → ${result}`);
    } else {
      failed++;
      console.error(`✗ ${test.name}: ${test.input} → ${result}, 期望 ${test.expected}`);
    }
  });
  
  console.log(`===== 测试完成: ${passed}通过, ${failed}失败 =====`);
} 