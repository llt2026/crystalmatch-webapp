// 测试lunar-javascript库的可用性
const lunar = require('lunar-javascript');

console.log('Lunar库版本:', lunar.toString());
console.log('Lunar API:', Object.keys(lunar));

// 创建Solar对象
try {
  const solar = lunar.Solar.fromYmd(1989, 11, 2);
  console.log('Solar 对象:', solar);
  
  // 转换为Lunar对象
  const lunarDate = lunar.Lunar.fromSolar(solar);
  console.log('农历日期:', lunarDate.toString());
  
  // 获取干支信息
  console.log('年柱:', lunarDate.getYearInGanZhi());
  console.log('月柱:', lunarDate.getMonthInGanZhi());
  console.log('日柱:', lunarDate.getDayInGanZhi());
} catch (error) {
  console.error('Lunar库使用出错:', error);
} 