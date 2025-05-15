// 使用ts-node测试TypeScript文件
const path = require('path');
const { execSync } = require('child_process');

try {
  // 创建一个临时的测试文件
  const fs = require('fs');
  const testFile = path.join(__dirname, 'temp-test.js'); // 改为.js后缀，稍后用ts-node执行
  
  // 编写测试代码
  const testCode = `
  // 使用require导入编译后的JS文件
  try {
    // 首先尝试导入编译后的JS文件
    const baziModule = require('./app/lib/getBaziFromLunar.js');
    
    if (baziModule && typeof baziModule.getBaziFromLunar === 'function') {
      // 测试案例1：使用Date对象
      const date1 = new Date(1989, 10, 2); // 1989年11月2日
      console.log('测试1 - 使用Date对象:');
      const result1 = baziModule.getBaziFromLunar(date1);
      console.log(JSON.stringify(result1, null, 2));
      
      // 测试案例2：使用日期字符串
      if (typeof baziModule.getBaziFromLunarString === 'function') {
        console.log('\\n测试2 - 使用日期字符串:');
        const result2 = baziModule.getBaziFromLunarString('1989-11-02');
        console.log(JSON.stringify(result2, null, 2));
      }
      
      // 测试案例3：使用年月日数字
      if (typeof baziModule.getBaziFromLunarNumbers === 'function') {
        console.log('\\n测试3 - 使用年月日数字:');
        const result3 = baziModule.getBaziFromLunarNumbers(1989, 11, 2);
        console.log(JSON.stringify(result3, null, 2));
      }
    } else {
      console.log('无法找到getBaziFromLunar函数');
    }
  } catch (error) {
    console.error('导入或执行失败:', error.message);
    
    // 退避方案：使用lunar-javascript直接计算
    const lunar = require('lunar-javascript');
    
    // 测试日期
    const testDate = new Date(1989, 10, 2); // 1989年11月2日
    console.log('\\n退避方案 - 直接使用lunar-javascript:');
    
    // 创建Solar对象
    const solar = lunar.Solar.fromYmd(1989, 11, 2);
    const lunarDate = lunar.Lunar.fromSolar(solar);
    
    // 获取八字信息
    const yearPillar = lunarDate.getYearInGanZhi();
    const monthPillar = lunarDate.getMonthInGanZhi();
    const dayPillar = lunarDate.getDayInGanZhi();
    
    console.log('年柱:', yearPillar);
    console.log('月柱:', monthPillar);
    console.log('日柱:', dayPillar);
  }
  `;
  
  // 写入测试文件
  fs.writeFileSync(testFile, testCode);
  
  console.log('正在执行JavaScript测试...');
  
  // 执行测试文件
  const result = execSync(`node "${testFile}"`, { encoding: 'utf8' });
  console.log(result);
  
  // 清理临时文件
  fs.unlinkSync(testFile);
  console.log('测试完成，临时文件已清理');
  
} catch (error) {
  console.error('执行测试时发生错误:', error.message);
  if (error.stdout) console.log('输出:', error.stdout);
  if (error.stderr) console.error('错误输出:', error.stderr);
} 