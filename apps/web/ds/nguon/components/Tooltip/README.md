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
