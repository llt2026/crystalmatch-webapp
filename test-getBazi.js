// 测试getBaziFromLunar.ts
const path = require('path');
const fs = require('fs');

// 查看文件是否存在
try {
  const filePath = path.join(__dirname, 'app', 'lib', 'getBaziFromLunar.ts');
  const exists = fs.existsSync(filePath);
  console.log('文件存在:', exists);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('文件内容前100个字符:', content.substring(0, 100));
  }
  
  // 方法1：测试lunar-javascript库的直接使用
  console.log('\n方法1: 直接使用lunar-javascript库:');
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
  
  // 方法2：使用我们自己实现的函数（通过编译后的JS文件）
  console.log('\n方法2: 通过编译后的JS文件导入:');
  try {
    // 尝试使用编译后的JS版本
    const baziJs = require('./app/lib/getBaziFromLunar.js');
    if (baziJs && typeof baziJs.getBaziFromLunar === 'function') {
      const result = baziJs.getBaziFromLunar(date);
      console.log('八字计算结果:', result);
    } else {
      console.log('编译后的JS文件不存在或函数不可用');
    }
  } catch (error) {
    console.log('导入编译后的JS文件失败:', error.message);
    
    // 创建一个临时的JS文件，用于测试
    console.log('\n方法3: 通过执行代码测试:');
    
    // 使用相同的逻辑，直接在这里测试八字计算
    const testDate = new Date(1989, 10, 2); // 1989年11月2日
    const testSolar = lunar.Solar.fromYmd(1989, 11, 2);
    const testLunar = lunar.Lunar.fromSolar(testSolar);
    
    const yearPillar = testLunar.getYearInGanZhi();
    const monthPillar = testLunar.getMonthInGanZhi();
    const dayPillar = testLunar.getDayInGanZhi();
    
    // 简单的测试结果
    const result = {
      yearPillar,
      monthPillar,
      dayPillar
    };
    
    console.log('手动计算的八字结果:', result);
  }
} catch (error) {
  console.error('错误:', error);
} 