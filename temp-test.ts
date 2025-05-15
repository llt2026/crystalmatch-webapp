
  import { getBaziFromLunar, getBaziFromLunarString, getBaziFromLunarNumbers } from './app/lib/getBaziFromLunar';

  // 测试案例1：使用Date对象
  const date1 = new Date(1989, 10, 2); // 1989年11月2日
  console.log('测试1 - 使用Date对象:');
  const result1 = getBaziFromLunar(date1);
  console.log(JSON.stringify(result1, null, 2));

  // 测试案例2：使用日期字符串
  console.log('\n测试2 - 使用日期字符串:');
  const result2 = getBaziFromLunarString('1989-11-02');
  console.log(JSON.stringify(result2, null, 2));

  // 测试案例3：使用年月日数字
  console.log('\n测试3 - 使用年月日数字:');
  const result3 = getBaziFromLunarNumbers(1989, 11, 2);
  console.log(JSON.stringify(result3, null, 2));
  