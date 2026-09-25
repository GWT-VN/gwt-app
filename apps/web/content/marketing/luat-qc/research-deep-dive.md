# Rule: Research Deep-Dive trước khi viết nội dung

> Áp dụng: mọi nội dung chuyên sâu (kịch bản video chuyên gia, bài viết dài, series).
> KHÔNG áp cho nội dung ngắn/nhanh (caption, hook đơn lẻ, social post).
> Kết quả: file knowledge-base `.md` trong `drafts/research/` — editor dùng làm nguồn.

---

## 1. Nguyên tắc lõi

**Rộng trước, sâu sau.** Thu thập nhiều nhất và rộng nhất thông tin về một chủ đề
TRƯỚC KHI bắt đầu viết nội dung. Viết khi chưa đủ research = viết nông.

**Đa chiều.** Mỗi chủ đề phải được nhìn từ TỐI THIỂU 6 góc khác nhau (xem §3).

**Trích nguồn.** Mỗi fact = 1 source. Không có source = không dùng.

---

## 2. Phân loại nguồn (ưu tiên giảm dần)

| Hạng | Loại | Ví dụ | Cách dùng |
|------|------|-------|-----------|
| **A** | Văn bản luật / quy chuẩn chính phủ | Luật, nghị định, thông tư, WHO guidelines | Trích nguyên văn, ghi điều khoản |
| **A** | Paper khoa học (peer-reviewed) | PMC, Nature, Science, journal chuyên ngành | Ghi DOI/PMC ID, năm, tác giả |
| **B** | Báo cáo chính thức tổ chức | WHO report, World Bank, OECD, cơ quan chính phủ | Ghi URL + năm + tổ chức |
| **B** | Data thống kê chính thức | Tổng cục thống kê, Bộ Y tế, cơ sở dữ liệu chính phủ | Ghi nguồn + năm + số liệu gốc |
| **C** | Báo chí uy tín | Reuters, AP, NHK, Tuổi Trẻ, VnExpress, Nikkei | Ghi URL + ngày + tác giả |
| **C** | Sách chuyên ngành | Có ISBN, tác giả chuyên gia | Ghi tên sách + chương + trang |
| **D** | Blog chuyên gia / trang ngành | Blog kỹ sư, trang công ty công nghệ nước | Chỉ dùng khi đã cross-verify với B+ |
| **D** | Video/podcast tham khảo | YouTube, TikTok, podcast | Ghi URL + timestamp, dùng để học cách kể |

**Quy tắc vàng:** Số liệu dùng trong lời kể (expert nói trước camera) PHẢI từ nguồn hạng
A hoặc B. Nguồn C–D chỉ dùng cho bối cảnh, ý tưởng, hoặc cách kể chuyện.

---

## 3. 8 chiều research bắt buộc

Với MỖI chủ đề chuyên sâu, phải cover ít nhất 6/8 chiều sau:

| # | Chiều | Câu hỏi cần trả lời |
|---|-------|---------------------|
| 1 | **Lịch sử & bối cảnh** | Chuyện này bắt đầu từ đâu? Ai là người đầu tiên? Sự kiện nào là bước ngoặt? |
| 2 | **Tiêu chuẩn & quy định** | Luật nào quản? Tiêu chuẩn cụ thể là gì? So với quốc tế thế nào? |
| 3 | **Công nghệ & cách vận hành** | Họ làm bằng cách nào? Công nghệ gì? Quy trình ra sao? |
| 4 | **Hạ tầng & con số** | Quy mô bao nhiêu? Chi phí? Nhân sự? Timeline? |
| 5 | **Sự cố & bài học** | Đã từng thất bại chưa? Scandal nào? Họ sửa thế nào? |
| 6 | **Văn hóa & câu chuyện con người** | Ai là nhân vật? Văn hóa liên quan thế nào? Câu chuyện nào gây xúc động? |
| 7 | **So sánh quốc tế** | Nước khác làm thế nào? Ai giỏi nhất? Ai tệ nhất? Việt Nam ở đâu? |
| 8 | **Khoảng trống nội dung** | Ai đã kể chuyện này? Kể bằng format gì? CÒN THIẾU gì chưa ai kể? |

