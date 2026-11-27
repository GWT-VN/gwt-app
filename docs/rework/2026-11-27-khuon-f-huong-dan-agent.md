# Hướng dẫn trải khuôn bảng Ticket F cho một màn (agent đọc trước khi làm)

Kế hoạch + kiểm kê: `docs/rework/2026-11-27-dong-bo-bang-khuon-f.md`. Worktree `gwt-worktrees/rework-v2.0.0`, app `apps/web`.

## Mẫu phải chép theo (đọc kỹ cả 3 trước khi sửa)

- `apps/web/app/khach-hang/page.tsx` — server: đọc searchParams, gọi list + `listTabView('<bang>')` + đếm tab + tuỳ chọn lọc.
- `apps/web/app/khach-hang/truong-khach.ts` — trường lọc (`TRUONG_*`: id, ten, kieu, cot), khoá lọc (`KHOA_LOC_*`), tab cố định (`TAB_*`).
- `apps/web/components/BangKhach.tsx` (+ `BangKhach.dom.test.tsx`) — client: `DataViewToolbar` (tieuDe, dem, timKiem=`OTimKiem`,
  nutChinh, tabs=`useHangTab(...).tabs`, loc=`NutLoc` (+ nút xuất nếu màn có), caiDat=`CaiDatHienThi`), `ThanhDangLoc` với
  `ChipLoc`, khối đầu+bảng chung MỘT `div` (bảng sát thanh công cụ), `Table` ghim + `useCotBang({url:true})` + `TieuDeCot` +
  `ColCotBang` + `ThemCot` + `KeoCot`, `ListView` khi khung < 640 (`useRongKhung`), `EmptyState` (kieu `loc` khi đang lọc,
  `that` khi chưa có dữ liệu), `PhanTrang`, `ThanhDaChon` nếu màn có thao tác hàng loạt. Trang bọc
  `ManV2 > TrangDuLieu > CauHinhBangDs giaoDien={{...O_TIM_PILL, ...CHON_BANG_GHIM}} thanhHangLoat="surface" > KhungChon`.
- Mảnh chung (KHÔNG sửa, chỉ dùng): `components/HangTab.tsx`, `bang/tabView.ts`, `bang/locDb.ts` (`chon`/`ngay`/`chu` →
  nhóm `.or()` PostgREST), `bang/locTruong.ts` (`docTatCa`, `ghiDieuKien`, `nhanChip`), `components/ui/use-rong-khung.ts`.

## Quy trình cho MỖI màn

1. Đọc màn cũ, lập bảng "cũ có gì": cột, bộ lọc, tìm, sắp, phân trang, xuất, tạo mới, thao tác hàng loạt, link sang chi tiết,
   chế độ xem đã lưu. **Mọi thứ cũ có phải còn đủ** sau khi đổi (đổi chỗ thì được, mất thì không).
2. Bộ lọc riêng sẵn có → tab cố định (bộ lọc chọn sẵn hay dùng nhất, như "Cần xin SĐT") và/hoặc trường `NutLoc`
   (chọn / người / ngày / chữ) lọc phía DB qua `bang/locDb`. Không thêm bộ lọc mới ngoài cái đang có, trừ trường chọn hiển
   nhiên của cột đã hiện (trạng thái, tỉnh…) nếu dữ liệu đủ nhỏ để lấy danh sách giá trị.
3. Tab: thêm MỘT dòng vào `apps/web/lib/tab-view.ts` (`<man>_tab: { khoaLoc, duongDan }`). Tab đầu luôn "Tất cả".
   Có số đếm khi đếm được rẻ (count head), không thì bỏ số.
4. Màn đã có "chế độ xem" cũ (`listBangView` / `luuBangView`, `BangTuyChinh`) → thay hẳn bằng tab (production có 0 view đã lưu).
5. Màn KHÔNG phải danh sách bản ghi (lịch, ma trận, form, báo cáo) → không ép khuôn; chỉ đồng bộ kiểu ô `Table` DS (prop
   `phai`, không đè px/màu) và ghi lý do trong báo cáo.

## Luật cứng

- Component DS ở `components/ui` + token `--…`; cấm `<button>/<select>/<input>` trần, hex/px lẻ, màu Tailwind gõ thẳng.
  Badge trạng thái = `variant="soft"` + `color`. Button phụ = `variant="ghost"|"outline"|"link"` (mặc định là nút đặc).
- `app/actions.ts` và `lib/tab-view.ts` là file CHUNG (nhiều agent sửa song song): chỉ sửa bằng công cụ Edit, từng đoạn nhỏ,
  ĐỌC LẠI ngay trước khi sửa; KHÔNG ghi đè cả file bằng script. `app/actions.ts` trên đĩa là CRLF.
- Mỗi server action export phải `await requireStaff()` + `await doQuyen('<mã>')` NGAY trong thân hàm chạm DB (test
  `lib/actions-guard.test.ts` + `lib/nen-tang/cong-quyen.test.ts` quét tĩnh). Đổi chữ ký action → sửa mọi caller.
- Không đổi dữ liệu gửi lên server ở các thao tác có sẵn (tạo/sửa/xoá/hàng loạt/xuất). Không migration, không DDL.
- KHÔNG commit, KHÔNG git stash/checkout/reset, KHÔNG `prettier --write`, KHÔNG dùng khung trình duyệt (người điều phối tự kiểm
  bằng mắt). Không sửa `components/ui/*`, `ds/nguon/`, `components/HangTab.tsx`, `bang/*` (thiếu gì thì báo).
- Test: cập nhật test cũ theo DOM mới nhưng GIỮ ý kiểm; thêm ít nhất 1 test DOM/màn: có tablist, có ô tìm trong toolbar, bấm
  tab cố định → URL đúng. Không xoá test, không nới kỳ vọng để cho xanh.
- Xong: trong `apps/web` chạy `npx tsc --noEmit`, `npx eslint <file đã sửa>`, `npx vitest run <test liên quan>` + 2 test
  quét quyền ở trên — phải sạch. Báo cáo tiếng Việt: bảng màn → "cũ có / mới có" (đủ chưa), file đã sửa, kết quả kiểm, màn
  nào không ép khuôn + lý do, điểm còn mở.
