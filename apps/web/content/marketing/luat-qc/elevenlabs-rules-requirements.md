# ElevenLabs v3 — Rules & Requirements

> Bộ quy tắc sản xuất giọng nói AI cho content tiếng Việt, rút ra từ quá trình test thực tế với ElevenLabs v3.

---

## 1. Quy trình Clone Voice

### Bước 1: Instant Voice Cloning (IVC) — test nhanh trước

- Cut một đoạn nói **chất lượng tốt nhất** của speaker (giọng rõ, không tạp âm, không filler words)
- Upload lên ElevenLabs → tạo IVC
- Test bằng **model v3** với một đoạn text ngắn (dưới 500 ký tự)
- Đánh giá: voice similarity có đạt không? Đọc tiếng Việt có đúng dấu không?
- Nếu ổn → dùng IVC luôn, không cần PVC

### Bước 2: Professional Voice Cloning (PVC) — khi IVC không đạt

PVC yêu cầu **~3 tiếng dữ liệu training**, nên cần chuẩn bị kỹ:

- **Lọc tạp âm:** loại hết background noise, tiếng ồn, echo
- **Loại filler words:** bỏ các "ừm", "à", "ờ", khoảng im dài bất thường
- **Loại lặp từ / nói lại:** chỉ giữ take tốt nhất
- **Đảm bảo consistent:** speaker giữ giọng đều, khoảng cách mic ổn định, RMS target -23 dB đến -18 dB
- **Ngôn ngữ:** training data phải bằng tiếng Việt nếu output là tiếng Việt — voice clone từ ngôn ngữ khác sẽ cho accent sai
- **Ưu tiên voice nói chuyện tự nhiên:** không nên dùng quá nhiều đoạn đọc kịch bản — giọng đọc script thường bị đầm hơn, thiếu sống động so với giọng nói chuyện tự nhiên. Tỉ lệ lý tưởng: phần lớn data là nói chuyện tự nhiên, xen kẽ một ít đọc script để model học được cả hai kiểu
- **Hướng dẫn speaker giữ tone nhất quán:** khi ghi âm nhiều file/session khác nhau, phải chú ý hướng dẫn người nói sao cho giọng giữa các file nghe giống nhau — cùng tone, cùng năng lượng, cùng khoảng cách mic. Nếu không, model sẽ học ra giọng "trung bình" giữa các file → output không giống lần nói nào cả

### Lưu ý chung về Clone Voice

- **Clone voice không tốn credit** — chỉ tốn credit khi generate audio ở bước Text to Speech
- **Verification bắt buộc:** khi tạo voice clone (cả IVC lẫn PVC), ElevenLabs yêu cầu xác minh danh tính người nói (voice verification) — cần chuẩn bị sẵn
- **v3 ưu tiên biểu cảm hơn voice similarity** — đây là trade-off cố hữu của model, không phải lỗi
- **v3 là non-deterministic** — cùng input có thể ra output khác nhau giữa các lần generate. Nếu một lần ra tệ, generate lại 2-3 lần trước khi kết luận
- **v2.5 Turbo** có voice similarity tốt hơn nhưng đọc sai dấu tiếng Việt → không dùng cho content tiếng Việt
- **Voice Changer** không có model hỗ trợ tiếng Việt → không dùng workaround v3 + Voice Changer được
- Nếu cả IVC lẫn PVC đều bị mất similarity cùng lúc → khả năng cao là lỗi phía server, report support và chờ — không cần xoá voice clone hay tạo lại

---

## 2. Quy trình Text to Speech (TTS)

> **Lưu ý:** Mỗi lần generate audio đều **tốn credit** — khác với clone voice (miễn phí). Nên check server đầu ngày trước khi sản xuất để tránh tốn credit vô ích.

### 2.1 Thiết lập trên ElevenLabs

1. Vào **Text to Speech**
2. Chọn đúng **voice profile** đã clone (kiểm tra dropdown — dễ chọn nhầm voice)
3. Chọn **model v3** (kiểm tra model selector — không dùng v2.5 Turbo cho tiếng Việt)
4. Chọn **Language Override → Vietnamese** (bắt buộc để v3 đọc đúng dấu tiếng Việt)

### 2.2 Check server đầu ngày

