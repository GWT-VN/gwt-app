Danh sách thuộc tính nhãn ↔ giá trị của một bản ghi (`<dl>`), giá trị bấm vào sửa tại chỗ bằng `InlineEdit`. **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Lưới | `ui-props` | 2 cột `minmax(96px,128px)` + phần còn lại, gap 2/12; ≤640px nhãn 88–112px |
| Nhãn `dt` | `muted-foreground` | 12/18, cao tối thiểu `control-size-md` 32px, icon `control-icon-size-xs` |
| Giá trị `dd` | `foreground` | 14/20, cao tối thiểu 32px (bằng ô sửa → sửa không nhảy dòng) |
| Trống | `ui-props-empty` · `color-text-tertiary` | "Chưa có" — không để ô trắng |
| Tiêu đề nhóm | `ui-props-title` (`<h3>`) | 12/18 600, cách nhóm trên 20px |
| Xếp dọc | `data-layout="stack"` | 1 cột, nhãn trên giá trị, cách mục trên 10px |

**a11y:** `<dl>/<dt>/<dd>` thật; ô sửa tại chỗ có tên đọc "Sửa <nhãn>".
**Code:** tự dựng (`<dl>` + class); giá trị sửa dùng `InlineEdit`/`Select`/`Combobox` của DS.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
