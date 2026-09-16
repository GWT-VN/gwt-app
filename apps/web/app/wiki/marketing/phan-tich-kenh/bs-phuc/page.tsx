import Link from "next/link";
import { Icon } from "@/lib/marketing/icons";

export const metadata = { title: "Phân tích kênh BS Phúc" };

/* Dữ liệu bảng để nội dung tách khỏi layout */

const KENH = [
  {
    ten: "Làm chậm lão hóa",
    handle: "@tshuuphuc.chamlaohoa",
    so: "Follower 12.3K · Like 79.4K · vid đầu 12/11/2025",
    view: "Ổn định, ~mấy nghìn view/video",
    vaitro: "Kênh chính / flagship — audience-driven, chăm kỹ hơn",
  },
  {
    ten: "Khoa học lão hóa",
    handle: "@huuphuc.khoahoclaohoa",
    so: "6.008 follower · 33.5K like · ~130 video · vid đầu 23/10/2025",
    view: "Phương sai cao — baseline vài trăm, thỉnh thoảng >200K",
    vaitro: "Kênh farm / thử nghiệm — sống nhờ FYP, hay reup & edit thô",
  },
  {
    ten: "Phục hồi",
    handle: "@tshuuphuc.phuchoi",
    so: "Follower 1.668 · Like 12.7K · vid đầu 10/11/2025",
    view: "Trung bình quanh mấy trăm",
    vaitro: "—",
  },
];

const FLOW = [
  ["1", "HOOK", "Câu hỏi / tương phản / hành động lạ trong 3 giây đầu"],
  ["2", "(CREDENTIAL)", "“TS Đặng Hữu Phúc, ĐH Trung Y Dược Thượng Hải” — không phải vid nào cũng có; vid có thì trust cao hơn"],
  ["3", "OPEN LOOP", "Hứa “4 bí kíp, chú ý số 4” HOẶC hỏi ngược “trước hết phải làm rõ X”"],
  ["4", "BODY 1-2-3-4", "Chia mục đánh số, MỖI mục 1 frame riêng; jargon giải thích ngay tại chỗ"],
  ["5", "BẰNG CHỨNG", "Mượn nghiên cứu (California, Kobe, Phần Lan) + người nổi tiếng (Tôn Vân Vân, Trần Truyền Đa, Bryan Johnson, Kardashian)"],
  ["6", "“NGƯỜI BÌNH THƯỜNG”", "Hạ rào cản: “bạn cũng làm được / chi phí thấp”"],
  ["7", "LEAD MAGNET", "“TS đã tổng hợp một bộ ghi chú chi tiết…” — chính là phễu thu khách"],
  ["8", "CTA", "“lưu lại / thả tim kẻo lướt qua mất không tìm lại được”"],
  ["9", "OUTRO CHỮ KÝ", "Đổi tone + nhạc nền: “TS Hữu Phúc sẵn sàng lắng nghe và đồng hành cùng bạn. Chúc bạn và gia đình mãi trẻ.”"],
];

const GIU_CHAN = [
  ["Open loop / trả lời sau", "“Chú ý bí kíp thứ 4”, “làm rõ cholesterol trước”", "Tạo khoảng trống tò mò, não muốn đóng vòng lặp → xem tới cuối"],
  ["Tương phản (contrast)", "Bryan 2 triệu đô vs trứng gà", "Vừa gợi khát khao vừa hạ rào cản “mình cũng làm được”"],
  ["Mượn uy tín người nổi tiếng", "Tôn Vân Vân, Trần Truyền Đa, Kardashian…", "Bằng chứng xã hội — “sao họ làm thì chắc đúng”"],
  ["Đánh số + frame riêng mỗi mục", "Vid listicle", "Thanh tiến độ trực quan, giảm tỉ lệ lướt giữa video"],
  ["Giải thích jargon tại chỗ", "choline, glycation", "Không ai bị bỏ lại → xem hết → cảm giác hiểu ra điều mới"],
  ["Ảnh minh họa khớp lời", "fructose→Coca, glycation→da xệ", "Giảm tải nhận thức, nghe + thấy nhớ lâu hơn"],
  ["Xử lý phản đối sớm", "cholesterol (vid trứng)", "Gỡ nghi ngờ trước khi bán lợi ích → người hoài nghi thành người tin"],
  ["Save-bait CTA", "“lưu kẻo không tìm lại được”", "Đánh vào nỗi sợ mất thông tin → tăng lượt lưu (tín hiệu tốt cho thuật toán)"],
  ["Outro chữ ký + nhạc", "Mọi video", "Nhận diện thương hiệu, tạo nghi thức đóng video"],
];

