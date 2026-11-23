Thanh link ngang có mục mở bảng con (mega menu) — cho trang nội dung (wiki, hướng dẫn); điều hướng chính của app là Sidebar.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`navigation-menu.tsx` @45bbf9b, MIT) trên Radix NavigationMenu, thêm ở
Đợt 6 chép shadcn (21/11/2026).

| Phần | Nguồn | Token gán |
| --- | --- | --- |
| `NavigationMenu` | Radix Root | `viewport` (mặc định có) — bảng con dùng chung một khung |
| `NavigationMenuList` / `Item` | Radix | hàng ngang cách 4 |
| `NavigationMenuTrigger` | Radix | `navigationMenuTriggerStyle`: cao 36, đệm 16, bo md, 14 500; rê / đang mở nền `accent`; mũi tên xoay khi mở |
| `NavigationMenuContent` | Radix | đệm 8; `viewport={false}` thì tự mang khung menu DS ngay dưới trigger |
| `NavigationMenuViewport` | Radix | khung menu DS (`menuContent`: bo xl, nền popover, bóng + hairline), z 90, cách trigger 6 |
| `NavigationMenuLink` | Radix | như mục menu DS: bo 6, đệm 8, rê alpha-08 (tối alpha-10); `active` alpha-05 |
| `NavigationMenuIndicator` | Radix | mũi nhọn nền `--border` |

- Bàn phím (Radix): Tab / ← → giữa các mục, ↓ hoặc Enter mở bảng và vào link đầu, Esc đóng về trigger.
- Không có hiệu ứng trượt/phóng của shadcn (DS chưa cài tw-animate-css; menu DS không hiệu ứng).
- `NavigationMenu` cần `aria-label` khi trang có nhiều vùng nav.

**Code:** `components/ui/navigation-menu.tsx`. Khối `/ds#navigation-menu`.
