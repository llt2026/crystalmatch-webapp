"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.energyCalendar = void 0;
exports.getMonthEnergyByDate = getMonthEnergyByDate;
exports.energyCalendar = [
    {
        month: "May 2025",
        start: "2025-05-05",
        end: "2025-06-05",
        pillar: "辛巳",
        element: "Fire",
        energyType: "Passion Energy"
    },
    {
        month: "June 2025",
        start: "2025-06-06",
        end: "2025-07-06",
        pillar: "壬午",
        element: "Fire",
        energyType: "Passion Energy"
    },
    {
        month: "July 2025",
        start: "2025-07-07",
        end: "2025-08-07",
        pillar: "癸未",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "August 2025",
        start: "2025-08-08",
        end: "2025-09-07",
        pillar: "甲申",
        element: "Metal",
        energyType: "Clarity Energy"
    },
    {
        month: "September 2025",
        start: "2025-09-08",
        end: "2025-10-07",
        pillar: "乙酉",
        element: "Metal",
        energyType: "Clarity Energy"
    },
    {
        month: "October 2025",
        start: "2025-10-08",
        end: "2025-11-06",
        pillar: "丙戌",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "November 2025",
        start: "2025-11-07",
        end: "2025-12-06",
        pillar: "丁亥",
        element: "Water",
        energyType: "Fluid Energy"
    },
    {
        month: "December 2025",
        start: "2025-12-07",
        end: "2026-01-05",
        pillar: "戊子",
        element: "Water",
        energyType: "Fluid Energy"
    },
    {
        month: "January 2026",
        start: "2026-01-06",
        end: "2026-02-03",
        pillar: "己丑",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "February 2026",
        start: "2026-02-04",
        end: "2026-03-05",
        pillar: "庚寅",
        element: "Wood",
        energyType: "Growth Energy"
    },
    {
        month: "March 2026",
        start: "2026-03-06",
        end: "2026-04-04",
        pillar: "辛卯",
        element: "Wood",
        energyType: "Growth Energy"
    },
    {
        month: "April 2026",
        start: "2026-04-05",
        end: "2026-05-05",
        pillar: "壬辰",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "May 2026",
        start: "2026-05-06",
        end: "2026-06-05",
        pillar: "癸巳",
        element: "Fire",
        energyType: "Passion Energy"
    },
    {
        month: "June 2026",
        start: "2026-06-06",
        end: "2026-07-06",
        pillar: "甲午",
        element: "Fire",
        energyType: "Passion Energy"
    },
    {
        month: "July 2026",
        start: "2026-07-07",
        end: "2026-08-07",
        pillar: "乙未",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "August 2026",
        start: "2026-08-08",
        end: "2026-09-07",
        pillar: "丙申",
        element: "Metal",
        energyType: "Clarity Energy"
    },
    {
        month: "September 2026",
        start: "2026-09-08",
        end: "2026-10-07",
        pillar: "丁酉",
        element: "Metal",
        energyType: "Clarity Energy"
    },
    {
        month: "October 2026",
        start: "2026-10-08",
        end: "2026-11-06",
        pillar: "戊戌",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "November 2026",
        start: "2026-11-07",
        end: "2026-12-06",
        pillar: "己亥",
        element: "Water",
        energyType: "Fluid Energy"
    },
    {
        month: "December 2026",
        start: "2026-12-07",
        end: "2027-01-05",
        pillar: "庚子",
        element: "Water",
        energyType: "Fluid Energy"
    },
    {
        month: "January 2027",
        start: "2027-01-06",
        end: "2027-02-03",
        pillar: "辛丑",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "February 2027",
        start: "2027-02-04",
        end: "2027-03-05",
        pillar: "壬寅",
        element: "Wood",
        energyType: "Growth Energy"
    },
    {
        month: "March 2027",
        start: "2027-03-06",
        end: "2027-04-04",
        pillar: "癸卯",
        element: "Wood",
        energyType: "Growth Energy"
    },
    {
        month: "April 2027",
        start: "2027-04-05",
        end: "2027-05-04",
        pillar: "甲辰",
        element: "Earth",
        energyType: "Stability Energy"
    },
    {
        month: "May 2027",
        start: "2027-05-05",
        end: "2027-06-05",
        pillar: "乙巳",
        element: "Fire",
        energyType: "Passion Energy"
    }
];
/**
 * 根据日期获取当月能量信息
 * @param date 需要查询的日期
 * @returns 月能量信息对象，包含干支、五行、能量类型等
 */
function getMonthEnergyByDate(date) {
    try {
        // 格式化日期为YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        // 查找当前日期对应的月份能量
        const monthEnergy = exports.energyCalendar.find(item => {
            const startDate = new Date(item.start);
            const endDate = new Date(item.end);
            const targetDate = new Date(formattedDate);
            return targetDate >= startDate && targetDate <= endDate;
        });
        if (!monthEnergy) {
            // 如果在预定义的能量日历中找不到，返回null
            console.error('No month energy found for date:', formattedDate);
            return null;
        }
        // 返回月能量信息
        return {
            pillar: monthEnergy.pillar,
            element: monthEnergy.element,
            energyType: monthEnergy.energyType,
            period: {
                start: monthEnergy.start,
                end: monthEnergy.end
            },
            month: monthEnergy.month
        };
    }
    catch (error) {
        console.error('Error in getMonthEnergyByDate:', error);
        return null;
    }
}
