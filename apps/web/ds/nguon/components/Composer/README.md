Ô viết bình luận / ghi chú ở cuối `Timeline`: tự cao theo nội dung, đính tệp, Ctrl+Enter gửi. **Mới 18/11/2026** — tham chiếu ô chat ChatGPT.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `ui-composer` | bo `radius-xl`, viền inset `input`; hover `alpha-25`; focus-within `alpha-50`; lỗi `red-500` |
| Ô chữ | `ui-composer-input` | 14/20, cao 44–240px (`field-sizing: content`), placeholder `color-text-tertiary` |
| Tệp đính | `ui-composer-files` | `ui-chip` có × |
| Thanh dưới | `ui-composer-bar` | 📎 `Button ghost icon-sm` · gợi ý "Ctrl Enter để gửi" (`ui-caption`, ẩn ≤640px) · nút Gửi tròn |
| Tắt | `aria-disabled="true"` | mờ 50% |

**Hành vi:** Gửi tắt khi trống; Enter xuống dòng, Ctrl/⌘+Enter gửi; đang gửi khoá ô và nút; lỗi gửi giữ nguyên nội dung, viền đỏ, nút thành "Gửi lại".
**a11y:** ô có `aria-label`; nút Gửi có tên đọc.
**Code:** shadcn `Textarea` + `Button` trong khung tự dựng.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
