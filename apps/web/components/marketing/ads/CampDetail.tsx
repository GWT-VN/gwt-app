import { useMemo } from "react";
import { OChonGoiY, type MucChon } from "@/bang";
import {
  costPerResult,
  costPerSdt,
  periodDays,
  totalOf,
  type Camp,
  type CreativeGroup,
  type PeriodStat,
  type Verdict,
} from "@/lib/marketing/ads-analysis";
import type { AdsWeek } from "@/lib/marketing/data/ads-results";
import { campLabel, CprPill, dec1, DecisionBadge, Delta, money, OffBadge } from "./shared";

type Target =
  | { kind: "camp"; key: string; label: string; camp: Camp; group: CreativeGroup }
  | { kind: "creative"; key: string; label: string; group: CreativeGroup };

/** Danh sách chọn: creative có ≥ 2 camp (xem gộp) + từng camp. */
export function buildTargets(groups: CreativeGroup[]): Target[] {
  return groups.flatMap((g) => [
    ...(g.camps.length > 1
      ? [{ kind: "creative" as const, key: g.key, label: `${g.name} — cả creative (${g.camps.length} camp)`, group: g }]
      : []),
    ...g.camps.map((c) => ({ kind: "camp" as const, key: c.key, label: campLabel(c), camp: c, group: g })),
  ]);
}

export default function CampDetail({
  weeks,
  groups,
  verdicts,
  selected,
  onSelect,
}: {
  weeks: AdsWeek[];
  groups: CreativeGroup[];
  verdicts: Map<string, Verdict | null>;
  selected: string;
  onSelect: (key: string) => void;
}) {
  const targets = useMemo(() => buildTargets(groups), [groups]);
  const options: MucChon[] = useMemo(
    () =>
      targets.map((t) => ({
        gt: t.label,
        nhan: t.label,
        phu: t.kind === "creative" ? "số gộp" : undefined,
      })),
    [targets],
  );
  const t = targets.find((x) => x.key === selected) ?? targets[0];
  if (!t) return <p className="ads-muted">Chưa có dữ liệu.</p>;

  const benchmark = t.group.group.benchmarkCpr;
  const periods = t.kind === "camp" ? t.camp.periods : t.group.periods;
  const verdict = t.kind === "camp" ? verdicts.get(t.camp.key) ?? null : null;
  const total = totalOf(periods);

  /** Số ngày có mặt trong kỳ: camp tính từ ngày lên; creative lấy camp lên sớm nhất có số kỳ đó. */
  const daysOf = (wi: number) => {
    const camps = t.kind === "camp" ? [t.camp] : t.group.camps.filter((c) => c.periods[wi]);
    return Math.max(...camps.map((c) => periodDays(weeks[wi], c.startDate)));
  };

  const rows: { wi: number; p: PeriodStat; days: number }[] = [];
  periods.forEach((p, wi) => {
    if (p) rows.push({ wi, p, days: daysOf(wi) });
  });

  return (
    <>
      <div className="ads-picker">
        <label className="ads-muted">Chọn camp hoặc creative (gõ để tìm)</label>
        <OChonGoiY
          giaTri={t.label}
          tuyChon={options}
          choPhepXoa={false}
          choTrong="Gõ tên, ví dụ CTD50 Dino"
          className="ads-picker-input"
          onChon={(label) => {
            const hit = targets.find((x) => x.label === label);
            if (hit) onSelect(hit.key);
          }}
        />
      </div>

      <div className="ads-camp-head">
        <h3>{t.label}</h3>
        {t.kind === "camp" && (verdict ? <DecisionBadge decision={verdict.decision} /> : <OffBadge />)}
        <span className="ads-muted">
          Chuẩn {t.group.group.label.toLowerCase()} {money(benchmark)}
          {t.kind === "camp" && ` · budget ${t.camp.budgetDaily}/ngày`}
        </span>
      </div>
      {t.kind === "creative" && <p className="ads-muted">Số gộp mọi camp của creative này.</p>}
      {verdict && (verdict.reasons.length > 0 || verdict.flags.length > 0) && (
        <p className="ads-reason">{[...verdict.reasons, ...verdict.flags].join(" · ")}</p>
      )}
      {t.kind === "camp" && t.camp.note && <p className="ads-muted">Ghi chú: {t.camp.note}</p>}

      {total && (
        <div className="ads-stats">
          <div className="ads-stat">
            <div className="num">{money(total.cost * 1000)}</div>
            <div className="lab">Tổng chi</div>
          </div>
          <div className="ads-stat">
            <div className="num">{total.results.toLocaleString("vi-VN")}</div>
            <div className="lab">Result</div>
          </div>
          <div className="ads-stat">
            <div className="num">{total.sdt ?? "—"}</div>
            <div className="lab">SĐT</div>
          </div>
          <div className="ads-stat">
            <div className="num">{money(costPerResult(total)!)}</div>
            <div className="lab">Cost/result TB</div>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kỳ</th>
              <th>Chi</th>
              <th>Result</th>
              <th>SĐT</th>
              <th>Cost/result</th>
              <th>Cost/SĐT</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ wi, p, days }, i) => {
              const prev = i > 0 ? rows[i - 1] : null;
              const cpr = costPerResult(p);
              const perSdt = costPerSdt(p);
              return (
                <tr key={weeks[wi].id}>
                  <td className="ad-name-col">
                    {weeks[wi].label} <span className="ads-muted">{days} ngày</span>
                  </td>
                  <td className="num-cell">
                    {money(p.cost * 1000)}
                    <small className="ads-sub-num">
                      {money((p.cost * 1000) / days)}/ngày
                      <Delta cur={p.cost / days} prev={prev && prev.p.cost / prev.days} goodWhenUp neutral />
                    </small>
                  </td>
                  <td className="num-cell">
                    {p.results}
                    <small className="ads-sub-num">
                      {dec1(p.results / days)}/ngày
                      <Delta cur={p.results / days} prev={prev && prev.p.results / prev.days} goodWhenUp />
                    </small>
                  </td>
                  <td className="num-cell">
                    {p.sdt ?? <span className="ads-muted">—</span>}
                    {p.sdt != null && (
                      <small className="ads-sub-num">
                        {dec1(p.sdt / days)}/ngày
                        <Delta
                          cur={p.sdt / days}
                          prev={prev && prev.p.sdt != null ? prev.p.sdt / prev.days : null}
                          goodWhenUp
                        />
                      </small>
                    )}
                  </td>
                  <td className="num-cell">
                    <CprPill cpr={cpr} benchmark={benchmark} />
                    <Delta cur={cpr} prev={prev && costPerResult(prev.p)} goodWhenUp={false} />
                  </td>
                  <td className="num-cell">{perSdt != null ? money(perSdt) : <span className="ads-muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="ads-muted ads-caption">
        Mũi tên so với kỳ trước, đã quy về mỗi ngày nên kỳ 2 tuần vẫn so được với kỳ 1 tuần. Xanh = tốt lên, đỏ = xấu
        đi; mũi tên chi tiêu chỉ báo hướng.
      </p>
    </>
  );
}
