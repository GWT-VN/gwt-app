import type { CaseStudy } from "./cases-types";

/**
 * Kho case buổi SECI 2 — brand VCB (Viễn Chí Bảo / kênh nhân vật HuyK, ngành kim hoàn).
 * Nguồn: `Work GWT/Thiện Sharing/Thiện - Sharing 2 - Tổng hợp.md` mục 4 · 4b · 4c · 4d.
 * ⚠️ Đây là case ĐI HỌC của bạn bè — học CÁCH LÀM, không bê nội dung sang GWT.
 */
export const CASES_VCB: CaseStudy[] = [
  {
    slug: "vcb-nhan-da-cau-vong",
    code: "V1",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "Nhẫn đá cầu vồng (7 màu Sapphire)",
    verdict: "fix",
    verdictNote: "Đã sửa — hook tốt, nội dung phải đổi trục",
    buoi: "Buổi 2",
    summary:
      "Hook xin lỗi 1.000 người hỏi rất mạnh, nhưng trục nội dung “7 màu mệnh nào cũng hợp” lại là thứ khách KHÔNG muốn mua.",
    story:
      "Video giới thiệu mẫu nhẫn gắn dải 7 màu sapphire, xoay được. Bản đầu bán bằng thông điệp “mệnh nào cũng hợp”. Trước dùng ruby/sapphire (đắt, khó cắt), sau chuyển sang garnet cho dễ tiếp cận mà vẫn sáng.",
    worked: [
      "Hook “HuyK chân thành xin lỗi hơn 1.000 anh em từng hỏi về mẫu nhẫn này” — vừa xin lỗi vừa khoe lượng cầu đủ lớn.",
    ],
    failed: [
      "Visual chưa đủ kịch tính, chưa “giống bóc phốt”.",
      "Trục “7 màu mệnh nào cũng hợp” không phải yếu tố khách muốn mua — nghe như hàng đại trà.",
    ],
    thien: [
      "“Đừng làm cái gì anh em không thích”: sản phẩm cái gì cũng hợp, mệnh nào cũng hợp → cảm giác KHÔNG CHUYÊN. Không ai bỏ vài triệu mua món “ai đeo cũng được”.",
      "Nhận xét của anh Tiến: Facebook CẤM nói may mắn/tài lộc — chỉ nói “cầu vồng = sự hồi phục”. “Chưa viral thì không bị bắt lỗi, viral thì bị.”",
    ],
    fix: [
      "Đổi trục sang Ý NGHĨA cầu vồng trong các nền văn hoá.",
      "Show ĐỘ KHÓ: cơ cấu xoay được, chọn đá dải 7 màu chuyển tiếp hài hoà rất phức tạp.",
      "Bỏ mọi câu về may mắn/tài lộc để tránh rủi ro nền tảng.",
    ],
    gwt:
      "Đừng bán máy lọc bằng “phù hợp mọi gia đình”. Nói rõ máy này hợp nguồn nước nào, KHÔNG hợp trường hợp nào — và show độ khó kỹ thuật thay vì hô công dụng. Claim “may mắn/tài lộc” tương đương claim sức khoẻ ở ngành nước: rủi ro nền tảng lẫn pháp lý.",
    laws: ["Đừng “mệnh nào cũng hợp”", "Chỉ dùng sản phẩm khi “wow thật sự”"],
  },
  {
    slug: "vcb-kim-cuong-that-gia",
    code: "V2",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "Phân biệt kim cương thật/giả (bản làm lại)",
    verdict: "win",
    verdictNote: "2,4k → 73k view sau khi làm lại",
    buoi: "Buổi 2",
    metrics: [
      { label: "bản cũ", value: "2,4K view" },
      { label: "bản mới", value: "73K view" },
    ],
    summary:
      "Cùng một đề tài, viết lại theo đủ 5 chữ PAAST thì view gấp 30 lần. Đây là case chứng minh khung có tác dụng thật.",
    story:
      "6 mẹo tự kiểm tra kim cương tại nhà. Bản mới đổi đối tượng so sánh từ “đá ít người biết” sang kim cương thật vs moissanite — thứ người mua thực sự hay gặp.",
    paast: [
      { k: "P", label: "Prefer", text: "Thoả tò mò “làm sao biết kim cương thật/giả” — kiến thức dùng được ngay lúc đi mua." },
      { k: "A1", label: "Action", text: "Hook STOP = macro viên kim cương cực lớn + dòng chữ “Phân biệt kim cương thật giả”." },
      { k: "A2", label: "Acknowledge", text: "Nâng vấn đề lên “làm thế nào để không mất tiền oan khi mua trang sức lớn”." },
      { k: "S", label: "Stick", text: "Lặp cấu trúc “cách 1, cách 2, cách 3…” — 6 mẹo, dễ nhớ dễ xem lại." },
      { k: "T", label: "Trust", text: "Kết quả test thật; chuyên gia đứng vai người có chuyên môn, KHÔNG phải người bán." },
    ],
    worked: [
      "Đổi vật so sánh sang thứ khách thật sự gặp (moissanite) — dễ liên tưởng hơn đá lạ.",
      "Chuyên gia đứng vai người có chuyên môn, không phải người bán → Trust cao.",
    ],
    fix: [
      "Đổi hook mở bằng vấn đề/bí mật: “viên kim cương bạn đang đeo có thể là giả mà mắt thường không nhận ra”.",
      "Tăng tương tác: “hà hơi vào kim cương mà hơi nước biến mất ngay thì thật hay giả?” → dừng 1–2s cho người xem đoán.",
      "Kết mở: “nhưng có 1 trường hợp cách này vẫn sai…”.",
      "Thêm hình thật VCB đóng hàng để tăng trust.",
      "Đã win thì QUAY THẬT thay hình AI.",
    ],
    gwt:
      "Bản gốc của “6 mẹo kiểm tra kim cương” cho GWT là “mấy cách tự kiểm tra nước nhà bạn” (bút TDS, giấy quỳ, nhìn cặn vòi sen). Điều kiện: người nói phải ở vai KỸ SƯ, không phải người bán máy — đúng định vị KOL inhouse. Và so sánh phải là thứ khách thật sự gặp (nước máy vs nước lọc), không phải khái niệm lạ.",
    laws: ["AI test → viral → quay thật", "Tò mò phải có kết"],
  },
  {
    slug: "vcb-ly-nha-ky-kim-cuong",
    code: "V3",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "Lý Nhã Kỳ & 2 viên kim cương ~1.500 tỷ",
    verdict: "fail",
    verdictNote: "FAIL logic — khơi tò mò rồi bỏ đó",
    buoi: "Buổi 2",
    summary:
      "Case kinh điển của lỗi “tò mò không có kết”: mở bằng câu hỏi thật/chiêu trò, nhưng chuyên gia không kết luận được rồi đi hỏi người khác.",
    story:
      "Nội dung: viên xanh 35 triệu USD (~900 tỷ) + viên hồng 22 triệu USD (~500 tỷ) = ~1.500 tỷ, gắn với Lý Nhã Kỳ.",
    failed: [
      "Logic lộn xộn: chuyên gia xem ảnh KHÔNG kết luận được, rồi lại đi hỏi người khác — người khác làm sao biết.",
      "Đầu video chưa có insight khách hàng.",
      "Khơi tò mò nhưng không giải quyết. Lôi người nổi tiếng ra mà không rõ để làm gì.",
    ],
    thien: [
      "“Rất lộn xộn về logic.” “Là ai viết content cho cái này?” — đòi hỏi trách nhiệm người viết.",
      "Tò mò phải có kết: mình cho người ta tò mò gì thì mình phải là người trả lời cái đó.",
      "“Lôi Lý Nhã Kỳ ra để làm gì?” — nhân vật nổi tiếng phải có vai trò rõ trong mạch.",
    ],
    fix: [
      "Xem V6 (Tiffany Yellow Diamond) — cùng góc “người nổi tiếng + không mua được” nhưng đóng vòng bằng “giá trị nằm ở câu chuyện”.",
    ],
    gwt:
      "Đừng mở video bằng “nước máy Hà Nội có an toàn không?” rồi kết bằng “tuỳ khu vực, các bạn nên tự kiểm tra”. Đó chính là lỗi này. Nếu không đủ dữ liệu để kết luận thì ĐỔI câu hỏi mở đầu thành câu mình trả lời được.",
    laws: ["Tò mò phải có kết", "Logic phải chặt — không bế tắc, không tiêu cực", "Insight khách hàng ngay từ đầu"],
  },
  {
    slug: "vcb-jar-brand-story",
    code: "V4",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "Kể chuyện thương hiệu JAR",
    verdict: "fix",
    verdictNote: "Cần làm lại — kể sai trọng tâm",
    buoi: "Buổi 2",
    summary:
      "Kể về một thương hiệu không ai biết, thay vì kể CÂU CHUYỆN sau nó. Đây là case dạy nhiều nhất về hook và cách khép vòng.",
    story:
      "JAR (Joel A. Rosenthal) — thợ kim hoàn huyền thoại ở Place Vendôme: không quảng cáo, chọn khách, cài áo hoa sơn trà đấu giá Christie’s 4,3 triệu USD, Met triển lãm 2013.",
    failed: [
      "Visual xấu.",
      "Thương hiệu JAR không ai biết → tập trung vào thương hiệu là sai trọng tâm.",
      "Mở đầu bằng liệt kê (“không tủ trưng bày, không website…”) kéo dài.",
      "Câu cứng kiểu “một người thợ kim hoàn với nhiều năm kinh nghiệm không đi theo hướng cực đoan” — nghe “hồ”.",
    ],
    thien: [
      "Đừng tập trung vào thương hiệu mà kể câu chuyện sau nó.",
      "Neo vào Lý Nhã Kỳ ngay từ hook: “nếu giàu như Lý Nhã Kỳ mà cũng không mua được…”.",
      "Cửa hàng JAR còn bé hơn cả biển nhà Lý Nhã Kỳ (39 Hàng Sàn) — dùng hình đó để tạo kết nối.",
      "Chuyển văn viết → văn nói bằng ChatGPT. Câu “mình mà được trưng bày một lần chắc sướng lắm” mới đúng cách người Việt nói.",
      "Góc kể = người thợ/nghệ nhân, KHÔNG phải nhà kinh doanh: thích thì làm, thích bán thì bán — “cứ để cho thị trường tự nhiên”.",
      "Cân nhắc giữ giọng thật thay giọng AI cho tự nhiên.",
    ],
    fix: [
      "Đưa người nổi tiếng vào hook (Elizabeth Taylor, hoàng gia…).",
      "Thêm câu tò mò: thương hiệu này là ai, đặc biệt gì mà người nổi tiếng cũng không mua được?",
      "Khều xem đến cuối: “hãy xem đến cuối để hiểu câu chuyện về những người thợ này.”",
      "Kết phải khép vòng với đầu — đã đưa người nổi tiếng vào thì phải kết lại bằng họ.",
      "Cẩn thận câu “nếu mọi người cũng…”: chỉ dùng khi tệp đủ to, kẻo lọc mất người xem.",
      "Nhắc khái niệm nào cũng phải kiểm tra: khách có hiểu không?",
    ],
    gwt:
      "GWT bán máy GE — thương hiệu người Việt phổ thông chưa chắc biết. Đừng làm video “GE là ai”; hãy kể CÂU CHUYỆN đằng sau (kỹ sư nước, tiêu chuẩn kiểm định, ca xử lý khó) rồi mới lộ ra tên. Và câu “nếu nhà bạn đang dùng máy lọc RO…” lọc mất người chưa có máy — cân nhắc trước khi dùng.",
    laws: ["Mạch phải liền", "Đầu – cuối khép vòng", "Văn nói > văn viết · góc người thợ > góc nhà kinh doanh", "Nhắc gì → khách có hiểu không?"],
  },
  {
    slug: "vcb-tre-don-3d",
    code: "V5",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "HuyK trễ đơn & nút thắt khâu thiết kế 3D",
    verdict: "fix",
    verdictNote: "Còn tín hiệu → sửa nhẹ, không bỏ",
    buoi: "Buổi 2",
    summary:
      "Kể chuyện quản trị: tìm ra nút thắt thật (khâu 3D, không phải khâu chế tác). Nội dung tốt, chỉ hỏng ở hook chung chung.",
    story:
      "Có giai đoạn cứ 5 khách đặt chế tác thì 1–2 khách chờ lâu → đổi ý, thậm chí huỷ đơn. Ca đau nhất: anh khách Đà Nẵng đặt nhẫn cầu hôn đúng ngày kỷ niệm, bản 3D chỉnh 2 lần nên trễ; khách không trách, chỉ nhắn “không sao anh dời ngày cầu hôn vậy”. Giải pháp tận gốc: không cố làm nhanh hơn mà TUYỂN THÊM thợ 3D.",
    worked: [
      "Cốt truyện có ca cụ thể, có cảm xúc thật.",
      "Bài học outro rõ: “đừng chăm chăm chạy nhanh hơn, hãy tìm xem mình đang nghẽn ở đâu.”",
    ],
    failed: [
      "Hook chung chung ai cũng thấy đúng: “Mua một món trang sức mà phải đợi cả tháng trời thì dẹp đi, bán được cho ai nữa!” — không tạo khoảng trống tò mò.",
    ],
    fix: [
      "Đổi hook sang CON SỐ cụ thể gây tò mò: “Có một khoảng thời gian, cứ 5 khách đặt chế tác thì lại có 1–2 khách vì chờ lâu mà đổi ý, thậm chí huỷ đơn.”",
      "Đoạn cuối quay THẬT: xưởng, nhân sự các vị trí, chế độ thợ (phòng mát, điều hoà) → phục vụ xây thương hiệu chung.",
      "Test cảm xúc bằng cách đăng thử xem view.",
      "Ý tưởng phát triển: series “30 ngày làm 30 vị trí trong xưởng”.",
    ],
    gwt:
      "Tuyến A3 (niềm tin) rất hợp GWT: kể ca lắp đặt khó, ca xử lý nước giếng nhiễm phèn nặng, nút thắt thật trong quy trình. Mở bằng con số (“cứ 10 nhà thì 3 nhà lắp xong vẫn thấy nước có mùi — vì sao”), kết bằng cảnh quay thật ở kho/xưởng/đội kỹ thuật.",
    laws: ["Hook phải ĐO ĐƯỢC", "Con nào “còn tín hiệu” thì sửa, không bỏ"],
  },
  {
    slug: "vcb-tiffany-yellow-diamond",
    code: "V6",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Giàu như Lý Nhã Kỳ cũng chưa chắc mua được” (Tiffany Yellow Diamond)",
    verdict: "win",
    verdictNote: "116k view — WIN",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "116K" }],
    summary:
      "Đúng hướng mà V3 đuối: 1 viên đá + người nổi tiếng + nghịch lý “không mua được”, và có khép vòng.",
    story:
      "Tiffany Yellow Diamond — đá thô 287,42 carat (mỏ Kimberly, Nam Phi, 1877). Nghệ nhân cắt bỏ HƠN NỬA còn 128,54 carat, 82 giác (so với 58 giác truyền thống) để tối đa độ rực. Hơn một thế kỷ chỉ 4 người đeo: Mary Whitehouse (1957), Audrey Hepburn (1961), Lady Gaga (2019), Beyoncé (2021). Ước ~30 triệu USD nhưng Tiffany gọi là “không thể thay thế”, không bán.",
    paast: [
      { k: "P", label: "Prefer", text: "Tò mò “giàu như Lý Nhã Kỳ/Mai Phương Thúy cũng chưa chắc mua được” + học lịch sử." },
      { k: "A1", label: "Action", text: "Hook mạnh = người nổi tiếng + tiền + khan hiếm + nghịch lý; kích comment “30 triệu USD có đáng không?”." },
      { k: "A2", label: "Acknowledge", text: "Nâng từ “tại sao viên đá đắt vậy” lên “điều gì thực sự tạo nên giá trị của một viên kim cương?” → độ hiếm + tay nghề + lịch sử + câu chuyện + thương hiệu + biểu tượng." },
      { k: "T", label: "Trust", text: "Số liệu có cơ sở về viên đá; uy tín “hơn 15 năm kinh nghiệm”." },
    ],
    worked: [
      "Idea trọng tâm rõ ràng.",
      "Có MINI-HOOK giữa video: “kim cương to vậy sao nghệ nhân lại cắt bỏ hơn nửa?”",
      "Dùng chất liệu tự thân hấp dẫn (ca sĩ nổi tiếng).",
    ],
    fix: [
      "Kéo người xem vào chuyện bằng câu hỏi: “nếu một viên kim cương bị cắt mất hơn nửa trọng lượng, bạn có nghĩ nó mất giá không?”",
      "ĐỈNH CẢM XÚC CHƯA RÕ — cần đẩy mạch: người nổi tiếng → viên đá vượt cả người nổi tiếng → Tiffany không bán → giá trị nằm ở câu chuyện.",
    ],
    gwt:
      "Công thức áp được: 1 CHỈ SỐ NƯỚC + nghịch lý gây tò mò. Ví dụ “nước máy đạt chuẩn quốc gia — nhưng vì sao vòi sen nhà bạn vẫn đóng cặn trắng?”, rồi khép vòng bằng ý nghĩa (chuẩn nước sinh hoạt khác chuẩn nước uống).",
    laws: ["Mini-hook giữa video", "Chất liệu phải có mâu thuẫn / tự thân hấp dẫn", "Đỉnh cảm xúc / sứ mệnh > đoạn mẹo"],
  },
  {
    slug: "vcb-5h30-tan-lam",
    code: "V7",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“5h30 là tan làm” — anh khách mua dây chuyền tặng vợ",
    verdict: "win",
    verdictNote: "149k view · 245 comment — WIN",
    buoi: "Buổi 2",
    metrics: [
      { label: "view", value: "149K" },
      { label: "comment", value: "245" },
      { label: "xem TB", value: "26s (14%)" },
      { label: "≥3s → ≥1 phút", value: "80.353 → 15.902" },
    ],
    summary:
      "Tuyến kể chuyện cảm xúc, được đánh giá xứng đáng thay tuyến cũ vì “dài + có mùi vị”. Nhưng retention tụt mạnh ở giây thứ 9.",
    story:
      "5h30 tan làm nhưng 5h29 có khách. Anh khách chọn dây chuyền trái tim đá xanh nhỏ tặng vợ, không dịp gì: “anh thích cái này… đá rung rung như hồi hai đứa mới yêu”. Hôm sau anh gửi ảnh vợ cầm hộp quà: “may mà hôm đó em còn mở cửa”. HuyK ngộ ra: không chỉ làm trang sức mà góp vào một khoảnh khắc của ai đó.",
    worked: ["Kể chuyện có cốt truyện, thoả tò mò hóng chuyện.", "Có “mùi vị” — chi tiết đời thật, không hô khẩu hiệu."],
    failed: ["Retention tụt mạnh ở mốc 0:09 — hook và 9 giây đầu chưa đủ giữ chân.", "Logic thời gian sai: cửa hàng mở tới 9h tối, 5h30 là giờ văn phòng."],
    thien: [
      "Sửa thành 9h30 tối chuẩn bị đóng cửa; hoặc nói “5h30 là giờ khách hàng có thể đến”, nhà mình mở tới tối.",
      "Đổi mạch sang MẤT THỜI GIAN TƯ VẤN cho anh ấy, chứ không chỉ “ngồi làm”.",
      "“Nhà mình hay làm kể chuyện nhưng không dài, không có mùi vị như thế này.”",
    ],
    gwt:
      "Tuyến A3 cho GWT: một ca lắp đặt ngoài giờ, một khách gọi lúc tối muộn vì nước đổi màu. Bài học kỹ thuật quan trọng hơn: ĐO retention, thấy tụt ở giây nào thì sửa đúng chỗ đó — đừng sửa cảm tính.",
    laws: ["Hook phải ĐO ĐƯỢC", "Mini-hook giữa video", "Logic phải chặt — không bế tắc, không tiêu cực"],
  },
  {
    slug: "vcb-menh-hoa-da-mau",
    code: "V8",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Người mệnh Hoả nên đeo đá màu gì?”",
    verdict: "win",
    verdictNote: "10k view — WIN",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "10K" }],
    summary:
      "Case mẫu về cách nói chủ đề nhạy cảm (phong thuỷ) mà KHÔNG tuyệt đối hoá — vẫn giữ được Trust.",
    story:
      "Mệnh Hoả hợp màu Hoả (đỏ/hồng/tím) + Mộc (xanh lá — Mộc sinh Hoả); hạn chế Thuỷ (đen, xanh dương — Thuỷ khắc Hoả).",
    paast: [
      { k: "P", label: "Prefer", text: "Tò mò mệnh Hoả đeo màu gì + đá đẹp lấp lánh + học phong thuỷ." },
      { k: "A1", label: "Action", text: "Hook “Đỏ, hồng, tím hay xanh lá?” → KHÔNG nói đáp án ngay; CTA comment “Anh chị mệnh Hoả đang đeo đá màu gì?”." },
      { k: "A2", label: "Acknowledge", text: "Nói trực tiếp về đá quý; khách mục tiêu = người mệnh Hoả đang phân vân; “màu hợp mệnh chỉ là gợi ý, món phù hợp với mình mới quan trọng nhất”." },
      { k: "T", label: "Trust", text: "Minh bạch “nếu xét theo quan niệm ngũ hành lưu truyền từ xưa” + “đây chỉ nên là tiêu chí tham khảo”. Outro định danh." },
    ],
    worked: ["Không nói đáp án ngay → giữ người xem.", "Tư vấn thực tế, không tuyệt đối hoá phong thuỷ, không áp đặt."],
    fix: [
      "Thêm nhiều sản phẩm vào khung hình.",
      "Thêm kiến thức chọn màu theo TÂM LÝ HỌC (xanh lam/lá/trắng → trầm tính; đỏ → hướng ngoại).",
      "Nêu rõ các “kiểu tham khảo”: ngũ hành · tâm lý học · 12 cung hoàng đạo — đừng nói “tham khảo” chung chung.",
    ],
    gwt:
      "Đây là khuôn xử lý claim rủi ro cho GWT. Với chủ đề nước–sức khoẻ: nói “theo khuyến nghị của WHO/QCVN…” + “đây là tiêu chí tham khảo, còn tuỳ nguồn nước nhà bạn”, thay vì khẳng định máy chữa được gì. Xem thêm rules/ad-compliance-vn.md và rules/claim-can-chung-nhan.md.",
    laws: ["Enrichment phải kèm hành động cụ thể", "Claim tâm linh / chữa bệnh: nói “mình KHÔNG TIN”"],
  },
  {
    slug: "vcb-bac-nam-cham-hut",
    code: "V9",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Trang sức bạc bị nam châm hút là bạc giả?”",
    verdict: "win",
    verdictNote: "23k view — WIN, case mẫu đủ PAAST",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "23K" }],
    summary:
      "Case Thiện khen nhất buổi: giải mã hiểu lầm bằng sự thật kỹ thuật, và đoạn SỨ MỆNH cuối mới là đoạn giá trị nhất.",
    story:
      "Chị khách mua nhẫn cỏ 4 lá xoay S925, test nam châm bị hút → tưởng bạc giả, đòi trả hàng. HuyK giải thích: nam châm chỉ hút ĐÚNG phần trục xoay (hợp kim cứng hơn bạc), vì bạc S925 mềm — làm trục bằng bạc sẽ mòn/lắc/kẹt/bung. Kết luận: mọi cơ cấu chuyển động trong kim hoàn phải chọn đúng vật liệu cho đúng chức năng.",
    paast: [
      { k: "P", label: "Prefer · CRAVES (2đ)", text: "Curiosity = giải mã hiểu lầm phổ biến bằng sự thật kỹ thuật bất ngờ; Enrichment = kiến thức chế tác + cách test đúng." },
      { k: "A2", label: "Acknowledge · BRANDS (5đ)", text: "Giới thiệu shop qua tình huống thật; Deeper Value = minh bạch + tử tế trong kinh doanh; Story = kiên trì làm video kiến thức dù không bán được hàng ngay." },
      { k: "S", label: "Stick · STICKS (2đ)", text: "Signature Face = nhân vật HuyK xuyên suốt; Core Mantra = outro “HuyK đến từ Viễn Chí Bảo”." },
    ],
    worked: [
      "Đoạn giải thích + sứ mệnh là đoạn giá trị nhất, KHÔNG phải đoạn mẹo.",
      "Câu chốt: “tử tế trong kiến thức là bước đầu của tử tế trong kinh doanh”.",
      "“Đừng dùng 1 bài test duy nhất để kết luận một món trang sức.”",
    ],
    thien: [
      "“Clip này làm rất tốt”, ấn tượng đoạn sau.",
      "Bài toán giao team: lôi hết các video “mẹo” cũ ra + ghép đoạn sứ mệnh vào cuối.",
      "Báo trước đoạn dài “hãy lưu lại nhé” để tăng save.",
    ],
    gwt:
      "Áp gần như 1–1: “Nước lọc xong vẫn có cặn trắng là máy hỏng?” — giải thích cặn canxi/magie không phải lỗi máy, rồi chốt bằng sứ mệnh “nói đúng về nước là bước đầu của bán hàng tử tế”. Và ĐỪNG dùng một bài test duy nhất (TDS) để kết luận chất lượng nước — đúng tinh thần rules/nguon-dan-chung.md.",
    laws: ["Đỉnh cảm xúc / sứ mệnh > đoạn mẹo", "Báo trước “đoạn sau dài, hãy lưu lại”"],
  },
  {
    slug: "vcb-ngoc-duong-nguoi",
    code: "V10",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Ngọc có dưỡng người không?” (vòng phỉ thúy)",
    verdict: "win",
    verdictNote: "WIN — case mẫu đủ PAAST + mẫu xử lý claim",
    buoi: "Buổi 2",
    summary:
      "Vừa là case PAAST đủ 5 chữ, vừa là khuôn mẫu xử lý claim chữa bệnh mà không mất người xem.",
    story:
      "Đeo phỉ thúy đi tắm/gội đầu/nấu cơm vung tay mạnh → vướng là mẻ. HuyK từng đang họp sản phẩm, sếp cáu đập tay xuống bàn → nhẫn phỉ thúy nứt ngang. Kết luận: ngọc dưỡng người không phải dưỡng sức khoẻ mà dưỡng KHÍ CHẤT (nhắc sống chậm, đừng nóng nảy). Dẫn Lễ Ký “quân tử vô cố, ngọc bất ly thân”. Còn bảo ngọc chữa bệnh/chống ung thư/làm trắng da → “nếu có thật thì ngọc đã cháy hàng từ lâu, đại gia gom hết”; tay đeo vòng trắng hơn chỉ vì che nắng.",
    paast: [
      { k: "P", label: "Prefer · CRAVES", text: "Curiosity (“cùng 2 bàn tay sao 1 bên đeo vòng lại khác vậy?”) · Reactions (sếp đập tay, nhẫn nứt) · Enrichment (người xưa đeo ngọc để sống chậm; câu Lễ Ký)." },
      { k: "A1", label: "Action · S-FACES", text: "Stop (hook 3s bằng câu hỏi 2 bàn tay) · Feel (đồng cảm cảnh sếp đập tay) · Connect (đeo vào thấy vui/đẹp/tự tin) · See Again (câu “ngọc chữa bệnh thì đã cháy hàng”)." },
      { k: "A2", label: "Acknowledge · BRANDS", text: "Reasons to Choose (nói thật về chữa bệnh) · Audience (chị em quan tâm ngọc) · Needs Context (đeo vòng đi tắm/nấu cơm bị mẻ)." },
      { k: "S", label: "Stick · STICKS", text: "Signature Face — nhân vật HuyK, câu mở “rất nhiều người hỏi HuyK…”." },
      { k: "T", label: "Trust · TRUSTS", text: "Storytelling/Human Touch — nhân hoá qua chuyện thật của founder/nhân viên/khách." },
    ],
    thien: [
      "Phần cách hiểu tinh thần + đỉnh cảm xúc OK.",
      "Claim chữa bệnh xử lý bằng “mình KHÔNG TIN” — giữ vậy, đừng kết luận có/không.",
      "Phần “ngọc cháy hàng/đắt” là THẬT thì giữ.",
      "Đoạn màu/visual hơi lệch cần chỉnh.",
      "Nhắc lại: hook phải đo được, đừng gán “hook” cho thứ không đo được.",
    ],
    gwt:
      "Khuôn xử lý claim quan trọng nhất cho GWT. Gặp câu “nước ion kiềm chữa được bệnh gì?”: KHÔNG kết luận có/không — nói lập trường (“mình không tin điều đó”), giữ phần cảm xúc và giữ phần sự thật kiểm chứng được. Đúng cả về nội dung lẫn rules/ad-compliance-vn.md (cấm nói như thuốc).",
    laws: ["Claim tâm linh / chữa bệnh: nói “mình KHÔNG TIN”", "Hook phải ĐO ĐƯỢC"],
  },
  {
    slug: "vcb-tam-su-nghe",
    code: "V11",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Tâm sự nghề — sau gần 10 năm làm nghề” (Đoàn)",
    verdict: "win",
    verdictNote: "31,7k view — đạt",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "31,7K" }],
    summary: "Monologue tâm sự nghề. Điểm kỹ thuật đáng học: CTA lồng cả ĐẦU và CUỐI.",
    story:
      "“Làm nghề không phải cuộc đua”, có lúc đông khách có lúc chậm, sai lầm dạy nhiều nhất; bài học lớn: làm càng lâu càng hiểu mình cần GIỮ điều gì, BỎ điều gì.",
    paast: [
      { k: "P", label: "Prefer", text: "Tò mò “sau gần 10 năm làm nghề…” + “sống thêm một cuộc đời”." },
      { k: "A1", label: "Action", text: "Dừng lại + CTA lồng cả ĐẦU và CUỐI → tăng tương tác/viral." },
      { k: "A2", label: "Acknowledge", text: "Basic (câu chuyện nghề/chế tác/tương tác = dịch vụ) + Story (động lực, góc nhìn người làm nghề)." },
      { k: "S", label: "Stick", text: "Nhân vật HuyK, quan điểm riêng." },
      { k: "T", label: "Trust", text: "Hậu trường cảnh chế tác + bài học sau nhiều năm." },
    ],
    gwt:
      "Tuyến A3 cho KOL kỹ sư nước GWT: “sau X năm đi lắp máy lọc, tôi giữ điều gì và bỏ điều gì”. Kỹ thuật CTA hai đầu áp được cho mọi video dài của GWT.",
    laws: ["CTA lồng cả đầu lẫn cuối"],
  },
];
