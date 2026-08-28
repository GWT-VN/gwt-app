import CaseGrid from "@/components/marketing/CaseGrid";
import { ALL_CASES, countByVerdict } from "@/lib/marketing/data/cases";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Kho case WIN / FAIL" };

export default function Page() {
  const n = countByVerdict();

  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Học hỏi</div>
        <h1>Kho case WIN / FAIL</h1>
        <p>
          {ALL_CASES.length} ca đã mổ trong các buổi SECI — mỗi ca ghi đủ: nội dung video, chấm theo từng chữ PAAST,
          điểm đúng, điểm sai, lời CEO Thiện, hướng sửa, và <b>áp cho GWT thế nào</b>. Bấm vào một ca để xem đầy đủ.
        </p>
      </div>

      <div className="stats" style={{ marginBottom: 20 }}>
        <div className="stat"><div className="num">{n.win}</div><div className="lab">WIN</div></div>
        <div className="stat"><div className="num">{n.fix}</div><div className="lab">Sửa được</div></div>
        <div className="stat"><div className="num">{n.fail}</div><div className="lab">FAIL</div></div>
        <div className="stat"><div className="num">{n.drop}</div><div className="lab">Bỏ hẳn</div></div>
        <div className="stat"><div className="num">{n.ref}</div><div className="lab">Tham khảo</div></div>
      </div>

      <div className="notice">
        <Icon.warn />
        <div>
          VCB (kim hoàn) và Elation (Đông y) là <b>case đi học của bạn bè</b>, không phải brand team làm. Brand thật
          của team là <b>GWT (máy lọc nước)</b> — lấy <b>cách làm</b>, không lấy nội dung.
        </div>
      </div>

      <CaseGrid cases={ALL_CASES} />
    </section>
  );
}
