import { fmt, METRIC_LABEL } from "@/lib/marketing/format";

/** Các mảnh dựng nội dung drawer — dùng lại giữa 2 trang dữ liệu. */

export function Field({
  label,
  children,
  formula = false,
}: {
  label: string;
  children: React.ReactNode;
  formula?: boolean;
}) {
  return (
    <div className={`field-block${formula ? " formula" : ""}`}>
      <div className="fl">{label}</div>
      <div className="fv">{children}</div>
    </div>
  );
}

export function Chips({ items, hash = false }: { items: (string | null)[] | null; hash?: boolean }) {
  const list = (items ?? []).filter((x): x is string => Boolean(x));
  if (!list.length) return <span style={{ color: "var(--ink-3)" }}>—</span>;
  return (
    <div className="chips-wrap">
      {list.map((s, i) =>
        hash ? (
          <span className="tag" key={`${s}-${i}`}>#{s}</span>
        ) : (
          <span className="chip" key={`${s}-${i}`}>{s}</span>
        ),
      )}
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: Record<string, number | null> | null }) {
  const entries = Object.entries(metrics ?? {}).filter(([, v]) => typeof v === "number");
  if (!entries.length) return <span style={{ color: "var(--ink-3)", fontSize: ".88rem" }}>Chưa có số liệu.</span>;
  return (
    <div className="metricgrid">
      {entries.map(([k, v]) => (
        <div className="m" key={k}>
          <div className="mv">{fmt(v as number)}</div>
          <div className="ml">{METRIC_LABEL[k] ?? k.replace(/_/g, " ")}</div>
        </div>
      ))}
    </div>
  );
}

export function CatBadge({ cat }: { cat: string | null }) {
  if (!cat) return <span className="tag">chưa phân tuyến</span>;
  return <span className={`cat cat-${cat}`}>{cat}</span>;
}
