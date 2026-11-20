Vùng trống có lý do và lối ra. **Bổ sung 18/11/2026** cho `.ui-empty` có sẵn: thêm biểu tượng, nhóm hành động, cỡ nhỏ.

| Lý do | Biểu tượng | Lời + hành động |
| --- | --- | --- |
| Chưa có dữ liệu | `alpha-05` | nói có gì sẽ hiện ở đây + nút tạo (nếu có quyền) |
| Không khớp lọc | `alpha-05` | nêu điều kiện đang lọc + "Xoá lọc" |
| Lỗi tải | `data-color="danger"` | nói không tải được + "Thử lại" — không đổ lỗi người dùng |
| Không có quyền | `alpha-05` | nói cần quyền gì + hỏi ai |

| Phần | Token | Giá trị |
| --- | --- | --- |
| Biểu tượng | `ui-empty-icon` | tròn 40px, icon 20px, cách chữ 8px |
| Hành động | `ui-empty-actions` | gap 8px, cách mô tả 12px, căn giữa |
| Cỡ nhỏ | `data-size="sm"` | padding 24/16 (trong thẻ, hộp thông báo) |

**Code:** shadcn `Empty` (`EmptyHeader/EmptyMedia/EmptyTitle/EmptyDescription/EmptyContent`).
Prototype: nhánh `prototype/v2-khung`, route `/prototype/phanhoi` (`apps/web/app/prototype/phanhoi/_ph/PhanHoiDemo.tsx`); CSS ở khối `BỔ SUNG DS PHẢN HỒI` cuối `khung/_proto/ui.css`.
