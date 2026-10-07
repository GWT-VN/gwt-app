# HeyGen — Hướng dẫn sản xuất Avatar Video

> Quy trình tạo avatar clone và generate video với audio từ ElevenLabs, rút ra từ tài liệu chính thức HeyGen + kinh nghiệm test thực tế.

---

## 1. Tạo Avatar Clone (Digital Twin)

### 1.1 Yêu cầu video training

| Yêu cầu | Chi tiết |
|---|---|
| Độ dài | Tối thiểu **2 phút** nói liên tục, không cắt ghép |
| Độ phân giải | Tối thiểu **1080p** — 4K 60fps càng tốt |
| Định dạng | Một file liên tục, không edit giữa chừng |
| Ánh sáng | Tốt, đều, không bóng đổ mạnh lên mặt |
| Âm thanh | Yên tĩnh, mic rõ tiếng — chất lượng audio ảnh hưởng đến consent verification |
| Máy quay | Camera chuyên nghiệp tốt nhất, điện thoại cũng được — nếu dùng điện thoại thì **khoá focus + exposure** trước khi quay (chạm giữ mặt đến khi hiện icon khoá) |

### 1.2 Filming tips

- **Nhìn thẳng camera** suốt video — không nhìn sang trái/phải/lên/dưới
- **Giới hạn xoay đầu** tối đa 30 độ mỗi bên
- **Mở đầu video với 2-3 giây im lặng** trước khi bắt đầu nói
- **Nghỉ 1-2 giây** giữa các câu dài — giúp lip sync chính xác hơn
- **Khi nghỉ, ngậm miệng tự nhiên** — đừng để miệng hé mở
- **Tay giữ dưới ngực** — không giơ tay cao hơn ngực
- **Giữ mặt rõ ràng** suốt video — không che mặt bằng tay hay phụ kiện
- **Giữ vị trí camera ổn định** — không rung, không di chuyển

### 1.3 Trang phục & ngoại hình

- **KHÔNG** mặc đồ có logo lớn, chữ, hoặc hoa văn rối → gây artifact
- Kính, trang sức, đồng hồ, râu, makeup: được nhưng **có thể gây artifact nhỏ**
- Quần áo chuyên nghiệp quá có thể khiến avatar trông già hơn → thử quần áo casual
- Đảm bảo **tương phản** giữa trang phục và background → tránh halo khi xoá nền

### 1.4 Upload video training & tạo avatar

1. Vào HeyGen → **Avatars** → **Create Avatar** → chọn **Instant Avatar**
2. Upload file video training (file 2 phút+ đã quay theo yêu cầu mục 1.1–1.3)
3. Đặt tên avatar rõ ràng (vd: `DR. NHƯ (BẢN FINAL)`) — tên này sẽ hiển thị trong danh sách avatar khi tạo video
4. Chờ HeyGen xử lý — thường **vài phút đến ~30 phút** tuỳ độ dài video
5. Sau khi xử lý xong → avatar xuất hiện trong danh sách **My Avatars**

### 1.5 Consent verification

- Upload video xong → HeyGen yêu cầu **consent verification bắt buộc**
- HeyGen hiển thị **mã consent** → quay video người thật đọc mã đó rõ ràng rồi upload
- **KHÔNG** dùng AI avatar để quay consent
- **KHÔNG** dùng screen recording thay cho quay thật
- Nếu consent bị reject: quay lại với ánh sáng tốt, audio rõ, đúng mã

### 1.6 Lý do upload bị reject

- Di chuyển đầu/mặt quá nhiều
- Mặt không nhìn thấy rõ suốt video
- Phát hiện nhiều cảnh hoặc cắt ghép
- File bị corrupt
- Video mờ, thiếu sáng
- Audio không rõ

---

## 2. Workflow: Audio ElevenLabs + Avatar HeyGen

> Workflow chính: generate audio trên ElevenLabs → upload audio lên HeyGen → avatar lip sync theo audio đó.
>
> **Credit:** Mỗi lần render video đều tốn credit. Nếu hết credit giữa tháng, có thể upgrade lên gói cao hơn ngay — chỉ phải trả phần chênh lệch giữa gói cũ và gói mới.

### 2.1 Chuẩn bị audio

- Generate audio trên ElevenLabs theo bản rules ElevenLabs (file riêng)
- Download: **MP3, 44.1 kHz, 128 kbps**
- Kiểm tra chất lượng audio trước khi upload lên HeyGen

### 2.2 Tạo video trên HeyGen

1. Vào danh sách avatar → tìm **DR. NHƯ (BẢN FINAL)** → ấn **"Tạo video bằng avatar này"** → tự mở AI Studio với avatar đã chọn sẵn
2. **Panel phải — "Avatar & Giọng Nói":**
   - **Avatar:** kiểm tra hiển thị đúng `DR. NHƯ (BẢN FINAL)` — Motion Look
   - **Giọng nói:** ấn vào dropdown → chọn file audio upload (icon 🎤) → upload file MP3 từ ElevenLabs. Không dùng TTS của HeyGen
   - **Động cơ chuyển động:** chọn **Avatar V** (dropdown ngay dưới Giọng nói)
   - **Nền avatar:** Tuỳ chỉnh / Gỡ bỏ / Màu — chọn tuỳ project
   - **Bố cục:** Góc (mặc định) hoặc Vòng tròn
