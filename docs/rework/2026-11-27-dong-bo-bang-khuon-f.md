# Đồng bộ mọi bảng về khuôn Ticket F — kế hoạch (27/11)

CEO 27/11: "format bảng của CSKH lại là 1 bảng khác so với ticket đã chốt" · "Đồng bộ lại hết format bảng biểu".
Nguồn khuôn: `app/ticket/_danh-sach/ds-f.tsx` (đã chốt 26/11). Không đẻ khuôn thứ hai.

## 1. Khuôn F (màn danh sách bản ghi)

Thứ tự từ trên xuống, đúng component DS:

| Phần | Component | Ghi chú |
|---|---|---|
| Khung | `TrangDuLieu` › `CauHinhBangDs giaoDien={{...O_TIM_PILL, ...CHON_BANG_GHIM}} thanhHangLoat="surface"` | như F |
| Đầu | `DataViewToolbar tieuDe dem timKiem={OTimKiem} nutChinh` | ô tìm ở góc phải tiêu đề |
| Hàng tab | `useTabView` (mới, mục 2): tab cố định + tab tự tạo, tự lưu | thay "Chế độ xem" (Combobox) + "Lưu chế độ xem" |
| Công cụ | `loc={<NutLoc>}` · `caiDat={<CaiDatHienThi>}` · (dạng xem/xem nhanh chỉ khi màn có) | xuất Excel → nút icon trong nhóm công cụ |
| Đang lọc | `ThanhDangLoc` | chip điều kiện + Xoá lọc |
| Bảng | `KhungChon` › `Table` ghim + `useCotBang({url:true})` + `TieuDeCot` + `ColCotBang` + `ThemCot` | cột tự vừa +8, cột đầu khoá/ghim; khung < 640 → `ListView` |
| Hàng loạt | `ThanhDaChon` | chỉ màn có thao tác hàng loạt |
| Rỗng | `EmptyState` (`kieu="loc"` khi có lọc, mặc định khi chưa có dữ liệu) | |

Lọc chạy phía server qua tham số URL (như F). Bộ lọc riêng sẵn có của từng màn → chuyển thành trường `NutLoc`
(`bang/locTruong`), không thêm bộ lọc mới ngoài cái đang có.

## 2. Tab dùng chung (`bang/useTabView.tsx` + action chung)

Tách từ `tab-ticket.tsx`: `useTabView({ bang, coDinh: [{ v, ten, loc }], khoaLoc, demTab?, quyenTabChung })` → `{ tabs, value }`.
Action chung trên `bang_view` (khoá `bang` = `<man>_tab`, danh sách khoá hợp lệ cố định trong code): list / lưu / tự lưu /
đổi tên / xoá — cùng gác quyền như ticket (`he_thong.view_xem`, tab chung cần `he_thong.view_chung`). Ticket chuyển sang
dùng chung (khoá `ticket_tab` giữ nguyên, không mất tab đã tạo). Chế độ xem cũ (`listBangView('<bang>')`, lưu danh sách
cột): đo production 27/11 = 0 dòng `bang_view` → thay hẳn bằng tab, không cần chuyển đổi.

**Đã có (27/11):** `components/HangTab.tsx` (`useHangTab`), `bang/tabView.ts` (locCua/queryTab/KHOA_COT), `bang/locDb.ts`
(chon/ngay/chu → PostgREST), `lib/tab-view.ts` (khoá bảng), `components/ui/use-rong-khung.ts`, action `listTabView` /
`luuTabView` / `capNhatTabView` / `doiTenTabView` / `xoaTabView`. Ticket F và Khách hàng chạy trên đó.
Thêm một màn: một dòng ở `lib/tab-view.ts` + file `truong-<man>.ts` (trường lọc, khoá lọc, tab cố định) như
`app/khach-hang/truong-khach.ts`, rồi theo `components/BangKhach.tsx`.

## 3. Kiểm kê

**Nhóm A — màn danh sách → khuôn F đầy đủ** (theo thứ tự làm)

| Đợt | Màn | File chính |
|---|---|---|
| 1 (mẫu, CEO duyệt) | Khách hàng `/khach-hang` | `components/BangKhach.tsx`, `app/khach-hang/page.tsx` |
| 2 | Máy `/`, Lỗi `/loi`, Bảo trì | `components/BangTuyChinh.tsx` (dùng chung) + `BangMay`, `BangLoi`, `BangBaoTri` |
| 3 | Kho serial `/serial`, BH chờ kích hoạt, Nhóm lỗi, Danh mục lỗi, Khách cần dọn `/khach`, Soát kênh, Nước | `app/serial`, `BHChoKichHoatList`, `app/nhom-loi`, `DanhMucLoiBang`, `app/khach`, `app/khach/kenh`, `app/nuoc` |
| 4 | Sales: đơn `/sales`, khách, bảng giá | `app/sales/page.tsx`, `app/sales/khach`, `app/sales/gia` |
| 5 | Kho (các bảng chứng từ, kiểm kê) | `app/kho/_ui.tsx` `Bang`, `app/kho/kiem-ke/_bang.tsx` |
| 6 | Quản trị: Nhân viên, Nhật ký thao tác, Duyệt, Lệch quyền | `BangNhanVien`, `app/audit`, `DuyetList`, `BangLechQuyen` |
| 7 | Kỹ thuật: bảng KT, Điều phối | `KyThuatBang`, `BangDieuPhoiKT` |
| 8 | Marketing: Phân tích, Kho hook, Ý tưởng, Ads xếp hạng / xu hướng | `components/marketing/*View`, `ads/RankingTable`, `ads/TrendTable` |

Work (`BangTeam`, `ViecCuaToi`) đã theo khuôn — chỉ soát lệch khi xong đợt 8.

**Nhóm B — bảng phụ trong trang chi tiết / báo cáo / bài viết → chỉ kiểu ô DS** (`Table`, `TableHead`, `TableCell`, prop
`phai`, không đè px/màu; KHÔNG thêm thanh công cụ): dòng hàng đơn `sales/don/[code]`, `sales/khach/[code]`,
`nhom-loi/[code]`, `doanh-so`, `BangTanSuat`, `BaoCaoNhom`, `NhapDanhMuc`, `MaTranQuyen`, `SoSanhHoSo`, `GopKhachManHinh`,
`CtkmForm`, `BangChinhSach`, `GanBac`, ads `CampDetail`/`PeriodDetail`, bảng trong bài Wiki (`Markdown`, `TraCuuFact`).

## 4. Mỗi màn xong khi

- [ ] Đúng thứ tự phần ở mục 1; không class tự vẽ thay component DS (Cổng UI 3 trục).
- [ ] Bộ lọc / tìm / sắp / cột / tab sống trên URL; link cũ không sập (id cột lạ bị bỏ qua).
- [ ] Mọi chức năng màn cũ còn đủ (thao tác hàng loạt, xuất Excel, tạo mới, link sang chi tiết) — bảng "cũ có / mới có".
- [ ] Ảnh 1440 / 900 / 390, sáng + tối, đặt cạnh ảnh Ticket F; đo mép ô tick = mép chữ tab đầu, tâm dọc từng ô lệch ≤ 0,5px.
- [ ] tsc + eslint + test sạch; test cũ không bị nới.

## 5. Ngoài phạm vi

Bộ lọc mới, dạng Kanban cho màn khác ticket, thẻ Xem nhanh cho màn khác ticket/việc — chỉ làm khi CEO yêu cầu.
