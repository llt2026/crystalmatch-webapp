import { useMemo } from "react";
import { z } from "zod";
import {
  getBaseBaziVector,
  calculateMonthEnergy,
  getDailyEnergyForRange,
  getHourlyEnergyHeatmap,
} from "@/app/lib/energyCalculation2025";             // 这些 util 已存在

/** 1️⃣  原始后端 Schema（允许字段缺失） */
const RawReportSchema = z.object({
  energyScore      : z.number().optional(),
  strongestElement : z.any().optional(),
  weakestElement   : z.any().optional(),
  elementVector    : z.array(z.number()).optional(),
  dailyEnergy      : z.array(z.any()).optional(),
  hourlyEnergy     : z.array(z.any()).optional(),
  sections         : z.record(z.string()).optional(),
  crystals         : z.array(z.string()).optional(),
  tier             : z.enum(["free","plus","pro"]).optional(),
  birthDate        : z.string().optional(),
}).passthrough();                       // 允许后端临时多发字段

/** 2️⃣  适配后给组件用的稳定 ViewModel */
export interface ReportVM {
  overview: {
    score   : number;
    strong  : string;
    weak    : string;
    vector  : number[];
  };
  sections: Record<"finance"|"relationship"|"mood"|"health"|"growth", string>;
  daily   : Array<{ date:string; score:number; delta:number; trend:"up"|"down"|"stable"; crystal:string }>;
  hourly  : Array<{ hour:number; score:number; delta:number; trend:"up"|"down"|"stable" }>;
  tier    : "free"|"plus"|"pro";
  missing : { overview:boolean; daily:boolean; hourly:boolean };
}

/** 3️⃣  统一日志出口 */
const log = (...msg:any[]) => console.warn("[ReportAdapter]", ...msg);

/** 4️⃣  主 Hook  */
export function useReportAdapter(rawData: unknown): ReportVM {
  const raw = RawReportSchema.safeParse(rawData);
  if (!raw.success) {
    log("Invalid schema from API:", raw.error);
  }

  return useMemo<ReportVM>(() => {
    const r = raw.success ? raw.data : {};
    /* ---------- 4.1  总览 ---------- */
    const vectorData = r.elementVector ?? (r.birthDate ? Object.values(getBaseBaziVector(r.birthDate)) : [1,1,1,1,1]);
    const vector = Array.isArray(vectorData) ? vectorData : [1,1,1,1,1];
    const score = r.energyScore ?? 50;
    const strongElem = r.strongestElement?.name ?? r.strongestElement ?? "—";
    const weakElem = r.weakestElement?.name ?? r.weakestElement ?? "—";

    const overviewMissing = r.energyScore === undefined
                         || r.strongestElement === undefined
                         || r.elementVector === undefined;

    /* ---------- 4.2  日历 ---------- */
    const dailyRaw = r.dailyEnergy ?? [];
    const daily = Array.isArray(dailyRaw) ? dailyRaw.map((d:any, i:number) => {
      const prev = i>0 ? (dailyRaw[i-1].score ?? dailyRaw[i-1].value ?? 50) : (d.score ?? d.value ?? 50);
      const val = d.score ?? d.value ?? 50;
      const delta = val - prev;
      return {
        date: d.date || new Date().toISOString(),
        score: val,
        delta,
        trend: (delta>0 ? "up" : delta<0 ? "down" : "stable") as "up"|"down"|"stable",
        crystal: d.crystal ?? (Array.isArray(r.crystals) ? r.crystals[0] : "") ?? "",
      };
    }) : [];
    const dailyMissing = r.dailyEnergy === undefined;

    /* ---------- 4.3  小时 ---------- */
    const hourlyRaw = r.hourlyEnergy ?? [];
    const hourly = Array.isArray(hourlyRaw) ? hourlyRaw.map((h:any, i:number) => {
      const prev = i>0 ? (hourlyRaw[i-1].score ?? hourlyRaw[i-1].value ?? 50) : (h.score ?? h.value ?? 50);
      const val = h.score ?? h.value ?? 50;
      const delta = val - prev;
      return {
        hour: h.hour ?? i,
        score: val,
        delta,
        trend: (delta>0 ? "up" : delta<0 ? "down" : "stable") as "up"|"down"|"stable",
      };
    }) : [];
    const hourlyMissing = r.hourlyEnergy === undefined;

    /* ---------- 4.4  Sections ---------- */
    const blank = "No insights yet.";
    const sections = {
      finance: r.sections?.finance ?? blank,
      relationship: r.sections?.relationship ?? blank,
      mood: r.sections?.mood ?? blank,
      health: r.sections?.health ?? blank,
      growth: r.sections?.growth ?? blank,
    };

    /* ---------- 4.5  汇总 ---------- */
    if (overviewMissing || dailyMissing || hourlyMissing) {
      log("Filled missing fields →", { overviewMissing, dailyMissing, hourlyMissing });
    }

    return {
      overview: { score, strong:strongElem, weak:weakElem, vector },
      sections,
      daily,
      hourly,
      tier: (r.tier ?? "free") as ReportVM["tier"],
      missing: { overview:overviewMissing, daily:dailyMissing, hourly:hourlyMissing },
    };
  // ⚠️ 依赖项：RawReportSchema 已经深比较过，只用 rawData
  }, [rawData]);
} 