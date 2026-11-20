shadcn `Button` mặc áo OpenAI: pill, cao 32px, chữ 14px medium; dùng cho mọi hành động bấm được.

**Dùng khi** cần thực thi một hành động. Điều hướng sang trang khác → `variant="link"` hoặc thẻ `<a>`.
**Người dùng cung cấp:** nhãn động từ tiếng Việt ("Lưu thay đổi", "Xuất Excel"), `variant`, `size`, `onClick`; nút chỉ có icon BẮT BUỘC có `aria-label`.

| shadcn | OpenAI nguồn | Giá trị |
| --- | --- | --- |
| `variant="default"` | color primary · variant solid | nền `primary` → hover `color-background-primary-solid-hover` → active `…-active` |
| `secondary` | secondary · soft | nền `secondary` (gray-100/gray-300), hover `…-soft-hover` |
| `outline` | primary · outline | viền 1px inset `input`, hover nền `color-background-primary-outline-hover` + viền `…-outline-hover` |
| `ghost` | primary · ghost | hover nền `accent`, active `color-background-primary-ghost-active` |
| `destructive` | danger · solid | nền `destructive` (red-500), chữ `destructive-foreground`, ring `color-ring-danger` |
| `link` | TextLink primary | chữ blue-500 / dark blue-300 |
| `size="sm"` | `sm` | cao `control-size-sm` 28px, gutter `control-gutter-sm` 10px × 1.33 |
| `size="default"` | `md` (mặc định OpenAI) | cao `control-size-md` 32px, gutter 12px × 1.33 ≈ 16px, icon 18px, gap 6px |
| `size="lg"` | `lg` | cao `control-size-lg` 36px |
| `size="icon"` | `md` + `uniform` | 32 × 32 |

- Bo góc: OpenAI để `pill = true` mặc định → `rounded-full`. Nút trong ô bảng, toolbar dày: `data-shape="rounded"` dùng `--control-radius-*` (sm 6px, md 8px).
- Focus-visible: outline 2px `ring`, offset 2px (outline/ghost: offset −1px). Không dùng ring 3px mờ mặc định của shadcn.
- Disabled: nền `color-background-disabled`, chữ `color-text-disabled`, viền `color-border-disabled`.
- Loading: giữ nguyên bề rộng, ẩn nội dung (opacity 0), spinner 16px giữa nút, `aria-busy="true"` + `aria-disabled="true"`, không cho bấm lại. **Không dùng `disabled`** (chốt 20/11/2026): nút `disabled` rơi focus về `body` giữa lúc lưu và trình đọc màn hình mất chỗ; `aria-disabled` giữ focus trên nút, chặn bấm trong `onClick`.

Tailwind (sửa `buttonVariants` của shadcn):
```ts
base: "relative inline-flex items-center justify-center gap-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:bg-(--color-background-disabled) disabled:text-(--color-text-disabled)"
default: "bg-primary text-primary-foreground hover:bg-(--color-background-primary-solid-hover) active:bg-(--color-background-primary-solid-active)"
size.default: "h-(--control-size-md) px-4 [&_svg]:size-(--control-icon-size-md)"
size.sm: "h-(--control-size-sm) px-[13px] gap-1"
size.lg: "h-(--control-size-lg) px-4"
size.icon: "size-(--control-size-md) p-0"
```

Không nên: hai nút `default` cạnh nhau; dùng `destructive` cho hành động hoàn tác được; nút chỉ icon không nhãn.

## Bổ sung 18/11/2026 — trạng thái bật
Nút `ghost` có `aria-pressed="true"` (toggle), `aria-checked="true"` (radio trong ToggleGroup) hoặc `aria-expanded="true"` (đang mở menu) → nền `accent`. Dùng cho thanh công cụ màn dữ liệu (⚙, dạng xem, thẻ xem nhanh). Nút chỉ icon kèm `Tooltip`.
