import Link from "next/link";
import { ALL_CASES } from "@/lib/marketing/data/cases";
import { LUAT_COUNT } from "@/lib/marketing/data/luat-sua";
import { listRules } from "@/lib/marketing/content";
import { Icon } from "@/lib/marketing/icons";
import { getCounts } from "@/lib/marketing/supabase-mkt";

const CARDS = [
  { href: "/wiki/marketing/khung/5a", icon: "layers", t: "Chiến lược 5A", d: "Video này làm nhiệm vụ gì: phủ, uy tín, niềm tin, chốt, hay hero." },
  { href: "/wiki/marketing/khung/paast", icon: "grid", t: "Khung PAAST", d: "Thẻ chấm 5 chữ để đánh giá & viết từng video: P·A·A·S·T." },
  { href: "/wiki/marketing/khung/luat-sua", icon: "edit", t: "Luật sửa content", d: "Các nguyên tắc sửa kịch bản rút ra từ những buổi review." },
  { href: "/wiki/marketing/khung/quy-trinh", icon: "film", t: "Quy trình sản xuất", d: "Từ chuẩn bị quay đến làm việc với editor ngoài." },
  { href: "/wiki/marketing/khung/seci", icon: "refresh", t: "SECI playbook", d: "Cách chạy buổi review để cả team giỏi lên, không phụ thuộc 1 người." },
  { href: "/wiki/marketing/du-lieu/phan-tich-video", icon: "chart", t: "Dữ liệu phân tích video", d: "Video viral đã mổ — bóc riêng hook, câu kết, câu kêu gọi từ transcript." },
  { href: "/wiki/marketing/kho-case", icon: "book", t: "Kho case WIN / FAIL", d: "33 ca đã chấm qua các buổi SECI, mỗi ca ghi đủ điểm sai và hướng sửa." },
] as const;

export default async function Home() {
  const counts = await getCounts();
  const rules = listRules().length;

  const stats = [
    { n: counts.analyses ?? "—", l: "Video đã phân tích", href: "/wiki/marketing/du-lieu/phan-tich-video" },
    { n: counts.ideas ?? "—", l: "Video ideas cho GWT", href: "/wiki/marketing/du-lieu/video-ideas" },
    { n: 5, l: "Khung làm việc", href: "/wiki/marketing/khung/5a" },
    { n: LUAT_COUNT, l: "Luật sửa content", href: "/wiki/marketing/khung/luat-sua" },
    { n: ALL_CASES.length, l: "Ca WIN/FAIL đã mổ", href: "/wiki/marketing/kho-case" },
    { n: rules, l: "Luật tuân thủ", href: "/wiki/marketing/luat" },
  ];

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Bản đồ hệ thống</div>
        <h1>Một nơi cho toàn bộ cách team làm video</h1>
        <p>
          Chiến lược, khung chấm, luật sửa, quy trình sản xuất và dữ liệu — gom về một chỗ. Bấm vào ô để mở, hoặc
          dùng thanh bên trái.
        </p>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <Link className="stat" href={s.href} key={s.l} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <div className="num">{s.n}</div>
            <div className="lab">{s.l}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-3">
        {CARDS.map((c) => {
          const Ic = Icon[c.icon];
          return (
            <Link className="card link" href={c.href} key={c.href}>
              <div className="card-ic"><Ic /></div>
              <h3>{c.t}</h3>
              <p>{c.d}</p>
              <div className="go">Mở →</div>
            </Link>
          );
        })}
      </div>

      <div className="notice" style={{ marginTop: 26 }}>
        <Icon.warn />
        <div>
          Muốn <b>thêm/sửa</b> dữ liệu phân tích hay ý tưởng? Vẫn làm qua chat + skill như hiện tại (
          <span className="chip mono">transcribe_video</span>) — web bản này <b>chỉ đọc</b>.
        </div>
      </div>
    </section>
  );
}
