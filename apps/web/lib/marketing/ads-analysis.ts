import { formatCost, type AdResult, type AdsWeek } from "./data/ads-results";

/**
 * Phân tích kết quả ads để ra quyết định: gom camp theo creative, so với chuẩn,
 * gắn nhãn Nên tắt / Tăng budget / Theo dõi kỹ.
 *
 * CHUẨN và NGƯỠNG nằm hết ở 2 hằng số dưới — CEO muốn đổi số thì sửa ở đây.
 */

export interface ProductGroup {
  id: "uong" | "tong";
  label: string;
  /** Cost/result chuẩn (đồng). CEO chốt 20/10/2026. */
  benchmarkCpr: number;
}

export const PRODUCT_GROUPS: Record<ProductGroup["id"], ProductGroup> = {
  uong: { id: "uong", label: "Máy lọc nước uống", benchmarkCpr: 30000 },
  tong: { id: "tong", label: "Lọc tổng", benchmarkCpr: 40000 },
};

export const DECISION_RULES = {
  /** CPR ≥ 1,5 lần chuẩn → nên tắt */
  offRatio: 1.5,
  /** Chạy ≥ 7 ngày mà dưới 5 result → nên tắt */
  offMinDays: 7,
  offMaxResults: 5,
  /** Rẻ hơn chuẩn ≥ 20%, có số ≥ 2 kỳ, không đắt lên quá 10% → tăng budget */
  scaleRatio: 0.8,
  scaleMinPeriods: 2,
  scaleMaxRise: 0.1,
  /** Đắt lên ≥ 15% so với kỳ trước → theo dõi kỹ */
  watchRise: 0.15,
  /** Từ 30 result trở lên mà SĐT dưới 2% → cờ "nhiều mess, ít SĐT" */
  lowLeadMinResults: 30,
  lowLeadRate: 0.02,
};

export function productGroupOf(creative: string): ProductGroup {
  return creative.startsWith("WH") ? PRODUCT_GROUPS.tong : PRODUCT_GROUPS.uong;
}

/** Số liệu 1 kỳ. `cost` tính theo nghìn đồng như file dữ liệu. */
export interface PeriodStat {
  cost: number;
  results: number;
  sdt: number | null;
}

/** Một camp = creative + ngày lên + tên ads. Tắt rồi lên lại là camp mới. */
export interface Camp {
  key: string;
  creative: string;
  name: string;
  startDate: string;
  status: AdResult["status"];
  /** Ghi chú của kỳ gần nhất camp có mặt (không kéo ghi chú cũ sang). */
  note: string;
  budgetDaily: string;
  /** Cùng độ dài với danh sách kỳ; null = kỳ đó camp không có số. */
  periods: (PeriodStat | null)[];
}

export interface CreativeGroup {
  key: string;
  name: string;
  group: ProductGroup;
  camps: Camp[];
  periods: (PeriodStat | null)[];
  running: boolean;
}

export type Decision = "off" | "scale" | "watch" | "keep" | "stale";

export interface Verdict {
  decision: Decision;
  reasons: string[];
  flags: string[];
  benchmark: number;
  /** Các trường dưới chỉ có khi decision ≠ "stale" */
  cpr?: number;
  ratio?: number;
  prevCpr?: number | null;
  days?: number;
  latest?: PeriodStat;
}

const DAY_MS = 86_400_000;

function isoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Ngày lên "d/m" → Date, lấy năm của kỳ; lùi 1 năm nếu rơi sau ngày cuối kỳ. */
function launchDate(startDate: string, week: AdsWeek): Date {
  const [d, m] = startDate.split("/").map(Number);
  const to = isoDate(week.to);
  const date = new Date(to.getFullYear(), m - 1, d);
  return date > to ? new Date(to.getFullYear() - 1, m - 1, d) : date;
}

/** Số ngày camp có mặt trong kỳ: từ max(đầu kỳ, ngày lên) đến cuối kỳ. */
export function periodDays(week: AdsWeek, startDate?: string): number {
  let from = isoDate(week.from);
  const to = isoDate(week.to);
  if (startDate) {
    const launch = launchDate(startDate, week);
    if (launch > from) from = launch;
  }
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1);
}

/** Cost/result (đồng). */
export function costPerResult(p: PeriodStat | null | undefined): number | null {
  if (!p || !p.results) return null;
  return Math.round((p.cost * 1000) / p.results);
}

/** Cost/SĐT (đồng). */
export function costPerSdt(p: PeriodStat | null | undefined): number | null {
  if (!p || !p.sdt) return null;
  return Math.round((p.cost * 1000) / p.sdt);
}

function sumPeriods(stats: (PeriodStat | null)[]): PeriodStat | null {
  const have = stats.filter((s): s is PeriodStat => s != null);
  if (!have.length) return null;
  const sdts = have.map((s) => s.sdt).filter((v): v is number => v != null);
  return {
    cost: have.reduce((t, s) => t + s.cost, 0),
    results: have.reduce((t, s) => t + s.results, 0),
    sdt: sdts.length ? sdts.reduce((t, v) => t + v, 0) : null,
  };
}

/** Tổng nhiều kỳ của một camp/creative. */
export function totalOf(periods: (PeriodStat | null)[]): PeriodStat | null {
  return sumPeriods(periods);
}

/** Khoá camp — dùng chung cho mọi bảng để bấm dòng nào cũng mở đúng camp. */
export function campKey(ad: Pick<AdResult, "creative" | "startDate" | "name">): string {
  return `camp:${ad.creative}|${ad.startDate}|${ad.name}`;
}

export function creativeKey(creative: string): string {
  return `creative:${creative}`;
}

function launchSortKey(startDate: string): number {
  const [d, m] = startDate.split("/").map(Number);
  return m * 100 + d;
}

