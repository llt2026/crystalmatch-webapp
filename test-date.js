// 导入函数
const { getBaziFromLunarNumbers } = require('./app/lib/getBaziFromLunar');

// 测试日期：1989年11月2日
const date = new Date(1989, 10, 2); // 注意月份是0-11
console.log(`测试日期: ${date.toLocaleDateString()}`);

// 使用lunar-javascript库计算八字
const bazi = getBaziFromLunarNumbers(1989, 11, 2);
console.log('\n使用lunar-javascript库计算八字:');
console.log(JSON.stringify(bazi, null, 2)); 