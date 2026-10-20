import { PRODUCT_GROUPS, type Camp, type Decision, type Verdict } from "@/lib/marketing/ads-analysis";
import { campLabel, money } from "./shared";

export type Judged = { camp: Camp; verdict: Verdict };

const COLUMNS: { decision: Decision; title: string; hint: string; dot: string }[] = [
  { decision: "off", title: "Nên tắt", hint: "Đắt quá chuẩn hoặc gần như không ra result", dot: "var(--a4)" },
  { decision: "scale", title: "Nên tăng budget", hint: "Rẻ hơn chuẩn từ 20% trở lên, ổn định ≥ 2 kỳ", dot: "var(--good)" },
  { decision: "watch", title: "Theo dõi kỹ", hint: "Camp mới, đang đắt dần, hoặc vượt chuẩn", dot: "var(--warn)" },
];

export default function DecisionPanel({
  judged,
  periodLabel,
  onOpen,
}: {
  judged: Judged[];
  periodLabel: string;
  onOpen: (key: string) => void;
}) {
  const stale = judged.filter((j) => j.verdict.decision === "stale");

  return (
    <section className="ads-decide">
      <div className="ads-decide-head">
        <h2>Cần quyết định · kỳ {periodLabel}</h2>
        <span className="ads-muted">
          Chuẩn cost/result: {PRODUCT_GROUPS.uong.label.toLowerCase()} {money(PRODUCT_GROUPS.uong.benchmarkCpr)} ·{" "}
          {PRODUCT_GROUPS.tong.label.toLowerCase()} {money(PRODUCT_GROUPS.tong.benchmarkCpr)}
        </span>
      </div>
      <div className="ads-decide-grid">
        {COLUMNS.map((col) => {
          const list = judged
            .filter((j) => j.verdict.decision === col.decision)
            .sort((a, b) => (b.verdict.ratio ?? 0) - (a.verdict.ratio ?? 0));
          return (
            <div key={col.decision} className="ads-decide-card">
              <div className="ads-decide-title">
                <span className="ads-dot" style={{ background: col.dot }} />
                {col.title} <span className="ads-muted">({list.length})</span>
              </div>
              <div className="ads-muted ads-decide-hint">{col.hint}</div>
              {list.length === 0 && <div className="ads-muted ads-decide-item">Không có</div>}
              {list.map(({ camp, verdict }) => (
                <button key={camp.key} type="button" className="ads-decide-item" onClick={() => onOpen(camp.key)}>
                  <div className="ads-decide-name">{campLabel(camp)}</div>
                  {verdict.reasons.map((r) => (
                    <div key={r} className="ads-reason">{r}</div>
                  ))}
                  {verdict.flags.map((f) => (
                    <div key={f} className="ads-flag">{f}</div>
                  ))}
                  {camp.note && <div className="ads-muted">Ghi chú: {camp.note}</div>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      {stale.length > 0 && (
        <p className="ads-flag ads-stale">
          Ghi “đang chạy” nhưng không có số kỳ này: {stale.map((j) => campLabel(j.camp)).join(" · ")} — đã tắt thì
          báo để cập nhật.
        </p>
      )}
    </section>
  );
}
