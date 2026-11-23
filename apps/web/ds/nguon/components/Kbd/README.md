Hiển thị phím tắt (`Ctrl` `K`, `↑` `↓`, `Esc`). **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phím | `ui-kbd` | cao 20px, rộng tối thiểu 20px, padding 0 4px, bo `radius-xs`, nền `background`, viền inset `alpha-12`, chữ 12px 500 `muted-foreground` |

**Hành vi:** Mac hiện `⌘`, Windows hiện `Ctrl`. Ẩn trên điện thoại (không có bàn phím cứng).
**Code:** shadcn `Kbd` / `KbdGroup`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp` (`apps/web/app/prototype/toanapp/_ta/ToanAppDemo.tsx`, `khung/_proto/TimToanCuc.tsx`); CSS ở khối `BỔ SUNG DS TOÀN APP` cuối `khung/_proto/ui.css`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- `KbdGroup` nay là thẻ `<kbd>` như shadcn (trước là `<span>`); chữ "+" giữa phím giữ font chữ DS, không ra font mono.
- `Kbd` không bắt chuột, không chọn chữ được (`pointer-events-none select-none`); icon trong phím 12px.
- Export giữ tên `Kbd`, `KbdGroup`; `data-slot` `kbd`, `kbd-group`. Số đo phím giữ nguyên.
