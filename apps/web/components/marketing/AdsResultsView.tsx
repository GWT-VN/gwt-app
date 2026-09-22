"use client";

import { useMemo, useState } from "react";
import type { AdResult, AdsWeek } from "@/lib/marketing/data/ads-results";

function fmtK(v: number): string {
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return v.toLocaleString("vi-VN");
}

function fmtVND(v: number): string {
  return v.toLocaleString("vi-VN") + "đ";
}

type AdRow = {
  name: string;
  latestStatus: AdResult["status"];
  latestBudget: string;
  latestNote: string;
  cprs: (number | null)[];
  costs: (number | null)[];
  results: (number | null)[];
  sdts: (number | null)[];
  totalCost: number;
  totalResults: number;
  totalSdt: number;
  trend: "up" | "down" | "flat" | "none";
  latestCPR: number | null;
};

function cprColor(v: number): string {
  if (v < 15000) return "var(--good)";
  if (v < 30000) return "var(--accent)";
  if (v < 50000) return "var(--warn)";
  return "var(--a4-ink)";
}

function cprBg(v: number): string {
  if (v < 15000) return "var(--good-bg)";
  if (v < 30000) return "var(--a2-bg)";
  if (v < 50000) return "var(--warn-bg)";
  return "var(--a4-bg)";
}

function TrendArrow({ trend }: { trend: AdRow["trend"] }) {
  if (trend === "none") return <span className="trend-icon trend-none">—</span>;
  if (trend === "down") return <span className="trend-icon trend-good">↓</span>;
  if (trend === "up") return <span className="trend-icon trend-bad">↑</span>;
  return <span className="trend-icon trend-flat">→</span>;
}

function StatusBadge({ status }: { status: AdResult["status"] }) {
  const map = {
    active: null,
    off: { cls: "badge-off", text: "Tắt" },
    new: { cls: "badge-new", text: "Mới" },
    expensive: { cls: "badge-off", text: "Đắt" },
  };
  const b = map[status];
  if (!b) return null;
  return <span className={b.cls}>{b.text}</span>;
}

function CPRCell({ value }: { value: number | null }) {
  if (value == null) return <td className="num-cell cpr-cell">—</td>;
  return (
    <td className="num-cell cpr-cell">
      <span className="cpr-pill" style={{ background: cprBg(value), color: cprColor(value) }}>
        {fmtK(value)}
      </span>
    </td>
  );
}

type ViewMode = "trend" | "detail";

