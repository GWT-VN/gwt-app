shadcn `Input`, `Label`, `Textarea` theo OpenAI Input outline: cao 32px, bo 8px, viền 1px inset, focus làm đậm viền thay vì quầng sáng.

**Người dùng cung cấp:** `Label` gắn `htmlFor`, `placeholder` là ví dụ (không thay nhãn), câu gợi ý/lỗi gắn qua `aria-describedby`, `aria-invalid="true"` khi lỗi.

| Phần | Nguồn OpenAI | Giá trị |
| --- | --- | --- |
| Cao / padding | `--control-size-md`, `--control-gutter-md` | 32px / 12px |
| Bo | `--control-radius-md` | 8px |
| Chữ | `--control-font-size-md` | 14px/20px, `color-text` |
| Placeholder | `--input-placeholder-text-color` | `color-text-tertiary` |
| Viền | `--input-outline-border-color` | `input` (alpha-16 / alpha-25) |
| Hover | `--input-outline-border-color-hover` | alpha-25 / alpha-30 |
| Focus | `--input-outline-border-color-focus` | alpha-50 |
| Lỗi | `--input-border-color-invalid` | red-500 / red-600 |
| Disabled | semantic disabled | nền `color-background-disabled`, chữ `color-text-disabled` |
| Icon trong ô | `--input-gap-md` | icon 16px, cách chữ 8px |

- Label: 14px medium, cách ô 6px. Gợi ý: 12px `muted-foreground`. Lỗi: 12px `color-text-danger`, câu nói rõ cách sửa ("Số điện thoại phải có 10 chữ số").
- Textarea: cùng viền/bo, padding 6px 12px, cao tối thiểu 80px.
- Ô tìm kiếm: icon kính lúp trái; khớp không dấu (theo `bang/timkiem.ts`).

Tailwind: `h-(--control-size-md) rounded-(--control-radius-md) px-(--control-gutter-md) text-sm shadow-[inset_0_0_0_1px_var(--input)] hover:shadow-[inset_0_0_0_1px_var(--alpha-25)] focus-visible:shadow-[inset_0_0_0_1px_var(--alpha-50)] aria-invalid:shadow-[inset_0_0_0_1px_var(--red-500)] border-0 bg-transparent outline-none` — bỏ `focus-visible:ring-[3px]` mặc định của shadcn.

⚠️ Viền `input` trên nền trắng chỉ 1.42:1 (dưới 3:1 của WCAG 1.4.11). Giữ đúng nguồn; xem "Quyết định còn mở" trong brand book.
