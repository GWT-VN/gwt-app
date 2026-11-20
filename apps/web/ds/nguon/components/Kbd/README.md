Hiển thị phím tắt (`Ctrl` `K`, `↑` `↓`, `Esc`). **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phím | `ui-kbd` | cao 20px, rộng tối thiểu 20px, padding 0 4px, bo `radius-xs`, nền `background`, viền inset `alpha-12`, chữ 12px 500 `muted-foreground` |

**Hành vi:** Mac hiện `⌘`, Windows hiện `Ctrl`. Ẩn trên điện thoại (không có bàn phím cứng).
**Code:** shadcn `Kbd` / `KbdGroup`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp` (`apps/web/app/prototype/toanapp/_ta/ToanAppDemo.tsx`, `khung/_proto/TimToanCuc.tsx`); CSS ở khối `BỔ SUNG DS TOÀN APP` cuối `khung/_proto/ui.css`.
