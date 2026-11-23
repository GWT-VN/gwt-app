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

## Đổi khi chép khung shadcn (21–23/11/2026)

- **Nút ✕ chuyển chỗ:** trước nằm trong `SheetHeader`, nay do `SheetContent` vẽ (cuối panel, cùng vị trí góc trên phải 19px). Tắt bằng `SheetContent showCloseButton={false}` (mới, mặc định `true`) — vd ngăn kéo menu Sidebar đã có nút "Đóng menu".
- Focus khi mở: phần tử có `data-autofocus` → không có thì nút ✕ → không ✕ thì phần tử focus được đầu tiên. Tab: ✕ → thân → footer → ✕.
- `side` thêm `top`/`bottom` (shadcn; artifact chưa vẽ): rộng hết, cao theo nội dung, tối đa cao khung nhìn. `right` (mặc định) và `left` giữ như cũ; khung có `data-side`.
- `SheetHeader` không còn tự thêm ✕ nhưng vẫn chừa lề phải 56px. Luôn phải có `SheetTitle` (ẩn `sr-only` nếu không có header).
- Export giữ tên: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter` + `SheetBody` (GWT, thân giãn + cuộn). Portal/Overlay dùng nội bộ, không export; portal vào ô của `DsRoot`.
- Không có chuyển động trượt của shadcn (artifact không định nghĩa). Hình thức giữ nguyên.
