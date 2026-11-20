Khung điều hướng GWT App — **phương án F, đã chốt 18/11/2026**: thanh icon các khu bên trái + panel menu của khu đang chọn; trợ lý Bắp là nút dock nổi. Đo theo app ChatGPT desktop. Ảnh: nhóm asset **Mẫu màn — Ticket** (7–11).

## Khi dùng
Mọi màn của GWT App nằm trong khung này. Không dựng sidebar riêng theo module.

## Cấu tạo
1. **Rail** (52px): logo · icon từng khu (có chấm đỏ khi có việc gấp) · vạch ngăn · "Tất cả khu" · (đáy) Quản trị · avatar.
2. **Panel menu** (288px): đầu panel (chấm màu khu + tên khu · chuông · tìm) → nút tạo nhanh → item của khu (số đếm bên phải) → "Bộ lọc đã lưu" → "Gần đây" → "Xem thêm".
3. **Vùng nội dung**: nền trắng, cách đỉnh 8px, kẻ trên `alpha-08`; nội dung tự cuộn, không thanh cuộn hiện.
4. **Bắp**: nút tròn đen góc phải dưới, bấm mở thẻ chat nổi; không chiếm cột cố định.

## Thông số
| Phần | Token | Giá trị |
| --- | --- | --- |
| Rail | `muted` | 52px, padding 8/0/12, gap 8 |
| Icon khu | `radius-lg` | ô 36px, Phosphor 18px **regular**, `color-text-tertiary`; hover `alpha-04` |
| Khu đang chọn | | nền `alpha-05`, icon **fill** `foreground`, không viền/bóng |
| Chú thích | DS `Tooltip` | đen bên PHẢI icon, `text-xs` 12/18 500, bo `radius-md` |
| Chấm gấp | `color-background-danger-solid` | 7px, viền 2px `muted` |
| Panel | `background` + `alpha-02` | 288px, cách đỉnh 8px, bo trên-trái 12px, viền `alpha-06/08`, bóng `0 0 8px alpha-05` |
| Đầu panel | `heading-sm` | cao 52px; tên khu 18/26 600 `gray-600` |
| Item | | cao 30px, padding 0 10, 14px `gray-600`; hover `alpha-04`; đang ở `alpha-05` weight 400 |
| Nhãn nhóm | | cao 30px, 14px `color-text-tertiary` |
| Số đếm | | 12px 500 `tabular-nums` tertiary |

## Hành vi
- Bấm icon khu → panel đổi sang menu khu đó; màu khu chỉ hiện ở chấm trước tên khu.
- "Tất cả khu" mở menu bên phải rail: chấm màu + tên; khu chưa mở ghi "sắp có", không bấm được.
- Item hiện theo phân quyền hiện có — không ẩn/hiện khác hiện trạng.
- Mobile < 768px: rail + panel thành ngăn kéo trượt từ trái (`shadow-400`), thanh trên 52px có nút mở menu; Bắp mở toàn màn.

## Bàn phím & a11y
Rail là `nav` ("Khu"), icon là `button` có `aria-label` + `aria-current` khi đang chọn; "Tất cả khu" có `aria-expanded`; item đang ở `aria-current="page"`. Focus: outline 2px `ring`. Tooltip phải hiện cả khi focus bằng phím (không chỉ hover).

## Code
- Dựng bằng shadcn `Sidebar` (`collapsible="icon"` cho rail) + `Tooltip` (side="right") + `DropdownMenu` cho "Tất cả khu"; mobile dùng `Sheet` trái.
- Icon: `@phosphor-icons/react` — `weight="fill"` khi đang chọn.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/khung/_proto/VariantD.tsx` (`Khung`, `che="dock"`) + `shell.css` (class `pD-*`, `pF-dock`).
- File dùng chung `components/TopNav*.tsx` sẽ bị thay — báo trước theo luật repo.

## Chưa chốt
Nội dung thẻ chat Bắp; logo GWT thật (đang chữ "GWT").