- Mỗi ngày làm việc, generate thử **1 đoạn dưới 500 ký tự lấy từ script cần produce** với voice clone đã chọn — nếu ổn thì dùng luôn output đó, không tốn credit thừa
- Nếu output không giống giọng speaker → dừng lại, không generate tiếp (tốn credit vô ích)
- Đây là bài học từ ngày 22/09/2026: cả ngày không generate được audio nào giống giọng anh Như, cả IVC lẫn PVC đều ra giọng khác — lỗi phía server ElevenLabs, status page vẫn báo "fully operational"

### 2.3 Generate audio

- **Giữ dưới 800 ký tự/đoạn** khi generate — đoạn dài làm giọng mất ổn định
- Generate **2-3 lần** nếu lần đầu chưa ưng — v3 non-deterministic, lần sau có thể tốt hơn
- Nếu output không giống giọng speaker → **ấn 👎** ở output đó và **chọn nguyên nhân feedback** để ElevenLabs ghi nhận

### 2.4 Download audio

- Định dạng: **MP3**
- Sample rate: **44.1 kHz**
- Bitrate: **128 kbps**

---

## 3. Quy trình Format Kịch Bản cho ElevenLabs v3

> Khi viết xong kịch bản văn nói, **đẩy lên Claude** để chèn tone tag, pause tag, CAPS nhấn mạnh theo các quy tắc bên dưới trước khi paste vào ElevenLabs.

### 3.1 Nguyên tắc chung

- **Paste text từ plain text:** khi copy kịch bản vào ElevenLabs, paste qua **Notepad** (hoặc plain text editor) trước rồi copy lại — tránh ký tự ẩn (zero-width space, smart quotes) khiến tag bị đọc thành tiếng click
- **Fallback khi pause tag bị lỗi:** nếu `[pause]` / `[short pause]` liên tục bị click dù đã gõ tay, thay bằng dấu câu: `...` (ba chấm) cho nghỉ ngắn, `-- --` cho nghỉ dài hơn, hoặc dấu chấm `.` kết thúc câu + xuống dòng
- **Viết văn nói (spoken style)**, không viết văn viết (written style) — TTS đọc văn nói tự nhiên hơn hẳn
- **Số viết bằng chữ:** "sáu trăm" thay vì "600", "mười ngày" thay vì "10 ngày" — tránh TTS đọc sai số
- **Tên riêng nước ngoài:** viết phiên âm nếu muốn TTS đọc đúng ("Luân Đôn" thay vì "London") hoặc giữ nguyên nếu muốn đọc theo tiếng Anh
- **Giữ dưới 800 ký tự/đoạn** khi generate — đoạn dài làm giọng mất ổn định

### 3.2 Tone Tags

**Combo mặc định cho giọng chuyên gia kể chuyện (nam, Bắc, lớn tuổi):**

```
[calm] [conversational]
```

**Các tag đã test:**

| Tag | Kết quả | Dùng khi |
|---|---|---|
| `[calm] [conversational]` | Tốt nhất — bình thản, tự nhiên | Mặc định cho kể chuyện |
| `[serious]` | Giọng trầm lại, nghiêm túc | Đoạn dịch bệnh bùng phát, người chết, tình huống nghiêm trọng |
| `[narration]` | Quá kịch, theatrical | KHÔNG dùng — nghe đa cấp |
| `[measured]` | Quá chậm | KHÔNG dùng |
| `[slow]` | Quá chậm | KHÔNG dùng |
| `[steady] [conversational]` | Quá nhanh | KHÔNG dùng |
| `[warm] [conversational]` | Ấm nhưng khác tone | Tuỳ context, test trước |
| `[friendly]` | Nhẹ nhàng | Tuỳ context — đoạn gần gũi, thân thiện với người nghe |
| `[relaxed]` | Thư giãn | Tuỳ context — đoạn nhẹ nhàng, không áp lực |

**Quy tắc chuyển tone inline:**

- Tối đa **2-3 lần chuyển tone** trong một bài ~1400 từ
- Chuyển quá nhiều → giọng bị "reset", nghe giật và không tự nhiên
- Đặt tag chuyển tone ở **đầu câu mới**, không đặt giữa câu
- Pattern đã test thành công: `[calm] [conversational]` → `[serious]` → `[calm] [conversational]`

