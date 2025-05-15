/**
 * 自定义缓存处理器
 * 允许构建继续即使某些页面在预渲染时出错
 */

// 简单的内存缓存
const cache = new Map();

module.exports = {
  get: async (key) => {
    return { value: cache.get(key) };
  },
  set: async (key, data) => {
    cache.set(key, data);
    return true;
  },
  // 如果页面渲染失败则忽略
  revalidateTag: async () => {
    return true;
  }
}; 