const A5 = [
  ["A1 — Nhận biết", "Hook 3 giây + FYP đẩy tới người ngoài tệp follow (like:follow ~5.5:1). Tên kênh + chức danh “TS”.", "Sống nhờ hook + thuật toán, không nhờ follower sẵn"],
  ["A2 — Cuốn hút", "Tương phản, người nổi tiếng, hứa “bí kíp số 4”; avatar có kính hiển vi + học vị.", "Bước mạnh nhất: mỗi hook là lời hứa “trẻ đẹp mà không tốn tiền”"],
  ["A3 — Tìm hiểu", "Body giải thích cơ chế, giải thích jargon tại chỗ, xử lý phản đối. Comment hỏi-đáp.", "Vid có “việc để làm” (trứng) thì Ask sôi động; vid khái niệm (NAD+) thì Ask rỗng"],
  ["A4 — Hành động", "Lead magnet “bộ ghi chú” + CTA lưu/nhắn tin. Chưa phải mua — là để lại dấu vết.", "Save-bait thiết kế kỹ; Act thật (mua TPBS) nằm ở phễu sau, cần lần theo “bộ ghi chú”"],
  ["A5 — Ủng hộ", "Câu kết “đồng hành cùng bạn” + trả lời comment.", "Còn mỏng; chưa có cơ chế biến người xem thành người chủ động giới thiệu"],
];

function Note({ children, tone = "note" }: { children: React.ReactNode; tone?: "note" | "warn" | "tip" }) {
  const bg = tone === "warn" ? "rgba(220,120,20,.08)" : tone === "tip" ? "rgba(30,150,90,.08)" : "var(--surface-2, rgba(120,120,140,.07))";
  const bar = tone === "warn" ? "#d9822b" : tone === "tip" ? "#1e965a" : "var(--accent, #5b7cff)";
  return (
    <div style={{ background: bg, borderLeft: `3px solid ${bar}`, borderRadius: 8, padding: "12px 14px", margin: "12px 0", fontSize: ".9rem", lineHeight: 1.55 }}>
      <span style={{ fontWeight: 700, marginRight: 6 }}>💡</span>
      {children}
    </div>
  );
}