---

## 4. Đa kênh, đa định dạng, đa ngôn ngữ

### 4a. Kênh tìm kiếm

- **Google Scholar** — paper, nghiên cứu, meta-analysis
- **PubMed / PMC** — y tế, môi trường, nước
- **Google thường** — tin tức, blog, trang chính phủ
- **YouTube** — video giải thích, documentary, vlog (học cách kể)
- **Podcast directories** — 99% Invisible, Radiolab, Planet Money, Huberman (xem ai đã kể)
- **TikTok / Reels** — content viral về chủ đề (học hook/format)
- **Reddit / Quora** — câu hỏi thực tế của người dùng
- **Trang chính phủ gốc** — .go.jp, .gov, .gov.vn (data chính thức)
- **Wikipedia** — điểm khởi đầu, lấy danh sách source ở footnotes

### 4b. Ngôn ngữ tìm kiếm

**Luôn search bằng NGÔN NGỮ GỐC của chủ đề.**

| Chủ đề về | Search bằng | Ví dụ |
|-----------|-------------|-------|
| Nhật Bản | Tiếng Nhật + Tiếng Anh | 水道法 水質基準 + Japan water quality standards |
| Trung Quốc | Tiếng Trung + Tiếng Anh | 饮用水卫生标准 + China drinking water standards |
| Việt Nam | Tiếng Việt + Tiếng Anh | QCVN 01:2009/BYT + Vietnam drinking water |
| Quốc tế | Tiếng Anh | WHO drinking water guidelines |

---

## 5. Format output: Knowledge Base cho editor

File output đặt ở `drafts/research/<tên-chủ-đề>-knowledge-base.md`. Cấu trúc:

```markdown
# Knowledge Base: [Tên chủ đề]
> Research date: YYYY-MM-DD | Agents: N | Sources: ~M URLs

## Tóm tắt 1 đoạn
(Để editor đọc nhanh biết có gì)

## [Chiều 1]: [Tên]
### Fact quan trọng nhất
- **[Số liệu / claim]** — [giải thích ngắn]
  📎 Source: [URL hoặc trích dẫn] | Hạng: A/B/C/D
  📸 MEDIA: [gợi ý hình/clip cho editor, nếu có]

### [Fact tiếp theo]
...

## Góc kể chuyện đề xuất
(Liệt kê các góc, xếp theo tiềm năng)

## Nguồn tổng hợp
(Tất cả URL + phân loại hạng)
```

Quy ước tag:
- `📎 Source:` = nguồn trích dẫn
- `📸 MEDIA:` = gợi ý hình ảnh/video/infographic cho editor
- `⚠️` = cần verify thêm hoặc có cảnh báo
- `🔥` = fact đặc biệt mạnh, nên dùng trong video
- `🆕` = thông tin mới/cập nhật gần đây

---

## 6. Cross-verification

- Mỗi **số liệu dùng trong lời kể** phải có ít nhất **2 nguồn độc lập** xác nhận
- Nếu 2 nguồn mâu thuẫn → ghi CẢ HAI + ghi rõ mâu thuẫn, để editor/chuyên gia quyết
- Source chính phủ gốc THẮNG source thứ cấp khi mâu thuẫn
- Paper peer-reviewed THẮNG báo chí khi mâu thuẫn về số liệu khoa học

---

## 7. Tìm khoảng trống nội dung (Content Gap Analysis)

Phần QUAN TRỌNG NHẤT của research — tìm ra **câu chuyện chưa ai kể**.

Checklist:
- [ ] Search YouTube bằng tiếng Việt + tiếng Anh + ngôn ngữ gốc → ai đã kể? Format gì?
- [ ] Search podcast directories → episode nào cover chủ đề này?
- [ ] Search TED Talks → có TED Talk không?
- [ ] Check content tiếng Việt → nội dung VN đã sâu đến đâu?
- [ ] So sánh: nguồn gốc (paper/luật) vs nội dung phổ biến → có gap nào giữa "sự thật" và "câu chuyện đang được kể"?

