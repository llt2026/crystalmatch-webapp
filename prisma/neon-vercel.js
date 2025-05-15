/**
 * 自定义 Prisma 预编译插件
 * 优化与 Neon 在 Vercel 上的连接
 * 
 * 在 Vercel serverless 环境中，数据库连接必须有效管理
 * 这个插件帮助处理一些常见问题
 */

function neonVercelPlugin() {
  return {
    name: 'neon-vercel-fix',
    onInit: ({ env }) => {
      // 检查是否在 Vercel 环境中
      const isVercel = !!process.env.VERCEL;
      
      if (isVercel) {
        console.log('🚀 检测到 Vercel 环境，应用 Neon 优化...');
        
        // 检查连接字符串
        const dbUrl = env.DATABASE_URL;
        if (dbUrl && dbUrl.includes('neon.tech')) {
          console.log('✅ 检测到 Neon 数据库连接');
          
          // 确保连接字符串包含 Pooler 配置
          if (!dbUrl.includes('-pooler')) {
            console.warn('⚠️ 推荐使用 Neon Pooled 连接以提高性能');
          }
          
          // 确保使用 SSL
          if (!dbUrl.includes('sslmode=require')) {
            console.warn('⚠️ 建议在连接字符串中添加 sslmode=require');
          }
        }
      }
    },
  };
}

module.exports = neonVercelPlugin; 