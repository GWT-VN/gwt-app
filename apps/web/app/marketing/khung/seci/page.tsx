import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "SECI playbook" };

const STEPS = [
  { k: "S", n: "Xã hội hoá", en: "Socialization", flow: "xã hội → tri thức ẩn cá nhân",
    d: "Xem video của mình (con tốt/con xấu), xem kênh khác, tiếp xúc khách, trao đổi — nhưng phải CÓ MỤC TIÊU." },
  { k: "E", n: "Ngoại hoá", en: "Externalization", flow: "tri thức ẩn → tri thức hiện",
    d: "Cố mô tả ra ngoài điều mình cảm nhận — nhận xét, nguyên tắc, tiêu chuẩn. Chính là buổi review.", star: true },
  { k: "C", n: "Kết hợp", en: "Combination", flow: "hiện → hiện",
    d: "Ghép góp ý của mọi người thành khung / quy trình / bài học chung." },
  { k: "I", n: "Nội hoá", en: "Internalization", flow: "hiện → ẩn cá nhân",
    d: "Áp vào tay làm cho tới khi thành phản xạ." },
];

const AGENDA = [
  ["Mở buổi", "Nhắc khung PAAST + mục tiêu buổi. 5 phút."],
  ["Đối chiếu tuần trước", "Chiếu video đã sửa tuần trước + kết quả WIN/FAIL, cập nhật số thật."],
  ["Từng người trình bày", "Chiếu clip của mình → TỰ chấm PAAST trước khi nghe góp ý."],
  ["Cả nhóm góp ý theo PAAST", "Góp ý theo từng chữ, không nói “hay/dở” chung chung. Người dẫn chốt hướng sửa."],
  ["Rút công thức từ video WIN", "Video win tuần này thắng nhờ cái gì → viết thành công thức nhân bản."],
  ["Content sưu tầm", "“Mượn phải khéo” — chuyển đổi sang GWT, kể theo mạch khác."],
  ["Giao việc", "Ai sửa video nào, KPI tuần, deadline."],
];

export default function Page() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Khung ⑤ — Vòng học</div>
        <h1>SECI playbook</h1>
        <p>
          Buổi review <b>không phải “chấm bài”</b> — nó là SECI (mô hình quản trị tri thức của Nonaka), để tri thức
          chảy từ người này sang người khác và <b>cả tập thể giỏi lên</b>, không phụ thuộc một cá nhân giỏi.
        </p>
      </div>

      <div className="notice">
        <Icon.check />
        <div>
          Sản phẩm quan trọng nhất của buổi này không phải video đã sửa — mà là{" "}
          <b>sự tiến bộ của con người và chất lượng phối hợp của đội</b>.
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {STEPS.map((s) => (
          <div className="card" key={s.k}>
            <h3>
              {s.k} — {s.n}
              {s.star && <span className="chip" style={{ marginLeft: 6 }}>quan trọng nhất</span>}
            </h3>
            <div className="chip mono" style={{ fontSize: ".66rem", marginBottom: 8 }}>
              {s.en} · {s.flow}
            </div>
            <p>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="read">
        <h2>Hai loại tri thức</h2>
        <ul>
          <li><b>Tri thức ẩn (tacit):</b> biết mà không nói ra được — cảm giác nghề, biết cái nào “wow”.</li>
          <li><b>Tri thức hiện (explicit):</b> mô tả được ra ngoài nên truyền đi được — chính là wiki này.</li>
        </ul>

        <h2>Điều kiện để buổi chạy được</h2>
        <ul>
          <li><b>Có tiêu chuẩn / khung</b> — chính là PAAST. Không có khung thì mỗi người nhận xét theo cảm tính, thảo luận phân tán.</li>
          <li><b>Có người dẫn mà mọi người muốn tham gia</b> — không phải trình bày hay, mà lôi kéo được sự tham gia.</li>
          <li><b>Mức độ tham gia đủ cao</b> — team hiện còn ít người chủ động đóng góp. Đây là chỗ đuối nhất, phải đẩy.</li>
          <li><b>Có theo dõi sau buổi</b> — nhóm trưởng kiểm tra sản phẩm đã cập nhật chưa, người đó có thật sự tiến bộ không.</li>
          <li><b>Liên tục cải tiến chính buổi SECI</b> — thành viên chưa tiến bộ thì phải sửa cách tổ chức buổi, không phải chỉ trách người.</li>
        </ul>
      </div>

      <div className="page-head" style={{ marginTop: 26 }}>
        <h1 style={{ fontSize: "1.2rem" }}>Agenda buổi gợi ý</h1>
      </div>
      <div className="steps">
        {AGENDA.map(([t, d]) => (
          <div className="step" key={t}>
            <div><b>{t}</b><p>{d}</p></div>
          </div>
        ))}
      </div>

      <div className="read">
        <h2>Kỷ luật vòng sửa (bắt buộc)</h2>
        <p>
          người nhận xét góp ý → người làm <b>sửa</b> → <b>đổ lên cho xem</b> → đăng / chưa đăng →{" "}
          <b>theo dõi tới khi xong</b>. <i>“Con nào được sửa thì rất chân quý.”</i>
        </p>

        <h2>Bài học vận hành từ những buổi đã chạy</h2>
        <ul>
          <li>Đẩy <b>mức độ tham gia</b> — team dễ đuối đúng chỗ này.</li>
          <li>Mỗi video phải sinh ra ít nhất <b>1 điểm học</b>, không chỉ “sửa xong rồi thôi”.</li>
          <li>Lỗi <b>lặp lại</b> (vd hiểu sai Acknowledge) → mở buổi đào tạo riêng, đừng nhắc lại lần thứ n.</li>
          <li>KPI phải <b>đo được</b>: SĐT/inbox + đơn chốt, không phải view.</li>
          <li>Nhóm trưởng theo sát tiến bộ từng người — sản phẩm lớn nhất của nhóm trưởng chính là các buổi SECI.</li>
        </ul>
      </div>
    </section>
  );
}
