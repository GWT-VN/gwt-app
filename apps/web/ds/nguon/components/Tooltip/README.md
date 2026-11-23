Chú thích ngắn cho nút chỉ có icon hoặc hành động cần giải thích — **bổ sung DS 18/11/2026**.

**Dùng:** thêm class `ui-tip` + `data-tip="…"` vào nút (nút vẫn phải có `aria-label`). Hiện dưới nút, căn giữa; hiện khi **hover và khi focus bằng phím**; ẩn khi nút đang mở menu (`aria-expanded="true"`).

Chữ tooltip không trùng aria-label — aria-label là tên ngắn của nút, tooltip là mô tả thêm.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Nền / chữ | `color-background-primary-solid` / `color-text-primary-solid` | tự đảo theo theme |
| Chữ | | 12px/16px 500, một dòng |
| Khung | `radius-md` | padding 4px 8px, cách nút 6px |

Thanh icon bên trái (Sidebar) dùng chú thích bên PHẢI icon — cùng màu, cùng cỡ.

**Code:** shadcn `Tooltip` (Radix) — `side="bottom"` (thanh công cụ) / `side="right"` (rail), `delayDuration` ~300ms; nội dung là chữ ngắn, không đặt nút bấm bên trong.

## Đổi khi chép khung shadcn (21–23/11/2026)

- **Đổi tên (R20):** hàm tiện cũ `<Tooltip content="…">` nay là **`TooltipNhanh`** (`content`, `side`, `sideOffset`, một phần tử con) — màn thường dùng hàm này. `Tooltip` nay là Root của Radix như shadcn.
- Export đủ 4 phần shadcn: `TooltipProvider` (file `tooltip-provider.tsx`), `Tooltip`, `TooltipTrigger`, `TooltipContent` + `TooltipNhanh`; `data-slot` `tooltip-provider`, `tooltip`, `tooltip-trigger`, `tooltip-content`.
- `DsRoot` đã bọc sẵn `TooltipProvider` (trễ 300ms, shadcn 0) → ghép tay không cần tự bọc Provider; `TooltipNhanh` vẫn tự mang Provider.
- `TooltipContent` mặc định `side="bottom"`, `sideOffset={6}` (shadcn: top, 0); không mũi tên, không chuyển động (artifact không định nghĩa); ngoài `DsRoot` không render.
- Chỉ `TooltipNhanh` có hành vi DS bổ sung: không mở khi nút đang `aria-expanded="true"`, đang focus phím thì chỉ Esc/rời focus mới đóng. Ghép tay bằng 4 phần thì không có các hành vi này.
- Trigger `asChild` có thể đè `data-slot`/`data-state` của nút con → tô trạng thái nút bằng `aria-*` (`aria-pressed`, `aria-expanded`), không dựa vào `data-state`.
- Thay dòng **Code:** ở trên: nút có mô tả dùng `<TooltipNhanh content="…" side="bottom|right">`, không đặt `delayDuration` riêng.
