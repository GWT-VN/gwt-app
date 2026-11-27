import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrap } from "@/components/ui/table";
import {
  costPerResult,
  type Camp,
  type CreativeGroup,
  type PeriodStat,
  type Verdict,
} from "@/lib/marketing/ads-analysis";
import type { AdsWeek } from "@/lib/marketing/data/ads-results";
import { NameButton, CprPill, DecisionBadge, OffBadge } from "./shared";

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
      <TableCell key={weeks[i].id} phai>
        <CprPill cpr={costPerResult(p)} benchmark={benchmark} />
      </TableCell>
    ));

  const rowsOf = (g: CreativeGroup) => {
    const b = g.group.benchmarkCpr;
    if (g.camps.length === 1) {
      const c = g.camps[0];
      return (
        <TableRow key={c.key} className="cursor-pointer" onClick={() => onOpen(c.key)}>
          <TableCell>
            <NameButton onOpen={() => onOpen(c.key)}>{g.name}</NameButton>{" "}
            {badge(c)} <span className="ads-muted">lên {c.startDate}</span>
          </TableCell>
          {cells(c.periods, b)}
          <TableCell phai>{sdtTotal(c.periods)}</TableCell>
        </TableRow>
      );
    }
    return [
      <TableRow key={g.key} className="cursor-pointer" onClick={() => onOpen(g.key)}>
        <TableCell>
          <NameButton onOpen={() => onOpen(g.key)}>{g.name}</NameButton>{" "}
          <span className="ads-muted">{g.camps.length} camp</span>
        </TableCell>
        {cells(g.periods, b)}
        <TableCell phai>{sdtTotal(g.periods)}</TableCell>
      </TableRow>,
      ...g.camps.map((c) => (
        <TableRow key={c.key} className="cursor-pointer" onClick={() => onOpen(c.key)}>
          <TableCell>
            {/* Dòng con thụt vào trong NỘI DUNG ô (không đè đệm ô DS). */}
            <span className="inline-block ps-4">
              <NameButton onOpen={() => onOpen(c.key)} ngu={g.name}>
                <span aria-hidden="true">↳</span> lên {c.startDate}{c.name !== g.name && ` · ${c.name}`}
              </NameButton>
            </span>{" "}
            {badge(c)}
          </TableCell>
          {cells(c.periods, b)}
          <TableCell phai>{sdtTotal(c.periods)}</TableCell>
        </TableRow>
      )),
    ];
  };

  const section = (title: string, list: CreativeGroup[], muted: boolean) =>
    list.length > 0 && (
      <>
        <div className={`section-head ${muted ? "off" : "active"}`}>
          {title} ({list.length})
        </div>
        <TableWrap vien role="region" tabIndex={0} aria-label={`Vùng cuộn xu hướng quảng cáo — ${title}`} className={muted ? "inactive-table" : undefined}>
          <Table aria-label={`Xu hướng quảng cáo — ${title}`}>
            <TableHeader>
              <TableRow>
                <TableHead>Creative / camp</TableHead>
                {weeks.map((w) => (
                  <TableHead key={w.id} phai>{w.label}</TableHead>
                ))}
                <TableHead phai>SĐT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{list.map(rowsOf)}</TableBody>
          </Table>
        </TableWrap>
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
