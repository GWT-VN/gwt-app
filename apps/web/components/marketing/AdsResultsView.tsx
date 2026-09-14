"use client";

import { useMemo, useState } from "react";
import type { AdResult, AdsWeek } from "@/lib/marketing/data/ads-results";

function fmtVND(v: number): string {
  return v.toLocaleString("vi-VN") + "đ";
}

function fmtCost(v: number): string {
  return v.toLocaleString("vi-VN");
}

function StatusBadge({ status }: { status: AdResult["status"] }) {
  const map = {
    active: null,
    off: { cls: "badge-fail", text: "Tắt" },
    new: { cls: "badge-new", text: "Mới" },
    expensive: { cls: "badge-fail", text: "Đắt" },
  };
  const b = map[status];
  if (!b) return null;
  return <span className={b.cls}>{b.text}</span>;
}

function DeltaCell({ current, prev }: { current: number; prev: number | undefined }) {
  if (prev == null) return <td className="num-cell">—</td>;
  const pct = ((current - prev) / prev) * 100;
  const sign = pct > 0 ? "+" : "";
  const cls = pct < 0 ? "delta-good" : pct > 0 ? "delta-bad" : "";
  return (
    <td className={`num-cell ${cls}`}>
      {sign}{pct.toFixed(0)}%
    </td>
  );
}

export default function AdsResultsView({ weeks }: { weeks: AdsWeek[] }) {
  const [weekIdx, setWeekIdx] = useState(weeks.length - 1);
  const week = weeks[weekIdx];
  const prevWeek = weekIdx > 0 ? weeks[weekIdx - 1] : null;

  const sorted = useMemo(() => {
    return [...week.ads]
      .filter((a) => a.costPerResult != null)
      .sort((a, b) => a.costPerResult! - b.costPerResult!);
  }, [week]);

  const noData = week.ads.filter((a) => a.costPerResult == null);
  const maxCPR = Math.max(...sorted.map((a) => a.costPerResult!));

  const totalCost = week.ads.reduce((s, a) => s + (a.cost ?? 0), 0);
  const totalResults = week.ads.reduce((s, a) => s + (a.results ?? 0), 0);
  const totalSdt = week.ads.reduce((s, a) => s + (a.sdt ?? 0), 0);
  const avgCPR = totalResults > 0 ? Math.round(totalCost / totalResults) : 0;

  const prevLookup = useMemo(() => {
    if (!prevWeek) return new Map<string, number>();
    const m = new Map<string, number>();
    for (const a of prevWeek.ads) {
      if (a.costPerResult != null) m.set(a.name, a.costPerResult);
    }
    return m;
  }, [prevWeek]);

  return (
    <>
      <style>{`
        .ads-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px }
        .ads-stat { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 14px 16px }
        .ads-stat .num { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em }
        .ads-stat .lab { font-size: .74rem; color: var(--ink-3); font-weight: 500; margin-top: 2px }
        .badge-new { background: var(--a2-bg); color: var(--a2-ink); font-weight: 700; font-size: .68rem; padding: 2px 8px; border-radius: 6px }
        .bar-bg { height: 8px; background: var(--surface-3); border-radius: 4px; min-width: 60px; max-width: 180px; position: relative }
        .bar-fill { height: 100%; border-radius: 4px 4px 4px 4px; min-width: 3px }
        .bar-fill.good { background: var(--good) }
        .bar-fill.ok { background: var(--accent) }
        .bar-fill.warn { background: var(--warn) }
        .bar-fill.bad { background: var(--a4-ink) }
        .delta-good { color: var(--good) !important }
        .delta-bad { color: #c0392b !important }
        .sdt-cell { font-weight: 600 }
        .note-cell { font-size: .78rem; color: var(--ink-3); max-width: 180px }
        @media (max-width: 640px) {
          .ads-stats { grid-template-columns: repeat(2, 1fr) }
          .bar-bg { max-width: 100px }
        }
      `}</style>

      <div className="toolbar">
        {weeks.map((w, i) => (
          <button
            key={w.id}
            className={`filter-chip${weekIdx === i ? " on" : ""}`}
            onClick={() => setWeekIdx(i)}
            aria-pressed={weekIdx === i}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="ads-stats">
        <div className="ads-stat">
          <div className="num">{week.ads.filter((a) => a.costPerResult != null).length}</div>
          <div className="lab">Ads đang chạy</div>
        </div>
        <div className="ads-stat">
          <div className="num">{fmtCost(totalCost)}</div>
          <div className="lab">Tổng chi (1000đ)</div>
        </div>
        <div className="ads-stat">
          <div className="num">{totalResults.toLocaleString("vi-VN")}</div>
          <div className="lab">Tổng result</div>
        </div>
        <div className="ads-stat">
          <div className="num">{fmtVND(avgCPR)}</div>
          <div className="lab">TB cost/result</div>
        </div>
        {totalSdt > 0 && (
          <div className="ads-stat">
            <div className="num">{totalSdt}</div>
            <div className="lab">Tổng SĐT</div>
          </div>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tên Ads</th>
              <th>Budget/ngày</th>
              <th>Chi phí</th>
              <th>Result</th>
              <th>Cost/Result</th>
              <th style={{ width: 180 }}></th>
              {prevWeek && <th>Δ tuần</th>}
              {week.ads.some((a) => a.sdt != null && a.sdt > 0) && <th>SĐT</th>}
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ad, i) => {
              const pct = ad.costPerResult! / maxCPR;
              const barCls = ad.costPerResult! < 15000 ? "good" : ad.costPerResult! < 30000 ? "ok" : ad.costPerResult! < 50000 ? "warn" : "bad";
              const hasSdt = week.ads.some((a) => a.sdt != null && a.sdt > 0);
              return (
                <tr key={ad.name}>
                  <td className="num-cell">{i + 1}</td>
                  <td className="td-title">
                    {ad.name}
                    <StatusBadge status={ad.status} />
                  </td>
                  <td className="num-cell">{ad.budgetDaily}</td>
                  <td className="num-cell">{fmtCost(ad.cost!)}</td>
                  <td className="num-cell">{ad.results}</td>
                  <td className="num-cell" style={{ fontWeight: 700 }}>
                    {fmtVND(ad.costPerResult!)}
                  </td>
                  <td>
                    <div className="bar-bg">
                      <div className={`bar-fill ${barCls}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                  </td>
                  {prevWeek && (
                    <DeltaCell current={ad.costPerResult!} prev={prevLookup.get(ad.name)} />
                  )}
                  {hasSdt && (
                    <td className={`num-cell${ad.sdt && ad.sdt > 0 ? " sdt-cell" : ""}`}>
                      {ad.sdt && ad.sdt > 0 ? ad.sdt : "—"}
                    </td>
                  )}
                  <td className="note-cell">{ad.note || "—"}</td>
                </tr>
              );
            })}
            {noData.map((ad) => {
              const hasSdt = week.ads.some((a) => a.sdt != null && a.sdt > 0);
              return (
                <tr key={ad.name} style={{ opacity: 0.55 }}>
                  <td className="num-cell">—</td>
                  <td className="td-title">
                    {ad.name}
                    <StatusBadge status={ad.status} />
                  </td>
                  <td className="num-cell">{ad.budgetDaily}</td>
                  <td className="num-cell" colSpan={prevWeek ? 5 : 4}>chưa có data</td>
                  {hasSdt && <td className="num-cell">—</td>}
                  <td className="note-cell">{ad.note || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
