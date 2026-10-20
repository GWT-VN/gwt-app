"use client";

import { useMemo, useRef, useState } from "react";
import { buildCreatives, judgeCamp, type Verdict } from "@/lib/marketing/ads-analysis";
import type { AdsWeek } from "@/lib/marketing/data/ads-results";
import CampDetail from "./ads/CampDetail";
import DecisionPanel, { type Judged } from "./ads/DecisionPanel";
import PeriodDetail from "./ads/PeriodDetail";
import RankingTable from "./ads/RankingTable";
import TrendTable from "./ads/TrendTable";

type Tab = "rank" | "trend" | "camp" | "period";

const TABS: { id: Tab; label: string }[] = [
  { id: "rank", label: "Xếp hạng" },
  { id: "trend", label: "Xu hướng" },
  { id: "camp", label: "Theo camp" },
  { id: "period", label: "Chi tiết kỳ" },
];

export default function AdsResultsView({ weeks }: { weeks: AdsWeek[] }) {
  const groups = useMemo(() => buildCreatives(weeks), [weeks]);
  const verdicts = useMemo(() => {
    const m = new Map<string, Verdict | null>();
    for (const g of groups) for (const c of g.camps) m.set(c.key, judgeCamp(c, weeks));
    return m;
  }, [groups, weeks]);
  const judged: Judged[] = useMemo(
    () =>
      groups.flatMap((g) =>
        g.camps.flatMap((camp) => {
          const verdict = verdicts.get(camp.key);
          return verdict ? [{ camp, verdict }] : [];
        }),
      ),
    [groups, verdicts],
  );

  const firstToWatch = judged.find((j) => j.verdict.decision === "off") ?? judged[0];
  const [tab, setTab] = useState<Tab>("rank");
  const [selected, setSelected] = useState<string>(firstToWatch?.camp.key ?? "");
  const [periodIdx, setPeriodIdx] = useState(weeks.length - 1);
  const tabsRef = useRef<HTMLDivElement>(null);
  const latestLabel = weeks[weeks.length - 1]?.label ?? "";

  const open = (key: string) => {
    setSelected(key);
    setTab("camp");
    tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        .ads-muted { color: var(--ink-3); font-size: .74rem; font-weight: 500 }
        .ads-caption { margin: 0 0 8px }
        .ads-decide { margin-bottom: 8px }
        .ads-decide-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 10px }
        .ads-decide-head h2 { font-size: 1.05rem; margin: 0 }
        .ads-decide-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px }
        .ads-decide-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px }
        .ads-decide-title { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: .9rem }
        .ads-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block }
        .ads-decide-hint { margin: 2px 0 6px }
        .ads-decide-item { display: block; width: 100%; text-align: left; background: none; border: 0; border-top: 1px solid var(--line); padding: 8px 4px; cursor: pointer; color: inherit; font: inherit }
        .ads-decide-item:hover { background: var(--surface-2) }
        .ads-decide-name { font-weight: 600; font-size: .84rem; color: var(--ink) }
        .ads-reason { font-size: .76rem; color: var(--ink-2); line-height: 1.4 }
        .ads-flag { font-size: .74rem; color: var(--a1-ink); line-height: 1.4 }
        .ads-stale { margin: 10px 0 0 }
        .ads-badge { font-size: .66rem; font-weight: 700; padding: 2px 7px; border-radius: 6px; margin-left: 6px; vertical-align: middle; white-space: nowrap }
        .ads-badge-off, .badge-off { background: var(--surface-3); color: var(--ink-3); font-weight: 600; font-size: .66rem; padding: 2px 7px; border-radius: 6px; margin-left: 6px; vertical-align: middle }
        .badge-new { background: var(--a2-bg); color: var(--a2-ink); font-weight: 700; font-size: .66rem; padding: 2px 7px; border-radius: 6px; margin-left: 6px; vertical-align: middle }
        .ads-tabs { display: flex; gap: 4px; flex-wrap: wrap; margin: 22px 0 14px; scroll-margin-top: 16px }
        .view-btn { background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 6px 14px; font-size: .78rem; font-weight: 500; cursor: pointer; color: var(--ink-2) }
        .view-btn.on { background: var(--accent-soft); color: var(--accent-ink); border-color: var(--accent) }
        .section-head { display: flex; align-items: center; gap: 8px; margin: 22px 0 10px; font-size: .76rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ink-3) }
        .section-head::after { content: ''; flex: 1; height: 1px; background: var(--line) }
        .section-head.active { color: var(--good) }
        .cpr-pill { display: inline-block; font-family: var(--font-mono); font-size: .72rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; font-variant-numeric: tabular-nums; white-space: nowrap }
        .cpr-cell { padding: 4px 2px !important }
        .ads-delta { font-weight: 700; font-size: .8rem }
        .ads-delta-good { color: var(--good) }
        .ads-delta-bad { color: #c0392b }
        .ads-row { cursor: pointer }
        .ads-row:hover td { background: var(--surface-2) }
        .ads-sub td:first-child { padding-left: 26px; color: var(--ink-2); font-size: .8rem }
        .ads-sub-num, .ads-note { display: block; font-size: .7rem; color: var(--ink-3); font-weight: 500; white-space: nowrap }
        .ads-note { white-space: normal; max-width: 260px }
        .sdt-val { font-weight: 600; color: var(--good) }
        .week-label { font-size: .66rem; white-space: nowrap }
        table th { font-size: .72rem; white-space: nowrap }
        .ad-name-col { white-space: nowrap }
        .inactive-table { opacity: 0.7 }
        .ads-picker { max-width: 460px; margin-bottom: 14px }
        .ads-picker label { display: block; margin-bottom: 4px }
        .ads-picker-input { width: 100%; background: var(--surface); color: var(--ink); border: 1px solid var(--line-2); border-radius: 8px; padding: 8px 12px; font-size: .86rem; outline: none }
        .ads-picker-input:focus { border-color: var(--accent) }
        .ads-camp-head { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-bottom: 4px }
        .ads-camp-head h3 { margin: 0; font-size: 1rem }
        .ads-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 12px 0 14px }
        .ads-stat { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 12px 14px }
        .ads-stat .num { font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -.02em }
        .ads-stat .lab { font-size: .72rem; color: var(--ink-3); font-weight: 500; margin-top: 2px }
        @media (max-width: 640px) {
          .ads-stats { grid-template-columns: repeat(2, 1fr) }
          .cpr-pill { font-size: .66rem; padding: 2px 5px }
        }
      `}</style>

      <DecisionPanel judged={judged} periodLabel={latestLabel} onOpen={open} />

      <div className="ads-tabs" ref={tabsRef} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`view-btn${tab === t.id ? " on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "rank" && <RankingTable judged={judged} periodLabel={latestLabel} onOpen={open} />}
      {tab === "trend" && <TrendTable weeks={weeks} groups={groups} verdicts={verdicts} onOpen={open} />}
      {tab === "camp" && (
        <CampDetail weeks={weeks} groups={groups} verdicts={verdicts} selected={selected} onSelect={setSelected} />
      )}
      {tab === "period" && (
        <PeriodDetail weeks={weeks} periodIdx={periodIdx} onPeriod={setPeriodIdx} onOpen={open} />
      )}
    </>
  );
}