### 3.3 Pause Tags

| Tag | Dùng khi | Ví dụ |
|---|---|---|
| `[pause]` | Chuyển phần lớn, đổi chủ đề, sau reveal quan trọng | Giữa "bối cảnh" → "dịch bùng" |
| `[short pause]` | Hít hơi tự nhiên, trước twist, giữa 2 ý trong cùng phần | Trước "cho tới khi ông nhìn vào những người KHÔNG chết" |
| `[long pause]` | Quá dài — KHÔNG dùng | Đã test, nghỉ lâu quá mất nhịp kể chuyện |

**Quy tắc:**

- Không để 2 pause liên tiếp
- Không bỏ hết pause (v2 đã test → nghe liền mạch, thiếu nhịp thở, không tự nhiên)
- Không quá nhiều `[short pause]` (v1 có 13 chỗ → nghe nhấn nhá quá mức)
- Tỉ lệ hợp lý: khoảng **8-12 `[pause]`** và **8-12 `[short pause]`** cho bài ~1400 từ

### 3.4 Nhấn mạnh (Emphasis)

**v3 không có tag `[emphasis]` riêng.** Dùng các kỹ thuật sau:

| Kỹ thuật | Cách dùng | Mức độ |
|---|---|---|
| **VIẾT HOA** | Từ khóa bẻ hướng hoặc tạo tương phản | Chính — hiệu quả nhất với v3 |
| `[short pause]` trước từ quan trọng | Tạo khoảng lặng trước reveal | Phụ trợ |
| Dấu ngoặc kép `"..."` | Trích dẫn, thuật ngữ | Nhẹ |

**Kỹ thuật đã bỏ (không phù hợp cho giọng chuyên gia lớn tuổi):**

- ~~Kéo nguyên âm "chảả"~~ — nghe đa cấp với speaker profile này
- ~~Gạch ngang em dash "—"~~ — hiệu quả không rõ ràng trên v3
- ~~CAPS quá nhiều (8+ chỗ)~~ — v1 có 8 chỗ, nghe kịch tính quá

**Quy tắc đặt CAPS:**

- **Tối đa 8-11 chỗ CAPS** cho bài ~1400 từ — đủ phá monotone, không quá kịch
- Chỉ CAPS ở các vị trí có **chức năng rõ ràng:**
  - Con số gây sốc: SÁU TRĂM, MƯỜI NGÀY
  - Tương phản / đối lập: GẦN / XA, KHÔNG chết
  - Reveal / bẻ hướng câu chuyện: CHÍNH NGUỒN NƯỚC
  - Irony: PHẢN BÁC (cố bác nhưng lại tìm ra bằng chứng)
  - Key message: MỚI BIẾT ĐƯỢC
- Không CAPS các từ thông thường, chỉ CAPS từ mang trọng lượng câu chuyện

### 3.5 Danh sách đầy đủ Audio Tags v3 (tham khảo)

