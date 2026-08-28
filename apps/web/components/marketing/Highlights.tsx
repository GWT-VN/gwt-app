import { CTA_LABEL, ts, type Cue, type Extract } from "@/lib/marketing/transcript";

/** Một câu trích, có mốc thời gian + nhãn V (lời thoại) / T (chữ trên hình). */
function Line({ cue }: { cue: Cue }) {
  return (
    <div style={{ display: "flex", gap: 9, padding: "5px 0", alignItems: "baseline" }}>
      <span
        className="chip mono"
        title={cue.kind === "V" ? "Lời thoại" : "Chữ trên hình"}
        style={{ flex: "none", fontSize: ".64rem", padding: "1px 6px" }}
      >
        {cue.kind} {ts(cue.start)}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ color: "var(--ink)" }}>{cue.vi || cue.text}</span>
        {cue.vi && (
          <span style={{ display: "block", color: "var(--ink-3)", fontSize: ".8rem", marginTop: 2 }}>
            {cue.text}
          </span>
        )}
      </span>
    </div>
  );
}

function Box({
  label,
  hint,
  accent,
  children,
  empty,
}: {
  label: string;
  hint?: string;
  accent: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: "11px 14px",
      }}
    >
      <div className="fl" style={{ marginBottom: empty ? 0 : 6 }}>
        {label}
        {hint && (
          <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--ink-3)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Ba khối bóc riêng: câu hook mở đầu · câu kết · các câu kêu gọi. */
export default function Highlights({ extract }: { extract: Extract }) {
  const { hook, hookOnScreen, ending, ctas } = extract;
  const noData = !hook.length && !ending.length && !ctas.length;

  if (noData) {
    return (
      <div className="empty" style={{ padding: 16, fontSize: ".84rem" }}>
        Chưa bóc được — transcript trống hoặc không theo định dạng <code>[V]</code>/<code>[T]</code>.
      </div>
    );
  }

  // Gom CTA theo loại để thấy ngay video này dùng những đòn kêu gọi nào.
  const byKind = new Map<string, Cue[]>();
  for (const c of ctas) byKind.set(c.kind, [...(byKind.get(c.kind) ?? []), c.cue]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Box label="Hook mở đầu" hint=" · cửa ải 3 giây" accent="var(--a1)">
        {hook.map((c, i) => <Line cue={c} key={`h${i}`} />)}
        {hookOnScreen.length > 0 && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed var(--line)" }}>
            <div style={{ fontSize: ".7rem", color: "var(--ink-3)", marginBottom: 2 }}>Chữ trên hình frame đầu:</div>
            {hookOnScreen.map((c, i) => <Line cue={c} key={`hs${i}`} />)}
          </div>
        )}
      </Box>

      <Box label="Câu kết" hint=" · nhịp chốt" accent="var(--a3)">
        {ending.map((c, i) => <Line cue={c} key={`e${i}`} />)}
      </Box>

      {ctas.length > 0 ? (
        <Box label={`Câu kêu gọi (${ctas.length})`} accent="var(--a4)">
          {[...byKind.entries()].map(([kind, cues]) => (
            <div key={kind} style={{ marginBottom: 8 }}>
              <span className="chip" style={{ fontSize: ".7rem" }}>
                {CTA_LABEL[kind as keyof typeof CTA_LABEL]}
              </span>
              {cues.map((c, i) => <Line cue={c} key={`c${i}`} />)}
            </div>
          ))}
        </Box>
      ) : (
        <Box label="Câu kêu gọi" accent="var(--line-2)" empty>
          <div style={{ fontSize: ".84rem", color: "var(--ink-3)", marginTop: 4 }}>
            Không có câu kêu gọi nào — video này không chủ động kêu lưu / xem hết / theo dõi.
            <br />
            <span style={{ color: "var(--warn)" }}>
              Theo Luật sửa content #21: Action chỉ tính điểm khi kịch bản CHỦ ĐỘNG kêu gọi.
            </span>
          </div>
        </Box>
      )}
    </div>
  );
}
