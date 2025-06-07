/**
 * 月度报告通用配置文件
 * 设置所有月度报告页面为动态渲染，确保服务端获取数据
 */

// 设置页面为动态渲染，禁用静态生成
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// 导出默认配置，使其可以被导入
export const reportConfig = {
  // 是否在构建时预渲染
  prerenderAtBuild: false,
  
  // 服务端渲染模式
  renderMode: 'dynamic',
  
  // 禁用缓存
  cache: 'no-store',
  
  // 确保用户身份验证
  requireAuth: true
}; 