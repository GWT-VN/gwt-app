Công tắc bật/tắt — **mới 18/11/2026**, cùng màu "đã chọn" với Checkbox/Radio.

**Dùng khi** thay đổi có hiệu lực ngay hoặc là cài đặt bật/tắt một tính năng. Lựa chọn chỉ có hiệu lực khi bấm Lưu trong form dài → vẫn dùng được, nhưng nếu là đồng ý/điều khoản thì dùng `Checkbox`.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Rãnh tắt | `alpha-25` (hover `alpha-30`) | 32×18, `radius-full` |
| Rãnh bật | `color-background-primary-solid` (hover `…-hover`) | |
| Núm | `background` (dark `foreground`); bật: `color-text-primary-solid` | 14px, cách mép 2px, `shadow-hairline`; trượt 14px trong 150ms |
| Hàng cài đặt | `ui-switch-row` | nhãn + `ui-help` trái, công tắc phải, gap 16px, căn đầu dòng |
| Tắt | | `opacity: 0.5`, nhãn `color-text-disabled` |
| Focus | `ring` | outline 2px offset 2px |

⚠️ Rãnh tắt `alpha-25` trên nền trắng ~1.6:1 (dưới 3:1 WCAG 1.4.11) — cùng vấn đề viền `Input`; giữ đồng bộ với DS, nằm trong "Quyết định còn mở".

**Bàn phím & a11y:** `<input type="checkbox" role="switch">` → Space bật/tắt, đọc "công tắc, bật/tắt". Toàn hàng là `<label>` nên bấm chữ cũng đổi. `prefers-reduced-motion` tắt hiệu ứng trượt.

**Code:** shadcn `Switch` (Radix) — `h-[18px] w-8`, thumb `size-3.5`, `data-[state=checked]:bg-primary`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
