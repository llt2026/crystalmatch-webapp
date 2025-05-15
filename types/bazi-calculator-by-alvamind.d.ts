declare module 'bazi-calculator-by-alvamind' {
  /**
   * 计算八字结果的接口
   */
  export interface BaziResult {
    /**
     * 天干信息
     */
    tianGan: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    /**
     * 地支信息
     */
    diZhi: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    /**
     * 本命/纳音五行
     */
    nayin: {
      year: string;
      month: string;
      day: string;
      hour: string;
    };
    /**
     * 阴历信息
     */
    lunar: {
      year: number;
      month: number;
      day: number;
      hour: number;
      isLeapMonth: boolean;
    };
    /**
     * 阳历信息
     */
    solar: {
      year: number;
      month: number;
      day: number;
      hour: number;
    };
  }

  /**
   * 计算八字
   * @param year 阳历年份
   * @param month 阳历月份 (1-12)
   * @param day 阳历日期 (1-31)
   * @param hour 阳历小时 (0-23)
   * @param timeZone 时区，默认为8（中国标准时间）
   * @returns 八字计算结果
   */
  export function calculate(
    year: number,
    month: number,
    day: number,
    hour: number,
    timeZone?: number
  ): BaziResult;
} 