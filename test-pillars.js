// 使用动态导入测试年柱和月柱
async function testPillars() {
  try {
    // 动态导入模块
    const yearPillarModule = await import('./app/lib/year-pillar.js');
    const energyCalendarModule = await import('./app/lib/energy-calendar.js');
    
    // 获取导出内容
    const { getYearPillarByDate } = yearPillarModule;
    const { energyCalendar } = energyCalendarModule;
    
    // 测试日期：2025年5月8日
    const testDate = new Date('2025-05-08');
    
    // 获取年柱信息
    const yearPillar = getYearPillarByDate(testDate);
    
    // 获取月柱信息
    const monthPillarInfo = energyCalendar.find(item => {
      return testDate >= new Date(item.start) && testDate <= new Date(item.end);
    });
    
    console.log('测试日期：2025年5月8日');
    console.log('====================');
    console.log('年柱信息:');
    console.log(`- 年份: ${yearPillar.year}`);
    console.log(`- 干支: ${yearPillar.pillar}`);
    console.log(`- 生肖: ${yearPillar.zodiac}`);
    console.log('\n月柱信息:');
    console.log(`- 月份: ${monthPillarInfo.month}`);
    console.log(`- 起始日期: ${monthPillarInfo.start}`);
    console.log(`- 结束日期: ${monthPillarInfo.end}`);
    console.log(`- 干支: ${monthPillarInfo.pillar}`);
    console.log(`- 五行: ${monthPillarInfo.element}`);
    console.log(`- 能量类型: ${monthPillarInfo.energyType}`);
  } catch (error) {
    console.error('测试出错:', error);
  }
}

// 执行测试
testPillars(); 