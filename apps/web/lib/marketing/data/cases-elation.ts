import type { CaseStudy } from "./cases-types";

/**
 * Kho case buổi SECI 3 — brand Elation (Cao Thiên Kim / kênh TS Đặng Hữu Phúc, Đông y & chống lão hoá).
 * Nguồn: `Work GWT/Thiện Sharing/Thiện - Sharing 3 - Tổng hợp.md` mục 4 · 5 · 6 · 7 · 8.
 * Đặc điểm buổi này: MỌI video đều là A4, và lỗi lặp lại là hiểu sai A4 = phải đi sâu vào sản phẩm.
 */
export const CASES_ELATION: CaseStudy[] = [
  {
    slug: "elation-toc-bac-som-goc",
    code: "E1",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Tóc bạc sớm — bản gốc F01",
    verdict: "fix",
    verdictNote: "6,4K view · 15/30 PAAST — điểm cao nhất buổi",
    buoi: "Buổi 3",
    paastScore: "15/30",
    metrics: [
      { label: "view", value: "6,4K" },
      { label: "xem TB", value: "19s" },
      { label: "tương tác", value: "92" },
      { label: "follow", value: "6" },
    ],
    summary:
      "Điểm PAAST cao nhất buổi, nhưng mạch bị dồn nén vì nhồi quá nhiều thứ vào một clip.",
    story:
      "Mở bằng “Cùng là phụ nữ sau tuổi 30, vì sao có người tóc vẫn đen dày, người lại bạc gần hết đầu?”, giải thích cơ chế melanin/melanocyte, rồi đưa giải pháp nuôi dưỡng cơ thể từ bên trong.",
    paast: [
      { k: "P", label: "Prefer (3/6)", text: "Curiosity 00:00–00:07; Enrichment 00:20–01:36 (cơ chế melanin/melanocyte); Aesthetics — hình ảnh phụ nữ đẹp ở intro." },
      { k: "A1", label: "Action (3/6)", text: "Hook đánh vào nỗi sợ tóc bạc sau 30; Connect+Engage 00:11–00:20 kêu lưu lại chia sẻ người thân; Feel 01:46–01:55." },
      { k: "A2", label: "Acknowledge (3/6)", text: "Basics = Cao Thiên Kim; Audience = phụ nữ sau 30 tóc bạc; Needs Context = bối cảnh “sau 30 tuổi” + chống chỉ định." },
      { k: "S", label: "Stick (4/6)", text: "Core Mantra “Tiến sĩ Đặng Hữu Phúc đến từ Đại học Trung Y Dược Thượng Hải”; Signature Face + giọng xuyên suốt; Themed Stage." },
      { k: "T", label: "Trust (2/6)", text: "Social Proof 02:48–02:54 (feedback khách trên Facebook); Tangible Evidence 00:16–00:36 (dẫn nghiên cứu, minh bạch cơ chế)." },
    ],
    failed: [
      "Lồng ghép quá nhiều thứ — dược liệu bị đẩy xuống cuối + chống chỉ định thêm vào khiến mạch dồn nén.",
      "Khán giả đang theo “chân dung lựa chọn” thì bị chuyển đột ngột sang “chống chỉ định cho người khác” → mất điểm rơi cảm xúc.",
      "Đoạn “tôi đã chế ra loại thuốc này, nguyên liệu rất tốt…” nặng mùi quảng cáo.",
      "Danh sách dược liệu 24+ vị trên màn — dễ sai tên (sơn trà tươi/khô, bạch chỉ, mật hoa hồng…).",
      "Câu “tiến sĩ Phúc kiên định là cần, không cần đợi feedback” nghe như bác sĩ trẻ mới ra trường.",
      "Kỹ thuật: giọng voice to hơn ở đoạn chuyển, đọc nhanh; nhạc đoạn Đông y quá nhiều thể loại âm thanh, đánh nhau với giọng đọc.",
      "Hình bác sĩ ngồi backdrop trắng “trống hết” — không khớp câu “khí huyết đầy đủ” đang nói.",
    ],
    fix: [
      "Đổi thứ tự: tình trạng/nguyên nhân tóc bạc → góp ý Đông y → chân dung khách hàng → sự khác biệt/lựa chọn. Đưa chân dung khách lên SỚM hơn.",
      "Đoạn bán: nêu biểu hiện → cơ chế → LỜI KHUYÊN CHUNG (Đông/Tây y xử lý thế nào, nên chú ý gì) → mới nhẹ nhàng gợi ý Cao Thiên Kim.",
      "Rút gọn danh sách dược liệu, chỉ nêu vài vị tiêu biểu + tác dụng.",
      "Đổi giọng câu “kiên định” sang điềm tĩnh, có cơ sở khoa học.",
      "Bối cảnh: thay phông trắng bằng phòng khám/dược liệu/ánh sáng ấm.",
    ],
    gwt:
      "Lỗi “nhồi quá nhiều thứ” là lỗi GWT rất dễ mắc khi nói về lọc tổng: cấp lọc + vật liệu + độ cứng + bảo hành + lịch thay lõi trong 1 clip. Chọn 1 trục, phần còn lại để clip khác. Và cảnh quay phải khớp lời: đang nói “nước trong hơn” thì cho thấy nước, đừng cho thấy vỏ máy.",
    laws: ["Đừng biến clip thành giáo trình", "Bối cảnh đừng phông trắng trơn", "Trình tự cảnh khớp câu thoại", "A4 đừng “sa” thẳng vào quảng cáo"],
  },
  {
    slug: "elation-toc-bac-som-sua",
    code: "E2",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Tóc bạc sớm — bản sửa (Huy sửa lại)",
    verdict: "fail",
    verdictNote: "Kém hơn bản gốc về avg-watch/tương tác",
    buoi: "Buổi 3",
    summary:
      "Case quan trọng nhất về kỷ luật sửa: sửa mà KHÔNG đo lại thì có thể làm video tệ đi.",
    failed: [
      "Vẫn giữ voice bị to hơn ở đoạn chuyển (chính người làm tự nhận trong buổi).",
      "So với view/tương tác bản trước, bản sửa CHƯA VƯỢT QUA được.",
      "Nhạc vẫn dùng 2 loại, loại 2 vẫn bị chê không hợp.",
      "Cảnh múc cao/đổ cao đẩy trước cảnh liên quan tới câu thoại đang nói (“da hồng hào hơn”).",
    ],
    fix: [
      "Cắt HẲN đoạn nhạc không hợp, không chỉ sửa nhẹ (gợi ý của leader trong buổi).",
      "Đảo lại thứ tự cảnh cho khớp lời thoại.",
      "Xử lý dứt điểm chênh lệch âm lượng ở chỗ chuyển cảnh.",
    ],
    gwt:
      "Bài học vận hành: mỗi lần sửa phải ghi lại CHỈ SỐ trước–sau. Nếu bản sửa kém hơn thì quay lại bản cũ, đừng cố bảo vệ công sức. Đúng tinh thần “kỷ luật vòng sửa” — sửa xong phải đổ lên cho xem và theo dõi tới khi xong.",
    laws: ["Kỷ luật vòng sửa", "Cân bằng tốc độ đọc và nhịp cắt", "Trình tự cảnh khớp câu thoại"],
  },
  {
    slug: "elation-roi-loan-kinh-nguyet",
    code: "E3",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Rối loạn kinh nguyệt — bản CS01",
    verdict: "fail",
    verdictNote: "600 view · 14/30 PAAST — sai chuyên môn",
    buoi: "Buổi 3",
    paastScore: "14/30",
    metrics: [
      { label: "view", value: "600" },
      { label: "xem TB", value: "20s" },
    ],
    summary:
      "Đặt vấn đề rối loạn kinh nguyệt nhưng lại quay sang nói da/tóc — sai chuyên môn, không trả lời đúng câu đã hỏi.",
    story:
      "Hook: “Sau tuổi 30, khi chu kỳ kinh nguyệt bắt đầu rối loạn, làn da sạm dần và tóc rụng ngày một nhiều — vậy phụ nữ Á Đông từ xa xưa đã làm gì để giữ được nhan sắc và sức khoẻ?” Nội dung dẫn Tứ Vật Thang + cơ chế nội tiết tố.",
    paast: [
      { k: "P", label: "Prefer (2/6)", text: "Curiosity 00:00–00:12 (bí quyết phụ nữ Á Đông xưa); Enrichment 00:45–01:50 (Tứ Vật Thang + cơ chế nội tiết tố)." },
      { k: "A1", label: "Action", text: "Hook 3s (Stop) + See Again (“hãy xem đến cuối…”) + Answer (CTA bình luận)." },
      { k: "A2", label: "Acknowledge", text: "Basics = Cao Thiên Kim; Reasons to Choose = kế thừa Tứ Vật Thang nhưng nâng cấp; Audience = phụ nữ Việt sau 30. Needs Context & Story: CHƯA CÓ." },
      { k: "S", label: "Stick", text: "Core mantra + câu chúc cuối video → đủ 2/2 mã nhận diện bắt buộc." },
      { k: "T", label: "Trust", text: "Tangible Evidence — dẫn nghiên cứu, số liệu, minh bạch cơ chế." },
    ],
    failed: [
      "SAI CHUYÊN MÔN: rối loạn kinh nguyệt bị quay sang nói về da/tóc.",
      "Không phân biệt rõ các dạng rối loạn (kinh ít/ngắn ngày, bế kinh/tắc kinh, u xơ/u nang) — gộp chung mơ hồ.",
      "Giọng đọc và nhạc không liên quan tới nhau.",
      "Có đoạn thoại lặp đi lặp lại; sound effect gây phân tán; nhịp phim đều đều không cao trào.",
      "Tỷ lệ nội dung Đông y/Tây y lệch.",
    ],
    fix: [
      "Đi đúng hướng: ảnh hưởng tới khả năng thụ thai, phụ khoa, thiếu máu, suy nhược cơ thể; đi sâu vào cơ chế nội tiết tố.",
      "Chọn lại nhạc khớp tông; hook nên upbeat, tránh tone trầm.",
      "Khớp âm thanh giữa hook mở đầu và đoạn kết.",
      "Dán nhãn rõ ràng khi minh hoạ để tránh gây hiểu lầm.",
    ],
    gwt:
      "Nguyên tắc “hỏi gì trả lời nấy” quan trọng với GWT: mở bằng “nước giếng nhiễm phèn” thì phải nói phèn, đừng lái sang cặn canxi vì đó là thứ mình có sẵn tư liệu. Và phân biệt rõ các dạng vấn đề nước (phèn / cứng / clo dư / vi sinh) — gộp chung là mất uy tín chuyên môn.",
    laws: ["Prefer bám sát đầu bài, Acknowledge chỉ là add-on", "Nhạc khớp mạch và có cao trào", "Nhắc gì → khách có hiểu không?"],
  },
  {
    slug: "elation-da-xin-mau",
    code: "E4",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Da xỉn màu — bản “Sửa” A4",
    verdict: "fail",
    verdictNote: "11/30 PAAST — điểm thấp nhất buổi",
    buoi: "Buổi 3",
    paastScore: "11/30",
    metrics: [{ label: "view", value: "0 (mới đăng)" }],
    summary:
      "Case điển hình nhất của lỗi hiểu sai A4: tưởng A4 là phải đi rất sâu vào sản phẩm → thành “viên đạn bọc đường”.",
    story:
      "Mở: “Cùng ở độ tuổi ngoài 30 có người da sắc xỉn, thiếu sức sống nhưng có người vẫn giữ được gương mặt tươi sáng hồng hào”. Giải thích da xỉn không chỉ do melanin, bề mặt da thô ráp/ánh sáng phản chiếu kém; Đông y nhìn vào huyết/khí huyết/tì.",
    paast: [
      { k: "P", label: "Prefer (2/6)", text: "Curiosity 0–15s; Enrichment kết hợp Đông–Tây y 0:25–2:05." },
      { k: "A1", label: "Action (3/6)", text: "Stop 0–3s; Answer ~2:10–2:15 (“hãy để lại tình trạng da ở phần bình luận”); Connect 2:40–2:50 (gợi liên tưởng mẹ/chị em)." },
      { k: "A2", label: "Acknowledge (3/6)", text: "Basics ~2:05–2:25 nhưng CHƯA giúp người xem nhận biết dịch vụ cốt lõi (tư vấn chống lão hoá); Reasons to Choose ~2:25–2:40 (phối dược liệu theo pháp trị, “địa đạo dược tài”); Story ~1:55–2:05 (6 năm nghiên cứu)." },
      { k: "S", label: "Stick (2/6)", text: "Signature Face + Core Mantra đạt." },
      { k: "T", label: "Trust (1/6)", text: "Chỉ đạt Tangible Evidence ~0:45–1:00 & ~1:50–2:05 (Skin Research and Technology 2021)." },
    ],
    failed: [
      "Đoạn cuối “tôi đã làm ra một cái cao thiên kim như thế này” khiến khách khó tính “ngửi thấy mùi quảng cáo là nhắn ngay”.",
      "Hệ quả kinh doanh: tăng chi phí quảng cáo vì phải trả tiền đập quảng cáo vào mặt người không muốn xem.",
      "Bị đảo ngược thành “viên đạn bọc đường” — mở đầu tưởng dạy kiến thức nhưng thực ra chỉ để bắn quảng cáo.",
    ],
    thien: [
      "Công thức ĐÚNG: khơi tò mò (vì sao da 2 người khác nhau dù cùng tuổi) → giải mã (khác nhau ở nội tiết tố/khí huyết) → dạy cách phòng chống (ăn uống, bổ sung) → MỚI nhẹ nhàng gợi ý “tôi thường tư vấn thêm 1 loại cao theo nguyên lý này”.",
      "Lỗi này có điểm chung với 2 con trước trong buổi — không phải lỗi cá nhân, là lỗi hiểu khung.",
    ],
    gwt:
      "Khuôn A4 chuẩn cho GWT: khơi tò mò (vì sao 2 nhà cùng khu mà một nhà vòi sen đóng cặn) → giải mã cơ chế (độ cứng nguồn, đường ống) → dạy cách tự kiểm tra và xử lý chung → MỚI nói “trong các ca như vậy tôi thường dùng giải pháp lọc tổng”. Đảo thứ tự này là mất tiền quảng cáo.",
    laws: ["A4 đừng “sa” thẳng vào quảng cáo", "Acknowledge ≠ nhồi kiến thức", "Prefer bám sát đầu bài, Acknowledge chỉ là add-on"],
  },
  {
    slug: "elation-da-xin-mau-sua-2",
    code: "E5",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Da xỉn màu — bản sửa lần 2",
    verdict: "fix",
    verdictNote: "Vẫn chưa trả lời trọn câu hỏi đã đặt ở đầu",
    buoi: "Buổi 3",
    summary: "Sửa rồi vẫn thiếu đúng cái quan trọng nhất: lý giải vì sao cùng 30 tuổi lại khác nhau.",
    failed: [
      "Thiếu phần lý giải rõ VÌ SAO cùng 30 tuổi lại khác nhau — chưa trả lời trọn vẹn câu hỏi mở đầu.",
      "Đoạn “Đông y — Tây y…” có tiếng chuông chùa chèn vào lúc đang nói về Tây y — sound effect lệch ngữ cảnh.",
      "Lặp lại đúng hình ảnh cũ (cảnh “thức khuya”) để mô tả — nhàm.",
    ],
    fix: [
      "Câu hỏi mở đầu phải dẫn tới: khác nhau ở NỘI TIẾT TỐ / khả năng dưỡng huyết, người không có sẵn cần bổ sung gì.",
      "Chọn sound effect khớp ngữ cảnh.",
      "Dùng ẩn dụ khác thay vì lặp lại hình cũ.",
    ],
    gwt:
      "Nhắc lại kỹ thuật đầu–cuối: khơi cái gì phải kết đúng cái đó. Với GWT, nếu hook hỏi “vì sao nhà A sạch nhà B cặn” thì phần kết phải trả lời chính câu đó bằng cơ chế, không được kết bằng “nên dùng máy lọc”.",
    laws: ["Tò mò phải có kết", "Đầu – cuối khép vòng", "Chuyển cảnh phải hợp nội dung"],
  },
  {
    slug: "elation-sua-chong-nang",
    code: "E6",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Sữa chống nắng nâng tone cho da nhạy cảm (Tây Y)",
    verdict: "win",
    verdictNote: "Video WIN tuần · 12/30 PAAST (bản P02: 3,2K view · 11/30)",
    buoi: "Buổi 3",
    paastScore: "12/30",
    metrics: [
      { label: "bản P02 view", value: "3,2K" },
      { label: "xem TB", value: "23s" },
      { label: "tương tác", value: "53" },
    ],
    summary:
      "Case dạy rõ nhất về HOOK: cùng nội dung, hook thuật ngữ thì chán, hook gần gũi thì win.",
    story:
      "Mở: “Ở trong nhà cả ngày, rất ít ra nắng nhưng da vẫn ngày càng xỉn màu, nám và khó dưỡng sáng lại?” — giải thích da âm thầm lão hoá do ánh sáng dù không tiếp xúc nắng.",
    paast: [
      { k: "P", label: "Prefer (2/6)", text: "Curiosity 0:00–0:10; Enrichment — lý do da chịu lão hoá do ánh sáng." },
      { k: "A1", label: "Action (3/6)", text: "Stop bằng câu hỏi nghịch lý; Engage 0:24–0:29; Answer 2:04–2:14 (“để lại tuổi, tình trạng da ở bình luận”)." },
      { k: "A2", label: "Acknowledge (4/6)", text: "Basics còn yếu (mới dùng visual, thiếu thông tin dịch vụ tư vấn chống lão hoá); Reasons to Choose — lá chắn phổ rộng không chỉ UVA/UVB mà cả ánh sáng khả kiến; Audience = phụ nữ 35–40 trong nhà/văn phòng." },
      { k: "S", label: "Stick (2/6)", text: "Signature Face + Core Mantra." },
      { k: "T", label: "Trust (1/6)", text: "Journal of Investigative Dermatology + dữ liệu kiểm nghiệm lâm sàng." },
    ],
    worked: ["Prefer là enrichment tốt — dạy cách chọn kem chống nắng, giải quyết đúng câu hỏi đã đặt."],
    failed: [
      "Bản P02: hook “ánh sáng khả kiến cũng có thể gây nám” — KHÓ HIỂU, hẹp tệp, không giải thích khả kiến là gì.",
      "Màu video hơi “quê” (vàng-xanh-đỏ chưa hài hoà).",
      "Chữ overlay lúc justify lúc căn giữa, không nhất quán.",
      "Acknowledge nên thêm một chút (bổ sung “trong quá trình thăm khám…”).",
    ],
    fix: [
      "Hook đổi sang gần gũi: “ở trong nhà mà da vẫn sạm…” rồi mới giải thích “ánh sáng khả kiến” ở phần sau.",
      "Bổ sung bước phục hồi da trước khi dùng kem chống nắng vào phần Needs Context.",
      "Thống nhất canh chữ overlay cả clip.",
    ],
    gwt:
      "Áp thẳng: đừng mở bằng “tổng chất rắn hoà tan TDS vượt ngưỡng”. Mở bằng “ấm siêu tốc nhà bạn cứ 2 tháng lại đóng một lớp trắng” rồi mới giải thích TDS/độ cứng ở phần sau. Thuật ngữ đặt SAU hiện tượng.",
    laws: ["Hook phải gần gũi, không thuật ngữ", "Enrichment phải kèm hành động cụ thể", "Text overlay canh chỉnh nhất quán"],
  },
  {
    slug: "elation-mat-na-sinh-hoc",
    code: "E7",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Mặt nạ sinh học (P01)",
    verdict: "win",
    verdictNote: "23K view · 14/30 PAAST — WIN nhưng Acknowledge sai",
    buoi: "Buổi 3",
    paastScore: "14/30",
    metrics: [
      { label: "view", value: "23K" },
      { label: "xem TB", value: "23s" },
      { label: "tương tác", value: "222" },
      { label: "follow", value: "4" },
    ],
    summary:
      "View cao nhất buổi nhưng vẫn dính lỗi Acknowledge — đây là chỗ Thiện đề nghị mở buổi đào tạo riêng.",
    story:
      "Hook nghịch lý: vì sao Phạm Băng Băng vẫn trẻ trung như tuổi đôi mươi dù nhiều người cùng tuổi đã có nếp nhăn/khô sạm/chảy xệ. Nội dung: nguy cơ da quá ẩm, xáo trộn lipid, suy yếu hàng rào bảo vệ + hướng dẫn chọn mặt nạ.",
    paast: [
      { k: "P", label: "Prefer (3/6)", text: "Curiosity 1:51–1:58; Aesthetics 0:00–1:15; Enrichment 1:17–1:48 + 2:13–2:47." },
      { k: "A1", label: "Action (3/6)", text: "Stop bằng nghịch lý; Connect+Answer — kêu share & để lại bình luận." },
      { k: "A2", label: "Acknowledge (3/6)", text: "Basics = mặt nạ phục hồi; Audience 2:27–2:31 = “da nhạy cảm, đặc biệt sau 30 tuổi”; Needs Context = “nổi mụn li ti, khô căng”." },
      { k: "S", label: "Stick (4/6)", text: "Core Mantra + Signature Face + Themed Stage." },
      { k: "T", label: "Trust (1/6)", text: "Chỉ đạt Tangible Evidence 1:31–1:48 (độ ẩm lớp sừng vượt 35% ảnh hưởng hàng rào da)." },
    ],
    failed: [
      "Acknowledge SAI HƯỚNG: video mới cho khán giả hiểu kiến thức trong clip, chưa cho hiểu ông Phúc BÁN GÌ, KHÁCH LÀ AI, KHI NÀO NÊN NHẮN TIN.",
      "Thumbnail “sao mắt trắng quá” gây cảm giác kỳ dị (uncanny).",
      "⚠️ Nguy cơ SAI THÔNG TIN SẢN PHẨM: mặt nạ giấy không phải là “mặt nạ sinh học”.",
      "Nếu quảng cáo hiệu quả đắp mặt nạ thường xuyên thì lời văn phải rất thuyết phục, tránh bị hiểu là khuyến khích lạm dụng.",
    ],
    thien: [
      "Đây là lỗi Acknowledge lặp lại nhiều lần trong buổi — cần buổi đào tạo riêng để không tái phạm.",
    ],
    gwt:
      "Bài học đắt nhất: VIEW CAO KHÔNG CỨU ĐƯỢC ACKNOWLEDGE SAI. Video GWT triệu view mà người xem không biết GWT bán gì, cho ai, khi nào nên inbox thì KPI (SĐT/inbox) vẫn bằng 0. Và cẩn thận gọi sai tên công nghệ — “lọc RO” ≠ “lọc nano” ≠ “lọc tổng”, gọi sai là sai thông tin sản phẩm.",
    laws: ["Acknowledge ≠ nhồi kiến thức", "Nhắc gì → khách có hiểu không?"],
  },
  {
    slug: "elation-lotion-phuc-hoi",
    code: "E8",
    brand: "Elation",
    brandFull: "Cao Thiên Kim · TS Đặng Hữu Phúc",
    title: "Lotion phục hồi da (P01)",
    verdict: "win",
    verdictNote: "16K view · xem TB 1p40s · 352 tương tác · 52 follow — WIN mạnh nhất",
    buoi: "Buổi 3",
    paastScore: "14/30",
    metrics: [
      { label: "view", value: "16K" },
      { label: "xem TB", value: "1p40s" },
      { label: "tương tác", value: "352" },
      { label: "follow", value: "52" },
    ],
    summary:
      "Xem trung bình 1 phút 40 giây và 52 follow — con số tốt nhất buổi. Thắng nhờ Enrichment làm được ngay.",
    story:
      "Hook nghịch lý: phụ nữ Nhật da khô/nhạy cảm hàng đầu nhưng lão hoá chậm nhất. Nội dung: kiến thức lipid + phương pháp “lotion mask” — sau rửa mặt, đắp bông/viên nén thấm lotion lên má/trán/cằm 3–5 phút.",
    paast: [
      { k: "P", label: "Prefer (2/6)", text: "Curiosity 0:00–0:08 (nghịch lý phụ nữ Nhật); Enrichment 0:35–1:50 (lipid + phương pháp làm được ngay)." },
      { k: "A1", label: "Action", text: "Hook 3s + See Again (khều xem đến cuối) + Answer (CTA bình luận để nhận tư vấn)." },
      { k: "A2", label: "Acknowledge (01:30–02:10)", text: "Basics = lotion phục hồi; Reasons = “không phải lotion nào cũng được, loại thường chỉ cấp nước rồi khô, loại này bù cả lipid”; Audience = da khô/nhạy cảm, người bận rộn. Deeper Value & Story: CHƯA CÓ." },
      { k: "T", label: "Trust", text: "Dẫn nghiên cứu + số liệu, trình bày minh bạch cơ chế." },
    ],
    worked: [
      "Enrichment kèm phương pháp LÀM ĐƯỢC NGAY (lotion mask) → giữ người xem tới 1p40s.",
      "Reasons to Choose nói rõ khác biệt với loại thường.",
    ],
    failed: [
      "Chưa có giá trị tầm nhìn + câu chuyện thương hiệu.",
      "Acknowledge vẫn sai — phải cho biết ông Phúc bán gì, khách của ông là ai, khác gì đại trà.",
      "CTA cần cụ thể hơn, không hô hào chung chung kiểu “hãy xem đi”.",
      "Chữ dày đặc trên màn hình, ảnh và chữ đè/xô lệch.",
      "Ảnh 3D tĩnh không cho thấy độ đặc/độ thấm của sản phẩm.",
    ],
    fix: [
      "Bôi THẬT ra tay/mặt và quay video để khán giả hình dung kết cấu.",
      "Thêm cảm xúc cá nhân để tăng độ relatable.",
      "Có nguồn/số liệu về sản phẩm thì phải nhắc để khách nhớ.",
      "Bố cục lại chữ overlay.",
    ],
    thien: [
      "Tranh luận kỹ thuật trong buổi: “lotion” khác “toner” — toner cân bằng da sau rửa mặt, hợp da dầu/thường; lotion đặc hơn, hợp da khô/thiếu ẩm.",
      "Lotion mask KHÔNG thay thế hoàn toàn mặt nạ, nhưng “chữa cháy” được khi thiếu thời gian.",
    ],
    gwt:
      "Công thức thắng áp cho GWT: dạy một việc khách LÀM ĐƯỢC NGAY (cách kiểm tra độ cứng bằng xà phòng, cách xả cặn bình nóng lạnh) → giữ chân lâu + ra follow. Và kết cấu/hiệu quả phải quay THẬT: dòng nước, lõi lọc bẩn sau 6 tháng — đừng render 3D.",
    laws: ["Enrichment phải kèm hành động cụ thể", "Kết cấu sản phẩm phải quay thật", "Acknowledge ≠ nhồi kiến thức", "Text overlay canh chỉnh nhất quán"],
  },
];