3. **Panel trái — "Kịch bản":**
   - File audio đã upload sẽ hiển thị ở đây với tên file + thời lượng (vd: `John_Snow_EP2__x1.1) 00:00/03:30`)
   - Phía dưới hiện transcript/text tham khảo
   - Có thể **+ Thêm cảnh** nếu video có nhiều đoạn
4. **Render:** ấn nút **Tạo** (góc trên phải) → chờ render xong → xem lại lip sync + expression trên video đã render
   - **Không có preview trước khi render** — phải tạo cảnh xong mới xem được lip sync
   - Nếu không đạt → chỉnh setting rồi render lại

### 2.3 Lưu ý quan trọng

- **Audio quyết định biểu cảm:** Avatar V ưu tiên theo thứ tự: **Audio > Ảnh gốc > Motion prompt** — nếu audio phẳng/monotone thì avatar cũng sẽ phẳng dù prompt có ghi gì
- Audio từ ElevenLabs với tone `[calm] [conversational]` đã có đủ biến thiên tự nhiên cho Avatar V
- **Kiểm tra lip sync tiếng Việt:** HeyGen tối ưu cho tiếng Anh — lip sync tiếng Việt có thể kém hơn chút, render xong xem lại kỹ

---

## 3. Settings & Tips

### 3.1 Avatar Model

**Luôn dùng Avatar V.** Không dùng Avatar III hay IV.

> Tham khảo: Avatar IV cho phép custom motion prompt chi tiết hơn — có thể test thử nếu Avatar V không đạt về gesture. Avatar III rẻ credit hơn nhưng chất lượng thấp hơn đáng kể.

### 3.2 Expression & Movement

- Ấn vào **icon thanh chỉnh ⚙️** ngay bên cạnh dropdown "Avatar V" (panel phải → Động cơ chuyển động) → mở ra Advanced Settings với tab **Expression**, **Gesture**, **Gaze**
- Với speaker profile anh Như (bình thản, chuyên gia): **Less Expressive** hoặc mức mặc định — KHÔNG bật quá expressive
- Avatar V ưu tiên: **Audio > Ảnh gốc > Motion prompt** — nên audio chất lượng là quan trọng nhất

### 3.3 Xử lý lỗi thường gặp

| Vấn đề | Nguyên nhân | Cách xử lý |
|---|---|---|
| Miệng mở quá rộng | Ảnh gốc cười toe, hoặc "More Expressive" đang bật | Dùng ảnh subtle smile; tắt "More Expressive"; chỉnh Less Expressive |
| Gesture không phản hồi prompt | Avatar V ưu tiên audio hơn prompt | Dùng audio expressive hơn — Avatar V lấy cử chỉ từ audio, không phải prompt. Nếu vẫn không đạt, có thể test thử Avatar IV (hỗ trợ custom motion prompt tốt hơn) |
| Avatar không giống người thật | Mặt nhỏ trong khung hình, video mờ | Quay lại close-up, mặt chiếm nhiều khung hình hơn; tăng resolution |
| Mắt nhìn sai hướng | Avatar V giữ hướng mắt từ frame đầu | Dùng gaze preset "Looking directly at camera"; bật Eye Contact Correction |
| Artifact ở viền khi xoá nền | Tương phản trang phục/nền thấp | Tăng tương phản; edit ảnh gốc |
| Lip sync không khớp tiếng Việt | HeyGen tối ưu cho tiếng Anh | Render xong xem lại kỹ; chia audio thành đoạn ngắn hơn |

### 3.4 Checklist trước khi Render

- [ ] Panel phải → Avatar: đúng **DR. NHƯ (BẢN FINAL)** — Motion Look
- [ ] Panel phải → Động cơ chuyển động: **Avatar V**
- [ ] Panel phải → Giọng nói: đúng file audio upload từ ElevenLabs (không phải TTS HeyGen)
- [ ] Panel trái → Kịch bản: file audio hiển thị đúng tên + thời lượng
- [ ] Render xong → xem lại lip sync + expression + timing (không có preview trước render)
- [ ] Nền avatar: đúng setting (tuỳ chỉnh / gỡ bỏ / màu)
- [ ] Expression: mức mặc định hoặc Less Expressive
- [ ] Không có motion prompt quá mạnh cho giọng chuyên gia

---

## 4. So sánh Platform Avatar (tham khảo)

| Platform | Lip sync | Custom avatar + external audio | Giá/tháng |
|---|---|---|---|
| **HeyGen** | ⭐⭐⭐⭐⭐ | Tốt nhất — Instant Avatar từ 2 phút video | $29 |
| Synthesia | ⭐⭐⭐⭐ | Tốt nhưng thiên về avatar có sẵn | $29 ($18 annual) |
| D-ID | ⭐⭐⭐ | Được nhưng lip sync kém hơn | $5.99 |
| AI Studios (DeepBrain) | ⭐⭐ | Lip sync tiếng Việt kém, không khớp khẩu hình | Tuỳ gói |

> **Kết luận:** HeyGen là lựa chọn tốt nhất cho workflow custom avatar + external audio từ ElevenLabs.
