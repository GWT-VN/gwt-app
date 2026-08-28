import type { CaseStudy } from "./cases-types";

/**
 * Buổi SECI 3 mục 8 — các KÊNH sưu tầm để học cách làm (không phải video lẻ).
 * Bài học chung: “mượn nội dung phải khéo” — giữ cơ chế khoa học cốt lõi, chuyển hoá phần
 * thổi phồng/lệch định vị về đúng chuẩn kênh (thời lượng 2–3 phút, giọng điềm tĩnh, dẫn nghiên cứu rõ).
 */
export const CASES_REFS: CaseStudy[] = [
  {
    slug: "ref-huyen-co-co-nhan",
    code: "R1",
    brand: "Tham khảo",
    brandFull: "Huyền Cơ Cổ Nhân (Đông Y) · youtube.com/@huyencoconhan-official",
    title: "Huyền Cơ Cổ Nhân — Đông y & dưỡng sinh",
    verdict: "ref",
    verdictNote: "Học tư duy, KHÔNG học chuyên môn điều trị",
    buoi: "Buổi 3",
    summary:
      "Lồng triết lý cổ nhân vào đời sống thực tiễn, bám vấn đề sức khoẻ hiện đại — nhưng chuyên môn phải lọc kỹ.",
    worked: [
      "Không đi hàn lâm mà lồng triết lý vào đời sống thực tiễn.",
      "Bám sát vấn đề sức khoẻ hiện đại.",
    ],
    failed: [
      "Đậm màu triết lý cổ phương, một số định nghĩa trừu tượng.",
      "Phương pháp chia sẻ mang tính ĐẠI TRÀ — chuyên môn điều trị cần đánh giá cẩn trọng.",
      "Nhịp làm giống livestream hơn video ngắn chuẩn.",
    ],
    fix: [
      "Chỉ lấy Ý TƯỞNG, không lấy kết luận chuyên môn.",
      "Tóm gọn thời lượng cho đúng định vị kênh.",
    ],
    gwt:
      "Tương đương với GWT là các kênh “mẹo dân gian về nước” (lọc bằng than, phèn chua…). Học cách kể gần gũi, TUYỆT ĐỐI không lấy kết luận kỹ thuật của họ — mọi con số phải về nguồn hạng A/B theo rules/nguon-dan-chung.md.",
    laws: ["Mượn content phải khéo", "Đừng biến clip thành giáo trình"],
  },
  {
    slug: "ref-bs-hoang-anh-tuyet",
    code: "R2",
    brand: "Tham khảo",
    brandFull: "BS Huang Yingxue 黄莹雪 (Hoàng Anh Tuyết) · Douyin",
    title: "BS Hoàng Anh Tuyết — làm cùng bác sĩ",
    verdict: "ref",
    verdictNote: "Học khung Action: “làm ngay cùng bác sĩ”",
    buoi: "Buổi 3",
    summary:
      "Phong cách gần giống TS Phúc. Điểm học được là KHUNG KỊCH BẢN 5 nhịp khiến người xem làm theo.",
    worked: [
      "Khung kịch bản: Vấn đề → Kiểm tra → Giải thích → Hướng xử lý → Kết quả (vd dùng thước đo lỗ chân lông tại nhà).",
      "Ngồi chia sẻ kiến thức có dẫn nghiên cứu chứng minh.",
    ],
    failed: [
      "Yếu về STICK — nhiều nội dung hay nhưng Brand Memory phân tán, thiếu signature.",
      "Về ACTION mới chỉ giải thích cho người xem, chưa nâng thành hướng dẫn để người xem LÀM CÙNG.",
    ],
    gwt:
      "Khung 5 nhịp này áp gần như hoàn hảo cho KOL kỹ sư nước GWT: Vấn đề (vòi sen đóng cặn) → Kiểm tra (đo TDS/độ cứng tại chỗ) → Giải thích (cơ chế) → Hướng xử lý → Kết quả (đo lại). Khán giả có dụng cụ rẻ nên LÀM CÙNG được thật.",
    laws: ["Enrichment phải kèm hành động cụ thể", "Action chỉ tính khi có CTA cụ thể"],
  },
  {
    slug: "ref-cuong-me-ai",
    code: "R3",
    brand: "Tham khảo",
    brandFull: "Cường Mê AI · Facebook/TikTok",
    title: "Cường Mê AI — mở bằng “một phát hiện lớn”",
    verdict: "ref",
    verdictNote: "Học cách mở hook; phải giảm thổi phồng",
    buoi: "Buổi 3",
    summary:
      "Ghép AI + chống lão hoá tạo khoảng cách tò mò lớn. Học cách mở bằng phát hiện, bỏ phần hype.",
    worked: [
      "Mở đầu bằng MỘT “phát hiện lớn” thay vì giải thích kiến thức ngay.",
      "Hook mẫu: “Quá khó tin! Các nhà khoa học vừa mới tìm ra cách dùng AI để đảo ngược quá trình lão hoá” — giống lời cảnh báo, khiến người xem tò mò.",
      "Công thức viết kịch bản: Vấn đề → Cơ chế → Giải pháp.",
    ],
    failed: [
      "Thổi phồng sự thật (đảo ngược lão hoá, trẻ hoá…).",
      "Giọng “hype” công nghệ không hợp vai chuyên gia.",
    ],
    fix: [
      "Áp sang kênh chuyên gia: Vấn đề lớn → Cơ chế khoa học → Góc nhìn Đông y → Cách chăm sóc đúng → Sản phẩm là MỘT PHẦN giải pháp.",
      "Case quy trình AI (@caocuongvuai): dùng prompt “hoá thân vào chuyên gia”, kết hợp nhiều AI (ChatGPT ↔ Claude), dựng video AI bằng CapCut.",
    ],
    gwt:
      "⚠️ Phần thổi phồng là ranh giới pháp lý ở ngành nước. “Máy này đảo ngược…”, “chữa được…” vi phạm rules/ad-compliance-vn.md. Học đúng phần khung (Vấn đề → Cơ chế → Giải pháp) và cách mở bằng phát hiện có nguồn thật.",
    laws: ["Mượn content phải khéo", "Claim tâm linh / chữa bệnh: nói “mình KHÔNG TIN”", "AI test → viral → quay thật"],
  },
  {
    slug: "ref-beauty-speaks",
    code: "R4",
    brand: "Tham khảo",
    brandFull: "Beauty Speaks (Lan Anh) · youtube.com/@BeautySpeaks.lananh",
    title: "Beauty Speaks — gần gũi, hướng dẫn từng bước",
    verdict: "ref",
    verdictNote: "Học cách tiếp cận; phải xác minh lại thông tin",
    buoi: "Buổi 3",
    summary:
      "Kết hợp vlog cá nhân + hướng dẫn thực tế + tóm tắt sách. Gần gũi nhưng không phải nguồn y khoa.",
    worked: [
      "Chu trình dưỡng da khoa học từ cơ bản đến chuyên sâu, hướng dẫn từng bước.",
      "Kết hợp vlog cá nhân + hướng dẫn thực tế + video tóm tắt sách.",
      "Insight về lối sống lành mạnh từ các cuốn sách được trích dẫn.",
    ],
    failed: [
      "Không phải kênh y khoa hàn lâm — chia sẻ kinh nghiệm cá nhân, tổng hợp từ sách báo và xu hướng phổ thông.",
      "Thiếu phân tích chuyên sâu dưới góc nhìn bác sĩ.",
      "Thumbnail gây cảm giác kỳ dị (uncanny) — cần tránh.",
    ],
    fix: ["Xác minh lại độ chuẩn xác dựa trên nghiên cứu trước khi mang góc nhìn chuyên gia vào."],
    gwt:
      "Áp cho tuyến A4 của GWT: giọng gần gũi, hướng dẫn từng bước (“chọn máy lọc theo 5 bước”), nhưng mọi con số phải verify lại. Và tránh thumbnail AI trông kỳ dị — mất trust ngay từ trước khi bấm vào.",
    laws: ["Mượn content phải khéo", "Văn nói > văn viết · góc người thợ > góc nhà kinh doanh"],
  },
  {
    slug: "ref-bai-hoc-song",
    code: "R5",
    brand: "Tham khảo",
    brandFull: "Bài Học Sống · youtube.com/@baihocsong",
    title: "Bài Học Sống — biến mẹo dân gian thành y học thực chứng",
    verdict: "ref",
    verdictNote: "Kênh được đánh giá cao nhất buổi — 2,3K–64K view/video",
    buoi: "Buổi 3",
    metrics: [
      { label: "1 video 6 ngày", value: "64.000 view" },
      { label: "1 video 2 tuần", value: "24.000 view" },
    ],
    summary:
      "Khai thác content từ chính câu hỏi của khách hàng, biến kiến thức y khoa khô khan thành video ngắn cực lôi cuốn.",
    worked: [
      "Tệp 35–55 tuổi, các vấn đề lão hoá & sức khoẻ chủ động.",
      "Biến kiến thức Đông y dưỡng sinh từ “mẹo dân gian truyền miệng” thành “Y HỌC THỰC CHỨNG”.",
      "Thuyết phục bằng cơ sở khoa học vững: “Tuổi thọ không hoàn toàn do trời định — 80% là lối sống & dinh dưỡng”, dẫn nghiên cứu dài hạn ĐH Harvard (5 thói quen lành mạnh → thêm 12–14 năm).",
      "Nhịp đăng đều, view rất ổn.",
    ],
    failed: [
      "Nếu đơn giản hoá quá thì mất cơ sở khoa học — phải giữ lại phần giải thích cơ chế cốt lõi.",
    ],
    fix: [
      "Chuyển khái niệm y khoa sang ngôn từ đời thường NHƯNG bắt buộc giữ cơ chế khoa học cốt lõi.",
      "Dùng ChatGPT nâng cao khi hỏi đáp: đừng dừng ở câu trả lời đầu — hỏi tiếp “giải thích kỹ hơn, thêm ví dụ, so sánh thực tế, coi tôi là người mới bắt đầu”.",
    ],
    thien: [
      "“Nếu mang bác sĩ Tiến (TS Hữu Phúc) làm content kiểu này thì kênh sẽ ăn rất tốt, không cần bán hàng vẫn kéo được tổ chức tự nhiên.”",
    ],
    gwt:
      "Đây là mô hình gần GWT nhất: lấy chính CÂU HỎI KHÁCH đang hỏi (81 mẫu quick_replies trong kho tài liệu) làm nguồn đề tài, rồi trả lời bằng cơ chế + nguồn hạng A. Đúng định vị KOL kỹ sư nước: không bán hàng vẫn kéo được tệp.",
    laws: ["Nhắc gì → khách có hiểu không?", "Enrichment phải kèm hành động cụ thể", "Mượn content phải khéo"],
  },
];
