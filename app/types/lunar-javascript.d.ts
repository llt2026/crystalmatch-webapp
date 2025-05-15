declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toYmd(): string;
    toString(): string;
    getLunar(): Lunar;
  }

  export class Lunar {
    static fromSolar(solar: Solar): Lunar;
    static fromDate(date: Date): Lunar;
    static fromYmd(year: number, month: number, day: number): Lunar;
    
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    
    getSolar(): Solar;
    toString(): string;
  }
} 