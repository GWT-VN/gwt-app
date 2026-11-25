Danh sách thuộc tính nhãn ↔ giá trị của một bản ghi (`<dl>`), giá trị bấm vào sửa tại chỗ bằng `InlineEdit`. **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Lưới | `ui-props` | 2 cột `minmax(96px,128px)` + phần còn lại, gap 2/12; ≤640px nhãn 88–112px; **căn đầu** (`align-items: start`, 25/11/2026): giá trị nhiều dòng (danh sách người) thì nhãn thẳng dòng đầu |
| Danh sách người | `Avatar` + tên, mỗi người một dòng cao 32 | × bỏ người ẩn, rê vào người đó / focus phím mới hiện (cảm ứng luôn hiện); "+ Thêm người" dòng riêng bên dưới — không trộn cùng hàng với tên (25/11/2026) |
| Nhãn `dt` | `muted-foreground` | 12/18, cao tối thiểu `control-size-md` 32px, icon `control-icon-size-xs` |
| Giá trị `dd` | `foreground` | 14/20, cao tối thiểu 32px (bằng ô sửa → sửa không nhảy dòng) |
| Trống | `ui-props-empty` · `color-text-tertiary` | "Chưa có" — không để ô trắng |
| Tiêu đề nhóm | `ui-props-title` (`<h3>`) | 12/18 600, cách nhóm trên 20px |
| Xếp dọc | `data-layout="stack"` | 1 cột, nhãn trên giá trị, cách mục trên 10px |
| Nút thêm (giá trị trống có thể thêm) | DS `Button` `ghost` `xs` + icon `Plus` + **chữ** · `color-text-tertiary` | "+ Thêm người", "+ Gắn khách"; chữ mờ hơn nhãn, rê / mở menu mới sáng + nền; lề trái âm bằng đệm nút → icon thẳng cột giá trị (nền rê tràn trái). Không dùng nút chỉ có icon "+" (khó bấm, không biết thêm gì). Thêm 23/11, màu tertiary 25/11/2026 |

**a11y:** `<dl>/<dt>/<dd>` thật; ô sửa tại chỗ có tên đọc "Sửa <nhãn>".
**Code:** tự dựng (`<dl>` + class); giá trị sửa dùng `InlineEdit`/`Select`/`Combobox` của DS.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
