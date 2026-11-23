Ô chọn **gốc của trình duyệt** (`<select>`) mặc diện mạo Select — cho form đơn giản ≤ 10 mục.

**Lên artifact 23/11/2026** — nguồn shadcn new-york-v4 (`native-select.tsx` @45bbf9b, MIT), thêm ở Đợt 4 chép shadcn (21/11/2026). Token lấy từ `.ui-select-trigger` của `bundle.css` (chuỗi `selectTrigger` dùng chung với Select).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Ô | `.ui-select-trigger` | cao 32 (`size="sm"` 28), lề 12 (sm 10), bo 8, viền inset 1px `--input`, chữ 14/20 500 |
| Trạng thái | như Select | hover viền alpha-25 · focus alpha-50 · lỗi red-500 (tối 600) · tắt nền/chữ/viền tắt |
| Chevron | `.ui-select-trigger .ui-icon` | `CaretDown` 16 muted, cách mép phải 12; ô chừa 36 bên phải |
| Danh sách | hệ điều hành | mục màu `Canvas`/`CanvasText` — không theo token, không tuỳ biến được |

**Khi nào dùng:** cần chạy không JS, hoặc trên điện thoại muốn bánh xe chọn gốc. Cần ✓ mục đang chọn, nhóm có kiểu, mục tắt kèm lý do, hay cùng diện mạo danh sách với app → **Select**. Quá 10 mục → **Combobox** (luật `docs/CHUAN-FILTER.md`).

**Lệch shadcn có chủ đích:** khung bọc rộng trọn cột (shadcn vừa nội dung) như mọi ô nhập DS; tắt dùng nền/chữ tắt (shadcn mờ 50%); chevron không mờ thêm.

**a11y:** `FieldLabel htmlFor` trỏ `id`; lỗi `aria-invalid` + `aria-describedby`; bắt buộc `required`. Mục "Chọn…" đầu danh sách: `value=""` + `disabled`.

**Code:** `components/ui/native-select.tsx` (không `'use client'`). Khối `/ds#native-select`.
