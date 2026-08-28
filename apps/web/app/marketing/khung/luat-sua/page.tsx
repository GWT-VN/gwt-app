import Link from "next/link";
import { LUAT_COUNT, LUAT_GROUPS } from "@/lib/marketing/data/luat-sua";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Luật sửa content" };

export default function Page() {
  // Số thứ tự chạy suốt 8 nhóm. Trước đây dùng biến `let n` rồi ++ ngay trong JSX —
  // React có thể render lại một phần cây, biến sẽ đếm sai. Tính sẵn mốc đầu mỗi nhóm.
  const offsets: number[] = [];
  LUAT_GROUPS.reduce((acc, g) => {
    offsets.push(acc);
    return acc + g.items.length;
  }, 0);
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Khung ③ — Luật sửa</div>
        <h1>Luật sửa content</h1>
        <p>
          {LUAT_COUNT} nguyên tắc lặp đi lặp lại qua các buổi review — “tri thức ẩn” của CEO Thiện biến thành luật tra
          cứu được. Đọc mục này <b>trước khi viết kịch bản mới</b>.
        </p>
      </div>

      <div className="notice">
        <Icon.warn />
        <div>
          Đây là luật <b>nội dung</b>. Khi va nhau với <b>luật quảng cáo VN</b> (
          <Link href="/marketing/luat/ad-compliance-vn">rules/ad-compliance-vn.md</Link>) thì luật QC thắng.
        </div>
      </div>

      {LUAT_GROUPS.map((group, gi) => (
        <div key={group.g} style={{ marginTop: 28 }}>
          <div className="page-head" style={{ margin: "0 0 12px" }}>
            <h1 style={{ fontSize: "1.15rem", margin: "0 0 .2em" }}>{group.g}</h1>
            <p style={{ fontSize: ".86rem" }}>{group.sub}</p>
          </div>
          <div className="principles">
            {group.items.map((l, li) => {
              const n = offsets[gi] + li + 1;
              return (
                <div className="principle" key={l.t}>
                  <div className="pn">{String(n).padStart(2, "0")}</div>
                  <div className="pc">
                    <b>{l.t}</b>
                    <span className="tag" style={{ marginLeft: 8, verticalAlign: "middle" }}>{l.from}</span>
                    <p>{l.d}</p>
                    {l.gwt && (
                      <p style={{ marginTop: 8, color: "var(--accent-strong)", fontWeight: 500 }}>
                        ▸ Áp cho GWT: <span style={{ color: "var(--ink-2)", fontWeight: 400 }}>{l.gwt}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
