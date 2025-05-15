# 八字计算功能测试和使用说明

## 问题修复记录

我们解决了之前在测试`getBaziFromLunar.ts`文件时遇到的问题。主要修复内容包括：

1. 创建了多个测试文件，测试不同的使用场景
2. 编写了TypeScript编译脚本，将TS文件编译为JS文件
3. 确保了`lunar-javascript`库正常安装和使用
4. 验证了`getBaziFromLunar`功能在各种调用方式下的正确性

## 测试文件说明

本项目包含以下测试文件：

- `test-getBazi.js`: 原始测试文件，测试lunar-javascript库和尝试导入编译后的模块
- `test-getBazi.mjs`: 使用ESM格式的测试文件，通过原生lunar-javascript库实现功能
- `test-bazi-import.js`: 专门测试导入编译后JS文件的测试
- `build-test.js`: 创建临时测试文件，执行更复杂的测试
- `compile-ts.js`: 编译TypeScript文件的辅助脚本
- `run-tests.js`: 执行所有测试的主脚本

## 使用方法

### 编译TypeScript文件

```bash
node compile-ts.js [文件名]
```

例如：
```bash
node compile-ts.js getBaziFromLunar.ts
```

### 运行所有测试

```bash
node run-tests.js
```

### 直接测试导入编译后模块

```bash
node test-bazi-import.js
```

## 八字计算API

`getBaziFromLunar.ts`模块提供以下三个主要函数：

1. **getBaziFromLunar(date: Date)**: 接收Date对象，计算八字
2. **getBaziFromLunarString(dateString: string)**: 接收日期字符串，计算八字
3. **getBaziFromLunarNumbers(year: number, month: number, day: number)**: 接收年月日数字，计算八字

所有函数返回相同格式的结果：

```javascript
{
  yearPillar: string,   // 年柱，如"己巳"
  monthPillar: string,  // 月柱，如"甲戌" 
  dayPillar: string,    // 日柱，如"丙寅"
  zodiac: {
    year: string,       // 年生肖，如"蛇"
    month: string,      // 月生肖，如"狗"
    day: string         // 日生肖，如"虎"
  },
  fiveElements: {
    year: string[],     // 年柱五行，如["土", "火"]
    month: string[],    // 月柱五行，如["木", "土"]
    day: string[]       // 日柱五行，如["火", "木"]
  }
}
```

## 示例代码

```javascript
// 导入编译后的模块
const baziModule = require('./app/lib/getBaziFromLunar.js');

// 使用Date对象计算八字
const date = new Date(1989, 10, 2); // 1989年11月2日
const result = baziModule.getBaziFromLunar(date);
console.log(result);

// 使用日期字符串计算八字
const result2 = baziModule.getBaziFromLunarString('1989-11-02');
console.log(result2);

// 使用年月日数字计算八字
const result3 = baziModule.getBaziFromLunarNumbers(1989, 11, 2);
console.log(result3);
```