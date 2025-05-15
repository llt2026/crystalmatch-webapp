// 使用ESM模块测试getBaziFromLunar.ts
// 通过动态导入和lunar-javascript库直接测试

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const lunar = require('lunar-javascript');

// 测试日期
const testDate = new Date(1989, 10, 2); // 1989年11月2日
console.log(`测试日期: ${testDate.toISOString().split('T')[0]}`);

// 使用lunar-javascript库直接计算八字
const solar = lunar.Solar.fromYmd(1989, 11, 2);
const lunarDate = lunar.Lunar.fromSolar(solar);

// 获取八字信息
const yearPillar = lunarDate.getYearInGanZhi();
const monthPillar = lunarDate.getMonthInGanZhi();
const dayPillar = lunarDate.getDayInGanZhi();

// 五行对应表
const FIVE_ELEMENTS = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '丑': '土', '辰': '土', '未': '土', '戌': '土'
};

// 生肖对应表
const ZODIAC_MAP = {
  '子': '鼠',
  '丑': '牛',
  '寅': '虎',
  '卯': '兔',
  '辰': '龙',
  '巳': '蛇',
  '午': '马',
  '未': '羊',
  '申': '猴',
  '酉': '鸡',
  '戌': '狗',
  '亥': '猪'
};

// 获取年、月、日柱的天干地支
const yearGan = yearPillar[0];
const yearZhi = yearPillar[1];
const monthGan = monthPillar[0];
const monthZhi = monthPillar[1];
const dayGan = dayPillar[0];
const dayZhi = dayPillar[1];

// 计算生肖
const yearZodiac = ZODIAC_MAP[yearZhi] || '未知';
const monthZodiac = ZODIAC_MAP[monthZhi] || '未知';
const dayZodiac = ZODIAC_MAP[dayZhi] || '未知';

// 构建结果对象，与getBaziFromLunar.ts中的返回格式相同
const result = {
  yearPillar,
  monthPillar,
  dayPillar,
  zodiac: {
    year: yearZodiac,
    month: monthZodiac,
    day: dayZodiac
  },
  fiveElements: {
    year: [FIVE_ELEMENTS[yearGan] || '未知', FIVE_ELEMENTS[yearZhi] || '未知'],
    month: [FIVE_ELEMENTS[monthGan] || '未知', FIVE_ELEMENTS[monthZhi] || '未知'],
    day: [FIVE_ELEMENTS[dayGan] || '未知', FIVE_ELEMENTS[dayZhi] || '未知']
  }
};

console.log('\n八字计算结果:');
console.log(JSON.stringify(result, null, 2)); 