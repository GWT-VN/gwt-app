shadcn `Tabs` mặc diện mạo SegmentedControl của OpenAI: rãnh pill xám, tab đang chọn là "thumb" trắng nổi nhẹ.

**Dùng khi** chuyển giữa 2–5 khung cùng ngữ cảnh (tab trạng thái của danh sách, tab chi tiết bản ghi). Không dùng để điều hướng giữa các khu (dùng Sidebar).
**Người dùng cung cấp:** nhãn ngắn, có thể kèm số đếm; `value`; panel tương ứng.

| Phần | Nguồn SegmentedControl md | Giá trị |
| --- | --- | --- |
| Rãnh (TabsList) | `--segmented-control-background` | gray-100 / dark gray-0; cao 32px; padding 2px; gap 2px; pill |
| Tab | | 14px semibold, `muted-foreground`; padding ngang 16px |
| Tab đang chọn | `--segmented-control-thumb-background`, `--segmented-control-thumb-shadow` | nền gray-0 / dark gray-300, `0 1px 4px -1px rgba(0,0,0,.2)`, chữ `foreground` |
| Hover | | chữ `foreground` |
| Focus-visible | | outline 2px `ring` |
| Disabled | | `color-text-disabled` |

Bàn phím (WAI-ARIA Tabs): ←/→ chuyển và kích hoạt, Home/End về đầu/cuối, chỉ tab đang chọn có `tabindex="0"`.
Nếu tab gắn với URL (lọc trạng thái danh sách) thì đi theo tham số chuẩn trong `CHUAN-FILTER.md`, không đặt tên mới.

## Bổ sung 18/11/2026 — biến thể `pill` (kiểu ChatGPT)
Hàng tab của màn dữ liệu (ticket, đơn…) dùng **`data-variant="pill"`**, không dùng segmented: không rãnh nền, tab cao `control-size-lg` 36px, padding 0 16px, chữ 500 `muted-foreground`; tab đang chọn nền `alpha-05`, chữ `foreground` **500** (đổi từ 600 theo prototype hiện tại), không bóng. Số đếm 12px 400 `color-text-tertiary` `tabular-nums`; `data-color="danger"` cho số cần chú ý (Quá hạn). Hàng tab dài thì cuộn ngang, không xuống dòng; khi tràn, mép phải mờ dần 40px (`mask-image`) để không cắt cụt giữa chữ. Khi code: tab không vừa gom vào nút "Thêm ▾" (chuẩn GitHub/Linear) để truy cập được bằng phím. Segmented (mặc định) giữ cho chuyển khung trong một thẻ/bảng nhỏ.
