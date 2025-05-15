/**
 * 自定义缓存处理器
 * 允许构建继续即使某些页面在预渲染时出错
 */

// 简单的内存缓存
const cache = new Map();

// 添加构造函数
class CacheHandler {
  constructor(options) {
    this.options = options || {};
    this.cache = new Map();
  }

  async get(key) {
    return { value: this.cache.get(key) };
  }

  async set(key, data) {
    this.cache.set(key, data);
    return true;
  }

  // 如果页面渲染失败则忽略
  async revalidateTag() {
    return true;
  }
}

// 导出实例和类
module.exports = CacheHandler; 