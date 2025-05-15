# Crystal Match 工具库

本目录包含Crystal Match项目的核心工具函数和服务。

## 八字计算工具 (getBaziFromLunar)

用于根据公历日期计算八字，包含年柱、月柱、日柱，基于lunar-javascript库实现，提供准确的农历与干支计算。

### 使用方法

```typescript
// 导入方法
import { 
  getBaziFromLunar,
  getBaziFromLunarString,
  getBaziFromLunarNumbers
} from '@/app/lib/getBaziFromLunar';

// 方法1: 使用Date对象
const date = new Date(1984, 9, 8); // 注意月份从0开始，10月是9
const bazi1 = getBaziFromLunar(date);

// 方法2: 使用日期字符串
const bazi2 = getBaziFromLunarString('1984-10-08');

// 方法3: 使用年月日数字
const bazi3 = getBaziFromLunarNumbers(1984, 10, 8); // 月份直接使用实际月份

// 返回结果示例
console.log(bazi1);
// {
//   yearPillar: '甲子',
//   monthPillar: '甲戌',
//   dayPillar: '乙亥',
//   zodiac: {
//     year: '鼠',
//     month: '狗',
//     day: '猪'
//   },
//   fiveElements: {
//     year: ['木', '水'],
//     month: ['木', '土'],
//     day: ['木', '水']
//   }
// }
```

### 特点

1. 使用专业lunar-javascript库，计算精度高
2. 准确处理节气、闰月等农历特殊情况
3. 支持生肖和五行属性信息
4. 输出格式丰富，包含详细的属性分析

### 应用场景

- 用户生日八字计算
- 能量报告生成
- 月度能量趋势分析
- 五行属性分析 