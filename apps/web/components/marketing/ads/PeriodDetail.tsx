import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import {
  campKey,
  costPerNewMessage,
  costPerResult,
  costPerSdt,
  creativeKey,
  periodDays,
  productGroupOf,
  totalOf,
  type PeriodStat,
} from "@/lib/marketing/ads-analysis";
import type { AdResult, AdsWeek } from "@/lib/marketing/data/ads-results";
import { CprPill, dec1, money, pct } from "./shared";

const isRunning = (a: AdResult) => a.status === "active" || a.status === "new";
const statOf = (a: AdResult): PeriodStat | null =>
  a.cost != null && a.results != null ? { cost: a.cost, results: a.results, sdt: a.sdt, orders: a.orders ?? null, newMessages: a.newMessages ?? null }
    : null;

function VsBenchmark({ p, benchmark, small }: { p: PeriodStat | null; benchmark: number; small?: boolean }) {
  const cpr = costPerResult(p);
  if (cpr == null) return <span className="ads-muted">—</span>;
  const d = cpr / benchmark - 1;
  return (
    <span className={small ? "ads-muted" : d <= 0 ? "ads-delta-good" : "ads-delta-bad"}>
      {d <= 0 ? "−" : "+"}
      {pct(Math.abs(d))}
    </span>
  );
}

/** Bảng 1 kỳ, nhóm theo creative: dòng đậm = số gộp, dòng ↳ = từng camp. */
export default function PeriodDetail({
  weeks,
  periodIdx,
  onPeriod,
  onOpen,
}: {
  weeks: AdsWeek[];
  periodIdx: number;
  onPeriod: (i: number) => void;
  onOpen: (key: string) => void;
}) {
  const week = weeks[periodIdx];
  const byCreative = new Map<string, AdResult[]>();
  for (const ad of week.ads) byCreative.set(ad.creative, [...(byCreative.get(ad.creative) ?? []), ad]);

  const blocks = [...byCreative.entries()].map(([creative, ads]) => {
    const benchmark = productGroupOf(creative).benchmarkCpr;
    const total = totalOf(ads.map(statOf));
    const cpr = costPerResult(total);
    return {
      creative,
      ads,
      benchmark,
      total,
      running: ads.some(isRunning),
      sortKey: cpr != null ? cpr / benchmark : Number.POSITIVE_INFINITY,
    };
  });

  const line = (
    key: string,
    name: ReactNode,
    p: PeriodStat | null,
    days: number,
    benchmark: number,
    sub: boolean,
    note?: string,
  ) => {
    const perSdt = costPerSdt(p);
    return (
      <TableRow key={key} className={`ads-row${sub ? " ads-sub" : ""}`} onClick={() => onOpen(key)}>
        <TableCell className={`ad-name-col${sub ? "" : " td-title"}`}>
          {name}
          {note && <small className="ads-note">{note}</small>}
        </TableCell>
        <TableCell className="num-cell">
          {p ? (
            <>
              {money(p.cost * 1000)}
              <small className="ads-sub-num">{money((p.cost * 1000) / days)}/ngày</small>
            </>
          ) : (
            <span className="ads-muted">—</span>
          )}
        </TableCell>
        <TableCell className="num-cell">
          {p ? (
            <>
              {p.results}
              <small className="ads-sub-num">{dec1(p.results / days)}/ngày</small>
            </>
          ) : (
            <span className="ads-muted">—</span>
          )}
        </TableCell>
        <TableCell className="num-cell">
          {p?.newMessages ? (
            <>
              {p.newMessages}
              <small className="ads-sub-num">{money(costPerNewMessage(p)!)}/mess</small>
            </>
          ) : (
            <span className="ads-muted">—</span>
          )}
        </TableCell>
        <TableCell className="num-cell">{p?.sdt ?? <span className="ads-muted">—</span>}</TableCell>
        <TableCell className="num-cell"><CprPill cpr={costPerResult(p)} benchmark={benchmark} /></TableCell>
        <TableCell className="num-cell">{perSdt != null ? money(perSdt) : <span className="ads-muted">—</span>}</TableCell>
        <TableCell className="num-cell">{p?.orders ? <span className="sdt-val">{p.orders}</span> : <span className="ads-muted">—</span>}</TableCell>
        <TableCell className="num-cell"><VsBenchmark p={p} benchmark={benchmark} small={sub} /></TableCell>
      </TableRow>
    );
  };

  const rowsOf = (b: (typeof blocks)[number]) => {
    const dayOf = (a: AdResult) => periodDays(week, a.startDate);
    if (b.ads.length === 1) {
      const a = b.ads[0];
      return line(
        campKey(a),
        <>
          {b.creative} <span className="ads-muted">lên {a.startDate}</span>
          {a.status === "new" && <span className="badge-new">Mới</span>}
        </>,
        statOf(a),
        dayOf(a),
        b.benchmark,
        false,
        a.note,
      );
    }
    return [
      line(
        creativeKey(b.creative),
        <>
          {b.creative} <span className="ads-muted">{b.ads.length} camp</span>
        </>,
        b.total,
        Math.max(...b.ads.map(dayOf)),
        b.benchmark,
        false,
      ),
      ...b.ads.map((a) =>
        line(
          campKey(a),
          <>
            ↳ lên {a.startDate}
            {a.name !== b.creative && ` · ${a.name}`}
            {a.status === "new" && <span className="badge-new">Mới</span>}
            {(a.status === "off" || a.status === "expensive") && <span className="badge-off">Tắt</span>}
          </>,
          statOf(a),
          dayOf(a),
          b.benchmark,
          true,
          a.note,
        ),
      ),
    ];
  };

  const section = (title: string, list: typeof blocks, muted: boolean) =>
    list.length > 0 && (
      <>
        <div className={`section-head ${muted ? "off" : "active"}`}>
          {title} ({list.length})
        </div>
        <TableWrap vien tabIndex={0} aria-label="Kết quả quảng cáo theo kỳ" className={muted ? "inactive-table" : undefined}>
          <Table variant="thuong" className="min-w-[640px]" aria-label="Kết quả quảng cáo theo kỳ">
            <TableHeader>
              <TableRow>
                <TableHead>Creative / camp</TableHead>
                <TableHead>Chi</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>New mess</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Cost/result</TableHead>
                <TableHead>Cost/SĐT</TableHead>
                <TableHead>Khách mua</TableHead>
                <TableHead>So chuẩn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{[...list].sort((a, b) => a.sortKey - b.sortKey).map(rowsOf)}</TableBody>
          </Table>
        </TableWrap>
      </>
    );

  return (
    <>
      <div className="toolbar">
        {weeks.map((w, i) => (
          <Button
            key={w.id}
            type="button"
            size="sm" variant={periodIdx === i ? "default" : "outline"}
            onClick={() => onPeriod(i)}
            aria-pressed={periodIdx === i}
          >
            {w.label}
          </Button>
        ))}
      </div>
      {section("Đang chạy", blocks.filter((b) => b.running), false)}
      {section("Đã tắt · Học hỏi", blocks.filter((b) => !b.running), true)}
    </>
  );
}
