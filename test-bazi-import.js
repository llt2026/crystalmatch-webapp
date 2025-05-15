// 直接测试导入编译后的getBaziFromLunar.js文件
const path = require('path');
const fs = require('fs');

try {
  // 检查编译后的JS文件是否存在
  const jsFilePath = path.join(__dirname, 'app', 'lib', 'getBaziFromLunar.js');
  const exists = fs.existsSync(jsFilePath);
  console.log('编译后的JS文件存在:', exists);
  
  if (exists) {
    // 读取前100个字符，确认内容
    const content = fs.readFileSync(jsFilePath, 'utf8');
    console.log('JS文件内容前100个字符:', content.substring(0, 100));
    
    // 尝试导入
    console.log('\n尝试导入JS模块...');
    const baziModule = require('./app/lib/getBaziFromLunar.js');
    
    // 检查模块和函数是否可用
    if (baziModule && typeof baziModule.getBaziFromLunar === 'function') {
      console.log('getBaziFromLunar函数存在 ✓');
      
      // 测试日期
      const testDate = new Date(1989, 10, 2); // 1989年11月2日
      console.log(`\n测试日期: ${testDate.toLocaleDateString()}`);
      
      // 调用函数
      const result = baziModule.getBaziFromLunar(testDate);
      console.log('\n八字计算结果:');
      console.log(JSON.stringify(result, null, 2));
      
      // 检查其他辅助函数
      if (typeof baziModule.getBaziFromLunarString === 'function') {
        console.log('\n测试字符串日期函数:');
        const stringResult = baziModule.getBaziFromLunarString('1989-11-02');
        console.log(JSON.stringify(stringResult, null, 2));
      }
      
      if (typeof baziModule.getBaziFromLunarNumbers === 'function') {
        console.log('\n测试数字日期函数:');
        const numbersResult = baziModule.getBaziFromLunarNumbers(1989, 11, 2);
        console.log(JSON.stringify(numbersResult, null, 2));
      }
    } else {
      console.error('模块存在但函数不可用');
    }
  } else {
    console.log('\n尝试使用原生lunar-javascript库...');
    
    // 使用lunar-javascript库测试
    const lunar = require('lunar-javascript');
    const date = new Date(1989, 10, 2); // 注意月份从0开始
    
    // 创建Solar对象
    const solar = lunar.Solar.fromYmd(1989, 11, 2);
    
    // 转换为Lunar对象
    const lunarDate = lunar.Lunar.fromSolar(solar);
    
    console.log('八字计算结果:');
    console.log('年柱:', lunarDate.getYearInGanZhi());
    console.log('月柱:', lunarDate.getMonthInGanZhi());
    console.log('日柱:', lunarDate.getDayInGanZhi());
  }
} catch (error) {
  console.error('错误:', error);
} 