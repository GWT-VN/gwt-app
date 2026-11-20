Đầu trang + thanh công cụ dùng chung cho mọi màn dữ liệu (ticket, đơn, khách…): tiêu đề + đếm, ô tìm, nút tạo, hàng tab, và bộ nút ⚙ │ dạng xem │ thẻ xem nhanh — đã chốt 18/11/2026.

## Cấu tạo
1. **Đầu trang**: tiêu đề 24px 600 · "đang thấy X / Y" · ô tìm (pill) · nút chính.
2. **Hàng tab**: DS `Tabs` biến thể **`pill`** (kiểu ChatGPT — không rãnh, tab chọn nền `alpha-05`) + `ui-tabs-count` (đỏ khi cảnh báo); khi đang lọc hiện "Lọc: … · Xoá lọc". **Không** đặt chip lọc hay chữ gợi ý ở hàng tab.
3. **Thanh công cụ** (phải hàng tab): `⚙` │ `Danh sách · Bảng · Kanban` (radiogroup) │ `bật/tắt thẻ xem nhanh`.

## Thông số
| Phần | Token | Giá trị |
| --- | --- | --- |
| Nút icon | DS `Button` ghost `icon` / `icon-sm` | 32 / 28px, icon Phosphor 18px; đang chọn/bật/mở: nền `accent` (bổ sung DS) |
| Tooltip | DS `Tooltip` (bổ sung) | `ui-tip` + `data-tip`, nền `color-background-primary-solid`, hiện khi hover và focus |
| Ô tìm | DS `Input` + icon | `ui-input-wrap`, rộng 240px |
| Vạch ngăn | `gray-100` | 1×18px, lề 8px |
| Menu ⚙ | `ui-menu` | rộng 300px, cao tối đa 560px / 70vh |

## ⚙ Cài đặt hiển thị (kiểu Notion "View settings")
Trang gốc: Bố cục · Cột hiển thị · Lọc · Sắp xếp · Nhóm theo — mỗi dòng có giá trị hiện tại + ›; dưới: Sao chép link view · Lưu view của tôi · Lưu view chung · Xuất Excel theo bộ lọc. Trang con có nút ← quay lại. "Cột hiển thị": checkbox từng cột (cột Mã khoá bật). "Sắp xếp": chỉ cột có thứ tự/số lượng. Điện thoại: menu thành sheet đáy.

## Hành vi
- Đổi dạng xem giữ nguyên tab/lọc/sắp xếp.
- Nút thẻ xem nhanh **mặc định tắt**; tắt → bấm bản ghi mở trang chi tiết, bật → mở thẻ bên phải (xem `Table`).
- Trạng thái view (dạng xem, cột ẩn, thứ tự cột, độ rộng, nhóm, lọc, sắp) phải ghi được vào URL để "Sao chép link view" và lưu view.

## Bàn phím & a11y
Nút icon có `aria-label` + tooltip cả khi focus; dạng xem là `role="radiogroup"`/`radio` + `aria-checked`; nút thẻ xem nhanh `aria-pressed`; tab là `tablist`.

## Code
- shadcn `Tabs` (biến thể pill, hàng tab) · `ToggleGroup` type="single" (dạng xem) · `Toggle` (thẻ xem nhanh) · `Tooltip` · `Popover` cho ⚙ (nhiều trang con → state trang trong Popover, không lồng DropdownMenu sâu).
- Lọc/tìm theo `docs/CHUAN-FILTER.md` và gói `apps/web/bang/`; danh sách > 10 mục phải gõ để tìm.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`ThanhCongCu`, `CaiDat`) + `chung.tsx` (`ThanhLoc`, `useBang`).
