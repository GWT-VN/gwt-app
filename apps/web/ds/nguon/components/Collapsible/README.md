Một vùng mở/thu đi kèm nút bấm (xem thêm thông số, ghi chú kỹ thuật).

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`collapsible.tsx` @45bbf9b, MIT) trên Radix Collapsible, thêm ở Đợt 5 chép shadcn (21/11/2026). Không có class/token: hình dáng do phần tử bên trong quyết định.

| Phần | Nguồn | Ghi chú |
| --- | --- | --- |
| `Collapsible` | Radix Root | `open` / `defaultOpen` / `onOpenChange`; `data-state` open / closed |
| `CollapsibleTrigger` | Radix | thường `asChild` + `Button` của DS; mang `aria-expanded` + `aria-controls` |
| `CollapsibleContent` | Radix | ẩn hẳn (`hidden`) khi thu |

- Nút chỉ có icon → `aria-label` ("Xem thêm thông số").
- Nhiều vùng cùng kiểu xếp dọc → `Accordion`.

**Code:** `components/ui/collapsible.tsx`. Khối `/ds#collapsible`.
