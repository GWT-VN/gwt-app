# QUY TRÌNH LÀM VIỆC VỚI EDITOR NGOÀI — tài liệu training người mới

> **Dành cho:** nhân sự marketing GWT mới nhận việc sản xuất video (chưa cần biết dựng phim chuyên nghiệp).
> **Đọc xong làm được gì:** tự chạy trọn một video từ ý tưởng → brief → bàn giao editor ngoài → nghiệm thu → thanh toán.
> **Vai trò của bạn:** bạn KHÔNG phải editor. Bạn là **người chốt ý tưởng và làm bản nháp flow** để editor ngoài
> hiểu đúng thứ mình muốn. Bản nháp xấu cũng được — miễn đúng flow.
> Cập nhật: 2026-08-22.

---

## 0. Toàn cảnh 7 bước

| Bước | Việc | Ai làm | Output bắt buộc | Thời gian tham khảo |
|---|---|---|---|---|
| 1 | Xác định định dạng, thời lượng, yêu cầu, **kịch bản (nhất là hook)** | Bạn | `kichban.md` đã duyệt | 0.5–1 ngày |
| 2 | Chọn source trong kho video đã quay | Bạn | Folder `02_SOURCE/` + danh sách timecode | 0.5 ngày |
| 3 | Gen voiceover (ElevenLabs / MiniMax) | Bạn | `voiceover.wav` (+ bản dự phòng) | 1–2 giờ |
| 4 | Dựng **edit flow** (bản nháp brief bằng hình) | Bạn (Descript + DaVinci) | `draft.mp4` + `timeline.xml` + `subtitles.srt` | 0.5–1 ngày |
| 5 | Đóng gói folder + brief + ref → gửi editor, **chốt deadline** | Bạn | Link folder + brief đã gửi | 1 giờ |
| 6 | Nhận bài → revise tới khi ưng | Bạn ↔ Editor | Bản final duyệt | 2–5 ngày |
| 7 | Thanh toán | Bạn | Xác nhận đã trả | — |

**Nguyên tắc xuyên suốt:** *bước sau không sửa được lỗi của bước trước.* Kịch bản sai thì editor giỏi mấy cũng
không cứu được. Đừng vội gửi editor khi bước 1–4 còn lỏng.

**Luật bắt buộc phải đọc trước khi viết bất cứ chữ nào:**
- [rules/ad-compliance-vn.md](../rules/ad-compliance-vn.md) — luật quảng cáo VN (thắng mọi rule khác)
- [rules/video-ads-general.md](../rules/video-ads-general.md) — cấu trúc bắt buộc của video chạy ads
- [rules/hook-video-playbook.md](../rules/hook-video-playbook.md) — cách làm hook giữ chân
- [rules/video-loc-tong.md](../rules/video-loc-tong.md) — riêng video lọc tổng (POE): **không nêu mã bộ**
- [rules/nguon-dan-chung.md](../rules/nguon-dan-chung.md) — mọi con số phải có nguồn

---

## Chuẩn bị trước khi bắt đầu (làm 1 lần)

**Tài khoản cần xin quản lý:**
- Google Drive: folder `MKT` (kho source) + quyền tạo folder mới
- Ổ/NAS chứa footage camera GWT
- ElevenLabs và/hoặc MiniMax (tài khoản team, **không tự đăng ký tài khoản cá nhân rồi tính tiền công ty**)
- Descript (bản có Timeline Export nếu cần xuất XML)

**Phần mềm cài trên máy:**
- **Descript** — cắt video bằng cách cắt chữ (dùng cho video có người nói)
- **DaVinci Resolve** (bản Free là đủ để làm draft) — dựng flow, chèn nhạc/SFX/text
- (tuỳ chọn) After Effects — chỉ khi cần motion phức tạp; xem
  [docs/10.8.2026_Workflow_Descript_DaVinci_AfterEffects.md](10.8.2026_Workflow_Descript_DaVinci_AfterEffects.md)

---

# BƯỚC 1 — Xác định định dạng, thời lượng, yêu cầu, kịch bản

Đây là bước **quan trọng nhất**. Chốt xong 5 ô dưới mới được đi tiếp.

### 1.1. Bảng chốt đề bài (điền trước khi viết kịch bản)

