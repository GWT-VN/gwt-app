Dòng hoạt động của bản ghi: bình luận (có khung) xen sự kiện hệ thống (một dòng), nhóm theo ngày. **Mới 18/11/2026** — tham chiếu GitHub/Linear.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Nhãn ngày | `ui-timeline-day` | 12/18 600 `muted-foreground`, thụt 36px thẳng chữ nội dung |
| Mốc | `ui-timeline-mark` | tròn 24px, viền `alpha-10`, icon 14px; `Avatar` cho người; `data-color="danger|success"` dùng nền soft-alpha |
| Đường nối | `alpha-08` | 1px giữa các mốc, ngắt ở mục cuối ngày |
| Dòng đầu | `ui-timeline-head` | 14/20 `muted-foreground`, tên người `b` 500 `foreground`, giờ `time` 12/18 `color-text-tertiary` `tabular-nums` |
| Bình luận | `ui-timeline-body` | padding 10/12, bo `radius-xl`, viền `alpha-08`, giữ xuống dòng |
| Tệp | `ui-timeline-files` | `ui-chip` gap 6px |
| Gập phần cũ | `ui-timeline-more` | `Button ghost sm` "Hiện N hoạt động cũ hơn", chữ thẳng mép nhãn ngày |

**Hành vi:** mới nhất ở dưới cùng, sát `Composer`. Rê lên giờ → `title` ngày giờ đủ. Theo spec: sự kiện do bot ghi hiện nguồn "Discord ↗" kèm link tin gốc (prototype chưa có mẫu).
**a11y:** `<ol>`; giờ là `<time datetime>`.
**Code:** tự dựng (shadcn không có).
Prototype: nhánh `prototype/v2-khung`, route `/prototype/chitiet` (`apps/web/app/prototype/chitiet/_ct/ChiTietDemo.tsx`); CSS ở khối `BỔ SUNG DS TRANG CHI TIẾT` cuối `khung/_proto/ui.css`.
