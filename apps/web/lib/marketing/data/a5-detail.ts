/**
 * Chi tiết từng tuyến A1–A5.
 * Nguồn: `Work GWT/Thiện Sharing/Thiện - Sharing 1.md` (bảng gốc + ví dụ GWT của anh Thiện)
 *        `Work GWT/Thiện Sharing/Framework Video/Content - 5A Signal.docx` (phương pháp luận,
 *        lý thuyết nền, ứng dụng & rủi ro AI cho từng tuyến).
 */

export type Theory = {
  name: string;
  origin: string;
  essence: string[];
  deepen: string;
  compass: string;
};

export type Tuyen = {
  cat: "A1" | "A2" | "A3" | "A4" | "A5";
  slug: string;
  name: string;
  en: string;
  /** Một câu trả lời “tuyến này làm nhiệm vụ gì”. */
  purpose: string;
  /** Câu hỏi khách hàng đang trả lời khi xem tuyến này. */
  question: string;
  /** 2–4 đoạn giải thích bản chất. */
  essence: string[];
  /** Nên gồm những dạng gì. */
  forms: string[];
  kpis: string[];
  /** Lưu ý chiến lược — chỗ hay làm sai. */
  strategy: string[];
  theory: Theory;
  aiUse: string[];
  aiRisk: { risk: string[]; fix: string };
  /** Áp cho GWT: ví dụ đề tài + cách làm. */
  gwtIdeas: string[];
  gwtNote: string;
  /** Slug ca trong kho case minh hoạ cho tuyến này. */
  cases?: string[];
  laws?: string[];
};

