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

## Đổi khi chép khung shadcn (21–23/11/2026)

- File mới `components/ui/empty.tsx` = khung shadcn: `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`. Dùng khi cần bố cục trống khác 4 lý do.
- `EmptyState` (file `empty-state.tsx`, tên giữ theo artifact — R22) nay ghép trên khung đó; prop giữ nguyên: `kieu` (`that`/`loc`/`loi`/`quyen`), `tieuDe`, `moTa`, `icon`, `size` (`default`/`sm`), `capTieuDe` (2–6), `children` = hành động.
- `EmptyMedia variant`: `default` (không nền, shadcn) · `icon` (tròn 40px nền `alpha-05`, icon 20px — như `ui-empty-icon`). `EmptyTitle asChild` để dùng thẻ heading thật là phần GWT.
- `data-slot` đổi: khung `empty-state` → `empty`; `empty-desc` → `empty-description`; `empty-actions` → `empty-content`; thêm `empty-header`. Biểu tượng giữ `empty-icon`.
- Link trong mô tả tự gạch chân. Khoảng cách và hình thức giữ nguyên như bảng trên.