**Mục tiêu:** tìm ra câu chuyện mà research cho thấy rất hay nhưng chưa ai kể
(hoặc kể nông) → đó là video có giá trị cao nhất.

---

## 8. Pipeline đầy đủ: Research → Kịch bản → Wiki

```
PHASE 0 — RESEARCH
  [0.1] Xác định chủ đề + đọc nội dung hiện có (kịch bản cũ, nếu có)
  [0.2] Chạy research 8 chiều (song song khi có thể)
  [0.3] Tổng hợp → file knowledge-base (`drafts/research/<tên>-deep-dive.md`)
  [0.4] Xác định khoảng trống nội dung + góc kể chuyện
  [0.5] Tìm video/media tham khảo bằng KEYWORD NGÔN NGỮ GỐC (xem §4b)
  [0.6] TRÌNH → chờ user chọn góc
        ⛔ GATE — không tự viết kịch bản khi chưa trình góc.

PHASE 1 — KỊCH BẢN
  [1.1] Viết khung sườn v1 → `drafts/scripts/<TÊN>-v1.md`
        Bám: style guide (`style-notes/chuyen-gia.md` + `van-noi-anh-nhu.md`),
        rule QC (`rules/ad-compliance-vn.md`), template (`docs/script-template.md`)
  [1.2] User feedback → sửa → v2, v3, v4... (giữ mọi version, không ghi đè)
  [1.3] Mỗi version phải có:
        - Khung sườn (lời anh Như nói)
        - Caption card / media hướng dẫn cho editor
        - Keyword tiếng gốc + tiếng Anh cho editor tìm stock
        - Video tham khảo (URL + ghi chú bản quyền)
        - Chấm điểm theo checklist `chuyen-gia.md` §6
        - Phân tích khung video (timeline + cấu trúc logic)
        - Rà lỗi (check các lỗi thường gặp)
        - Bảng nguồn trích dẫn (mỗi data point → source + hạng)
  [1.4] TRÌNH → chờ user nói OK
        ⛔ GATE — không tự đẩy wiki khi user chưa duyệt.

PHASE 2 — WIKI
  [2.1] User nói OK → đẩy bản kịch bản lên wiki GWT-App
        Đường đi: tạo/cập nhật file `.md` ở
        `~/gwt/GWT-App/apps/web/content/wiki/tai-lieu/marketing/<slug>.md`
        (frontmatter: tieuDe, hang, thuTu, nhom, nguon)
  [2.2] Chạy sync: `npm --prefix ~/gwt/GWT-App/apps/web run sync:wiki`
  [2.3] Báo user cần commit + push bên GWT-App để deploy Vercel
```

### Quy tắc version kịch bản

- **Mỗi lần sửa = version mới** (`v1` → `v2` → ...), KHÔNG ghi đè file cũ.
- Header file ghi rõ thay đổi so với version trước.
- Version cuối user duyệt = version đẩy wiki.

### Quy tắc video tham khảo / bản quyền

- Video chính phủ nước ngoài (ví dụ 東京都水道局): **kiểm điều khoản trước khi dùng**.
  Nhiều cổng chính phủ Nhật **CẤM tái sử dụng thương mại** dù là video "official".
- **Cách dùng an toàn:** (1) Xem làm storyboard → tự quay/mua stock. (2) Quay anh Như
  reaction xem trên màn hình → fair use commentary. (3) Liên hệ phòng PR xin phép.
- Ghi rõ trạng thái bản quyền từng video trong bảng tham khảo.

---

## 9. Khi nào KHÔNG cần deep-dive

- Caption / social post ngắn → dùng fact đã có trong knowledge-base sẵn
- Hook / CTA đơn lẻ → không cần research mới
- Nội dung về sản phẩm GWT → fact từ masterdata (Supabase), KHÔNG cần research ngoài
- Sửa chữ / edit nhỏ → không trigger research

---

*Rule này được viết dựa trên research thực tế cho "Nghịch lý nước Nhật" (2026-09-22).
Pipeline 3 phase (Research → Kịch bản → Wiki) chốt cùng ngày.
Cập nhật khi có phương pháp tốt hơn.*
