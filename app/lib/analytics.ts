// 使用 Map 存储在线用户信息
const onlineUsers = new Map<string, {
  lastActive: number;
  isPremium: boolean;
}>();

// 清理超时用户的间隔（毫秒）
const CLEANUP_INTERVAL = 60000; // 1分钟
// 用户超时时间（毫秒）
const USER_TIMEOUT = 300000; // 5分钟

// 定期清理超时用户
setInterval(() => {
  const now = Date.now();
  for (const [userId, userData] of onlineUsers.entries()) {
    if (now - userData.lastActive > USER_TIMEOUT) {
      onlineUsers.delete(userId);
    }
  }
}, CLEANUP_INTERVAL);

// 更新用户活动状态
export function updateUserActivity(userId: string, isPremium: boolean) {
  onlineUsers.set(userId, {
    lastActive: Date.now(),
    isPremium
  });
}

// 获取在线用户统计
export function getOnlineStats() {
  const now = Date.now();
  let totalOnline = 0;
  let premiumOnline = 0;

  for (const [_, userData] of onlineUsers.entries()) {
    if (now - userData.lastActive <= USER_TIMEOUT) {
      totalOnline++;
      if (userData.isPremium) {
        premiumOnline++;
      }
    }
  }

  return {
    totalOnline,
    premiumOnline,
    premiumPercentage: totalOnline > 0 ? (premiumOnline / totalOnline * 100).toFixed(1) : '0'
  };
}

// 访问统计数据（示例数据）
const visitStats = {
  hourly: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    visits: Math.floor(Math.random() * 100)
  })),
  daily: Array.from({ length: 7 }, (_, i) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
    visits: Math.floor(Math.random() * 1000)
  })),
  monthly: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    visits: Math.floor(Math.random() * 10000)
  }))
};

export function getVisitStats() {
  return visitStats;
} 