export const TUYEN: Tuyen[] = [
  {
    cat: "A1",
    slug: "a1",
    name: "Thú vị — Mass Traffic",
    en: "Mass Traffic Content · Attention",
    purpose: "Mở rộng độ phủ và tạo cảm giác “quen mặt”",
    question: "“Cái này là cái gì mà hay thế?”",
    essence: [
      "Lớp nội dung rộng nhất, kéo sự chú ý của nhóm khách hàng tiềm năng lớn — đặc biệt là người CHƯA có nhu cầu rõ ràng hoặc chưa biết đến thương hiệu.",
      "A1 không phải content “cho vui” thuần tuý, mà là TRAFFIC CÓ ĐỊNH HƯỚNG. Mục tiêu là khiến khách hàng nhiều lần nhìn thấy IP/thương hiệu, cảm thấy “quen”, tạo tiền đề ghi nhớ sau này.",
      "Chủ đề phải giàu tính giải trí, dễ chia sẻ, hook mạnh về cảm xúc — nhưng vẫn nằm trong VÙNG LIÊN TƯỞNG của ngành hàng. Tách quá xa ngành thì có view nhưng không tạo giá trị thương hiệu.",
    ],
    forms: [
      "Insight phổ thông của ngành",
      "Tình huống đời thường liên quan đến vấn đề ngành",
      "Meme, hài hước, bắt trend nhưng có liên hệ tới category",
      "“Sự thật thú vị”, “điều ít ai biết”, “lỗi mọi người hay mắc”",
      "Format ngắn, nhanh, dễ hiểu, dễ chia sẻ",
    ],
    kpis: ["Reach / View", "Share", "Follower growth", "Tỷ lệ người xem mới", "Cost per 1.000 qualified views (nếu boost)"],
    strategy: [
      "A1 phải trả lời được: “Người xem NHỚ GÌ về mình sau khi xem xong?” Nếu chỉ nhớ nội dung vui mà không nhớ người nói, không nhớ ngữ cảnh ngành, không nhớ biểu tượng thương hiệu → A1 đang tạo attention cho NỀN TẢNG chứ không tạo mental availability cho thương hiệu.",
      "Độ phủ rộng nhưng KHÔNG được lệch tệp. Làm nội dung giải trí tạp nham giật gân là hỏng định vị.",
    ],
    theory: {
      name: "Thuyết Sử dụng và Thoả mãn (Uses and Gratifications Theory — UGT)",
      origin: "Elihu Katz, Jay Blumler & Michael Gurevitch (1974)",
      essence: [
        "UGT bác bỏ quan điểm khán giả là người tiếp nhận thụ động.",
        "Người dùng cực kỳ CHỦ ĐỘNG tìm nội dung để thoả mãn nhu cầu tâm lý/xã hội: giải trí, trốn tránh thực tại, tìm sự thuộc về.",
      ],
      deepen:
        "Đừng làm nội dung “thú vị nói chung” — map chính xác tệp khách của bạn đang cần thoả mãn nhu cầu UGT nào nhất khi họ cầm điện thoại lên.",
      compass:
        "Khách hàng không nợ bạn sự chú ý. A1 phải hoạt động như một “phần thưởng dopamine” ngay lập tức. Nội dung ngành khô khan thì phải bọc trong lớp vỏ giải trí (Edutainment) để vượt qua màng lọc phòng vệ của não bộ.",
    },
    aiUse: [
      "Social Listening (Meltwater/BuzzSumo) dò Trending Topics theo thời gian thực",
      "Gom bình luận/FAQ để phát hiện pattern câu hỏi",
      "Sinh nhiều hook, tiêu đề, angle khác nhau",
      "Tái chế 1 ý tưởng thành 10 biến thể theo từng platform",
      "Tự động cắt clip, chèn subtitle, A/B test 3 giây đầu",
    ],
    aiRisk: {
      risk: [
        "“Sea of Sameness” — ai cũng dùng AI bắt trend, nội dung thành công nghiệp và nhạt nhoà",
        "Hook giật mạnh nhưng rỗng giá trị",
        "Lạm dụng trend làm loãng định vị",
        "Thuật toán hạ cấp (shadowban) nội dung AI spam, thiếu sáng tạo nguyên bản",
      ],
      fix: "Số lượng chỉ có ý nghĩa khi được tổ chức theo kiến trúc đúng. Mỗi A1 vẫn phải để lại một dấu ấn nhận diện.",
    },
    gwtIdeas: [
      "“Phát hiện mỏ suối khoáng gần nhà có cần khai báo chính quyền không?”",
      "“Nước từ suối khoáng uống trực tiếp được không?”",
      "Bút TDS đo nước mưa vs nước máy vs nước RO — con số gây bất ngờ",
      "“Lỗi ai cũng mắc khi đun nước” — sự thật ít ai biết về cặn ấm siêu tốc",
    ],
    gwtNote:
      "Với GWT, vùng liên tưởng ngành là NƯỚC — mọi thứ liên quan tới nước sinh hoạt, nước uống, đường ống, thiết bị dùng nước đều hợp lệ. Nhưng phải nhớ mặt kỹ sư nước, không chỉ nhớ trò lạ.",
    cases: ["vcb-top-thuong-hieu", "vcb-noi-vang"],
    laws: ["Hook phải gần gũi, không thuật ngữ", "Mở rộng tệp", "Mượn content phải khéo"],
  },
  {
    cat: "A2",
    slug: "a2",
    name: "Chuyên gia — Authority",
    en: "Knowledge / Authority Content",
    purpose: "Xác lập năng lực chuyên môn và thẩm quyền",
    question: "“Người này có biết nghề thật không?”",
    essence: [
      "Nếu A1 giúp “quen mặt” thì A2 giúp ĐƯỢC CÔNG NHẬN là có năng lực thật.",
      "Nội dung phải cung cấp kiến thức chuyên sâu, “độc bản” (proprietary knowledge) mà người dùng KHÔNG dễ dàng tra cứu bằng một lệnh search thông thường.",
      "Khi AI ngày càng giỏi tổng hợp, kiểu “điểm tin”, “nói lại kiến thức cơ bản”, “list 5 điều ai cũng biết” sẽ ngày càng kém giá trị.",
    ],
    forms: [
      "Phân tích chuyên môn sâu",
      "Bóc tách case study thực tế",
      "Phản biện các hiểu lầm phổ biến trong ngành",
      "Hướng dẫn ra quyết định",
      "Framework / phương pháp luận",
      "So sánh các lựa chọn",
      "Cảnh báo sai lầm tốn tiền/tốn thời gian",
      "“Đây là điều internet chưa nói rõ”",
    ],
    kpis: [
      "Save / Share chất lượng",
      "Comment chiều sâu",
      "Tỷ lệ xem hết",
      "Tỷ lệ quay lại xem nội dung cùng chủ đề",
      "Lượng câu hỏi chuyên môn phát sinh",
      "Brand search / name search tăng dần",
    ],
    strategy: [
      "Tránh trở thành “người đọc bản tin”.",
      "Một A2 mạnh có ĐỒNG THỜI 3 TẦNG: (1) Kiến thức — thông tin đúng và có cấu trúc · (2) Phán đoán — quan điểm cá nhân có cơ sở · (3) Dấu ấn trình bày — cách kể khiến người xem nhớ AI đã nói điều đó.",
      "Thiếu tầng 2 và 3 → dễ bị AI thay thế. Thiếu tầng 1 → chỉ là “ý kiến cá nhân” thiếu độ tin cậy.",
    ],
    theory: {
      name: "Mô hình Khả năng Chế biến Thông tin (Elaboration Likelihood Model — ELM)",
      origin: "Richard E. Petty & John Cacioppo (1986)",
      essence: [
        "Con người xử lý thông tin qua 2 tuyến.",
        "Tuyến ngoại vi (Peripheral): xử lý nhanh, hời hợt, dựa vào cảm xúc hoặc bề ngoài — hợp với A1.",
        "Tuyến trung tâm (Central): đòi hỏi nỗ lực nhận thức cao, phân tích logic và bằng chứng. Thay đổi thái độ ở tuyến này BỀN VỮNG và khó bị phá vỡ nhất.",
      ],
      deepen:
        "A2 BẮT BUỘC nhắm vào tuyến trung tâm. Muốn vậy khách phải có cả Động lực (Motivation) lẫn Khả năng (Ability) xử lý thông tin.",
      compass:
        "Đừng ném báo cáo ngành và thuật ngữ khô khan (làm giảm “Ability” của người đọc). Dùng phương pháp sư phạm, cấu trúc logic chặt, phép ẩn dụ để dẫn não họ tự suy luận. Khi họ tự “ngộ” ra kiến thức, thẩm quyền của bạn trở nên bất khả xâm phạm.",
    },
    aiUse: [
      "Tổng hợp tài liệu nghiên cứu/báo cáo ngành thành dàn ý logic",
      "Chuyển ngôn ngữ chuyên ngành sang ngôn ngữ phổ thông",
      "Trích xuất insight từ transcript, ghi chú, webinar",
      "Biến 1 bài dài thành nhiều asset nhỏ: clip, carousel, post, FAQ",
    ],
    aiRisk: {
      risk: [
        "“Hallucination” — AI bịa số liệu hoặc trích dẫn sai nghiên cứu",
        "AI thiếu “skin in the game”: người trong ngành nhận ra ngay sự sáo rỗng",
        "Nội dung quá “sạch”, giống sách giáo khoa, mất cá tính",
        "Chuyên gia bị biến thành “người tóm tắt internet”",
      ],
      fix: "A2 phải thêm thứ AI khó sao chép: thực chiến + lập trường + ví dụ riêng + cách nhìn riêng + DỮ LIỆU RIÊNG + kinh nghiệm xử lý tình huống thật.",
    },
    gwtIdeas: [
      "Lịch sử GE — câu chuyện đằng sau, không phải năm thành lập",
      "“Làm nóng 3S”: màng lọc là gì, hoạt động thế nào, ảnh hưởng sức khoẻ ra sao, vị nước đổi thế nào",
      "Phản biện hiểu lầm: “nước RO mất khoáng có hại không?”",
      "So sánh lựa chọn: khi nào cần lọc tổng, khi nào chỉ cần lọc điểm dùng",
      "Cảnh báo tốn tiền: chọn sai công suất máy làm mềm",
    ],
    gwtNote:
      "DỮ LIỆU RIÊNG của GWT là lợi thế lớn nhất ở tuyến này: file “Kết quả nước tại các công ty cấp nước tỉnh thành Việt Nam” cho độ cứng theo TỪNG nhà máy. Đó chính xác là thứ AI không tra được. ⚠️ Mọi con số phải theo `rules/nguon-dan-chung.md` — hạng A/B, và transcript tự động chỉ là hạng C.",
    cases: ["vcb-kim-cuong-that-gia", "vcb-bac-nam-cham-hut", "ref-bai-hoc-song", "ref-bs-hoang-anh-tuyet"],
    laws: ["Enrichment phải kèm hành động cụ thể", "Nhắc gì → khách có hiểu không?", "Đừng biến clip thành giáo trình"],
  },
  {
    cat: "A3",
    slug: "a3",
    name: "Niềm tin — Human Proof",
    en: "Trust / Human Proof Content",
    purpose: "Biến “chuyên gia/thương hiệu” thành một thực thể đáng tin và đáng gần",
    question: "“Người này có đáng tin không? Thương hiệu này có sống đúng điều họ nói không?”",
    essence: [
      "Kéo IP/thương hiệu từ bục chuyên gia XUỐNG đời sống thực, biến họ thành một thực thể sống động.",
      "Khách hàng không chỉ mua vì chuyên môn; họ còn mua vì tin rằng người này CÓ THẬT, SỐNG THẬT, LÀM THẬT, và phù hợp với mình.",
      "A3 KHÔNG đồng nghĩa với “đăng đời tư”. Nội dung đời sống chỉ trở thành A3 khi nó gia tăng tín nhiệm hoặc kết nối có ý nghĩa.",
    ],
    forms: [
      "Hậu trường làm việc thật",
      "Hành trình xử lý một ca khó / vấn đề khó",
      "Phản hồi khách hàng KÈM BỐI CẢNH",
      "Hoạt động xã hội, đào tạo, nghiên cứu, thi cử, giải thưởng",
      "Tiêu chuẩn nghề nghiệp",
      "“Một ngày làm việc” — nhưng phải có giá trị quan sát",
      "Giá trị sống liên quan trực tiếp đến thương hiệu",
    ],
    kpis: [
      "Comment có chiều sâu",
      "Lời khen, sự tin tưởng, sự hỏi han",
      "DM mang tính tham khảo",
      "Tỷ lệ người xem quay lại",
      "Tỷ lệ chuyển từ follower lạnh sang follower ấm",
    ],
    strategy: [
      "Mọi nội dung cá nhân phải soi qua lăng kính giá trị cốt lõi (Chân – Thiện – Mỹ). Không đăng nội dung cá nhân vô thưởng vô phạt.",
      "A3 mạnh khi làm được 2 việc: chứng minh TÍNH NGƯỜI, và chứng minh TÍNH THẬT.",
      "Ở tuyến này, “quá hoàn hảo” đôi khi lại LÀM GIẢM uy tín.",
    ],
    theory: {
      name: "Thuyết Độ tin cậy của Nguồn phát & Thuyết Bộc lộ Bản thân",
      origin: "Hovland, Janis & Kelley (1953) · Sidney Jourard (1958)",
      essence: [
        "Hovland: sức thuyết phục phụ thuộc 3 yếu tố của nguồn phát — Chuyên môn (Expertise), Đáng tin cậy (Trustworthiness), Hấp dẫn/đồng điệu (Attractiveness). A2 đã lo “Chuyên môn”; A3 sinh ra để lấp 2 yếu tố còn lại.",
        "Jourard: sự thân mật và niềm tin tỷ lệ thuận với mức độ và độ sâu của việc TỰ BỘC LỘ (self-disclosure). Chia sẻ điểm yếu, góc khuất, giá trị sống thật sẽ phá vỡ bức tường phòng thủ tâm lý.",
      ],
      deepen:
        "Thiết kế một “Thang đo Bộc lộ” — không phải cái gì cũng khoe ra. Chọn lọc bộc lộ những góc đời thường/triết lý cá nhân cộng hưởng mạnh với hệ giá trị thương hiệu. Tiêu chuẩn: “Vulnerability có thể kiểm chứng” — mọi tự bộc lộ phải gắn với một cột mốc THỰC TẾ.",
      compass:
        "“Perfection is intimidating, vulnerability is connecting.” Khách tin một chuyên gia thỉnh thoảng chia sẻ về thất bại và cách vượt qua, hơn là người luôn đóng vai hoàn mỹ.",
    },
    aiUse: [
      "Phân tích sắc thái bình luận (Sentiment Analysis) để tìm pain point ẩn",
      "Gom dữ liệu phản hồi khách hàng thành insight",
      "Cắt các khoảnh khắc thật từ vlog, livestream, workshop",
      "⚠️ AI ở A3 chỉ nên đóng vai BIÊN TẬP VIÊN, không phải tác giả chính",
    ],
    aiRisk: {
      risk: [
        "Đây là tuyến KỴ AI nhất — sụp đổ niềm tin (Trust Deficit)",
        "Hậu trường giả, testimonial giả, cảm xúc giả",
        "Bài tâm sự “đậm chất ngôn tình” do AI viết",
        "Lạm dụng avatar/voice AI khiến người xem thấy xa cách",
        "Social proof bị format hoá quá mức",
      ],
      fix: "A3 phải có DẤU VẾT THỰC: bối cảnh thật, người thật, tình huống thật, chi tiết thật, LỖI NHỎ THẬT, ngôn ngữ thật.",
    },
    gwtIdeas: [
      "“Lắp xong khách bảo không thích nữa — hãng xử lý sao?”",
      "Các trục trặc vận hành thật và cách đội kỹ thuật xử lý",
      "Hoạt động đi làm sạch hồ / hoạt động cộng đồng về nước",
      "Một ca nước giếng nhiễm phèn nặng: từ lúc khảo sát đến lúc bàn giao",
    ],
    gwtNote:
      "Đây là tuyến GWT có lợi thế mà đối thủ khó copy: đội kỹ thuật đi lắp thật, gặp ca khó thật. Quay tại chỗ lắp, ở kho, ở trạm cấp nước — đừng phông trắng studio (xem case E1).",
    cases: ["vcb-tre-don-3d", "vcb-5h30-tan-lam", "vcb-tam-su-nghe", "vcb-nhan-phuc-che"],
    laws: ["Bối cảnh đừng phông trắng trơn", "Áp lực nêu ra phải THẬT của mình", "Văn nói > văn viết · góc người thợ > góc nhà kinh doanh"],
  },
  {
    cat: "A4",
    slug: "a4",
    name: "Sản phẩm — Conversion",
    en: "Conversion Content",
    purpose: "Hỗ trợ ra quyết định và kích hoạt hành động mua",
    question: "“Cái này có hợp với tôi không, và tôi phải làm gì tiếp?”",
    essence: [
      "A4 phục vụ trực tiếp cho chuyển đổi: inbox, điền form, đặt lịch, để lại số điện thoại, chốt đơn.",
      "Nhưng A4 hiệu quả nhất khi KHÔNG vận hành theo kiểu “tự khen mình”, mà giúp người xem TỰ RÚT RA kết luận rằng sản phẩm phù hợp với họ. Nguyên tắc: “Show, don’t tell”.",
      "Trong giai đoạn đánh giá của “messy middle”, người mua cần bằng chứng, khung so sánh, use case, review, demo, social proof. A4 nên được thiết kế như nội dung GIẢM MA SÁT NHẬN THỨC, không chỉ là nội dung chào bán.",
    ],
    forms: [
      "Demo sản phẩm trong tình huống sử dụng thật",
      "Trước/sau — nhưng phải có ngữ cảnh",
      "FAQ chuyển đổi",
      "So sánh lựa chọn",
      "Xử lý phản đối phổ biến",
      "Case khách hàng",
      "Review / unboxing / test thực tế",
      "“Sản phẩm này phù hợp với ai và KHÔNG phù hợp với ai”",
    ],
    kpis: ["Click to DM / Inbox", "Lead form", "Conversion rate", "CPA / CAC", "Revenue per content piece", "Assisted conversion"],
    strategy: [
      "Thay vì tuyên bố “sản phẩm của tôi tốt nhất”, hãy kể case về sự chuyển hoá của khách, hoặc đưa chứng lý sắc bén để khách TỰ đi đến kết luận.",
      "A4 tốt trả lời 5 câu: (1) Dành cho ai? (2) Giải quyết vấn đề gì? (3) Khác gì lựa chọn khác? (4) Bằng chứng nào cho thấy nó đáng tin? (5) Hành động tiếp theo là gì?",
      "Không thể chỉ nhìn inbox/đơn hàng last-click — phải đặt trong mối liên hệ với A1–A3 phía trên.",
    ],
    theory: {
      name: "Mô hình Hành vi Fogg (B = MAP)",
      origin: "TS B.J. Fogg — Behavior Design Lab, Đại học Stanford",
      essence: [
        "Hành vi (mua hàng/inbox) chỉ xảy ra khi 3 yếu tố HỘI TỤ CÙNG MỘT THỜI ĐIỂM.",
        "M (Motivation — Động lực): được tích luỹ từ A1, A2, A3.",
        "A (Ability — Độ dễ dàng): sản phẩm dễ hiểu, quy trình mua mượt, rào cản phù hợp.",
        "P (Prompt — Lời nhắc): chính là nội dung A4.",
      ],
      deepen:
        "Nhiều chiến dịch CHẾT ở A4 vì tung Prompt (kêu gọi mua) khi Motivation của khách đang ở DƯỚI đường giới hạn hành động.",
      compass:
        "Khi làm A4, ĐỪNG cố tăng Motivation (việc đó của A2, A3). Tập trung tối đa vào tăng Ability — làm việc ra quyết định trở nên cực kỳ dễ và ít rủi ro: social proof, cam kết rủi ro bằng 0, cấu trúc dẫn dắt logic.",
    },
    aiUse: [
      "Phân tích câu hỏi chat/inbox để xác định objection thật",
      "Viết nhiều phiên bản sales angle + A/B test headline và CTA",
      "Tạo comparison sheet, FAQ sheet, product script",
      "Chấm điểm content nào có khả năng chuyển đổi cao hơn từ dữ liệu lịch sử",
    ],
    aiRisk: {
      risk: [
        "“Robotic Selling” — AI tối ưu theo hướng hối thúc FOMO máy móc, nghe như tờ rơi",
        "Nội dung bán hàng bị template hoá, ai cũng nói giống nhau",
        "Lạm dụng urgency/scarcity giả gây phản cảm",
        "Sản phẩm được trình bày hoàn hảo quá mức, không giống trải nghiệm thật",
      ],
      fix: "Evidence over adjectives. Ít “hay lắm/tốt lắm/đỉnh lắm”, nhiều “cho thấy / cách dùng / kết quả / so sánh / phù hợp – không phù hợp”.",
    },
    gwtIdeas: [
      "Demo tại nhà khách: đo nước đầu vào → đầu ra, có ngữ cảnh cụ thể",
      "“Máy này phù hợp với ai và KHÔNG phù hợp với ai” — nguồn nước nào nên chọn giải pháp khác",
      "Xử lý phản đối: “lắp lọc tổng có phải đục tường không?”, “bao lâu thay lõi?”",
      "Lõi lọc sau 6 tháng ở nhà khách — quay thật, không render",
    ],
    gwtNote:
      "⚠️ Ranh giới của GWT ở tuyến này chặt hơn ngành khác: KHÔNG nêu giá (masterdata không còn nguồn giá), KHÔNG nói như thuốc/chữa bệnh, KHÔNG so sánh đối thủ thiếu tài liệu. Số liệu được phép nêu: bảo hành · số lõi · chu kỳ thay. Xem `rules/ad-compliance-vn.md` và `rules/video-loc-tong.md` (video lọc tổng không nêu mã bộ).",
    cases: ["elation-da-xin-mau", "elation-lotion-phuc-hoi", "elation-mat-na-sinh-hoc", "vcb-nhan-big-size"],
    laws: ["A4 đừng “sa” thẳng vào quảng cáo", "Acknowledge ≠ nhồi kiến thức", "Đừng “mệnh nào cũng hợp”", "Kết cấu sản phẩm phải quay thật"],
  },
  {
    cat: "A5",
    slug: "a5",
    name: "Kết hợp — Hero",
    en: "Combination Content",
    purpose: "Nội dung hợp lực: vừa lan truyền, vừa xây thẩm quyền, vừa hỗ trợ bán",
    question: "“Đây là ai, họ tin vào điều gì, và vì sao tôi nên theo họ?”",
    essence: [
      "“Vũ khí hạng nặng” (Hero Content) — nơi 4 lớp trên được kết hợp trong MỘT đơn vị nội dung mạnh.",
      "Thường tốn nhiều nguồn lực: một chuỗi workshop quy mô lớn, một phim tài liệu ngắn về thương hiệu, một báo cáo ngành thường niên.",
      "A5 hiệu quả cao vì bám sát cách người dùng ra quyết định thực tế: họ không tách rời “xem vui / học / tin / mua”, mà cảm nhận đồng thời nhiều thứ trong cùng một hành trình.",
    ],
    forms: [
      "Một case study kể như một câu chuyện đời thật",
      "Một video trải nghiệm thực tế vừa giải trí vừa cho thấy chuyên môn",
      "Một bài phân tích sâu nhưng có demo sản phẩm",
      "Một video hậu trường xử lý vấn đề thật của khách, kết bằng lời mời hành động tự nhiên",
    ],
    kpis: [
      "Tổng hợp: reach + save + share + comment + DM + conversion",
      "View-to-conversion",
      "Watch time",
      "Assisted revenue",
      "Brand lift / search lift nếu đo được",
    ],
    strategy: [
      "A5 vẫn phải có MỘT TRỤC CHÍNH. Một nội dung không nên cố làm 4 việc ngang nhau — nên có 1 mục tiêu chính, 2 mục tiêu phụ.",
      "Chỉ số “Khấu hao Nội dung” (Amortization of Content): A5 tốn 100 triệu KHÔNG phải để thu hồi vốn trong tháng. Nó được chẻ nhỏ thành ~50 video A2, ~100 post A1, ~30 câu chuyện A3 → điểm hoà vốn nằm ở chỗ nó CẮT 80% chi phí sản xuất các tuyến còn lại trong 6 tháng tiếp theo, đồng thời tăng CR ở A4 nhờ hiệu ứng hào quang.",
      "A5 tạo Quyền lực định giá (Pricing Power) cho thương hiệu.",
    ],
    theory: {
      name: "Tâm lý học Gestalt",
      origin: "Max Wertheimer, Kurt Koffka — đầu thế kỷ 20",
      essence: [
        "“Tổng thể KHÁC BIỆT so với tổng các phần tử của nó.”",
        "Tâm trí con người nhận thức sự vật như một hình thức hợp nhất, có tổ chức — không phải những mảnh ghép rời rạc.",
      ],
      deepen:
        "A5 KHÔNG phải là A1 + A2 + A3 + A4 cộng lại. Nó là một bức tranh toàn cảnh mang tính biểu tượng, cung cấp cho não khách hàng một “Lược đồ nhận thức” hoàn chỉnh về hệ tư tưởng của thương hiệu.",
      compass:
        "Đầu tư mạnh cho các dự án A5 ĐỊNH KỲ. Chính “khí chất tổng thể” của A5 neo đậu vĩnh viễn trong tâm trí khách, biến họ thành tín đồ trung thành thay vì người mua một lần.",
    },
    aiUse: [
      "Map storyline đa tầng",
      "Phát hiện chỗ “thừa bán hàng” hoặc “thiếu hook”",
      "Chẻ 1 A5 thành hàng trăm micro-content phân phối ngược cho A1–A4",
      "Phân phối lại theo từng audience segment",
    ],
    aiRisk: {
      risk: [
        "Quá phụ thuộc công nghệ làm mất “Tâm hồn” của chiến dịch lớn",
        "Ôm đồm: quá nhiều lớp thông tin khiến video loãng",
        "Hook yếu vì tham đủ thứ; không rõ CTA",
        "Nhìn tưởng đa tầng nhưng thực ra chỉ là sales content nguỵ trang",
      ],
      fix: "Ý tưởng đột phá đòi hỏi trực giác và sự rung cảm của con người — thứ máy chưa mô phỏng được. Giữ 1 trục chính.",
    },
    gwtIdeas: [
      "Series chuyên gia LỌC TỔNG 21+2 tập — đã có bản nháp trong `drafts/scripts/POE-chuyengia-series-v1.md`",
      "Phóng sự một vùng nước khó: khảo sát → đo → xử lý → đo lại → nhà khách sau 6 tháng",
      "Báo cáo thường niên “bản đồ độ cứng nước Việt Nam” dựa trên dữ liệu riêng của GWT",
    ],
    gwtNote:
      "GWT đã có sẵn nguyên liệu A5 rất mạnh: series chuyên gia lọc tổng + file kết quả nước theo từng nhà máy cấp nước. Làm một lần rồi chẻ ra hàng chục A1/A2 — đúng logic “khấu hao nội dung”.",
    cases: ["vcb-tiffany-yellow-diamond", "vcb-ngoc-duong-nguoi"],
    laws: ["Đỉnh cảm xúc / sứ mệnh > đoạn mẹo", "Mạch phải liền", "Đầu – cuối khép vòng"],
  },
];

