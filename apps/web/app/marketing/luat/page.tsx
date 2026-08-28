import Link from "next/link";
import { listRules } from "@/lib/marketing/content";

export const metadata = { title: "Luật QC & nguồn" };

export default function Page() {
  const rules = listRules();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Luật &amp; tuân thủ</div>
        <h1>Luật QC &amp; nguồn dẫn chứng</h1>
        <p>
          Toàn bộ rule đang có trong Marketing Kit — render thẳng từ <code>rules/*.md</code> ở gốc repo, không chép
          lại. <b>Luật QC thắng mọi rule khác.</b>
        </p>
      </div>

      {rules.length === 0 ? (
        <div className="empty">
          Không thấy thư mục <code>rules/</code>. Chạy <code>npm run sync:rules</code> trong <code>marketing-os/</code>.
        </div>
      ) : (
        <div className="grid grid-2">
          {rules.map((r) => (
            <Link className="card link" href={`/marketing/luat/${r.slug}`} key={r.slug}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="chip mono">rules/{r.slug}.md</span>
              </div>
              <h3>{r.title}</h3>
              {r.blurb && <p style={{ marginTop: 6 }}>{r.blurb}</p>}
              <div className="go">Mở →</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
