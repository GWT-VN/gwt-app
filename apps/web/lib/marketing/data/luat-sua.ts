/**
 * "Luật sửa content của Thiện" — tri thức ẩn từ các buổi SECI, tách thành luật tra cứu được.
 * Nguồn: `Work GWT/Thiện Sharing/Thiện - Sharing 2 - Tổng hợp.md` (mục ⭐ A/B/C + mục 3)
 *        `Work GWT/Thiện Sharing/Thiện - Sharing 3 - Tổng hợp.md` (mục 2 A–F)
 *        `Tong-ket-buoi-hop-review-content.md`
 * Mỗi luật: tên · giải thích · buổi phát sinh · (nếu có) cách áp cho GWT.
 */

export type Luat = { t: string; d: string; from: string; gwt?: string };
export type LuatGroup = { g: string; sub: string; items: Luat[] };

export const LUAT_GROUPS: LuatGroup[] = [
  {
    g: "Mạch & logic",
    sub: "Cái quyết định người xem có trôi hết video hay “khựng lại” giữa chừng.",
    items: [
      {
        t: "Tò mò phải có kết",
        d: "Khơi tò mò gì thì CUỐI phải chính mình trả lời cái đó. Đừng khơi ra “0–0” rồi bỏ — người xem “khựng lại một cái xoáy xoáy, không trôi tiếp”.",
        from: "Buổi 2 + 3",
        gwt: "Hook “nước máy nhà bạn TDS bao nhiêu?” thì cuối phải có con số + kết luận, không được lảng sang chuyện khác.",
      },
      {
        t: "Insight khách hàng ngay từ đầu",
        d: "Insight = suy nghĩ thật của khách. Trước khi viết, phải biết cuối video giải quyết vấn đề gì cho người xem.",
        from: "Buổi 2",
      },
      {
        t: "Prefer / điểm chốt phải ở ĐẦU",
        d: "Đừng để tò mò và insight ở cuối — “cái final phải ở đầu”. Chủ đề nhân vật thì đừng kể tiểu sử dài, vào insight luôn.",
        from: "Buổi 2",
      },
      {
        t: "Logic phải chặt — không bế tắc, không tiêu cực",
        d: "Chuyên gia đã “không kết luận được” thì không thể đi hỏi người khác. Content đẩy người xem vào kết luận nản thì bỏ — “viral nó chửi cho”.",
        from: "Buổi 2",
      },
      {
        t: "Mạch phải liền",
        d: "Đừng để mạch đứt khúc rồi ghép clip khác vào. Giữ một mạch xuyên suốt; hỏng mạch thì viết lại bản khác, đừng sửa vặt.",
        from: "Buổi 2",
      },
      {
        t: "Đầu – cuối khép vòng",
        d: "Đoạn cuối quay lại nhắc câu chuyện đã mở ở đầu, tạo cảm giác trọn vẹn.",
        from: "Buổi 3",
      },
    ],
  },
  {
    g: "Hook & giữ chân",
    sub: "3 giây đầu quyết định có người xem hay không — và giữa video quyết định họ ở lại bao lâu.",
    items: [
      {
        t: "Hook phải ĐO ĐƯỢC",
        d: "Hook = “một hành động có chủ đích để giữ người xem ở lại”, và phải gắn chỉ số đo được. “Cái gì không đo được thì đừng biện vào.”",
        from: "Buổi 2",
      },
      {
        t: "Hook phải gần gũi, không thuật ngữ",
        d: "“Ánh sáng khả kiến gây sạm da” là hook hẹp tệp và khó hiểu → đổi thành “ở trong nhà cả ngày mà da vẫn xỉn màu”, cơ chế để phần sau.",
        from: "Buổi 3",
        gwt: "Đừng mở bằng “nước cứng do ion Ca²⁺/Mg²⁺” — mở bằng “vòi sen nhà bạn đóng cặn trắng”.",
      },
      {
        t: "Mini-hook giữa video",
        d: "Khi cắt sang ý mới hoặc trước đoạn giải thích dài, gài một “hụt nhỏ” (câu hỏi hoặc visual hook) để kéo chú ý quay lại.",
        from: "Buổi 2 + 3",
      },
      {
        t: "Báo trước “đoạn sau dài, hãy lưu lại”",
        d: "Trước khối kiến thức dày, nói thẳng cho người xem biết — vừa giữ chân vừa tăng lượt save.",
        from: "Buổi 2 + 3",
      },
      {
        t: "Chất liệu phải có mâu thuẫn / tự thân hấp dẫn",
        d: "Mượn chất liệu hot (người nổi tiếng, sự kiện) hoặc TỰ TẠO mâu thuẫn khi không có sẵn.",
        from: "Buổi 2",
      },
      {
        t: "Đỉnh cảm xúc / sứ mệnh > đoạn mẹo",
        d: "Đoạn giá trị nhất là giải thích + sứ mệnh, không phải mẹo kỹ thuật. Video “mẹo” cũ nên ghép thêm đoạn sứ mệnh để nâng giá trị.",
        from: "Buổi 2",
      },
    ],
  },
  {
    g: "Acknowledge & cách bán (A4)",
    sub: "Lỗi lặp lại nhiều nhất qua các buổi: hiểu sai A4 thành “phải đi sâu vào sản phẩm”.",
    items: [
      {
        t: "Acknowledge ≠ nhồi kiến thức",
        d: "Acknowledge là giúp khách hiểu MÌNH BÁN GÌ · CHO AI · KHI NÀO NÊN NHẮN TIN — không phải nhắc lại kiến thức vừa giảng. Lỗi này lặp nhiều lần tới mức đề xuất mở buổi đào tạo riêng.",
        from: "Buổi 3",
      },
      {
        t: "A4 đừng “sa” thẳng vào quảng cáo",
        d: "Đúng trình tự: giải thích cơ chế (thoả tò mò) → lời khuyên chung, Đông/Tây y xử lý ra sao → mới nhắc nhẹ sản phẩm như một lời khuyên.",
        from: "Buổi 3",
      },
      {
        t: "Prefer bám sát đầu bài, Acknowledge chỉ là add-on",
        d: "Mở bằng câu hỏi nào thì phải trả lời chính câu đó trước khi rẽ sang sản phẩm.",
        from: "Buổi 3",
      },
      {
        t: "Chỉ dùng sản phẩm khi “wow thật sự”",
        d: "Con nào chưa wow thì đừng ép vào video.",
        from: "Buổi 2",
      },
      {
        t: "Đừng “mệnh nào cũng hợp”",
        d: "Sản phẩm “cái gì cũng hợp” tạo cảm giác không chuyên. Không ai bỏ tiền mua món “ai dùng cũng được”.",
        from: "Buổi 2",
        gwt: "Nói rõ máy này hợp nguồn nước nào / KHÔNG hợp trường hợp nào, thay vì “phù hợp mọi gia đình”.",
      },
      {
        t: "Sản phẩm có 2 luồng công dụng thì phải nói cả 2",
        d: "Để cả hai tập khách hàng cùng thấy relatable, đừng chỉ nói cho một luồng.",
        from: "Buổi 3",
      },
      {
        t: "Enrichment phải kèm hành động cụ thể",
        d: "Không nêu hiện tượng suông rồi bảo “tham khảo”. Giải thích xong phải chỉ tiêu chí chọn, cách đọc thông số, cách kiểm tra.",
        from: "Buổi 3",
        gwt: "Nói về lõi lọc thì phải dạy luôn: nhìn dấu hiệu nào biết cần thay, đo bằng gì.",
      },
    ],
  },
  {
    g: "Action & CTA",
    sub: "Chấm điểm Action chỉ tính khi kịch bản CHỦ ĐỘNG kêu gọi.",
    items: [
      {
        t: "Action chỉ tính khi có CTA cụ thể",
        d: "Đoạn khiến người xem tự share/like mà kịch bản không kêu gọi thì không tính điểm — để chấm cho thống nhất.",
        from: "Buổi 3",
      },
      {
        t: "CTA đừng chạm chỗ tự ti",
        d: "Chủ đề dễ khiến người xem tự ti thì đừng hỏi tuổi — chỉ hỏi tình trạng.",
        from: "Buổi 3",
      },
      {
        t: "CTA lồng cả đầu lẫn cuối",
        d: "Video kể chuyện đạt tương tác tốt khi CTA xuất hiện ở cả hai đầu, không dồn hết vào cuối.",
        from: "Buổi 2",
      },
    ],
  },
  {
    g: "Giọng điệu & an toàn",
    sub: "Thiện lành, đúng nghề, và không tự đưa mình vào thế bị bắt lỗi.",
    items: [
      {
        t: "Văn nói > văn viết · góc người thợ > góc nhà kinh doanh",
        d: "Mềm, hài hước, chất phác. Kịch bản cứng thì chuyển sang văn nói. Kể theo tinh thần nghề, đừng bán hàng lộ liễu.",
        from: "Buổi 2",
      },
      {
        t: "Thiện lành, tránh tranh cãi — hỏi ngược thay vì khẳng định",
        d: "“Chiều vợ thì giàu” → “có phải ai giàu cũng chiều vợ không, hay do chiều vợ mà giàu?”. Khẳng định cứng dễ hớ.",
        from: "Buổi 2",
      },
      {
        t: "Claim tâm linh / chữa bệnh: nói “mình KHÔNG TIN”",
        d: "Không kết luận có hay không — nói lập trường cá nhân. Giữ phần cảm xúc, giữ phần sự thật kiểm chứng được.",
        from: "Buổi 2",
        gwt: "Áp thẳng cho mọi claim sức khoẻ của nước: xem thêm rules/ad-compliance-vn.md — luật QC thắng rule này.",
      },
      {
        t: "Chống chỉ định là yếu tố an toàn — đừng cắt cho gọn",
        d: "Bản sửa từng bỏ phần chống chỉ định để mạch gọn hơn; phải cân nhắc lại vì đây là an toàn/pháp lý.",
        from: "Buổi 3",
      },
      {
        t: "Đừng tự nhận “thủ công 100%”",
        d: "Máy cũng tham gia, có khâu máy làm tốt hơn người. Khẳng định tuyệt đối dễ bị bắt lỗi.",
        from: "Buổi 2",
      },
      {
        t: "Áp lực nêu ra phải THẬT của mình",
        d: "Thợ, giá vật liệu, tiến độ — đừng mượn áp lực giả không đúng ngành.",
        from: "Buổi 2",
      },
      {
        t: "Đừng biến clip thành giáo trình",
        d: "Liệt kê 20+ vị dược liệu vừa dễ sai tên vừa không hấp dẫn. Nêu vài cái tiêu biểu kèm tác dụng là đủ.",
        from: "Buổi 3",
        gwt: "Đừng đọc cả bảng 15 chỉ tiêu nước — chọn 2–3 chỉ số khách cảm nhận được.",
      },
      {
        t: "Nhắc gì → khách có hiểu không?",
        d: "Mỗi lần nhắc một khái niệm, kiểm tra người xem phổ thông có hiểu không. Thuật ngữ khô khan phải nói tự nhiên lại.",
        from: "Buổi 3",
      },
    ],
  },
  {
    g: "Mượn & nhân bản content",
    sub: "Học người khác mà không bê nguyên si.",
    items: [
      {
        t: "Mượn content phải khéo",
        d: "Đừng bê content “đánh đá” (chửi đối thủ) hay bối cảnh nước ngoài vào. Học nội dung TRÁI NGÀNH an toàn hơn; kể lại theo mạch khác.",
        from: "Buổi 2",
      },
      {
        t: "AI test → viral → quay thật",
        d: "Hình AI hơi fake, mất trust. Quay test bằng AI, con nào win thì quay thật, rồi share source cho các team.",
        from: "Buổi 2",
      },
      {
        t: "Mở rộng tệp",
        d: "Video kiến thức sâu về một ngách chỉ hợp người mê ngách đó → phải nêu được “vì sao mọi người phải xem”.",
        from: "Buổi 2",
      },
      {
        t: "Con nào “còn tín hiệu” thì sửa, không bỏ",
        d: "Chưa win nhưng chưa chết thì giữ và sửa nhẹ. Chỉ bỏ khi logic hỏng từ gốc.",
        from: "Buổi 2",
      },
    ],
  },
  {
    g: "Kỹ thuật dựng",
    sub: "Cách dựng phải phục vụ nội dung — không được cản trở.",
    items: [
      {
        t: "Nhạc khớp mạch và có cao trào",
        d: "Tránh nhạc chậm mà nói nhanh, mút nhạc lệch, trôi đều không cao trào. Trộn nhiều thể loại trong 1 clip thì nhạc “đánh nhau” với giọng đọc.",
        from: "Buổi 2 + 3",
      },
      {
        t: "Cân bằng tốc độ đọc và nhịp cắt",
        d: "Voice AI to hơn ở chỗ chuyển cảnh, đọc dồn dập khiến hình cũng phải cắt nhanh theo.",
        from: "Buổi 3",
      },
      {
        t: "Sound effect đúng chỗ, không lạm dụng",
        d: "Tiếng gõ, leng keng dùng đúng chỗ thì tăng hiệu ứng; mix quá nhiều trong một đoạn thì rối.",
        from: "Buổi 3",
      },
      {
        t: "Chuyển cảnh phải hợp nội dung",
        d: "Hiệu ứng “lật trang giấy” chỉ hợp khi đang nói về sách/tài liệu.",
        from: "Buổi 3",
      },
      {
        t: "Trình tự cảnh khớp câu thoại",
        d: "Nói “da hồng hào hơn” thì cho cảnh da hồng hào lên trước. Cảnh không khớp lời thoại thì vô nghĩa.",
        from: "Buổi 3",
      },
      {
        t: "Bối cảnh đừng phông trắng trơn",
        d: "Nhân vật ngồi lọt thỏm giữa nền trắng làm mất uy tín hình ảnh. Cần bối cảnh có chất liệu nghề.",
        from: "Buổi 3",
        gwt: "Quay tại chỗ lắp máy, trạm cấp nước, phòng kỹ thuật — không phông trắng studio.",
      },
      {
        t: "Text overlay canh chỉnh nhất quán",
        d: "Justify/center phải thống nhất cả clip; tránh chữ đè lên nhau hoặc đè logo.",
        from: "Buổi 3",
      },
      {
        t: "Kết cấu sản phẩm phải quay thật",
        d: "Ảnh 3D tĩnh không thể hiện được kết cấu. Quay thật để khách hình dung.",
        from: "Buổi 3",
        gwt: "Dòng nước, cặn lọc, màng lọc bẩn — quay thật, đừng render.",
      },
    ],
  },
  {
    g: "Kỷ luật vận hành",
    sub: "Không có kỷ luật thì góp ý bay hết sau buổi họp.",
    items: [
      {
        t: "Kỷ luật vòng sửa",
        d: "Người nhận xét góp ý → người làm SỬA → ĐỔ LÊN cho xem → đăng/chưa đăng → theo dõi tới khi xong. “Con nào được sửa thì rất chân quý.”",
        from: "Buổi 2",
      },
      {
        t: "Bám lý thuyết, đừng “trùng hợp”",
        d: "Mạch content không khớp hook nghĩa là chưa hiểu mình đang làm gì — hỏi lại và bám PAAST, đừng ăn may, đừng “mò, bịa ra”.",
        from: "Buổi 2",
      },
      {
        t: "Lỗi lặp lại thì mở buổi đào tạo riêng",
        d: "Một lỗi bị nhắc nhiều lần (vd Acknowledge sai) là dấu hiệu thiếu đào tạo, không phải thiếu cố gắng.",
        from: "Buổi 3",
      },
      {
        t: "KPI phải đo được",
        d: "KPI tuần giao rõ ràng, đo bằng SĐT/inbox và đơn chốt — không phải view.",
        from: "Buổi 2",
      },
    ],
  },
];

export const LUAT_COUNT = LUAT_GROUPS.reduce((n, g) => n + g.items.length, 0);