> Nguồn: [elevenlabs.io/blog/v3-audiotags](https://elevenlabs.io/blog/v3-audiotags)

**Quy tắc chung:**

- Tag đặt trong ngoặc vuông `[ ]`, viết thường
- Đặt ở bất kỳ đâu trong script — đầu đoạn, giữa câu, hoặc trước từ cần hiệu ứng
- Có thể kết hợp nhiều tag trong một câu để tạo lớp biểu cảm
- Tag là chỉ dẫn diễn xuất — v3 không đọc thành tiếng
- Kết hợp với dấu câu (ba chấm, phẩy, CAPS) để tăng hiệu quả

**Emotions (cảm xúc):**

| Tag | Ý nghĩa |
|---|---|
| `[sad]` | Buồn |
| `[angry]` | Giận dữ |
| `[happily]` | Vui vẻ |
| `[sorrowful]` | Đau buồn sâu sắc |
| `[awe]` | Kinh ngạc, ngưỡng mộ |
| `[excited]` | Hào hứng |
| `[worried]` | Lo lắng |
| `[surprised]` | Ngạc nhiên |
| `[annoyed]` | Bực mình |
| `[tired]` | Mệt mỏi |
| `[upset]` | Buồn bực |

**Delivery & Pacing (cách đọc & nhịp):**

| Tag | Ý nghĩa |
|---|---|
| `[whispers]` | Thì thầm |
| `[shouts]` | Hét |
| `[softly]` | Nhẹ nhàng |
| `[booming]` | Vang dội |
| `[rushed]` | Đọc gấp gáp |
| `[drawn out]` | Kéo dài |
| `[slowly]` | Đọc chậm |
| `[pause]` | Nghỉ |
| `[short pause]` | Nghỉ ngắn |
| `[sarcastically]` | Mỉa mai |

**Human Reactions (phản ứng con người):**

| Tag | Ý nghĩa |
|---|---|
| `[laughs]` | Cười |
| `[big laugh]` | Cười to |
| `[sighs]` | Thở dài |
| `[clears throat]` | Hắng giọng |
| `[coughing]` | Ho |

**Performance (diễn xuất):**

| Tag | Ý nghĩa |
|---|---|
| `[beginning to speak]` | Bắt đầu nói (ngập ngừng) |
| `[interrupting]` | Cắt ngang |
| `[overlapping]` | Nói chồng lên |

**Accents & Character (giọng nhân vật) — tham khảo, ít dùng cho content tiếng Việt:**

| Tag | Ý nghĩa |
|---|---|
| `[French accent]` | Giọng Pháp |
| `[British accent]` | Giọng Anh |
| `[pirate voice]` | Giọng cướp biển |

**Sound Effects (hiệu ứng âm thanh):**

| Tag | Ý nghĩa |
|---|---|
| `[gunshot]` | Tiếng súng |
| `[explosion]` | Tiếng nổ |
| `[clapping]` | Tiếng vỗ tay |

> ⚠️ **Lưu ý cho speaker profile anh Như:** Danh sách trên là tham khảo đầy đủ. Với giọng chuyên gia lớn tuổi kể chuyện, chỉ nên dùng combo đã test ở mục 3.2 (`[calm] [conversational]`, `[serious]`). Các tag emotion mạnh (`[angry]`, `[excited]`, `[shouts]`) hoặc character voice sẽ phá tone — test cẩn thận trước khi dùng trong production.

**Custom tag — đã test thực tế:**

| Tag | Hiệu quả | Ghi chú |
|---|---|---|
| `[continue softly]` | Giọng nhẹ lại mượt sau dấu phẩy | Tùy lúc — không ổn định 100%, test trước khi dùng production |

### 3.6 SSML Tags (không chính thức nhưng chạy được)

> ElevenLabs nói v3 **không hỗ trợ SSML** trong tài liệu chính thức, nhưng qua test thực tế thì engine vẫn parse được. Dùng cẩn thận — có thể mất hỗ trợ bất cứ lúc nào nếu ElevenLabs cập nhật.

**Đã test chạy được:**

| Tag | Chức năng | Ví dụ |
|---|---|---|
| `<prosody pitch="high">` | Đẩy pitch lên cao | `<prosody pitch="high">Thật sao?</prosody>` |
| `<prosody pitch="low">` | Kéo pitch xuống thấp | `<prosody pitch="low">Đó là sự thật.</prosody>` |
| `<prosody rate="slow">` | Đọc chậm lại | `<prosody rate="slow">Mười ngày.</prosody>` |
| `<break time="1s"/>` | Nghỉ chính xác (1 giây) | Thay thế cho `[pause]` khi cần kiểm soát thời gian nghỉ |

**Lưu ý:**

- SSML tag dùng cú pháp XML `< >`, khác với audio tags `[ ]` — có thể mix cả hai trong cùng script
- Phải đóng tag đúng: `<prosody pitch="high">text</prosody>`
- `<break/>` là self-closing, không cần đóng
- **Không có trong tài liệu chính thức** — nếu một ngày nó ngừng hoạt động, chuyển sang audio tags `[ ]` tương đương

### 3.7 Văn phong kể chuyện tiếng Việt (giọng Bắc)

Khi format kịch bản cho TTS tiếng Việt, giữ các đặc trưng văn nói miền Bắc:

- **"chả ai", "chả mấy ai"** — đặc trưng giọng Bắc kể chuyện
- **"ấy", "á", "cơ"** — trợ từ tạo nhịp nói tự nhiên ("Mà thợ ở đấy á...")
- **Câu mở kiểu trò chuyện:** "Đến đây, anh chị có thể đang nghĩ...", "Mà đây không phải chuyện kinh dị tôi nghĩ ra đâu nhé"
- **Ngắt nhịp bằng liên từ:** "Mà chỉ trong vòng...", "Thế nhưng thời đấy...", "Rồi ngay gần đó nữa..."
- **Không dùng từ hàn lâm:** "dịch tễ học" thì phải giải thích ngay sau ("đó là ngành chuyên về...")
- **Xưng hô:** "tôi" (người kể) — "anh chị" (người nghe) — giữ nhất quán

---

## 4. Checklist trước khi Generate

- [ ] Text dưới 800 ký tự/đoạn
- [ ] Tone tag đặt ở đầu đoạn hoặc đầu câu mới
- [ ] Pause hợp lý — không liền mạch quá, không ngắt quá nhiều
- [ ] CAPS chỉ ở từ khóa có chức năng, tối đa 8-11 chỗ/bài
- [ ] Số viết bằng chữ
- [ ] Văn nói, không văn viết
- [ ] Đúng voice clone đã chọn (kiểm tra dropdown trước khi generate)
- [ ] Đúng model v3 (kiểm tra model selector)
- [ ] Language Override = Vietnamese
- [ ] Generate 2-3 lần nếu lần đầu chưa ưng — v3 non-deterministic
- [ ] Download: MP3, 44.1 kHz, 128 kbps

---

## 5. Troubleshooting

| Vấn đề | Nguyên nhân | Cách xử lý |
|---|---|---|
| Giọng không giống speaker | v3 ưu tiên biểu cảm hơn similarity | Generate lại 2-3 lần; bỏ hết tag thử; **ấn 👎 ở output đó và chọn nguyên nhân feedback** để ElevenLabs ghi nhận; nếu cả IVC & PVC đều bị → lỗi server, report support |
| Đọc monotone, phẳng | Thiếu CAPS, thiếu pause, thiếu chuyển tone | Thêm CAPS ở điểm tương phản, thêm `[short pause]` trước reveal |
| Đọc quá kịch / đa cấp | Quá nhiều CAPS, dùng `[narration]`, kéo nguyên âm | Giảm CAPS, chuyển về `[calm] [conversational]` |
| Đọc quá nhanh | Dùng `[steady]` hoặc không có tone tag | Thêm `[calm]`, thêm pause |
| Đọc quá chậm | Dùng `[measured]` hoặc `[slow]` | Bỏ, dùng `[calm] [conversational]` |
| Đọc sai dấu tiếng Việt | Dùng model v2.5 Turbo | Chuyển sang v3 — v3 đọc tiếng Việt đúng dấu hơn |
| Giọng bị "reset" giữa bài | Chuyển tone tag quá nhiều lần | Giảm xuống tối đa 2-3 lần chuyển tone |
| Tag `[pause]` phát ra tiếng click | Ký tự ẩn khi copy-paste, hoặc lỗi server/model v3 | Paste qua Notepad trước; gõ lại tag bằng tay; nếu vẫn bị → generate lại 2-3 lần; hoặc thay tag bằng dấu câu (`...`, `--`, dấu chấm) làm fallback; nếu lỗi vẫn persist → kéo audio vào **Descript** và mute đoạn click trong timeline; nếu mọi cách đều bị → lỗi server, chờ |

---

## 6. Speaker Profile Reference

| Thuộc tính | Giá trị |
|---|---|
| Tên | Nguyễn Hữu Như |
| Vai trò | Chuyên gia kỹ thuật về nước |
| Kinh nghiệm | 25+ năm |
| Giọng | Nam, miền Bắc Việt Nam |
| Tuổi | Lớn tuổi |
| Tone mong muốn | Bình thản, uy tín, kể chuyện tự nhiên — KHÔNG kịch tính, KHÔNG đa cấp |
| Tag combo | `[calm] [conversational]` mặc định, `[serious]` cho đoạn nghiêm trọng |
| Tốc độ đọc | ~150-170 từ/phút (calm conversational) |
