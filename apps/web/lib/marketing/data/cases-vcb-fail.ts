import type { CaseStudy } from "./cases-types";

/**
 * Buổi SECI 2 — nhóm FAIL/CHƯA WIN (mục 4c) và nhóm SƯU TẦM chuyển đổi (mục 4d).
 * Kết luận Thiện xếp: F1/F3 → sửa là win được · F2 → viết lại bản khác · F4 → bỏ · F5 → sửa hook.
 */
export const CASES_VCB_FAIL: CaseStudy[] = [
  {
    slug: "vcb-chieu-vo-de-giau",
    code: "F1",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Đàn ông càng chiều vợ càng dễ giàu”",
    verdict: "fix",
    verdictNote: "6,5k view — chưa win, sửa là được",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "6,5K" }],
    summary:
      "Hook hay, cảm xúc mạnh, nhưng mối liên hệ “chiều vợ → giàu” bị ĐỨT: video chỉ nói “chiều”, không giải thích “vì sao giàu”.",
    story:
      "Anh khách quen (Hoàng Quốc Việt) đặt nhẫn vàng đính kim cương tặng sinh nhật vợ (>30 triệu), không phải cầu hôn, tự nguyện. Thông điệp: trang sức là cách người chồng gửi gắm tình yêu → vợ hạnh phúc → nhà ấm → nền tảng tài lộc.",
    paast: [
      { k: "P", label: "Prefer · CRAVES", text: "Curiosity (chủ đạo) từ nghịch lý “chiều vợ → dễ giàu” + Reactions (cảm xúc vợ chồng)." },
      { k: "A1", label: "Action · S-FACES", text: "Stop bằng hook; Answer/Comment bằng CTA cuối “bạn có tin không? Nếu bạn cũng muốn…”." },
      { k: "A2", label: "Acknowledge · BRANDS", text: "Basics/Audience (đàn ông thành đạt có gia đình)/Needs (sinh nhật vợ)/Deeper Value (trang sức = biểu tượng tình yêu)/Story." },
      { k: "T", label: "Trust · TRUSTS", text: "Social Proof (khách quen từng mua nhẫn lục tự vàng) + Storytelling." },
    ],
    failed: [
      "Câu “đàn ông chiều vợ dễ giàu” ĐÃ ĐỦ THÔNG TIN → không tạo khoảng trống tò mò.",
      "Nội dung không giải thích “vì sao chiều vợ thì giàu” — mối liên hệ bị đứt.",
      "Nhạc/tốc độ hơi chậm so với mạch.",
    ],
    thien: [
      "Đừng khẳng định, HỎI NGƯỢC: “có phải ai giàu cũng chiều vợ như thế này không? Hay do chiều vợ mà giàu?” — tạo tranh luận, không kết luận.",
    ],
    fix: [
      "Tạo khoảng trống tò mò: “Có một chi tiết mà 90% đàn ông bỏ qua, nhưng nó quyết định độ giàu có của họ…” (⚠️ slide ghi cần thêm Recommend từ ban cố vấn).",
      "Tăng nhịp nhạc cho khớp mạch.",
    ],
    gwt:
      "Lỗi “mệnh đề bị đứt” rất dễ xảy ra ở GWT: “nước cứng làm hỏng máy giặt” mà không giải thích CƠ CHẾ (canxi bám thành lớp, giảm truyền nhiệt) thì người xem không tin. Và thay vì khẳng định gây hớ, hỏi ngược: “có phải cứ lắp lọc tổng là hết cặn không?”",
    laws: ["Thiện lành, tránh tranh cãi — hỏi ngược thay vì khẳng định", "Nhạc khớp mạch và có cao trào"],
  },
  {
    slug: "vcb-nhan-phuc-che",
    code: "F2",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "Nhẫn phục chế “Làm lại một món đồ cũ khó đến mức nào” (anh Tâm)",
    verdict: "fail",
    verdictNote: "2,4k view — không win, phải VIẾT LẠI bản khác",
    buoi: "Buổi 2",
    metrics: [{ label: "view", value: "2,4K" }],
    summary:
      "Chuyện hay nhưng kịch bản trôi vào mạch “tâm sự êm đềm”, không cao trào, và thiếu bằng chứng đối chiếu Before–After.",
    story:
      "Anh Tâm làm mất chiếc nhẫn (kỷ niệm bạn gái tặng thời sinh viên nghèo), chỉ còn 1 tấm ảnh. HuyK phục chế từ ảnh — không có mẫu thật, đo từ ảnh, “không thể giống 100%, làm gần giống nhất là được”. Anh Tâm đeo thử → nhận ra chiếc nhẫn thời sinh viên.",
    paast: [
      { k: "P", label: "Prefer · CRAVES", text: "Curiosity có nhưng QUÁ CHUNG: “làm lại món đồ cũ khó đến mức nào?”." },
      { k: "A2", label: "Acknowledge · BRANDS", text: "Story có, nhưng Reasons to Choose THIẾU — câu “không giống 100%” hạ thấp kỳ vọng, biến case khó thành kết quả thoả hiệp." },
      { k: "T", label: "Trust · TRUSTS", text: "Storytelling có nhưng Tangible Evidence THIẾU NGHIÊM TRỌNG — không show ảnh gốc cạnh thành phẩm." },
    ],
    failed: [
      "Kịch bản trôi vào mạch “kể chuyện tâm sự êm đềm”, thiếu Action–Comment ở cuối.",
      "Không có đoạn cao trào / cảm giác hồi hộp.",
      "Ghép “mắc”, lộn xộn.",
    ],
    thien: [
      "“Nhạc chậm, nói nhanh, mút nhạc không hợp mạch nội dung.”",
      "Không sửa vặt được — phải VIẾT LẠI một bản khác.",
    ],
    fix: [
      "Đổi hook: “Đã có vợ con đề huề nhưng anh khách lại mang ảnh đến nhờ HuyK làm lại chiếc nhẫn của… mối tình đầu thời sinh viên.”",
      "Chèn ảnh gốc của khách lên góc màn hình SUỐT quá trình gia công → tăng Tangible Evidence.",
      "Kết bằng câu hỏi chấm điểm: “Làm lại từ ảnh thế này mọi người chấm tay nghề HuyK mấy điểm?” để bùng nổ comment.",
    ],
    gwt:
      "Video before/after của GWT phải giữ BẰNG CHỨNG trong khung hình suốt quá trình: mẫu nước đầu vào để cạnh mẫu đầu ra, chỉ số hiện trên màn. Và đừng tự hạ kỳ vọng (“cũng không sạch được 100% đâu”) — nói đúng giới hạn kỹ thuật thì được, tự dìm thì không.",
    laws: ["Mạch phải liền", "Action chỉ tính khi có CTA cụ thể", "Nhạc khớp mạch và có cao trào"],
  },
  {
    slug: "vcb-top-thuong-hieu",
    code: "F3",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Top thương hiệu trang sức hàng đầu thế giới”",
    verdict: "fix",
    verdictNote: "1,9k view · 0 comment — FLOP, nhưng sửa là win",
    buoi: "Buổi 2",
    metrics: [
      { label: "view", value: "1,9K" },
      { label: "comment", value: "0" },
      { label: "xem TB", value: "11 giây (5%)" },
      { label: "≥3s → ≥1 phút", value: "815 → 70" },
      { label: "tụt mạnh ở", value: "0:05" },
    ],
    paastScore: "Content 7đ",
    summary:
      "Nội dung ngon, cắt ghép đẹp, nhưng Prefer yếu + Action lộ + Trust bằng 0. Ba lỗi này đủ giết một video hay.",
    story:
      "Xếp hạng top brand: H5 Bulgari (Serpenti), H4 Van Cleef & Arpels (Alhambra, đính đá ẩn), H3 Cartier (Panthère), H2 Harry Winston (“Vua Kim Cương”), H1 Graff (kim cương lớn/màu hiếm, tự cắt mài).",
    paast: [
      { k: "P", label: "Prefer (yếu)", text: "“Hơn 90% không biết” — chung chung, không minh chứng, và bị quá nhiều video dùng." },
      { k: "A1", label: "Action (lộ)", text: "Khều action quá lộ, nghe thô." },
      { k: "A2", label: "Acknowledge (1đ)", text: "Story “khách thấy món đẹp, thợ thấy phía sau là bài toán”." },
      { k: "S", label: "Stick (2đ)", text: "Outro + nhân vật HuyK, nhưng chưa đa dạng." },
      { k: "T", label: "Trust (0đ — yếu)", text: "Xếp hạng nhưng CHƯA CÓ SỐ LIỆU nào làm căn cứ." },
    ],
    thien: [
      "Hook “hơn 90% không biết” bị nhiều video dùng, thiếu mâu thuẫn.",
      "Khều comment hơi thô.",
      "Xếp hạng thì phải theo tiêu chí rõ ràng + có số liệu.",
      "Nhưng nội dung “ngon”, cắt ghép/chuyển cảnh đẹp → sửa lại + MỞ RỘNG TỆP thì chắc chắn win.",
    ],
    fix: [
      "Prefer: chuyển “bạn không biết” → “bạn TƯỞNG mình biết nhưng thực ra không” (vd “2 vị trí đầu là tên nhiều người chưa nghe”).",
      "Action đỡ lộ: “thử đoán 5 tên, lát xem đúng không”.",
      "Thêm Trust: “5 tên tiêu biểu… xét theo mức độ ảnh hưởng, di sản, kỹ thuật chế tác, vị thế phân khúc cao cấp”.",
    ],
    gwt:
      "GWT hay làm dạng “top công nghệ lọc nước” — phải có tiêu chí xếp hạng và số liệu, nếu không thì Trust = 0. Và bỏ hook “90% người Việt không biết”: mòn, thiếu mâu thuẫn. Đổi sang “bạn tưởng nước đun sôi là sạch — nhưng…”.",
    laws: ["Hook phải gần gũi, không thuật ngữ", "Mở rộng tệp", "Action chỉ tính khi có CTA cụ thể"],
  },
  {
    slug: "vcb-tich-vang",
    code: "F4",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Tích vàng mỗi tháng có giàu không?”",
    verdict: "drop",
    verdictNote: "BỎ HẲN — Thiện loại",
    buoi: "Buổi 2",
    summary:
      "Case duy nhất bị bỏ hẳn. Không phải vì làm dở, mà vì LOGIC dẫn người xem tới kết luận bế tắc.",
    story:
      "20 tuổi mua 1 chỉ vàng/tháng đến 60 tuổi = 48 cây; giá 130 triệu/cây → ~6,24 tỷ. Nhưng đó chỉ là quy đổi theo giá hiện tại; vàng không phải công cụ giàu nhanh, hợp tích luỹ/bảo toàn.",
    paast: [
      { k: "P", label: "Prefer · CRAVES", text: "Curiosity “tích 1 chỉ vàng/tháng có giàu không?”." },
      { k: "A1", label: "Action", text: "Stop + Comment “6 tỷ sau 40 năm có giàu không?”." },
      { k: "A2", label: "Acknowledge", text: "Audience “thu nhập TB 10–15 triệu/tháng, trừ chi phí còn ít để đầu tư”." },
      { k: "S", label: "Stick", text: "Outro “HuyK đến từ Viễn Chí Bảo”." },
      { k: "T", label: "Trust", text: "BỎ TRỐNG trên slide — không có gì." },
    ],
    thien: [
      "Logic tiêu cực/bế tắc — người lương 10–15 triệu gần như không tiết kiệm/đầu tư được, thông điệp làm người xem nản.",
      "“May không viral, viral nó chửi cho.”",
      "Bỏ hẳn, làm content khác có giá trị hơn.",
    ],
    gwt:
      "Cảnh báo trực tiếp cho GWT: đừng làm video kiểu “nước máy Việt Nam ô nhiễm, đun sôi cũng không cứu được, không lọc thì bệnh”. Nó đẩy người xem vào bế tắc và mời gọi tranh cãi — càng viral càng bị phản ứng. Luôn để lối ra hành động được.",
    laws: ["Logic phải chặt — không bế tắc, không tiêu cực", "Thiện lành, tránh tranh cãi — hỏi ngược thay vì khẳng định"],
  },
  {
    slug: "vcb-cong-nuong-diana",
    code: "F5",
    brand: "VCB",
    brandFull: "Viễn Chí Bảo · kênh HuyK",
    title: "“Công nương Diana — biểu tượng thời trang Hoàng gia”",
    verdict: "fix",
    verdictNote: "Chưa win → sửa hook, bỏ kể tiểu sử",
    buoi: "Buổi 2",
    summary: "Insight rõ và tốt, nhưng đem kể tiểu sử lê thê trước khi vào insight.",
    story:
      "Vì sao hơn 20 năm sau khi mất, Diana vẫn là huyền thoại thời trang/trang sức chưa ai thay thế; phân tích cách bà biến mỗi món trang sức thành dấu ấn.",
    failed: ["Kể tiểu sử/cuộc đời Diana lê thê trước khi vào insight."],
    thien: [
      "Insight rõ và tốt.",
      "Đừng đi kể tiểu sử — vào insight luôn.",
      "“Cái final/Prefer phải ở ĐẦU” — đưa điểm chốt/tò mò lên đầu, đừng để cuối.",
    ],
    fix: ["Sửa hook, làm lại — đưa điểm chốt lên đầu."],
    gwt:
      "GWT hay mắc lỗi này khi làm video về GE: kể lịch sử hãng từ năm thành lập. Bỏ. Vào thẳng insight (“vì sao một hệ lọc tổng lại thay đổi cả cảm giác tắm”) rồi mới lộ dần bối cảnh.",
    laws: ["Prefer / điểm chốt phải ở ĐẦU", "Insight khách hàng ngay từ đầu"],
  },
  {
    slug: "vcb-noi-vang",
    code: "S1",
    brand: "VCB",
    brandFull: "Sưu tầm → chuyển đổi sang HuyK",
    title: "“Nồi vàng nấu ăn của giới siêu giàu”",
    verdict: "ref",
    verdictNote: "Reference Douyin — PAAST 9đ",
    buoi: "Buổi 2",
    paastScore: "9đ (P2 · A2 · A1 · S2 · T1)",
    summary: "Mẫu mượn content trái ngành rồi bẻ về góc của mình bằng một câu so sánh.",
    story:
      "Giới siêu giàu dùng nồi/bát/đũa bằng vàng. Hook: nghĩ siêu giàu chỉ đeo kim cương/siêu xe nhưng đó là phần nổi tảng băng. Vàng trơ, ổn định hoá học → nấu ăn an toàn; nhưng quá mềm, dễ trầy móp. Adapt: cùng số vàng đó HuyK làm nhẫn/dây chuyền (kể được câu chuyện) — nồi thì lo trầy. CTA: “có đủ vàng, ngoài nhẫn/dây chuyền bạn làm gì? Dám dùng thật không?”",
    paast: [
      { k: "P", label: "Prefer (2đ)", text: "Curiosity + Enrichment." },
      { k: "A1", label: "Action (2đ)", text: "Hook STOP + Answer/Comment." },
      { k: "A2", label: "Acknowledge (1đ)", text: "Basic: HuyK làm nhẫn/dây chuyền." },
      { k: "S", label: "Stick (2đ)", text: "Outro + nhân vật HuyK." },
      { k: "T", label: "Trust (1đ)", text: "Tangible: vàng trơ, ổn định hoá học." },
    ],
    thien: [
      "Có thể cài thêm nhẫn/ấm/chén bạc cho tính “khoa trương” hơn.",
      "Nhưng ấm bạc khó dùng thật trong đời sống — đừng bịa.",
    ],
    gwt:
      "Mẫu này áp thẳng được: “giới siêu giàu lọc nước thế nào” → dẫn về hệ lọc tổng dân dụng. Điều kiện: phải bẻ về được bằng một câu so sánh có thật, không thổi phồng.",
    laws: ["Mượn content phải khéo"],
  },
  {
    slug: "vcb-chan-ga-ba-tuyet",
    code: "S2",
    brand: "VCB",
    brandFull: "Sưu tầm → chuyển đổi sang HuyK",
    title: "“Chân gà Bà Tuyết” → bản HuyK",
    verdict: "ref",
    verdictNote: "Reference brand storytelling — nhiều lưu ý khi mượn",
    buoi: "Buổi 2",
    summary:
      "Case dạy “mượn phải khéo” rõ nhất: bản gốc rất Trung Quốc và mang giọng “đánh đá”, bê nguyên là hỏng.",
    story:
      "Reference: storytelling là cách duy nhất chạm cảm xúc; không quảng cáo/phô trương, chỉ câu chuyện thật. Bản HuyK chuyển đổi: nỗi ấm ức người thợ bạc tử tế bị đánh đồng với bạc rởm/thủ công giả — “làm tỉ mỉ thì bị chê chậm, làm đúng chất liệu thì bị chê đắt”.",
    paast: [
      { k: "P", label: "Prefer", text: "Cảm xúc mạnh — người đọc “sống” trong tâm lý người thợ bị nghi ngờ." },
      { k: "A1", label: "Action", text: "Stop (đánh vào nỗi sợ) + Feel (đồng cảm đoạn nghịch lý)." },
      { k: "A2", label: "Acknowledge", text: "Basics đạt." },
      { k: "T", label: "Trust", text: "Thừa nhận khó khăn/muốn bỏ cuộc → tuyên bố cuối nặng ký hơn quảng cáo." },
    ],
    thien: [
      "Bản gốc “đánh đá”/rất Trung Quốc → mượn phải khéo, kể theo MẠCH KHÁC.",
      "Dùng văn viết khẩu ngữ, chân chất, tránh từ hoa mỹ.",
      "BỎ đoạn phân biệt thủ công vs máy — “thủ công 100%” không đúng, máy cũng tham gia, có khâu máy làm tốt hơn.",
      "Áp lực nêu ra phải THẬT của mình (thợ, giá vật liệu, đồng đội, tiến độ) — bỏ áp lực giả kiểu “an toàn thực phẩm” của bà Tuyết.",
    ],
    gwt:
      "GWT mượn content ngành nước Trung Quốc rất nhiều (Douyin). Bê nguyên giọng “vạch mặt”, so đo đối thủ là vi phạm cả rules/ad-compliance-vn.md lẫn tinh thần thiện lành. Kể lại theo mạch Việt, và áp lực nêu ra phải là áp lực THẬT của đội kỹ thuật GWT.",
    laws: ["Mượn content phải khéo", "Đừng tự nhận “thủ công 100%”", "Áp lực nêu ra phải THẬT của mình"],
  },
  {
    slug: "vcb-ngai-vang-tutankhamun",
    code: "S3",
    brand: "VCB",
    brandFull: "Sưu tầm → chuyển đổi sang HuyK",
    title: "“Ngai vàng cổ 3300 năm (Tutankhamun)”",
    verdict: "ref",
    verdictNote: "Reference knowledge content",
    buoi: "Buổi 2",
    summary: "Mẫu đổi GÓC NHÌN của một chủ đề ai cũng biết, để thành content của người trong nghề.",
    story:
      "Ngai vàng Tutankhamun (~1330 TCN), cốt gỗ phủ vàng/bạc, kỹ thuật chasing (chạm dập) + repoussé (gò nổi từ mặt sau). Góc HuyK tò mò KHÔNG phải “ngày xưa họ giàu thế nào” mà “3300 năm trước thợ làm bằng cách nào?” — kiểm soát lực để kim loại không thủng/biến dạng, lại tồn tại qua 30 thế kỷ.",
    gwt:
      "Cùng chủ đề, người thường hỏi “cái gì”, người trong nghề hỏi “làm thế nào”. GWT: thay vì “người La Mã có hệ dẫn nước hoành tráng”, hỏi “2000 năm trước họ làm sạch nước bằng cách nào, và cách đó còn dùng được không?”.",
    laws: ["Mượn content phải khéo"],
  },
  {
    slug: "vcb-nhan-big-size",
    code: "S4",
    brand: "VCB",
    brandFull: "Sưu tầm → chuyển đổi sang HuyK",
    title: "“Vì sao nhẫn Big Size tính thêm tiền?”",
    verdict: "ref",
    verdictNote: "Reference — minh bạch giá",
    buoi: "Buổi 2",
    summary: "Mẫu xử lý câu hỏi khó chịu về giá bằng cách bóc chi phí thật, không né.",
    story:
      "Size lớn không phải “lấy mẫu thường kéo rộng” — nguyên liệu vàng/bạc + số đá tăng, công chế tác tăng (chỉnh tỉ lệ, sửa file 3D, thay ổ đá, làm lại khuôn). Thông điệp: khoản phát sinh là chi phí vật liệu + công thật, không phải “chém khách”. “Làm nghề lâu dài phải nói thật cho khách biết họ trả tiền cho điều gì.”",
    thien: ["Mượn nội dung dạng này phải khéo — học nội dung TRÁI NGÀNH an toàn hơn, kể theo mạch khác."],
    gwt:
      "⚠️ Lưu ý riêng: GWT KHÔNG nêu giá trong nội dung (masterdata không còn nguồn giá — xem CLAUDE.md). Nên mượn KHUNG chứ không mượn chủ đề giá: “vì sao lọc tổng cần nhiều cấp lọc đến vậy” — bóc lý do kỹ thuật thật, không né câu hỏi khó.",
    laws: ["Mượn content phải khéo"],
  },
];