export function getTuyen(slug: string) {
  return TUYEN.find((t) => t.slug === slug || t.cat.toLowerCase() === slug.toLowerCase());
}

/** Tỷ trọng theo giai đoạn thương hiệu (Sharing 1 + docx mục 5). */
export const TY_TRONG = [
  {
    stage: "Giai đoạn 1 — mới xây IP/thương hiệu",
    now: true,
    items: ["A1 NHIỀU để mở reach", "A2 đủ để chứng minh năng lực", "A3 bắt đầu xuất hiện để tạo tính thật", "A4 vừa phải", "A5 ít nhưng chất lượng"],
  },
  {
    stage: "Giai đoạn 2 — đã có nhận diện bước đầu",
    items: ["Giảm bớt A1 đại trà", "Tăng A2 và A3 để khoá vị thế", "Tăng A4 có hệ thống hơn", "Bắt đầu đầu tư A5 làm trụ cột"],
  },
  {
    stage: "Giai đoạn 3 — đã có cộng đồng / tệp ấm",
    items: ["A3 và A4 nhiều hơn", "A2 giữ độ uy tín", "A1 có chọn lọc", "A5 trở thành đòn bẩy chính"],
  },
];

/** Tỷ trọng theo LOẠI KÊNH (Sharing 1, mục ĐỊNH DẠNG). */
export const THEO_KENH = [
  {
    kenh: "Official — trang chính thức",
    note: "Tinh thần / linh hồn thương hiệu. VD: Cocoon, Xiaomi.",
    rows: [
      { cat: "A1", pct: "10%", label: "Thích", detail: "Tài trợ, từ thiện, TVC" },
      { cat: "A2", pct: "50%", label: "Biết", detail: "Bối cảnh sử dụng sản phẩm" },
      { cat: "A3", pct: "20%", label: "Tín", detail: "Collab KOL, billboard, giải thưởng, celeb mua hàng" },
      { cat: "A4", pct: "20%", label: "Nhớ", detail: "Bán" },
    ],
  },
  {
    kenh: "KOC inhouse — kênh nhân vật nội bộ",
    note: "Đây là mô hình GWT đang làm (KOL kỹ sư nước). Trục chính: Trust / tín nhiệm.",
    now: true,
    rows: [
      { cat: "A1", pct: "40%", label: "Thích", detail: "Info thú vị của ngành" },
      { cat: "A2", pct: "30%", label: "Biết", detail: "Mẹo, tips, kiến thức" },
      { cat: "A3", pct: "20%", label: "Tín", detail: "Câu chuyện nghề, xuất hiện ở sự kiện ngành, hình ảnh cá nhân" },
      { cat: "A4", pct: "10%", label: "Bán", detail: "Sản phẩm / doanh nghiệp" },
    ],
  },
];
