Ô nhập **mã một lần** (OTP) — mỗi chữ số một ô, dán cả mã hoặc điện thoại tự điền từ SMS.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`input-otp.tsx` @45bbf9b, MIT) trên thư viện `input-otp` 1.5.0 (MIT), thêm ở Đợt 4 chép shadcn (21/11/2026). Token mượn ô nhập (`.ui-input` của `bundle.css`, chuỗi `controlOutline`).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Ô | `.ui-input` | 32×32, viền inset 1px `--input`, chữ 14/20 500 `color-text`, số đều cột |
| Nhóm | — | ô liền chồng mép 1px, bo 8 ở ô đầu/cuối; nhóm cách nhau 8 |
| Ô đang gõ | focus `.ui-input` | viền alpha-50 (không quầng), nổi lên trên; con trỏ giả 1×16 `foreground` nhấp nháy |
| Lỗi | `aria-invalid` | viền red-500 (tối 600), thắng ô đang gõ |
| Tắt | shadcn | mờ 50%, con trỏ cấm |
| Gạch giữa nhóm | `InputOTPSeparator` | `Minus` 16 muted, `role="separator"` |

**Cách dùng:** `<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>` + `InputOTPGroup` / `InputOTPSlot index`. Tên đặt lên InputOTP (`aria-label` hoặc `FieldLabel htmlFor` + `id`) — thư viện chuyển thẳng vào ô `<input>` thật nằm dưới. Câu gợi ý (gửi tới số nào, hết hạn khi nào) + câu lỗi nối `aria-describedby`.

**Lệch shadcn có chủ đích:** viền inset chồng mép thay viền ba cạnh (giữ cách vẽ viền của ô nhập DS); con trỏ giả nhấp nháy bằng `animate-pulse` có sẵn — keyframes `caret-blink` của shadcn chưa thêm vào CSS chung.

**Dùng ở đâu:** hiện chưa có màn cần (đăng nhập qua Google). Chép theo lệnh "lấy hết" của CEO 21/11.

**Code:** `components/ui/input-otp.tsx`. Khối `/ds#input-otp`.
