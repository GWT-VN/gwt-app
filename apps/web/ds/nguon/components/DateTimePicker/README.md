Chọn **ngày + giờ** (hạn xử lý, giờ hẹn) — gõ hoặc chọn lịch, chỉ lưu khi bấm Xong.

**Chưa có trong artifact** — nguồn là prototype `/prototype/chon-gio?variant=A4`, CEO duyệt 20/11/2026; thêm ở repo lát 7. Hiển thị **dd/MM/yyyy · HH:mm** (ô bảng **dd/MM HH:mm**), lưu ISO có múi `2026-11-25T14:30:00+07:00`.

**Cách dùng đã chốt (CEO 20/11):** đầu pop hai ô gõ **[ngày] [giờ]**, lịch bên dưới đồng bộ hai chiều với ô ngày; chân pop **Xoá** (trái) · **Huỷ** + **Xong** (phải). **Chỉ lưu khi Xong** (hoặc Enter ở ô ngày / ô giờ). Huỷ / Esc / bấm ra ngoài = bỏ nháp; mở lại luôn thấy giá trị đang lưu. Xoá có hiệu lực ngay.

| Phần | Token / component | Giá trị |
| --- | --- | --- |
| Trigger ô form | `ui-select-trigger` (y DatePicker) | icon `CalendarBlank` 16px; "25/11/2026 · 14:30"; placeholder "Chọn ngày giờ" |
| Trigger gọn (`gon`) | `.b-osua` (InlineEdit) | "25/11 14:30" `tabular-nums`; trống chữ `color-text-tertiary`; ▾ khi rê / mở / focus phím |
| Bảng nổi | `ui-menu ui-cal-pop` (y DatePicker) | padding 20/24, bo `radius-4xl`; trần cao = chỗ trống tới mép màn + cuộn trong |
| Hai ô gõ | `Input` + `TimeInput` | cách nhau 8, cách lịch 12; ô giờ rộng 112 |
| Ô ngày | `Input` + `CalendarBlank` | nhận `dd/mm`, `dd/mm/yyyy` (dấu / - .); thiếu năm mà đã qua → năm sau; gõ sai / ngày đã qua → `aria-invalid`, **Xong tắt** |
| Ô giờ | `TimeInput` | 24h; gõ `1430` / `14:30` / `9` (→ 09:00), phút lẻ giữ nguyên; gợi ý mỗi 30 phút (mặt menu), ↑/↓ + Enter |
| Lịch | `Calendar` (y DatePicker) | ngày trước `tuNgay` (mặc định hôm nay) gạch ngang, **trừ ngày của hạn đang có** |
| Chân | `ui-cal-foot` | trái "Xoá" (`ghost sm` gạch chân, chỉ khi có giá trị) · phải "Huỷ" (`outline sm`) + "Xong" (`default sm`) |

**Giờ mặc định:** chỉ chọn ngày → giờ đang có, chưa có thì `gioMacDinh` = **17:30 (CEO chưa chốt — đổi ở `GIO_MAC_DINH`, `lib/gio.ts`)**. Ô giờ trống hiện số đó dạng placeholder mờ. Chỉ đổi giờ, ô ngày trống → ngày đang có, chưa có thì hôm nay.

**Bàn phím & a11y:** trigger là nút thường, tên đọc = nhãn + giá trị (`useTriggerChon`); pop `role="dialog"` "Chọn ngày giờ", mở là focus ô ngày (chọn hết để gõ đè). Ô giờ là combobox APG (`aria-activedescendant`, danh sách `role="listbox"` "Gợi ý giờ"). Enter đang ghép chữ (IME) không chốt. Esc đóng pop, focus về trigger.

**Mở từ ngoài:** `open` / `onOpenChange` — vd mục menu "Đặt hạn…" mở pop ngay tại ô Hạn của dòng.

**Múi giờ:** `mui` mặc định `+07:00`. Giá trị từ DB ở múi khác (`…Z`) đổi về `mui` trước khi hiện / sửa (`tachIso`) — không cắt chuỗi. Không `toISOString()`.

**Code:** `components/ui/date-time-picker.tsx`, `components/ui/time-input.tsx`, hàm thuần `lib/gio.ts`. Khối `/ds#date-time-picker`.
