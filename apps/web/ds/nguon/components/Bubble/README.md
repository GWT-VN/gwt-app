Bong bóng nội dung của một tin chat, kèm dải cảm xúc; bấm được khi là nút/link.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`bubble.tsx` @45bbf9b, MIT), thêm ở Đợt 8 chép shadcn (21/11/2026).

| Biến thể | Nền | Chữ |
| --- | --- | --- |
| `default` | `primary` (sáng #181818 · tối #f3f3f3) | `primary-foreground` |
| `secondary` | `secondary` (sáng #ededed · tối #303030) | `secondary-foreground` |
| `muted` | `muted` (surface-tertiary) | kế thừa |
| `tinted` | `primary` đổi độ sáng 0.93 (tối 0.3) — primary DS là xám nên ra xám nhạt | `foreground` |
| `outline` | `background` + viền 1 `border` | kế thừa |
| `ghost` | trong suốt, không đệm, không bo, rộng 100% | kế thừa |
| `destructive` | `--color-background-danger-soft-alpha` | `--color-text-danger-soft` (như Badge danger) |

- Khung: bo 12 (radius-xl), đệm 12/8, chữ 14/20 (shadcn leading-relaxed 22.75 → text-sm DS), rộng tối đa 80% khung chứa.
- `align="end"` hoặc nằm trong `Message` align end → dạt phải.
- `BubbleContent asChild` + `button`/`a`: rê đổi nền (default → primary-solid-hover, secondary → secondary-soft-hover, destructive → danger-soft-alpha-hover), focus phím outline 2 `ring` lệch 2 như Button.
- `BubbleReactions`: nền `muted`, bo `--radius-full`, vòng 3 màu `card`; `side` top/bottom, `align` start/end. Đặt `aria-label` ("2 lượt thích").
- Biến thể `dark:` của shadcn (theo hệ điều hành) → biến thể theo theme DS ở DsRoot.

**Code:** `components/ui/bubble.tsx`. Khối `/ds#bubble`.