| Hạng mục | Chốt gì | Mặc định GWT |
|---|---|---|
| **Kênh đăng** | FB Reel / TikTok / YouTube Shorts / YouTube dài / Zalo | Cross-post 4 nền tảng |
| **Định dạng** | Tỉ lệ khung hình | **9:16 dọc** cho ads. TVC ngang 16:9 đã xác nhận không hiệu quả |
| **Thời lượng** | Số giây/phút mục tiêu | Ads ngắn: 30–60s · Video chuyên gia: 5–7 phút được phép dài |
| **Loại video** | Chuyên gia / người dùng / không lời / demo sản phẩm | Xem mix A1–A4 trong `CLAUDE.md` |
| **Mục tiêu** | View rộng hay ra số điện thoại/inbox | KPI = SĐT + inbox, **không phải view** |

> ⛔ **Không dùng lượt view để đánh giá hiệu quả** — view phụ thuộc ngân sách bơm ads.
> Chỉ dùng nhãn hiệu quả do GWT xác nhận (xem `rules/video-ads-general.md`).

### 1.2. Kịch bản

Viết theo khung 3 lớp trong [docs/script-template.md](script-template.md):

```
LỚP A — Voice-over   (lời sẽ đọc)
LỚP B — Text overlay (chữ hiện trên màn hình)
LỚP C — Shot list    (hình gì chạy dưới lời đó)
```

Có thể nhờ Claude viết nháp bằng skill `write_script` (số liệu tự lấy từ Supabase, tự áp luật QC),
nhưng **bạn là người chốt**, không copy máy móc.

Cấu trúc bắt buộc cho video chạy ads:

```
[0–3s]     HOOK           — bắt người xem dừng lướt
[3–30s]    KHỐI HIGHLIGHT — nói HẾT lý do mua, dồn lên đầu (6 nhóm ý)
[30s → …]  NỘI DUNG CHÍNH — chiều sâu cho người thật sự quan tâm
[cuối]     CTA            — lý do cụ thể để nhắn tin
```

### 1.3. HOOK — viết riêng, kỹ nhất

Hook là **đơn vị riêng**, nên quay riêng, KHÔNG lấy đoạn chuyên gia ngồi nói làm mở màn.
Đọc kỹ [rules/hook-video-playbook.md](../rules/hook-video-playbook.md). Rút gọn 4 luật quan trọng nhất:

1. **Bắt đầu bằng hành động vật lý**, không bằng lời dẫn (đo TDS/độ cứng, bổ đôi lõi lọc đã dùng,
   rót 2 cốc nước trước–sau, thả giấy test đổi màu).
2. **Câu đầu tiên = kết quả hoặc câu hỏi tò mò**, không phải bối cảnh.
   ❌ "Trên thị trường có nhiều hãng, GE có lợi thế gì?" → ✅ "Nước nhà bạn đang cứng cỡ nào?"
3. **Có con số cụ thể đập ngay** trong 3 giây đầu.
4. **Nhịp cắt dốc rồi thả dần**: 15–30s đầu dưới 1s/cut, sau đó giãn ra rồi vào shot dài cho chuyên gia nói.

**Checklist chốt bước 1 — chưa tick đủ thì chưa qua bước 2:**
- [ ] Đã chốt kênh + tỉ lệ + thời lượng + loại video + mục tiêu
- [ ] Kịch bản đủ 3 lớp A/B/C
- [ ] Hook viết riêng, có hành động vật lý + con số trong 3s đầu
- [ ] Mọi số liệu khớp Supabase / có nguồn theo `rules/nguon-dan-chung.md`
- [ ] Không có claim y khoa, không "số 1 / tốt nhất / duy nhất", không nêu tên đối thủ
- [ ] Nếu là lọc tổng: **không nhắc mã bộ nào** (WH15A, WH30A, ECO…)
- [ ] Người phụ trách đã duyệt kịch bản

---

# BƯỚC 2 — Chọn source trong kho video đã quay

Mục tiêu: **không quay mới nếu kho đã có**. Cắt lại từ video cũ hoàn toàn hợp lệ.

### 2.1. Hai kho phải lục

1. **Folder camera GWT** (ổ/NAS footage gốc) — chất lượng cao nhất, ưu tiên số 1
2. **Folder Drive MKT** — video đã dựng, đã đăng, b-roll rời

### 2.2. Quy tắc chất lượng

- Ưu tiên **4K > 2K > 1080p**. Càng cao càng tốt vì editor còn crop/reframe về 9:16 và zoom.
- **Lấy file gốc, không lấy file đã nén đăng mạng** (video tải lại từ Facebook/TikTok đã mất chất lượng
  + có watermark). Chỉ dùng bản đăng mạng khi không còn nguồn nào khác.
