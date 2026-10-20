import type { Camp, Decision } from "@/lib/marketing/ads-analysis";

/** Tiền (đồng) → "689k" / "12,6tr". */
export function money(dong: number): string {
  if (dong >= 1_000_000) return `${(dong / 1_000_000).toFixed(1).replace(".", ",")}tr`;
  return `${Math.round(dong / 1000)}k`;
}

/** Số lẻ 1 chữ số kiểu Việt: 2,4 */
export function dec1(v: number): string {
  return v.toFixed(1).replace(".", ",");
}

export function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function campLabel(c: Pick<Camp, "creative" | "name" | "startDate">): string {
  return c.name === c.creative ? `${c.name} · lên ${c.startDate}` : `${c.creative} · ${c.name} · lên ${c.startDate}`;
}

type Tone = "good" | "ok" | "warn" | "bad";

/** Màu theo CPR so với chuẩn: ≤ 80% xanh lá · ≤ chuẩn xanh dương · < 1,5 lần vàng · còn lại đỏ. */
export function toneOf(cpr: number, benchmark: number): Tone {
  const r = cpr / benchmark;
  if (r <= 0.8) return "good";
  if (r <= 1) return "ok";
  if (r < 1.5) return "warn";
  return "bad";
}

const TONE_VARS: Record<Tone, [string, string]> = {
  good: ["var(--good-bg)", "var(--a3-ink)"],
  ok: ["var(--a2-bg)", "var(--a2-ink)"],
  warn: ["var(--warn-bg)", "var(--a1-ink)"],
  bad: ["var(--a4-bg)", "var(--a4-ink)"],
};

export function CprPill({ cpr, benchmark }: { cpr: number | null; benchmark: number }) {
  if (cpr == null) return <span className="ads-muted">—</span>;
  const [bg, ink] = TONE_VARS[toneOf(cpr, benchmark)];
  return (
    <span className="cpr-pill" style={{ background: bg, color: ink }}>
      {money(cpr)}
    </span>
  );
}

const DECISION: Record<Decision, { text: string; tone: Tone }> = {
  off: { text: "Nên tắt", tone: "bad" },
  scale: { text: "Tăng budget", tone: "good" },
  watch: { text: "Theo dõi kỹ", tone: "warn" },
  keep: { text: "Giữ nguyên", tone: "ok" },
  stale: { text: "Thiếu số", tone: "warn" },
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  const d = DECISION[decision];
  const [bg, ink] = TONE_VARS[d.tone];
  return (
    <span className="ads-badge" style={{ background: bg, color: ink }}>
      {d.text}
    </span>
  );
}

export function OffBadge() {
  return <span className="ads-badge ads-badge-off">Tắt</span>;
}

/** Mũi tên so với kỳ trước. `goodWhenUp` = tăng là tốt; `neutral` = chỉ báo hướng, không tô màu. */
export function Delta({
  cur,
  prev,
  goodWhenUp,
  neutral = false,
}: {
  cur: number | null;
  prev: number | null | undefined;
  goodWhenUp: boolean;
  neutral?: boolean;
}) {
  if (cur == null || prev == null || prev === 0) return null;
  const p = (cur - prev) / prev;
  if (Math.abs(p) < 0.05) return <span className="ads-delta ads-muted"> →</span>;
  const up = p > 0;
  const cls = neutral ? "ads-muted" : up === goodWhenUp ? "ads-delta-good" : "ads-delta-bad";
  return (
    <span className={`ads-delta ${cls}`} title={`${up ? "+" : "−"}${pct(Math.abs(p))} so với kỳ trước`}>
      {up ? " ↑" : " ↓"}
    </span>
  );
}