export default function Page() {
  return (
    <section className="view">
      <div className="page-head">
        <div className="eyebrow">Học hỏi · Phân tích kênh tham khảo</div>
        <h1>Kênh TS. Hữu Phúc — Chống lão hóa</h1>
        <p>
          Mổ xẻ hệ 3 kênh TikTok chống lão hóa của BS Phúc để hiểu <b>họ hút và giữ người xem bằng cách nào</b>, rồi
          rút công thức áp cho video nước GWT. Phân tích từng video (transcript đầy đủ + bóc tách) nằm ở{" "}
          <Link href="/wiki/marketing/du-lieu/phan-tich-sau">Phân tích chuyên sâu</Link>; các câu hook/CTA dùng lại ở{" "}
          <Link href="/wiki/marketing/du-lieu/kho-hook">Kho hook / CTA</Link>.
        </p>
      </div>

      <div className="notice" style={{ marginTop: 0 }}>
        <Icon.warn />
        <div>
          Đây là tài liệu <b>học nghề content</b> từ kênh tham khảo. Mọi số liệu/nghiên cứu trong các video là{" "}
          <b>nội dung sức khỏe của bên ngoài</b> — học <b>cấu trúc &amp; kỹ thuật</b>, tuyệt đối không bê claim sang
          nội dung GWT (bám <Link href="/wiki/marketing/luat">luật QC &amp; nguồn dẫn chứng</Link>).
        </div>
      </div>

      {/* 1. Hệ 3 kênh */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>1. Hệ thống 3 kênh chạy song song</h1>
        <p>Cùng một nhân vật + cùng công thức kịch bản, chạy trên 3 kênh đóng 3 vai khác nhau.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Kênh</th><th>Handle</th><th>Số liệu</th><th>Đặc điểm view</th><th>Vai trò (suy luận)</th></tr>
          </thead>
          <tbody>
            {KENH.map((k) => (
              <tr key={k.handle}>
                <td className="td-title">{k.ten}</td>
                <td><span className="tag">{k.handle}</span></td>
                <td style={{ fontSize: ".8rem" }}>{k.so}</td>
                <td style={{ fontSize: ".8rem", color: "var(--ink-3)" }}>{k.view}</td>
                <td style={{ fontSize: ".82rem" }}>{k.vaitro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        ~130 video/11 tháng ≈ <b>3 video/tuần đều đặn</b> — không phải làm ngẫu hứng mà là <b>guồng sản xuất công
        nghiệp</b>: một công thức kịch bản + một bộ khung edit, lắp nội dung mới vào là ra video. Toàn bộ file này là đi
        giải mã công thức lặp lại đó (mục 2).
      </Note>

      {/* 2. Flow chung */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>2. Flow chung — công thức 9 bước lặp lại</h1>
        <p>Gần như mọi video chạy trên cùng một khung xương. Nắm được khung này là viết kịch bản mới rất nhanh.</p>
      </div>
      <div className="card">
        <div style={{ display: "grid", gap: 8 }}>
          {FLOW.map(([n, k, d]) => (
            <div key={n} style={{ display: "grid", gridTemplateColumns: "28px auto 1fr", gap: 10, alignItems: "baseline" }}>
              <span className="chip mono" style={{ justifySelf: "center" }}>{n}</span>
              <b style={{ fontSize: ".82rem", whiteSpace: "nowrap" }}>{k}</b>
              <span style={{ fontSize: ".88rem", color: "var(--ink-2)", lineHeight: 1.5 }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      <Note>
        Vì sao khung hiệu quả: <b>bước 1–3</b> lo &ldquo;3 giây vàng&rdquo; (giữ chân đầu video) · <b>bước 4</b> lo
        &ldquo;giữa video&rdquo; (đánh số = thanh tiến độ tâm lý) · <b>bước 5–6</b> lo niềm tin + khả thi · <b>bước
        7–8</b> lo chuyển đổi (biến người xem thành lead) · <b>bước 9</b> lo thương hiệu (nhận diện).
      </Note>
      <Note tone="warn">
        <b>Rủi ro của công thức:</b> vid NAD+ cho thấy — nếu chỉ có khung mà thiếu chất (không có việc để làm, không có
        nhân vật) thì flow vẫn chạy nhưng <b>engagement rỗng</b>. Khung là điều kiện <i>cần</i>, nội dung cụ thể-đời-thường
        mới là điều kiện <i>đủ</i>.
      </Note>

      {/* 3. Kỹ thuật giữ chân */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>3. Kỹ thuật giữ chân người xem</h1>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Kỹ thuật</th><th>Ví dụ</th><th>Vì sao hiệu quả</th></tr></thead>
          <tbody>
            {GIU_CHAN.map(([a, b, c]) => (
              <tr key={a}>
                <td className="td-title" style={{ fontSize: ".85rem" }}>{a}</td>
                <td style={{ fontSize: ".8rem", color: "var(--ink-3)" }}>{b}</td>
                <td style={{ fontSize: ".85rem" }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Mô hình 5A */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>4. Kênh nhìn qua mô hình 5A (Kotler)</h1>
        <p>A1 Nhận biết → A2 Cuốn hút → A3 Tìm hiểu → A4 Hành động → A5 Ủng hộ. Kênh không chỉ làm video — kênh chạy cả một phễu.</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Giai đoạn</th><th>Kênh làm gì</th><th>Quan sát</th></tr></thead>
          <tbody>
            {A5.map(([a, b, c]) => (
              <tr key={a}>
                <td className="td-title" style={{ fontSize: ".85rem", whiteSpace: "nowrap" }}>{a}</td>
                <td style={{ fontSize: ".85rem" }}>{b}</td>
                <td style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        Kênh <b>rất mạnh ở A1–A2</b> (hook + cuốn hút) và có ý đồ rõ ở <b>A4</b> (lead magnet), nhưng <b>A3 phập phù</b>
        {" "}(tùy vid có &ldquo;việc để làm&rdquo;) và <b>A5 còn yếu</b> (dừng ở trả lời comment). Chân dung kênh{" "}
        <b>top-of-funnel thiên thu lead</b>: kéo thật nhiều người lạ vào rồi lùa về &ldquo;bộ ghi chú&rdquo;. Chỉ số{" "}
        <b>BAR</b> (Brand Advocacy — biến người xem thành người giới thiệu) gần như chưa khai thác — khoảng trống lớn nếu
        muốn tăng trưởng bền.
      </Note>

      {/* 5. Đa kênh */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>5. Vì sao chạy nhiều kênh + view chênh nhau</h1>
      </div>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="fl" style={{ marginBottom: 8 }}>Kênh &ldquo;farm&rdquo; — xổ số FYP (phương sai cao)</div>
          <p style={{ fontSize: ".88rem", lineHeight: 1.55, margin: 0 }}>
            Vài trăm view là baseline vì đa số video chỉ được đẩy cho một batch test nhỏ rồi tắt. Thỉnh thoảng 1 video
            chạm ngưỡng giữ chân → bùng 200K. Nơi hay reup & bản edit thô → chất lượng không đồng đều.
          </p>
        </div>
        <div className="card">
          <div className="fl" style={{ marginBottom: 8 }}>Kênh chính — audience-driven (ổn định)</div>
          <p style={{ fontSize: ".88rem", lineHeight: 1.55, margin: 0 }}>
            Có sàn view mười mấy K nghĩa là thuật toán đã &ldquo;tin&rdquo; kênh, mỗi lần đăng đều đẩy tới tệp quen. Được
            chăm hơn (edit kỹ, đăng đều).
          </p>
        </div>
      </div>
      <Note tone="tip">
        <b>Vì sao chủ động chạy nhiều kênh:</b> (1) chia rủi ro bay acc (nội dung sức khỏe + bán &ldquo;bộ ghi
        chú&rdquo; dễ bị flag); (2) A/B test hook/edit rẻ tiền ở kênh farm rồi nhân bản cái thắng sang kênh chính; (3)
        phủ nhiều ô đề xuất/tìm kiếm cùng một ngách; (4) tên kênh khác nhau bắt các tệp hơi khác nhau.
      </Note>
      <Note tone="warn">
        Đây là <b>giả thuyết đọc từ pattern</b>, chưa phải kết luận. Muốn chắc cần soi số thật: follower từng kênh, tần
        suất/thời điểm đăng, kênh lập trước, tỉ lệ reup vs original, loại video hay &ldquo;bùng&rdquo; ở kênh farm.
      </Note>

      {/* 6. Playbook GWT */}
      <div className="page-head" style={{ marginTop: 22 }}>
        <h1 style={{ fontSize: "1.25rem" }}>6. Rút ra cho GWT — kích comment về nước</h1>
        <p>4 đòn kích comment (từ đối chiếu vid trứng vs vid cơm), viết lại theo góc nước. Bản dùng lại đầy đủ ở Kho hook.</p>
      </div>
      <div className="card">
        <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10, fontSize: ".9rem", lineHeight: 1.55 }}>
          <li><b>Cho quy tắc chung, chừa ca ngoại lệ hở ra.</b> &ldquo;TDS dưới 50 là ổn&rdquo; (thòng &ldquo;còn tùy nguồn&rdquo;) → &ldquo;nhà tôi 180 có sao không?&rdquo;</li>
          <li><b>Chia khán giả thành nhóm.</b> &ldquo;Nước máy / giếng khoan / nước mưa, mỗi loại xử lý khác&rdquo; → &ldquo;nhà tôi giếng khoan thì lọc kiểu gì?&rdquo;</li>
          <li><b>Đưa một ngưỡng số để áp vào nhà mình.</b> &ldquo;Độ cứng trên 120 là nên xử lý&rdquo; → &ldquo;khu tôi 200 thì dùng bộ nào?&rdquo;</li>
          <li><b>Trả lời 1 câu hay gặp, hé còn nhiều ca.</b> &ldquo;Hay gặp nhất là nước mùi clo, mình trả lời luôn; nước vàng/có cặn thì comment mình xem riêng.&rdquo;</li>
        </ol>
      </div>
      <p style={{ fontSize: ".82rem", color: "var(--ink-3)", marginTop: 10 }}>
        Nguồn: tài liệu &ldquo;Phân tích Kênh Bác sĩ Phúc v2&rdquo; (2026-09-15). Dữ liệu từng video đã nạp vào{" "}
        <Link href="/wiki/marketing/du-lieu/phan-tich-sau">Phân tích chuyên sâu</Link>.
      </p>
    </section>
  );
}