const isRunning = (s: AdResult["status"]) => s === "active" || s === "new";

function latestRatio(g: CreativeGroup): number {
  for (let i = g.periods.length - 1; i >= 0; i--) {
    const v = costPerResult(g.periods[i]);
    if (v != null) return v / g.group.benchmarkCpr;
  }
  return Number.POSITIVE_INFINITY;
}

/** Gom camp theo creative. Creative xếp theo CPR kỳ gần nhất so với chuẩn nhóm (rẻ lên đầu). */
export function buildCreatives(weeks: AdsWeek[]): CreativeGroup[] {
  const byCreative = new Map<string, Map<string, Camp>>();
  weeks.forEach((week, wi) => {
    for (const ad of week.ads) {
      const camps = byCreative.get(ad.creative) ?? new Map<string, Camp>();
      byCreative.set(ad.creative, camps);
      const id = campKey(ad);
      let c = camps.get(id);
      if (!c) {
        c = {
          key: id,
          creative: ad.creative,
          name: ad.name,
          startDate: ad.startDate,
          status: ad.status,
          note: "",
          budgetDaily: ad.budgetDaily,
          periods: new Array(weeks.length).fill(null),
        };
        camps.set(id, c);
      }
      c.status = ad.status;
      c.budgetDaily = ad.budgetDaily;
      c.note = ad.note;
      if (ad.cost != null && ad.results != null) {
        c.periods[wi] = { cost: ad.cost, results: ad.results, sdt: ad.sdt };
      }
    }
  });

  return [...byCreative.entries()]
    .map(([name, campMap]) => {
      const camps = [...campMap.values()].sort((a, b) => launchSortKey(a.startDate) - launchSortKey(b.startDate));
      return {
        key: creativeKey(name),
        name,
        group: productGroupOf(name),
        camps,
        periods: weeks.map((_, wi) => sumPeriods(camps.map((c) => c.periods[wi]))),
        running: camps.some((c) => isRunning(c.status)),
      };
    })
    .sort((a, b) => latestRatio(a) - latestRatio(b));
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Nhãn quyết định cho 1 camp, xét kỳ gần nhất (kỳ cuối của `weeks`). Camp đã tắt → null. */
export function judgeCamp(camp: Camp, weeks: AdsWeek[]): Verdict | null {
  if (!isRunning(camp.status)) return null;
  const R = DECISION_RULES;
  const benchmark = productGroupOf(camp.creative).benchmarkCpr;
  const lastIdx = weeks.length - 1;
  const withData = camp.periods
    .map((p, i) => ({ p, i }))
    .filter((x): x is { p: PeriodStat; i: number } => x.p != null && x.p.results > 0);
  const last = withData[withData.length - 1];

  if (!last || last.i !== lastIdx) {
    return {
      decision: "stale",
      reasons: [`Không có số kỳ ${weeks[lastIdx].label} — đã tắt chưa?`],
      flags: [],
      benchmark,
    };
  }

  const latest = last.p;
  const days = periodDays(weeks[lastIdx], camp.startDate);
  const cpr = costPerResult(latest)!;
  const ratio = cpr / benchmark;
  const prevCpr = withData.length >= 2 ? costPerResult(withData[withData.length - 2].p) : null;
  const prev2Cpr = withData.length >= 3 ? costPerResult(withData[withData.length - 3].p) : null;
  const reasons: string[] = [];
  let decision: Decision = "keep";

  if (ratio >= R.offRatio) {
    decision = "off";
    reasons.push(`CPR ${formatCost(cpr)}, đắt hơn chuẩn ${formatCost(benchmark)} ${pct(ratio - 1)}`);
  } else if (days >= R.offMinDays && latest.results < R.offMaxResults) {
    decision = "off";
    reasons.push(`${days} ngày chỉ ${latest.results} result`);
  } else if (
    ratio <= R.scaleRatio &&
    withData.length >= R.scaleMinPeriods &&
    (prevCpr == null || cpr <= prevCpr * (1 + R.scaleMaxRise))
  ) {
    decision = "scale";
    reasons.push(`CPR ${formatCost(cpr)}, rẻ hơn chuẩn ${formatCost(benchmark)} ${pct(1 - ratio)}`);
    if (prevCpr != null) reasons.push(`Ổn định: kỳ trước ${formatCost(prevCpr)}`);
  } else {
    if (withData.length < 2) reasons.push("Camp mới — mới có 1 kỳ số");
    if (prevCpr != null && cpr >= prevCpr * (1 + R.watchRise)) {
      reasons.push(`Đắt lên ${pct(cpr / prevCpr - 1)} so với kỳ trước (${formatCost(prevCpr)} → ${formatCost(cpr)})`);
    } else if (prev2Cpr != null && prevCpr != null && cpr > prevCpr && prevCpr > prev2Cpr) {
      reasons.push(`Tăng 2 kỳ liên tiếp (${formatCost(prev2Cpr)} → ${formatCost(prevCpr)} → ${formatCost(cpr)})`);
    }
    if (ratio > 1) reasons.push(`Vượt chuẩn ${formatCost(benchmark)} ${pct(ratio - 1)}`);
    if (reasons.length) decision = "watch";
  }
  if (decision === "off" && prevCpr != null) reasons.push(`Kỳ trước ${formatCost(prevCpr)}`);

  const flags: string[] = [];
  if (latest.sdt == null) flags.push("Chưa ghi SĐT");
  else if (latest.results >= R.lowLeadMinResults && latest.sdt / latest.results < R.lowLeadRate) {
    flags.push(`Nhiều mess, ít SĐT (${latest.sdt}/${latest.results})`);
  }

  return { decision, reasons, flags, benchmark, cpr, ratio, prevCpr, days, latest };
}
