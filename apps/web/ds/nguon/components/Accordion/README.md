Nhiều mục mở/thu xếp dọc: câu hỏi thường gặp, thông số máy, nhóm cài đặt dài.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`accordion.tsx` @45bbf9b, MIT) trên Radix Accordion, thêm ở Đợt 5 chép shadcn (21/11/2026).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Phần | shadcn | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| Vạch ngăn mục | `--border` | 1px dưới mỗi mục, mục cuối không có |
| Nút | DS | chữ 14/20 medium màu chữ, đệm dọc 16, rê gạch chân, bo radius-md |
| Caret | Phosphor `CaretDown` | 16, `muted-foreground`, xoay 180° khi mở (200ms) |
| Nội dung | shadcn | 14/20, đệm dưới 16 |
| Focus | luật focus DS | outline 2 `ring` offset 2 (shadcn dùng quầng — DS không) |
| Tắt | shadcn | mờ 50%, không mở được |

- `type="single"` (+ `collapsible` để thu được mục đang mở) hoặc `type="multiple"`.
- **Bàn phím (Radix):** Tab vào nút, ↑/↓ chuyển giữa các nút, Home/End về đầu/cuối, Enter/Space mở/thu.
- **Không chép** animation trượt `accordion-down/up`: cần keyframes của gói `shadcn/tailwind.css` mà DS không nạp — mục mở/thu tức thì. Thêm khi CEO muốn chuyển động (keyframes đặt trong `ds/theme.css`).
- Chỉ một vùng mở/thu → `Collapsible`.

**Code:** `components/ui/accordion.tsx`. Khối `/ds#accordion`.
