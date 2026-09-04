import Link from "next/link";
import { notFound } from "next/navigation";
import { TAI_LIEU } from "@/lib/wiki/data/san-pham";
import { HANG } from "@/lib/wiki/kieu";
import { KHU } from "@/lib/wiki/nav";
import { Icon } from "@/lib/marketing/icons";

export function generateStaticParams() {
  return TAI_LIEU.map((k) => ({ khu: k.khu }));
}

export async function generateMetadata({ params }: { params: Promise<{ khu: string }> }) {
  const { khu } = await params;
  const meta = KHU.find((k) => k.ma === khu);
  return { title: meta ? `${meta.ten} · Wiki GWT` : "Wiki GWT" };
}

/**
 * Trang danh sách của một khu tài liệu dạng trang.
 *
 * Route ĐỘNG nên nó chỉ nhận những khu KHÔNG có thư mục riêng: `/wiki/san-pham` và
 * `/wiki/marketing` có route tĩnh nên Next ưu tiên chúng, không rơi vào đây.
 */
export default async function TrangKhu({ params }: { params: Promise<{ khu: string }> }) {
  const { khu } = await params;
  const meta = KHU.find((k) => k.ma === khu);
  const noiDung = TAI_LIEU.find((k) => k.khu === khu);
  if (!meta || !noiDung) notFound();

  // Gom theo nhóm nếu bài có khai báo `nhom`; không thì một danh sách phẳng.
  const nhom = new Map<string, typeof noiDung.bai>();
  for (const b of noiDung.bai) {
    const k = b.nhom || "";
    if (!nhom.has(k)) nhom.set(k, []);
    nhom.get(k)!.push(b);
  }

  const coHangD = noiDung.bai.some((b) => b.hang === "D");

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Wiki nội bộ</div>
        <h1>
          <span aria-hidden="true">{meta.icon}</span> {meta.ten}
        </h1>
        <p>{meta.moTa}</p>
      </div>

      {coHangD && (
        <div className="notice" style={{ marginBottom: 20 }}>
          <Icon.warn />
          <div>
            Khu này có tài liệu <b>hạng D</b> — bản AI tổng hợp, chưa đối chiếu nguồn gốc.
            Đọc để hiểu bối cảnh, <b>⛔ không trích số cho khách</b>. Số nói với khách phải
            truy được về một mã <span className="chip mono">F-xxx</span> trong PKB của máy.
          </div>
        </div>
      )}

      {[...nhom.entries()].map(([tenNhom, bai]) => (
        <div key={tenNhom || "_"}>
          {tenNhom && <h2 className="wiki-tieu-de-muc">{tenNhom}</h2>}
          <div className="grid grid-2">
            {bai.map((b) => (
              <Link className="card link" href={`/wiki/${khu}/${b.slug}`} key={b.slug}>
                <h3>{b.tieuDe}</h3>
                {b.nguon && <p>{b.nguon}</p>}
                {b.hang && (
                  <div className="wiki-the-meta">
                    <span className={`chip hang-${b.hang}`} title={HANG[b.hang] ?? ""}>
                      Hạng {b.hang}
                    </span>
                  </div>
                )}
                <div className="go">Đọc →</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
