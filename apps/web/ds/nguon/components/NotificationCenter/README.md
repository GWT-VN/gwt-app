Trung tâm thông báo trong app, mở từ chuông trên khung. **Mới 19/11/2026** — cùng nguồn sự kiện với tin bot gửi Discord; loại nào vào chuông do `NotificationMatrix` (cột Trong app) quyết định.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Hộp | `ui-menu ui-notif` | rộng `min(400px, 100vw-16px)`, cao ≤560px; chỉ danh sách cuộn |
| Đầu | `ui-notif-head` | tiêu đề 16/24 600 · "Đọc hết" `Button ghost sm` · ⚙ `Button ghost icon-sm` (mở cấu hình) |
| Tab | `Tabs` pill | Tất cả · Chưa đọc + số |
| Nhóm ngày | `ui-menu-label` | Hôm nay · Hôm qua · Cũ hơn |
| Dòng | `ui-notif-item` | bo `radius-lg`, hover nền `accent` (**một lớp**) |
| Biểu tượng | `ui-notif-icon` | tròn 32px nền `alpha-04`; `data-loai="gap"` danger-soft, `"nhac"` info-soft |
| Chữ | `ui-notif-text` | `muted-foreground` tối đa 2 dòng; chưa đọc → `foreground`; tên người `b` 500 |
| Trích | `ui-notif-quote` | kẻ trái 2px `border`, 2 dòng |
| Thời gian | `ui-notif-meta` | 12/18 `muted-foreground` + khu + "qua Discord" nếu có |
| Nút đánh dấu | `ui-notif-mark` | góc trên phải, chấm `ui-dot` info (chưa đọc) / vòng (đã đọc); hover chỉ đổi màu chữ; dòng đã đọc ẩn nút tới khi rê/focus |

**Hành vi:** bấm dòng → đánh dấu đã đọc, đóng hộp, mở đúng bản ghi. Ở tab Chưa đọc, dòng vừa đọc **ở yên chỗ** tới khi đổi tab. "Đọc hết" chỉ đánh dấu loại đang hiện. Thông báo mới đến: số tăng + câu đọc qua `role="status"`.
**a11y:** hộp không chặn (non-modal dialog, `aria-label="Thông báo"`); mở → focus vào tab đang chọn; Tab ra khỏi hộp hoặc Esc → đóng, focus về chuông (Shift+Tab ở đầu về chuông, Tab ở cuối sang phần tử kế sau chuông). Tab theo APG (←/→, Home/End). Nút đánh dấu có tên đọc "Đánh dấu đã đọc: …".
**Code:** shadcn `Popover` (Radix, `modal={false}`) + `Tabs`; dữ liệu từ bảng thông báo theo người nhận.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp#thongbao` và `#cauhinh` (`khung/_proto/ThongBao.tsx`, `khung/_proto/MaTranThongBao.tsx`); CSS ở khối `BỔ SUNG DS THÔNG BÁO` cuối `khung/_proto/ui.css`.
