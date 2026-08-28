import Link from "next/link";
import { THEO_KENH, TUYEN, TY_TRONG } from "@/lib/marketing/data/a5-detail";
import { A5 } from "@/lib/marketing/data/frameworks";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Chiến lược 5A" };

export default function Page() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Khung ① — Chiến lược</div>
        <h1>Chiến lược nội dung 5A (A1–A5)</h1>
        <p>
          Năm <b>chức năng chiến lược</b>, không phải năm định dạng cố định. Trước khi làm mỗi video, hỏi: video này
          đang làm nhiệm vụ gì trong hành trình khách hàng? <b>Bấm vào một tuyến để xem đầy đủ</b> — bản chất, lý
          thuyết nền, KPI, cách dùng AI, rủi ro AI, và đề tài áp cho GWT.
        </p>
      </div>

      <div className="grid grid-2">
        {A5.map((a) => {
          const t = TUYEN.find((x) => x.cat === a.c);
          return (
            <Link className="card link" href={`/wiki/marketing/khung/5a/${t?.slug ?? a.c.toLowerCase()}`} key={a.c}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className={`cat cat-${a.c}`}>{a.c}</span>
                <h3 style={{ margin: 0 }}>{a.name}</h3>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: ".86rem", margin: "0 0 8px" }}>
                <b style={{ color: "var(--ink)" }}>Nhiệm vụ:</b> {a.purpose}
              </p>
              {t && (
                <p style={{ margin: "0 0 10px", fontStyle: "italic", color: "var(--ink-3)" }}>{t.question}</p>
              )}
              <p style={{ margin: "0 0 10px" }}>{a.detail}</p>
              <div className="chip mono" style={{ fontSize: ".68rem" }}>KPI · {a.kpi}</div>
              <div className="go" style={{ marginTop: 11 }}>
                Xem chi tiết {t ? `· ${t.theory.name.split("(")[0].trim()}` : ""} →
              </div>
            </Link>
          );
        })}
      </div>

      <div className="page-head" style={{ margin: "30px 0 12px" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Tỷ trọng theo giai đoạn thương hiệu</h1>
        <p style={{ fontSize: ".86rem" }}>
          Thương hiệu càng non càng cần độ phủ; càng trưởng thành càng cần chiều sâu, trust và chuyển đổi hiệu quả.
        </p>
      </div>
      <div className="grid grid-3">
        {TY_TRONG.map((g) => (
          <div className="card" key={g.stage} style={g.now ? { borderColor: "var(--accent)" } : undefined}>
            <h3 style={{ fontSize: ".93rem" }}>
              {g.stage}
              {g.now && <span className="chip" style={{ marginLeft: 7 }}>GWT đang ở đây</span>}
            </h3>
            <ul style={{ margin: "8px 0 0", paddingLeft: "1.15em", fontSize: ".85rem", color: "var(--ink-2)" }}>
              {g.items.map((i) => <li key={i} style={{ margin: ".3em 0" }}>{i}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="page-head" style={{ margin: "30px 0 12px" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Tỷ trọng theo loại kênh</h1>
        <p style={{ fontSize: ".86rem" }}>Cùng bộ 5A nhưng kênh chính thức và kênh nhân vật chia tỷ trọng rất khác nhau.</p>
      </div>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {THEO_KENH.map((k) => (
          <div className="card" key={k.kenh} style={k.now ? { borderColor: "var(--accent)" } : undefined}>
            <h3>
              {k.kenh}
              {k.now && <span className="chip" style={{ marginLeft: 7 }}>mô hình GWT</span>}
            </h3>
            <p style={{ marginBottom: 12 }}>{k.note}</p>
            <table style={{ minWidth: 0 }}>
              <tbody>
                {k.rows.map((r) => (
                  <tr key={r.cat} style={{ cursor: "auto" }}>
                    <td style={{ width: 44 }}><span className={`cat cat-${r.cat}`}>{r.cat}</span></td>
                    <td className="num-cell" style={{ width: 52, fontWeight: 700 }}>{r.pct}</td>
                    <td style={{ width: 54, fontSize: ".8rem", color: "var(--ink-3)" }}>{r.label}</td>
                    <td style={{ fontSize: ".82rem" }}>{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="read" style={{ marginTop: 28 }}>
        <h2>Không phải 5 loại bài, mà là 5 chức năng</h2>
        <p>
          Sai lầm phổ biến là xem A1–A5 như 5 “format” cố định. Một video có thể nghiêng 70% A1 và 30% A2; một video
          khác là A3 nhưng gắn CTA của A4. Khi lập kế hoạch content, đội ngũ phải trả lời rõ 4 câu:
        </p>
        <ul>
          <li>Nội dung này đang làm <b>nhiệm vụ gì</b>?</li>
          <li>Nó phục vụ <b>giai đoạn nào</b> trong tâm lý khách hàng?</li>
          <li>Nó đóng góp gì cho <b>brand building</b>?</li>
          <li>Nó hỗ trợ gì cho <b>sales activation</b>?</li>
        </ul>
        <p>
          Tư duy này tránh hai cực đoan: chỉ làm viral mà không chuyển hoá thành thương hiệu, hoặc chỉ làm chuyên
          môn/bán hàng mà không đủ độ phủ để tăng trưởng.
        </p>
        <div className="notice">
          <Icon.warn />
          <div>KPI đo bằng <b>SĐT/inbox + đơn chốt</b>, KHÔNG bằng view — view phụ thuộc ngân sách bơm ads.</div>
        </div>
      </div>
    </section>
  );
}