- Kiểm nhanh trước khi chọn: độ phân giải, frame rate, có tiếng không, tiếng có lệch hình không.
- Cùng một video **không trộn nhiều frame rate** nếu tránh được — báo editor nếu buộc phải trộn.

### 2.3. Ghi lại timecode — bắt buộc

Không copy nguyên file 40 phút rồi bảo editor "tự tìm". Lập bảng:

| # | File gốc | Timecode | Nội dung | Dùng cho |
|---|---|---|---|---|
| 1 | `A7S_C0043.MP4` | 00:12:31 – 00:12:48 | Cận tay bổ đôi lõi lọc | Hook |
| 2 | `A7S_C0051.MP4` | 00:03:10 – 00:03:52 | Anh Như giải thích tái sinh | Nội dung chính |

Lưu bảng này thành `02_SOURCE/danh-sach-source.md` — đây là thứ editor đọc đầu tiên.

**Checklist bước 2:**
- [ ] Đủ hình cho **mọi** dòng trong Shot list (lớp C) — thiếu chỗ nào ghi rõ "CẦN QUAY THÊM"
- [ ] Đã copy file gốc (không phải bản nén) vào `02_SOURCE/`
- [ ] Có bảng timecode
- [ ] Có ít nhất 2–3 phương án hình cho hook để editor chọn

---

# BƯỚC 3 — Gen voiceover

Dùng khi kịch bản cần lời đọc (video không lời, video minh hoạ, phần dẫn chuyện).
Video chuyên gia nói trực tiếp thì **giữ tiếng thật**, không thay bằng AI.

> 📝 Thuật ngữ: gen giọng đọc từ chữ = **Text-to-Speech (TTS)**.
> *Speech-to-text* là chiều ngược lại (từ tiếng ra chữ) — cái đó dùng ở bước 4, khi Descript lấy transcript.

### 3.1. Chọn tool

| Tool | Mạnh | Dùng khi |
|---|---|---|
| **ElevenLabs** | Giọng tự nhiên, kiểm soát cảm xúc, ổn định | Voice chính, video quan trọng |
| **MiniMax** | Giọng tiếng Việt/châu Á khá, rẻ hơn | Thử nhiều phương án, video số lượng lớn |

### 3.2. Cách làm

1. Dán **đúng lớp A (Voice-over)** của kịch bản, không dán cả kịch bản.
2. Chọn giọng khớp tuyến nội dung:
   - Chuyên gia/kỹ thuật → nam, trung niên, chậm, chắc
   - Người dùng/đời thường → trẻ hơn, nhịp nhanh, thân mật
3. **Gen 2–3 phương án giọng khác nhau** rồi nghe lại chọn, đừng lấy bản đầu tiên.
4. Sửa chữ để sửa giọng đọc: chấm phẩy điều khiển nhịp ngắt; số viết ra chữ nếu đọc sai
   (`1–3 mg/l` → "một đến ba mi-li-gam trên lít"); tên riêng viết theo cách đọc.
5. Xuất **WAV** (không MP3) cho editor. MP3 chỉ dùng để nghe duyệt nhanh.
6. Đặt tên: `voiceover_v1.wav`, sửa lời thì lên `v2` — **không ghi đè**.

**Checklist bước 3:**
- [ ] Nghe lại toàn bộ, không có chỗ đọc sai số/tên/thuật ngữ
- [ ] Nhịp khớp thời lượng mục tiêu (đọc thử, bấm giờ)
- [ ] Xuất WAV + đặt tên có version
- [ ] Lưu kèm file text đã dùng để gen (`voiceover_v1.txt`) để lần sau gen lại y hệt

---

# BƯỚC 4 — Dựng EDIT FLOW (bản nháp để brief editor)

**Mục đích duy nhất:** để editor ngoài **hiểu được idea mình muốn**.
Không cần đẹp, không cần chỉnh màu, không cần transition xịn. Cần **đúng flow**.

Ba thứ phải nhìn ra được trong bản nháp: **nhạc ở đâu · SFX ở đâu · chữ hiện lúc nào, nội dung gì.**

## 4.A — Descript (video chuyên gia / có người nói)

Dùng Descript để cắt sạch lời: bỏ "ừ, ờm", câu lặp, câu hỏng, khoảng lặng dài.

**Quy trình chuẩn (làm đúng thứ tự):**

