Hàng **"đang áp dụng gì"** ngay dưới hàng tab: mỗi điều kiện lọc là một chip có × bỏ riêng, chip sắp xếp **nói nghĩa bằng lời**, số dòng phân biệt "đang thấy" với "tổng". **Mới 18/11/2026** — thay dòng chữ "Lọc: …" cũ.

**Dùng khi** bảng/danh sách có ≥ 1 điều kiện khác mặc định (từ khoá, lọc cột, sắp xếp). Không có gì → ẩn cả hàng.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Hàng | `ui-filterbar` | flex wrap, gap 6/8, cao tối thiểu `control-size-sm` 28px |
| Chip | `ui-chip` · `alpha-05` | cao 28px pill, padding 0 10 (có × thì phải 4), chữ 12/18; **nhãn thường + giá trị `strong` 600** ("Loại lỗi: **Rò rỉ nước**") |
| Nút × | `ui-chip-x` | ô tròn 20px, icon X 12px `muted-foreground`; hover `alpha-10` + `foreground`; `aria-label="Bỏ lọc <nhãn>"` |
| Chip sắp xếp | `ui-chip` + icon ↑/↓ | "Sắp xếp: **Hạn** · muộn nhất trước" — nghĩa lấy từ `nghiaSapXep` của dự án, không để người dùng đoán từ mũi tên; × = về thứ tự mặc định; đang mặc định thì **ẩn chip** |
| Số dòng | `ui-filterbar-count` | 12/18 `muted-foreground` `tabular-nums`, `aria-live`: "5 ticket" / "Hiện 15 trên 19 ticket" (khi nhiều trang) |
| Bên phải | `ui-filterbar-end` | "Lưu bộ lọc" (`ghost sm` + icon `BookmarkSimple`, mở `SavedView`) · "Xoá lọc" (`ghost sm`) — chỉ khi có điều kiện |

**Hành vi:** bỏ 1 chip → giữ các điều kiện khác, về trang 1, bỏ chọn dòng. "Xoá lọc" bỏ từ khoá + mọi lọc cột (giữ tab, giữ sắp xếp).

**Khoá giaoDien (`bang/giaoDien.ts`):** `dangLoc_khung` → `ui-filterbar` · `dangLoc_chip` → `ui-chip` · `dangLoc_nutGoChip` → `ui-chip-x` · `dangLoc_soDong` → `ui-filterbar-count` · `dangLoc_nutXoaLoc` → `ui-btn` ghost sm · `sapXep_chip` → `ui-chip` · `sapXep_nutGo` → `ui-chip-x`.

**Code thật:** logic đã có trong gói `apps/web/bang/` — chỉ truyền bộ class DS vào `giaoDien` của `<CauHinhBang>` (xem bảng "Khoá giaoDien"), **không viết lại logic**. Component: `ThanhDangLoc` + `ChipSapXep` (đã tự bọc `Suspense`).
Prototype: nhánh `prototype/v2-khung`, `/prototype/bang?variant=B` — `apps/web/app/prototype/bang/_bang/chung.tsx` (`ThanhDangLoc`, `ChanTrang`, `ThanhHangLoat`, `LuuLoc`); CSS ở khối `BỔ SUNG DS XEM DỮ LIỆU` cuối `khung/_proto/ui.css`.
