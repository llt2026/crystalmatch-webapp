/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    // 允许在server components中使用setTimeout
    serverActions: true,
  },
  // 路由配置
  rewrites: async () => {
    return [
      {
        source: '/monthly-reports/:path*',
        destination: '/profile/monthly-reports/:path*',
      },
    ];
  },
  // 将这些路径设置为动态渲染
  unstable_runtimeJS: true,
  reactStrictMode: true,
}

module.exports = nextConfig 