1. **Đẩy video lên** Descript.
2. **Tạo bản copy để edit** — luôn giữ bản gốc nguyên vẹn để còn quay lại được.
3. `AI Tools` → **Edit for clarity** → chọn mức **cao nhất** → **Remove ignored texts**
   *(dọn filler words, câu lặp, đoạn thừa)*
4. `AI Tools` → **Shorten Word gaps** → **Gap more than 0.5s → shorten to 0.3s** → **All**
   *(rút khoảng lặng, video đỡ lê thê)*
5. **Đưa transcript cho Claude** làm 2 việc:
   - **Chọn câu trong các đoạn nói lặp** — chuyên gia thường nói một ý 2–3 lần; hỏi Claude bản nào
     gọn và rõ nhất để giữ, các bản còn lại cắt.
   - **Check lỗi chính tả** trong transcript (transcript sai → caption sai).
6. **Chọn All** → `Change Layout` → **Captions** *(bật phụ đề để soát bằng mắt)*
7. **Xem lại 1 lượt từ đầu đến cuối** rồi **cut final** — đây là lúc phát hiện chỗ cắt vấp,
   câu bị cụt, chuyển ý gãy.
8. `AI Tools` → **Create clip / highlight reel** — cho Descript đề xuất các đoạn hay nhất,
   dùng làm gợi ý cho khối highlight và cho các clip cắt ngắn. *(Xem ví dụ: POE-1)*

**Xuất từ Descript** (chi tiết: [docs/10.8.2026_Workflow_Descript_DaVinci_AfterEffects.md](10.8.2026_Workflow_Descript_DaVinci_AfterEffects.md)):
- `Export → Timeline → Premiere (.xml)` → được `timeline.xml` để mở trong DaVinci
- `Export → Subtitles → SubRip (.srt)` → được `subtitles.srt`
  (gợi ý: Show speakers OFF · ~35–42 ký tự/dòng · tối đa 2 dòng)
- ⛔ **Không burn phụ đề chết vào video.** Giữ video và `.srt` rời để còn sửa typo, đổi font, đổi màu.

> Sau bước này coi như **SCRIPT LOCK** — chốt lời nói, không đổi cấu trúc lời nữa.

## 4.B — DaVinci Resolve (dựng flow)

Mở `timeline.xml` từ Descript (hoặc dựng tay nếu video không lời), rồi làm **vừa đủ để nhìn ra flow**:

| Làm | Không làm ở bước này |
|---|---|
| Ráp đúng thứ tự shot theo kịch bản | Chỉnh màu / grading |
| Chèn nhạc nền, đánh dấu chỗ fade | Transition cầu kỳ |
| Chèn sound effect ở các điểm nhấn | Motion graphic phức tạp |
| Chèn **text dự kiến** (nội dung + vị trí + thời điểm) | Căn chỉnh font/kerning hoàn hảo |
| Cắm voiceover đúng nhịp | Render chất lượng cao |

Layout track gợi ý:

```
SUBTITLE  [ Subtitle Track — import subtitles.srt ]
V3        [ Text dự kiến ]
V2        [ B-roll ]
V1        [ A-roll ]
A1        [ Lời thoại / voiceover ]
A2        [ SFX ]
A3        [ Music ]
```

**Mẹo cực hữu ích:** ở những chỗ bạn muốn editor làm gì đó mà mình chưa làm được, cứ **chèn một ô chữ đỏ**
ghi thẳng lên hình: *"CHỖ NÀY ZOOM VÀO MÁY ĐO"*, *"CẦN SFX WHOOSH"*, *"TEXT: 1–3 mg/l, đỏ → xanh"*.
Editor đọc bản nháp còn nhanh hơn đọc brief chữ.

Xuất bản nháp: `draft_v1.mp4`, H.264, 1080p là đủ.

## 4.C — Tìm nhạc

- Nguồn: YouTube (kênh no-copyright), **HelloThematic**, Epidemic Sound, Artlist, thư viện nhạc GWT (nếu có).
- Có thể copy link nhạc dán lên **y2mate.com** để tải về nhanh cho bản nháp.
- ⚠️ **Chỉ dùng nhạc thật sự no-copyright / đã có license.** Lưu lại link nguồn + dòng điều khoản
  ("free to use", "no copyright") vào `05_ASSETS/MUSIC/nguon-nhac.txt`. Nếu tác giả yêu cầu ghi credit
  thì phải ghi trong caption khi đăng. Nhạc dính bản quyền → video bị tắt tiếng hoặc gỡ, mất luôn ngân sách ads.
