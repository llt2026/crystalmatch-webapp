import fs from 'fs';
import path from 'path';

// 确保存储目录存在
const DATA_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CODES_FILE = path.join(DATA_DIR, 'verification-codes.json');

// 从文件加载数据或创建新对象
function loadData() {
  try {
    if (fs.existsSync(CODES_FILE)) {
      return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('加载验证码数据失败:', e);
  }
  return {};
}

// 保存数据到文件
function saveData(data: any) {
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('保存验证码数据失败:', e);
  }
}

// 简单实现Redis接口
export const localRedis = {
  set: async (key: string, value: string, options: any = {}) => {
    console.log(`[LocalRedis] 存储数据: ${key} = ${value}, options=`, options);
    const data = loadData();
    data[key] = {
      value,
      expires: options.ex ? Date.now() + options.ex * 1000 : null
    };
    saveData(data);
    return 'OK';
  },
  
  get: async (key: string) => {
    const data = loadData();
    const item = data[key];
    
    if (!item) {
      console.log(`[LocalRedis] 键不存在: ${key}`);
      return null;
    }
    
    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      console.log(`[LocalRedis] 数据已过期: ${key}`);
      delete data[key];
      saveData(data);
      return null;
    }
    
    console.log(`[LocalRedis] 获取数据: ${key} = ${item.value}`);
    return item.value;
  },
  
  del: async (key: string) => {
    const data = loadData();
    if (data[key]) {
      console.log(`[LocalRedis] 删除数据: ${key}`);
      delete data[key];
      saveData(data);
      return 1;
    }
    console.log(`[LocalRedis] 尝试删除不存在的键: ${key}`);
    return 0;
  }
};

// 导出一个获取所有验证码的函数，用于调试
export function getAllStoredCodes() {
  const data = loadData();
  const now = Date.now();
  const result: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, item]: [string, any]) => {
    result[key] = {
      value: item.value,
      expires: item.expires ? new Date(item.expires).toISOString() : null,
      expiresIn: item.expires ? Math.ceil((item.expires - now) / 1000) : null,
      isExpired: item.expires ? now > item.expires : false
    };
  });
  
  return result;
} 