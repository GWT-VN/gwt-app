/**
 * Dữ liệu khung làm việc — hạt giống lấy từ bản mockup đã được duyệt.
 * Nguồn gốc: `Work GWT/Thiện Sharing/*`, `Work GWT/Quy trình/*`, `Tong-ket-buoi-hop-review-content.md`.
 * Đây là DỮ LIỆU CÓ CẤU TRÚC (thẻ, bảng) nên để ở .ts thay vì .md — trang khung render đúng bố cục mockup.
 */

export type A5Row = { c: "A1" | "A2" | "A3" | "A4" | "A5"; name: string; purpose: string; kpi: string; detail: string };

export const A5: A5Row[] = [
  {
    c: "A1",
    name: "Thú vị — Mass Traffic",
    purpose: "Mở phủ, tạo “quen mặt”",
    kpi: "Reach · View · Share · Follower · người xem mới",
    detail:
      "Insight phổ thông ngành, tình huống đời thường, meme bắt trend có liên hệ category, “sự thật thú vị / điều ít ai biết”. Ngắn, nhanh, dễ chia sẻ — nhưng phải mang mã gene thương hiệu, không lệch tệp.",
  },
  {
    c: "A2",
    name: "Chuyên gia — Authority",
    purpose: "Xác lập năng lực & thẩm quyền",
    kpi: "Save · Comment sâu · % xem hết · brand search",
    detail:
      "Phân tích chuyên môn sâu, bóc case, phản biện hiểu lầm, framework, so sánh lựa chọn. 3 tầng: kiến thức đúng + phán đoán có cơ sở + dấu ấn kể chuyện. Thiếu 2 tầng sau thì bị AI thay thế.",
  },
  {
    c: "A3",
    name: "Niềm tin — Human Proof",
    purpose: "Chứng minh tính người + tính thật",
    kpi: "Comment sâu · DM tham khảo · follower lạnh → ấm",
    detail:
      "Hậu trường thật, xử lý ca khó, phản hồi khách kèm bối cảnh, tiêu chuẩn nghề. “Perfection is intimidating, vulnerability is connecting.” Kỵ AI nhất — phải có dấu vết thật.",
  },
  {
    c: "A4",
    name: "Sản phẩm — Conversion",
    purpose: "Giảm ma sát, kích hoạt hành động",
    kpi: "DM/Inbox · Lead · CR · CPA",
    detail:
      "Demo trong tình huống thật, before/after có ngữ cảnh, xử lý phản đối, “phù hợp với ai / không phù hợp với ai”. Show, don’t tell — bằng chứng thay tính từ. Đừng “sa” thẳng vào quảng cáo.",
  },
  {
    c: "A5",
    name: "Kết hợp — Hero",
    purpose: "Vừa hút, vừa sâu, vừa tin, vừa chốt",
    kpi: "Tổng hợp + view-to-conversion + assisted revenue",
    detail:
      "Nội dung “đinh”, tài sản dài hạn. Phải có 1 trục chính (không ôm 4 việc ngang nhau). Chẻ nhỏ thành hàng chục A1/A2/A3 — cắt 80% chi phí sản xuất các tuyến khác.",
  },
];

export type PaastCol = { k: string; cls: string; t: string; sub: string; items: [string, string][] };

export const PAAST: PaastCol[] = [
  {
    k: "P", cls: "p-P", t: "Prefer — Ưu tiên", sub: "C.R.A.V.E.S",
    items: [
      ["C", "Curiosity — thoả tò mò"],
      ["R", "Reactions — cảm xúc mạnh"],
      ["A", "Aesthetics — thoả giác quan"],
      ["V", "Vicarious — sống thêm 1 đời"],
      ["E", "Enrichment — học hỏi"],
      ["S", "Superiority — khác biệt"],
    ],
  },
  {
    k: "A", cls: "p-A1", t: "Action — Hành động", sub: "S.F.A.C.E.S",
    items: [
      ["S", "Stop — cửa ải 3s đầu"],
      ["F", "Feel — like, đồng cảm"],
      ["A", "Answer — comment, tranh luận"],
      ["C", "Connect — share, lan toả"],
      ["E", "Engage — save, gắn bó"],
      ["S", "See again — rewatch"],
    ],
  },
  {
    k: "A", cls: "p-A2", t: "Acknowledge — Ghi nhận", sub: "B.R.A.N.D.S",
    items: [
      ["B", "Basics — SP/dịch vụ cốt lõi"],
      ["R", "Reasons — khác biệt & ưu/nhược"],
      ["A", "Audience — chân dung KH"],
      ["N", "Needs — bối cảnh sử dụng"],
      ["D", "Deeper — giá trị & tầm nhìn"],
      ["S", "Story — câu chuyện"],
    ],
  },
  {
    k: "S", cls: "p-S", t: "Stick — Đính lâu", sub: "S.T.I.C.K.S",
    items: [
      ["S", "Signature Face — nhân vật"],
      ["T", "Themed Stage — bối cảnh"],
      ["I", "Iconic Totem — biểu tượng"],
      ["C", "Core Mantra — câu thần chú"],
      ["K", "Kinetic Ritual — hành động lặp"],
      ["S", "Sonic Emotion — giọng/âm"],
    ],
  },
  {
    k: "T", cls: "p-T", t: "Trust — Tin cậy", sub: "T.R.U.S.T.S",
    items: [
      ["T", "Transparency — minh bạch"],
      ["R", "Responsibility — trách nhiệm"],
      ["U", "Unbiased Authority — uy tín"],
      ["S", "Social Proof — bằng chứng XH"],
      ["T", "Tangible — số liệu/chứng nhận"],
      ["S", "Storytelling — chạm cảm xúc thật"],
    ],
  },
];

export const AXES = [
  {
    dot: "#c0392b", name: "VISUAL — Hình", q: "Hình có kéo người xem STOP và giữ họ ở lại?",
    items: ["First Frame Punch", "Aesthetic Level", "Signature Face", "Themed Stage", "Iconic Totem", "Visual Rhythm"],
  },
  {
    dot: "#2f6fd6", name: "CONTENT — Chữ / Kịch bản", q: "Nội dung có chạm insight và tạo cảm xúc / hành động?",
    items: ["Hook Line", "Big Insight Hit", "Emotional Payoff", "Comment & Share", "Core Mantra", "Brand Fit + Trust"],
  },
  {
    dot: "#2f9e6b", name: "KỸ THUẬT — Craft", q: "Cách dựng có phục vụ nội dung — hay đang cản trở?",
    items: ["Hook Craft (3s đầu)", "Pacing & Cut", "Sound Design", "Subtitle Craft", "Source & Format", "Loop / Ending"],
  },
];

// Kho case đã tách sang `cases-*.ts` (33 ca chi tiết) — xem `src/data/cases.ts`.
