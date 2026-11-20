Bố cục trang một bản ghi: cột nội dung chính (mô tả, `Timeline`, `Composer`) + cột thuộc tính (`PropertyList`). **Mới 18/11/2026** — tham chiếu Linear issue.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Lưới | `ui-detail` | `1fr` + 280px, gap 40px |
| Chính | `ui-detail-main` | cột, gap 20px |
| Cột thuộc tính | `ui-detail-aside` | sticky top 16px |
| Tiêu đề khối | `ui-detail-heading` | 16/24 600 (heading-xs) |
| ≤960px | | 1 cột, gap 24px, thuộc tính lên **trên** nội dung, hết sticky |

**Dùng cho** mọi trang chi tiết: ticket, khách, máy, đơn, phiếu chi. Trên cùng luôn là `PageHeader`.
**Code:** tự dựng (CSS grid).
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