- Chọn nhạc theo tuyến: hook cần energy; đến đoạn chuyên gia nói thì **fade out** để tiếng sạch
  (fade dần, không cắt phựt).

## 4.D — Font và text

- **Ưu tiên: xin guideline chữ từ anh designer** (font, cỡ, màu, khoảng cách an toàn) — dùng thống nhất mọi video.
- Chưa có guideline → lên [Google Fonts](https://fonts.google.com) chọn font **có hỗ trợ tiếng Việt đầy đủ**
  (bắt buộc gõ thử: ắ ằ ẳ ễ ộ ợ ữ — nhiều font thiếu dấu, vỡ chữ).
- Phân vai màu cho chữ, đừng để phụ đề một màu đều: ví dụ **đỏ = con số vấn đề**,
  **xanh = kết quả sau lọc**, **trắng = tên bước**.
- Chữ phải nằm trong vùng an toàn — tránh mép dưới (bị che bởi caption/nút của Facebook, TikTok).
- Gửi kèm **file font** cho editor nếu dùng font không phổ biến.

**Checklist bước 4:**
- [ ] Descript đã lock script, đã soát chính tả
- [ ] Có `timeline.xml` + `subtitles.srt`, phụ đề không burn vào hình
- [ ] Bản nháp DaVinci nhìn ra được: nhạc ở đâu, SFX ở đâu, text nào hiện lúc nào
- [ ] Ghi chú đỏ tại mọi chỗ cần editor xử lý
- [ ] Nhạc đã lưu nguồn + license
- [ ] Font đã kiểm dấu tiếng Việt

---

# BƯỚC 5 — Đóng gói, brief và chốt deadline

## 5.1. Cấu trúc folder bàn giao (upload Drive, share quyền xem/tải)

```
20260822_POE_chuyen-gia-do-cung_9x16_v1/
├── 00_BRIEF/
│   ├── brief.md              ← file quan trọng nhất
│   ├── kichban.md
│   └── guideline-text.pdf    (nếu có)
├── 01_REF/                   ← video tham khảo (link hoặc file)
├── 02_SOURCE/
│   ├── danh-sach-source.md   ← bảng timecode
│   └── (file gốc 4K/2K)
├── 03_VOICEOVER/
│   ├── voiceover_v1.wav
│   └── voiceover_v1.txt
├── 04_DRAFT/
│   ├── draft_v1.mp4          ← bản nháp flow
│   ├── timeline.xml
│   └── subtitles.srt
├── 05_ASSETS/
│   ├── MUSIC/ (+ nguon-nhac.txt)
│   ├── SFX/
│   ├── LOGO/
│   └── FONT/
└── 06_EXPORT/                ← editor trả bài vào đây
```

## 5.2. Brief phải nói rõ 6 nhóm

Không brief miệng. Không brief rải rác qua chat. **Viết ra file, gửi 1 lần, đủ 6 nhóm:**

1. **Màu** — tông muốn (trong trẻo/sạch/xanh mát hay ấm/cao cấp), tham chiếu video ref nào
2. **Cách edit** — nhịp cắt (hook dưới 1s/cut, thân bài giãn ra), reframe 9:16, có zoom/punch-in không
3. **Transition** — dùng loại nào, tần suất; nói rõ nếu **không muốn** transition loè loẹt
4. **Sound effect** — chỗ nào cần, kiểu gì (whoosh chuyển cảnh, ting cho con số, impact cho hook)
5. **Text** — font, màu theo vai, vị trí, thời điểm; phụ đề full hay chỉ text nhấn
6. **Ref video** — gửi **link cụ thể + ghi rõ lấy gì từ đó**: *"lấy nhịp cắt hook của video này"*,
   *"lấy kiểu chữ của video kia"*. Ref không ghi chú = editor đoán sai.

Template brief copy-paste: **Phụ lục A** ở cuối tài liệu.

## 5.3. Chốt deadline

- Nói rõ **ngày + giờ** nhận bài, không nói "cuối tuần nhé".
- Chốt luôn **số vòng revise nằm trong giá** (thường 2 vòng) và **thời gian mỗi vòng** (24–48h).
- Xác nhận lại giá trước khi editor bắt tay làm (xem bước 7) — không để đến lúc trả bài mới bàn tiền.
- Yêu cầu editor **xác nhận đã nhận đủ file và hiểu brief** trước khi bắt đầu. Thiếu gì hỏi ngay
  trong 24h đầu, không phải sát deadline.

**Checklist bước 5:**
- [ ] Folder đủ 6 mục, đã share quyền và **kiểm tra link mở được từ máy khác**
- [ ] Brief đủ 6 nhóm, có ref kèm ghi chú
- [ ] Deadline có ngày + giờ
- [ ] Đã chốt giá + số vòng revise
- [ ] Editor đã xác nhận nhận đủ file

---

# BƯỚC 6 — Nhận bài và revise

Nhận bản đầu tiên → **xem hết một lượt không dừng** (cảm nhận như người xem thật), rồi mới xem lượt hai
để ghi lỗi theo timecode.

### 6.1. Duyệt theo 7 yếu tố — luôn theo đúng thứ tự này

| # | Yếu tố | Hỏi gì |
|---|---|---|
| 1 | **Hook** | 3 giây đầu có giữ được không? Có hành động + con số không? Hook hỏng thì phần còn lại vô nghĩa |
| 2 | **Voiceover** | Rõ chưa? To nhỏ có đều? Có bị nhạc át? |
| 3 | **Nhạc** | Đúng tông? Có fade out khi vào đoạn nói? Có to quá không? |
| 4 | **Sound effect** | Có đúng chỗ? Có bị lạm dụng thành ồn? |
| 5 | **Transition** | Có mượt? Có bị loè loẹt/lỗi thời? |
| 6 | **Text** | Đúng chính tả? Đủ dấu tiếng Việt? Nằm trong vùng an toàn? Kịp đọc không? |
| 7 | **Tổng thể** | Màu nhất quán? Không frame đen? Không mất tiếng? Đúng tỉ lệ + thời lượng? |

### 6.2. Cách ghi feedback (quyết định số vòng revise)

**Luôn ghi theo timecode + nói rõ muốn gì**, không nói cảm tính:

❌ "Đoạn đầu chưa được, làm lại cho hay hơn"
✅ `00:02` — chữ "1–3 mg/l" hiện chậm 0.5s so với lúc nói, đẩy lên sớm hơn
✅ `00:14` — nhạc át tiếng anh Như, hạ nhạc xuống khoảng 60%
✅ `00:31` — transition xoay quá mạnh, đổi thành cắt thẳng

**Gom feedback thành 1 lần/vòng.** Nhắn lắt nhắt 20 tin trong 3 ngày là cách nhanh nhất để
mất thiện cảm của editor và đẩy dự án trễ.

### 6.3. Kiểm tra pháp lý trước khi duyệt final — bắt buộc

- [ ] Không có claim kiểu thuốc/chữa bệnh
- [ ] Không "số 1 / tốt nhất / duy nhất" thiếu căn cứ
- [ ] Không nêu tên/nhãn đối thủ (nếu lỡ xuất hiện trong hình → làm mờ)
- [ ] Số liệu khớp Supabase (bảo hành, số lõi, chu kỳ thay); **không nêu giá / công dụng chưa có chứng nhận**
- [ ] Video lọc tổng: không xuất hiện mã bộ cụ thể
- [ ] Nhạc có license; credit (nếu cần) đã chuẩn bị cho caption

### 6.4. Nghiệm thu

Yêu cầu editor gửi bản final:
- Đúng tỉ lệ (9:16) + đúng thời lượng chốt
- H.264 MP4, 1080p trở lên, không watermark
- Kèm **bản không phụ đề** (nếu định cross-post nền tảng khác có caption riêng)
- Kèm **project file** nếu đã thoả thuận (nên thoả thuận từ đầu — sau này sửa nhỏ đỡ phải gọi lại editor)

Lưu bản final vào `06_EXPORT/` + copy về Drive MKT.

---

# BƯỚC 7 — Thanh toán

### Rate tham khảo

| Loại | Rate |
|---|---|
| Video **dưới 1 phút** | **300.000đ** |
| Video **trên 1 phút** | **400.000đ** |

### Nguyên tắc

- **Chốt giá TRƯỚC khi editor bắt đầu**, không phải sau khi trả bài.
- Giá trên đã bao gồm **2 vòng revise**. Vòng thứ 3 trở đi, hoặc **đổi yêu cầu so với brief ban đầu**
  (đổi kịch bản, đổi nhạc toàn bộ, đổi tuyến) → thương lượng phụ phí. Đây là lý do bước 1–5 phải chắc:
  brief lỏng thì tiền phát sinh là lỗi của mình, không phải của editor.
- Thanh toán sau khi **duyệt final**, đúng hạn đã hẹn. Giữ mối editor tốt quan trọng hơn 100k.
- Lưu chứng từ: nội dung chuyển khoản ghi rõ `<tên video> - <ngày>`, lưu ảnh xác nhận vào folder dự án
  hoặc file theo dõi chi phí của MKT.
- Ghi lại vào bảng theo dõi: tên video · editor · rate · số vòng revise · đúng/trễ hạn · chất lượng.
  Sau 5–10 video bạn sẽ biết nên giao ai loại nào.

---

# Lỗi người mới hay mắc

| Lỗi | Hậu quả | Cách tránh |
|---|---|---|
| Gửi editor khi kịch bản chưa chốt | Sửa vòng vòng, phát sinh phí | Tick đủ checklist bước 1 |
| Copy nguyên file 40 phút, bảo "tự tìm đoạn hay" | Editor cắt sai ý, trễ hạn | Bảng timecode ở bước 2 |
| Dùng video tải lại từ Facebook/TikTok làm source | Mờ, có watermark, không cứu được | Luôn lấy file gốc từ camera/Drive |
| Bản nháp làm quá kỹ (chỉnh màu, motion) | Mất 2 ngày làm trùng việc của editor | Nháp chỉ cần đúng flow |
| Brief miệng / brief rải rác qua chat | Editor hiểu sai, cãi nhau lúc nghiệm thu | Brief 1 file, đủ 6 nhóm |
| Gửi ref mà không nói lấy gì từ ref | Editor bắt chước nhầm chỗ | Ref phải kèm ghi chú |
| Feedback cảm tính "chưa hay lắm" | Revise vô tận | Timecode + yêu cầu cụ thể |
| Nhắn feedback lắt nhắt nhiều ngày | Trễ hạn, editor nản | Gom 1 lần/vòng |
| Quên kiểm pháp lý trước khi đăng | Bị gỡ bài, rủi ro phạt | Checklist 6.3 |
| Dùng nhạc "thấy trên mạng ai cũng dùng" | Tắt tiếng/gỡ video, mất tiền ads | Lưu link + license |
| Burn phụ đề chết vào video | Sai một chữ phải render lại toàn bộ | Giữ `.srt` rời |

---

# Lộ trình training tuần đầu

| Ngày | Làm gì |
|---|---|
| **1** | Đọc tài liệu này + 4 file rule ở mục 0. Xin đủ tài khoản, cài Descript + DaVinci. Xem 5 video GWT đã đăng và tự chấm theo 7 yếu tố ở mục 6.1 |
| **2** | Lục 2 kho source, làm quen cấu trúc folder. Tự lập bảng timecode cho **một video đã đăng** (làm ngược để hiểu cách chọn source) |
| **3** | Descript: chạy trọn 8 bước mục 4.A trên một file phỏng vấn cũ. Xuất `timeline.xml` + `subtitles.srt` |
| **4** | DaVinci: mở XML, dựng flow nháp cho video đó — chèn nhạc, SFX, text dự kiến, ghi chú đỏ. Gen thử voiceover 2 phương án trên ElevenLabs/MiniMax |
| **5** | Viết brief hoàn chỉnh theo Phụ lục A cho video đó → đưa người phụ trách chấm. Đạt thì được giao video thật, có người kèm ở vòng revise đầu |

Sau 3 video chạy trọn quy trình có người kèm → tự chạy độc lập.

---

# PHỤ LỤC A — Template brief gửi editor (copy nguyên, điền vào)

```markdown
# BRIEF VIDEO — <tên video>

## 1. Thông tin chung
- Mã dự án: 20260822_POE_chuyen-gia-do-cung_9x16_v1
- Kênh đăng: Facebook Reel + TikTok + YouTube Shorts
- Tỉ lệ: 9:16 dọc
- Thời lượng mục tiêu: 45–60 giây
- Deadline: 17:00 thứ Sáu 29/08/2026
- Rate: 300.000đ (dưới 1 phút), gồm 2 vòng revise

## 2. Mục tiêu video
<1–2 câu: video này muốn người xem hiểu gì / làm gì>

## 3. File trong folder
- 00_BRIEF/kichban.md — kịch bản 3 lớp (lời / chữ / hình)
- 02_SOURCE/danh-sach-source.md — bảng timecode các đoạn cần dùng
- 03_VOICEOVER/voiceover_v1.wav
- 04_DRAFT/draft_v1.mp4 — BẢN NHÁP FLOW, xem cái này trước
- 04_DRAFT/timeline.xml + subtitles.srt
- 05_ASSETS/ — nhạc, SFX, logo, font

## 4. HOOK (0–3s) — phần quan trọng nhất
- Hình: <mô tả>
- Lời: <câu thoại>
- Chữ: <text + màu>
- Yêu cầu: nhịp cắt dưới 1s/cut, nhạc energy vào ngay từ frame đầu

## 5. Màu
<trong trẻo / sạch / xanh mát — hoặc ấm, cao cấp>. Tham chiếu: ref #1.
Da người phải tự nhiên, không đẩy xanh quá tay.

## 6. Cách edit
- Nhịp: 0–30s cắt dồn, sau đó giãn dần, vào shot dài khi chuyên gia nói
- Reframe 9:16, ưu tiên giữ mặt/tay trong khung an toàn
- Được punch-in/zoom nhẹ ở các câu nhấn

## 7. Transition
<vd: chủ yếu cắt thẳng; whoosh nhẹ chỉ ở 2 chỗ chuyển chương. KHÔNG dùng transition xoay/glitch>

## 8. Sound effect
- 00:01 impact khi <hành động>
- Mỗi lần con số hiện lên: ting nhẹ
- Nhạc fade out từ 00:12 khi chuyên gia bắt đầu nói

## 9. Text
- Font: <tên font> (file trong 05_ASSETS/FONT/)
- Đỏ = con số vấn đề · Xanh = kết quả sau lọc · Trắng = tên bước
- Chữ tránh 15% mép dưới (bị UI nền tảng che)
- Phụ đề: <full câu / chỉ text nhấn> — dùng subtitles.srt, KHÔNG tự gõ lại

## 10. Video tham khảo
| # | Link | Lấy gì từ ref này |
|---|---|---|
| 1 | <link> | Nhịp cắt + cách chèn số ở hook |
| 2 | <link> | Kiểu chữ và cách chữ xuất hiện theo nhịp |

## 11. KHÔNG được làm
- Không burn phụ đề chết (giữ track riêng)
- Không để lộ nhãn hiệu đối thủ (làm mờ nếu có)
- Không thêm chữ/lời không có trong kịch bản
- Không đổi nhạc khác nếu chưa hỏi

## 12. Bàn giao
- MP4 H.264, 1080p+, 9:16, không watermark → 06_EXPORT/
- Kèm bản không phụ đề
- Kèm project file
```

---

# PHỤ LỤC B — Template feedback revise

```markdown
# REVISE VÒNG <1/2> — <tên video> — <ngày>

Tổng thể: <1 câu — cái gì đã ổn, đừng chỉ chê>

| Timecode | Vấn đề | Muốn sửa thành |
|---|---|---|
| 00:02 | Chữ "1–3 mg/l" hiện chậm hơn lời nói ~0.5s | Đẩy sớm, khớp đúng lúc phát âm |
| 00:14 | Nhạc át tiếng anh Như | Hạ nhạc còn ~60%, fade từ 00:12 |
| 00:31 | Transition xoay quá mạnh | Đổi thành cắt thẳng |
| 00:48 | Sai chính tả "khoáng chât" | "khoáng chất" |

Giữ nguyên (đã tốt, đừng sửa): <liệt kê>
Hạn gửi lại: <ngày giờ>
```

---

# PHỤ LỤC C — Checklist QC cuối cùng trước khi đăng

- [ ] Xem lại **trọn vẹn một lượt** từ đầu đến cuối trên **điện thoại** (không phải màn hình máy tính)
- [ ] Đúng tỉ lệ 9:16, đúng thời lượng
- [ ] Hook 3 giây đầu đứng vững cả khi xem không có tiếng
- [ ] Không typo, dấu tiếng Việt đủ, chữ không lỗi font
- [ ] Chữ không bị UI nền tảng che
- [ ] Tiếng không rè, không clip, nhạc không át lời
- [ ] Không frame đen, không missing media, không watermark
- [ ] Màu nhất quán giữa các shot
- [ ] Đã qua checklist pháp lý mục 6.3
- [ ] Caption từng nền tảng đã viết riêng (2 dòng đầu = hook thứ hai, có con số hoặc nghịch lý)
- [ ] File final đã lưu Drive MKT
