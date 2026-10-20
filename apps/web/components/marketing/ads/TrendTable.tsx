import {
  costPerResult,
  type Camp,
  type CreativeGroup,
  type PeriodStat,
  type Verdict,
} from "@/lib/marketing/ads-analysis";
import type { AdsWeek } from "@/lib/marketing/data/ads-results";
import { CprPill, DecisionBadge, OffBadge } from "./shared";

function sdtTotal(periods: (PeriodStat | null)[]) {
  const t = periods.reduce((s, p) => s + (p?.sdt ?? 0), 0);
  return t > 0 ? <span className="sdt-val">{t}</span> : <span className="ads-muted">—</span>;
}

export default function TrendTable({
  weeks,
  groups,
  verdicts,
  onOpen,
}: {
  weeks: AdsWeek[];
  groups: CreativeGroup[];
  verdicts: Map<string, Verdict | null>;
  onOpen: (key: string) => void;
}) {
  const badge = (c: Camp) => {
    const v = verdicts.get(c.key);
    return v ? <DecisionBadge decision={v.decision} /> : <OffBadge />;
  };

  const cells = (periods: (PeriodStat | null)[], benchmark: number) =>
    periods.map((p, i) => (
      <td key={weeks[i].id} className="num-cell cpr-cell">
        <CprPill cpr={costPerResult(p)} benchmark={benchmark} />
      </td>
    ));

  const rowsOf = (g: CreativeGroup) => {
    const b = g.group.benchmarkCpr;
    if (g.camps.length === 1) {
      const c = g.camps[0];
      return (
        <tr key={c.key} className="ads-row" onClick={() => onOpen(c.key)}>
          <td className="td-title ad-name-col">
            {g.name}
            {badge(c)} <span className="ads-muted">lên {c.startDate}</span>
          </td>
          {cells(c.periods, b)}
          <td className="num-cell">{sdtTotal(c.periods)}</td>
        </tr>
      );
    }
    return [
      <tr key={g.key} className="ads-row" onClick={() => onOpen(g.key)}>
        <td className="td-title ad-name-col">
          {g.name} <span className="ads-muted">{g.camps.length} camp</span>
        </td>
        {cells(g.periods, b)}
        <td className="num-cell">{sdtTotal(g.periods)}</td>
      </tr>,
      ...g.camps.map((c) => (
        <tr key={c.key} className="ads-row ads-sub" onClick={() => onOpen(c.key)}>
          <td className="ad-name-col">
            ↳ lên {c.startDate}
            {c.name !== g.name && ` · ${c.name}`}
            {badge(c)}
          </td>
          {cells(c.periods, b)}
          <td className="num-cell">{sdtTotal(c.periods)}</td>
        </tr>
      )),
    ];
  };

  const section = (title: string, list: CreativeGroup[], muted: boolean) =>
    list.length > 0 && (
      <>
        <div className={`section-head ${muted ? "off" : "active"}`}>
          {title} ({list.length})
        </div>
        <div className={`table-wrap${muted ? " inactive-table" : ""}`}>
          <table>
            <thead>
              <tr>
                <th>Creative / camp</th>
                {weeks.map((w) => (
                  <th key={w.id} className="week-label">{w.label}</th>
                ))}
                <th>SĐT</th>
              </tr>
            </thead>
            <tbody>{list.map(rowsOf)}</tbody>
          </table>
        </div>
      </>
    );

  return (
    <>
      <p className="ads-muted ads-caption">
        Ô = cost/result từng kỳ, màu so với chuẩn nhóm: xanh lá ≤ 80% · xanh dương ≤ chuẩn · vàng dưới 1,5 lần · đỏ
        từ 1,5 lần. Creative có nhiều camp thì dòng đậm là số gộp, dòng ↳ là từng camp theo ngày lên.
      </p>
      {section("Đang chạy", groups.filter((g) => g.running), false)}
      {section("Đã tắt · Học hỏi", groups.filter((g) => !g.running), true)}
    </>
  );
}
