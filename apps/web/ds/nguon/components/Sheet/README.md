shadcn `Sheet` (bảng trượt cạnh phải 384px) cho bộ lọc nâng cao và xem/sửa nhanh một bản ghi mà không rời danh sách.

**Người dùng cung cấp:** tiêu đề, mô tả ngắn, thân cuộn được, footer có hành động chính bên phải.

| Phần | Nguồn | Giá trị |
| --- | --- | --- |
| Bề rộng | shadcn `sm:max-w-sm` | 384px, mobile 100% |
| Nền / bóng | `popover`, `shadow-400` + `shadow-hairline` | |
| Overlay | `--modal-backdrop-background` | 30% / 50% |
| Header / thân | `dialog-padding` | 20px; header + footer ngăn bằng 1px `border` |
| Tiêu đề | heading-sm | 18px/26px semibold |
| Footer | | padding 12px 20px, căn phải, gap 8px |

- Bộ lọc trong Sheet vẫn ghi vào tham số URL chuẩn (`CHUAN-FILTER.md`); "Xoá lọc" là `ghost`, "Áp dụng" là `default`.
- Đóng: nút ✕ (ghost icon-sm, `aria-label="Đóng"`; cách mép trên/phải 19px — tâm nút thẳng tâm dòng tiêu đề), Esc, bấm overlay. Header chừa lề phải 56px cho ✕ → tiêu đề dài xuống dòng, cách ✕ 9px.