export default function AdsResultsView({ weeks }: { weeks: AdsWeek[] }) {
  const [view, setView] = useState<ViewMode>("trend");
  const [weekIdx, setWeekIdx] = useState(weeks.length - 1);

  const allAds = useMemo(() => {
    const nameSet = new Map<string, AdRow>();
    for (let wi = 0; wi < weeks.length; wi++) {
      for (const ad of weeks[wi].ads) {
        if (!nameSet.has(ad.name)) {
          nameSet.set(ad.name, {
            name: ad.name,
            latestStatus: ad.status,
            latestBudget: ad.budgetDaily,
            latestNote: ad.note,
            cprs: new Array(weeks.length).fill(null),
            costs: new Array(weeks.length).fill(null),
            results: new Array(weeks.length).fill(null),
            sdts: new Array(weeks.length).fill(null),
            totalCost: 0,
            totalResults: 0,
            totalSdt: 0,
            trend: "none",
            latestCPR: null,
          });
        }
        const row = nameSet.get(ad.name)!;
        row.cprs[wi] = ad.costPerResult;
        row.costs[wi] = ad.cost;
        row.results[wi] = ad.results;
        row.sdts[wi] = ad.sdt;
        row.totalCost += ad.cost ?? 0;
        row.totalResults += ad.results ?? 0;
        row.totalSdt += ad.sdt ?? 0;
        row.latestStatus = ad.status;
        row.latestBudget = ad.budgetDaily;
        if (ad.note) row.latestNote = ad.note;
        if (ad.costPerResult != null) row.latestCPR = ad.costPerResult;
      }
    }
    for (const row of nameSet.values()) {
      const vals = row.cprs.filter((v): v is number => v != null);
      if (vals.length >= 2) {
        const first = vals[0];
        const last = vals[vals.length - 1];
        const pct = ((last - first) / first) * 100;
        row.trend = pct < -5 ? "down" : pct > 5 ? "up" : "flat";
      }
    }
    return [...nameSet.values()];
  }, [weeks]);

  const active = useMemo(
    () =>
      allAds
        .filter((a) => a.latestStatus === "active" || a.latestStatus === "new")
        .sort((a, b) => (a.latestCPR ?? 999999) - (b.latestCPR ?? 999999)),
    [allAds],
  );

  const inactive = useMemo(
    () =>
      allAds
        .filter((a) => a.latestStatus === "off" || a.latestStatus === "expensive")
        .sort((a, b) => (a.latestCPR ?? 999999) - (b.latestCPR ?? 999999)),
    [allAds],
  );

  const totalCostAll = allAds.reduce((s, a) => s + a.totalCost, 0);
  const totalResultsAll = allAds.reduce((s, a) => s + a.totalResults, 0);
  const totalSdtAll = allAds.reduce((s, a) => s + a.totalSdt, 0);
  const avgCPR = totalResultsAll > 0 ? Math.round(totalCostAll / totalResultsAll) : 0;

  const weekForDetail = weeks[weekIdx];

  return (
    <>
      <style>{`
        .ads-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 20px }
        .ads-stat { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px }
        .ads-stat .num { font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em }
        .ads-stat .lab { font-size: .72rem; color: var(--ink-3); font-weight: 500; margin-top: 2px }
        .section-head { display: flex; align-items: center; gap: 8px; margin: 24px 0 10px; font-size: .76rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-3) }
        .section-head::after { content: ''; flex: 1; height: 1px; background: var(--line) }
        .section-head.active { color: var(--good) }
        .section-head.off { color: var(--ink-3) }
        .cpr-pill { display: inline-block; font-family: var(--font-mono); font-size: .72rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-variant-numeric: tabular-nums; white-space: nowrap }
        .cpr-cell { padding: 4px 2px !important }
        .trend-icon { font-weight: 700; font-size: .85rem }
        .trend-good { color: var(--good) }
        .trend-bad { color: #c0392b }
        .trend-flat { color: var(--ink-3) }
        .trend-none { color: var(--ink-3) }
        .badge-new { background: var(--a2-bg); color: var(--a2-ink); font-weight: 700; font-size: .66rem; padding: 2px 7px; border-radius: 6px; margin-left: 6px; vertical-align: middle }
        .badge-off { background: var(--surface-3); color: var(--ink-3); font-weight: 600; font-size: .66rem; padding: 2px 7px; border-radius: 6px; margin-left: 6px; vertical-align: middle }
        .view-toggle { display: flex; gap: 4px; margin-bottom: 16px }
        .view-btn { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 6px 14px; font-size: .78rem; font-weight: 500; cursor: pointer; color: var(--ink-2) }
        .view-btn.on { background: var(--accent-soft); color: var(--accent-ink); border-color: var(--accent) }
        .note-text { font-size: .72rem; color: var(--ink-3); max-width: 200px; line-height: 1.3 }
        .sdt-val { font-weight: 600; color: var(--good) }
        .week-label { font-size: .66rem; white-space: nowrap }
        table th { font-size: .72rem; white-space: nowrap }
        .ad-name-col { white-space: nowrap }
        .inactive-table { opacity: 0.7 }
        @media (max-width: 640px) {
          .ads-stats { grid-template-columns: repeat(2, 1fr) }
          .cpr-pill { font-size: .66rem; padding: 2px 5px }
        }
      `}</style>

      <div className="ads-stats">
        <div className="ads-stat">
          <div className="num">{active.length}</div>
          <div className="lab">Ads đang chạy</div>
        </div>
        <div className="ads-stat">
          <div className="num">{fmtK(totalCostAll)}</div>
          <div className="lab">Tổng chi (1000đ)</div>
        </div>
        <div className="ads-stat">
          <div className="num">{totalResultsAll.toLocaleString("vi-VN")}</div>
          <div className="lab">Tổng result</div>
        </div>
        <div className="ads-stat">
          <div className="num">{fmtVND(avgCPR)}</div>
          <div className="lab">TB cost/result</div>
        </div>
        {totalSdtAll > 0 && (
          <div className="ads-stat">
            <div className="num">{totalSdtAll}</div>
            <div className="lab">Tổng SĐT</div>
          </div>
        )}
      </div>

      <div className="view-toggle">
        <button className={`view-btn${view === "trend" ? " on" : ""}`} onClick={() => setView("trend")}>
          Xu hướng
        </button>
        <button className={`view-btn${view === "detail" ? " on" : ""}`} onClick={() => setView("detail")}>
          Chi tiết tuần
        </button>
      </div>

      {view === "trend" ? (
        <>
          <div className="section-head active">Đang chạy ({active.length})</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên Ads</th>
                  <th>Budget</th>
                  {weeks.map((w) => (
                    <th key={w.id} className="week-label">{w.label}</th>
                  ))}
                  <th>Trend</th>
                  <th>SĐT</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {active.map((row) => (
                  <tr key={row.name}>
                    <td className="td-title ad-name-col">
                      {row.name}
                      <StatusBadge status={row.latestStatus} />
                    </td>
                    <td className="num-cell">{row.latestBudget}</td>
                    {row.cprs.map((cpr, i) => (
                      <CPRCell key={i} value={cpr} />
                    ))}
                    <td className="num-cell"><TrendArrow trend={row.trend} /></td>
                    <td className="num-cell">
                      {row.totalSdt > 0 ? <span className="sdt-val">{row.totalSdt}</span> : "—"}
                    </td>
                    <td className="note-text">{row.latestNote || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inactive.length > 0 && (
            <>
              <div className="section-head off">Đã tắt · Học hỏi ({inactive.length})</div>
              <div className="table-wrap inactive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tên Ads</th>
                      <th>Budget</th>
                      {weeks.map((w) => (
                        <th key={w.id} className="week-label">{w.label}</th>
                      ))}
                      <th>Trend</th>
                      <th>SĐT</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactive.map((row) => (
                      <tr key={row.name}>
                        <td className="td-title ad-name-col">
                          {row.name}
                          <StatusBadge status={row.latestStatus} />
                        </td>
                        <td className="num-cell">{row.latestBudget}</td>
                        {row.cprs.map((cpr, i) => (
                          <CPRCell key={i} value={cpr} />
                        ))}
                        <td className="num-cell"><TrendArrow trend={row.trend} /></td>
                        <td className="num-cell">
                          {row.totalSdt > 0 ? <span className="sdt-val">{row.totalSdt}</span> : "—"}
                        </td>
                        <td className="note-text">{row.latestNote || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <>
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
          <DetailTable week={weekForDetail} />
        </>
      )}
    </>
  );
}

function DetailTable({ week }: { week: AdsWeek }) {
  const activeAds = week.ads
    .filter((a) => a.costPerResult != null && (a.status === "active" || a.status === "new"))
    .sort((a, b) => a.costPerResult! - b.costPerResult!);

  const inactiveAds = week.ads
    .filter((a) => a.costPerResult != null && (a.status === "off" || a.status === "expensive"))
    .sort((a, b) => a.costPerResult! - b.costPerResult!);

  const noData = week.ads.filter((a) => a.costPerResult == null);
  const hasSdt = week.ads.some((a) => a.sdt != null && a.sdt > 0);

  return (
    <>
      {activeAds.length > 0 && (
        <>
          <div className="section-head active">Đang chạy ({activeAds.length})</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên Ads</th>
                  <th>Budget</th>
                  <th>Chi phí</th>
                  <th>Result</th>
                  <th>Cost/Result</th>
                  {hasSdt && <th>SĐT</th>}
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {activeAds.map((ad, i) => (
                  <tr key={ad.name}>
                    <td className="num-cell">{i + 1}</td>
                    <td className="td-title ad-name-col">
                      {ad.name}
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="num-cell">{ad.budgetDaily}</td>
                    <td className="num-cell">{fmtK(ad.cost!)}</td>
                    <td className="num-cell">{ad.results}</td>
                    <td className="num-cell">
                      <span className="cpr-pill" style={{ background: cprBg(ad.costPerResult!), color: cprColor(ad.costPerResult!) }}>
                        {fmtVND(ad.costPerResult!)}
                      </span>
                    </td>
                    {hasSdt && (
                      <td className="num-cell">
                        {ad.sdt && ad.sdt > 0 ? <span className="sdt-val">{ad.sdt}</span> : "—"}
                      </td>
                    )}
                    <td className="note-text">{ad.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {inactiveAds.length > 0 && (
        <>
          <div className="section-head off">Đã tắt · Học hỏi ({inactiveAds.length})</div>
          <div className="table-wrap inactive-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên Ads</th>
                  <th>Budget</th>
                  <th>Chi phí</th>
                  <th>Result</th>
                  <th>Cost/Result</th>
                  {hasSdt && <th>SĐT</th>}
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {inactiveAds.map((ad, i) => (
                  <tr key={ad.name}>
                    <td className="num-cell">{i + 1}</td>
                    <td className="td-title ad-name-col">
                      {ad.name}
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="num-cell">{ad.budgetDaily}</td>
                    <td className="num-cell">{fmtK(ad.cost!)}</td>
                    <td className="num-cell">{ad.results}</td>
                    <td className="num-cell">
                      <span className="cpr-pill" style={{ background: cprBg(ad.costPerResult!), color: cprColor(ad.costPerResult!) }}>
                        {fmtVND(ad.costPerResult!)}
                      </span>
                    </td>
                    {hasSdt && (
                      <td className="num-cell">
                        {ad.sdt && ad.sdt > 0 ? <span className="sdt-val">{ad.sdt}</span> : "—"}
                      </td>
                    )}
                    <td className="note-text">{ad.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {noData.length > 0 && (
        <>
          <div className="section-head off">Chưa có data ({noData.length})</div>
          <div className="table-wrap inactive-table">
            <table>
              <thead>
                <tr>
                  <th>Tên Ads</th>
                  <th>Budget</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {noData.map((ad) => (
                  <tr key={ad.name}>
                    <td className="td-title ad-name-col">
                      {ad.name}
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="num-cell">{ad.budgetDaily}</td>
                    <td className="note-text">{ad.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
