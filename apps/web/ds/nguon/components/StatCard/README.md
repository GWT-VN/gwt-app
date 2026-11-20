Thẻ số liệu chính của một khu trên màn Tổng quan. **Mới 18/11/2026.**

| Phần | Token | Giá trị |
| --- | --- | --- |
| Lưới | `ui-stat-grid` | `auto-fill minmax(200px, 1fr)`, gap 12px |
| Thẻ | `ui-stat` | padding 16px, bo `radius-xl`, nền `card`, viền inset `border`; có liên kết thì hover viền `alpha-25`, focus-visible `ring` |
| Nhãn | `ui-kpi-label` | 12/18 `muted-foreground` |
| Số | `ui-kpi-value` | 24/28 600 `tabular-nums`; đơn vị `ui-stat-unit` 14/20 400 `muted-foreground` |
| Thay đổi | `ui-stat-delta` | 12/18; số `b` 600: `data-nghia="tot"` → `color-text-success`, `"xau"` → `color-text-danger`, không có → `muted-foreground` |
| Chân | `ui-stat-foot` | "Xem 12 ticket →" 12/18, hover mũi tên dịch 2px |
| Đang tải | `role="status"` `aria-busy` | `Skeleton` cùng hình |
| Chưa có dữ liệu | | thẻ ghi rõ lý do ("tính năng Đợt 2"), không hiện 0 |

**Luật màu:** theo **nghĩa** — "Quá hạn giảm" là tốt (xanh) dù mũi tên xuống; "Khách hỏi lại tăng" là xấu (đỏ).
**a11y:** thay đổi có câu đọc đủ cho trình đọc màn hình ("Tăng 3 so với hôm qua, xấu"); mũi tên `aria-hidden`.
**Code:** shadcn `Card` + class theo bảng.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/toanapp` (`apps/web/app/prototype/toanapp/_ta/ToanAppDemo.tsx`, `khung/_proto/TimToanCuc.tsx`); CSS ở khối `BỔ SUNG DS TOÀN APP` cuối `khung/_proto/ui.css`.
