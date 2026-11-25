-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260821075138, name nen_tang_seed_ma_tran_52_quyen).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 9a41a88c0f8dea43caf5a3ae43b3481f.

-- Seed ma trận phân quyền: 52 quyền x 14 vai trò = 177 ô tick.
--
-- SINH THẲNG TỪ CODE (`MAC_DINH` trong apps/web/lib/nen-tang/quyen.ts), không gõ tay,
-- nên DB không thể lệch code. Đây là trạng thái cuối sau khi gộp 3 file seed của repo
-- (20260820050000 + 20260821010000 + 20260821020000) — hai file trước đó bị chính
-- chúng xoá rồi ghi lại nên bỏ qua là tương đương.
--
-- Giá trị = hành vi HÔM NAY của luật cũ, để lúc bật cầu dao thì số lệch bằng 0.
-- Hai chỗ đã sửa so với bản seed 20/08: quyền xem doanh số CHỈ còn ceo + admin
-- (bảng cũ lỡ cho cả cs và cs_manager, tức nhân viên CSKH xem được doanh số), và
-- tách quyền ĐỌC view bảng (he_thong.view_xem) khỏi quyền GHI view dùng chung.
--
-- CHẠY LẠI FILE NÀY SẼ XOÁ MỌI Ô CEO ĐÃ TỰ TICK. Từ nay chỉnh ma trận bằng màn
-- /nhan-vien/phan-quyen, đừng seed lại.

delete from public.quyen_vai_tro;

insert into public.quyen_vai_tro (vai_tro, ma_quyen)
select t.v, q from (values
  ('ceo', '{cs.khach.xem,cs.may.xem,cs.ticket.xem,cs.ticket.xem_tat_ca,cs.bao_tri.xem,cs.ky_thuat.lich_cua_toi,cs.bao_cao.doanh_so,cs.yeu_cau.xem,sales.don.xem,he_thong.nhan_su.xem,he_thong.nhat_ky,he_thong.view_xem}'),
  ('admin', '{cs.khach.xem,cs.khach.sua,cs.khach.xin_xoa,cs.khach.gop,cs.khach.duyet_cho,cs.khach.xin_xuat,cs.khach.duyet_xuat,cs.khach.duyet_xoa,cs.khach.xoa_hang_loat,cs.may.xem,cs.may.kich_hoat_bh,cs.may.lap_thu_doi,cs.serial.kho,cs.serial.duyet,cs.may.thay_loi,cs.may.trang_thai,cs.ticket.xem,cs.ticket.xem_tat_ca,cs.ticket.tao_sua,cs.ticket.chi_phi,cs.nhom_loi.cau_hinh,cs.nhom_loi.gan_ticket,cs.bao_tri.xem,cs.bao_tri.ghi_ket_qua,cs.bao_tri.tao_plan,cs.bao_tri.duyet_plan,cs.ky_thuat.lich_cua_toi,cs.ky_thuat.ho_so,cs.ky_thuat.xep_lich,cs.ky_thuat.tai_khoan,cs.bao_cao.xuat,cs.bao_cao.doanh_so,cs.yeu_cau.gui,cs.yeu_cau.xem,cs.yeu_cau.duyet,cs.yeu_cau.ap_thang,cs.hang_loat.cap_nhat,work.viec.xem_tao,work.viec.giao,work.luat_tu_sinh,sales.don.xem,sales.don.ghi,he_thong.nhan_su.xem,he_thong.nhan_su.sua,he_thong.nhan_su.xoa,he_thong.nhan_su.mat_khau,he_thong.phan_quyen,he_thong.nhat_ky,he_thong.catalog,he_thong.kenh,he_thong.view_xem,he_thong.view_chung}'),
  ('quan_tri_ht', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem,he_thong.nhan_su.xem,he_thong.nhan_su.sua,he_thong.nhan_su.xoa,he_thong.nhan_su.mat_khau,he_thong.phan_quyen,he_thong.nhat_ky,he_thong.catalog,he_thong.kenh,he_thong.view_chung,cs.nhom_loi.cau_hinh,cs.may.trang_thai}'),
  ('kt_giam_doc', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('ky_thuat', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('ctv_lap_dat', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('cs_manager', '{cs.khach.xem,cs.khach.sua,cs.khach.xin_xoa,cs.khach.gop,cs.khach.duyet_cho,cs.khach.xin_xuat,cs.khach.duyet_xuat,cs.may.xem,cs.may.kich_hoat_bh,cs.may.lap_thu_doi,cs.serial.kho,cs.serial.duyet,cs.may.thay_loi,cs.may.trang_thai,cs.ticket.xem,cs.ticket.xem_tat_ca,cs.ticket.tao_sua,cs.ticket.chi_phi,cs.nhom_loi.cau_hinh,cs.nhom_loi.gan_ticket,cs.bao_tri.xem,cs.bao_tri.ghi_ket_qua,cs.bao_tri.tao_plan,cs.bao_tri.duyet_plan,cs.ky_thuat.lich_cua_toi,cs.ky_thuat.ho_so,cs.ky_thuat.xep_lich,cs.bao_cao.xuat,cs.yeu_cau.gui,cs.yeu_cau.xem,cs.yeu_cau.duyet,cs.yeu_cau.ap_thang,cs.hang_loat.cap_nhat,work.viec.xem_tao,work.viec.giao,work.luat_tu_sinh,he_thong.kenh,he_thong.view_xem,he_thong.view_chung}'),
  ('cs', '{cs.khach.xem,cs.khach.sua,cs.khach.xin_xoa,cs.khach.xin_xuat,cs.may.xem,cs.may.kich_hoat_bh,cs.may.thay_loi,cs.ticket.xem,cs.ticket.tao_sua,cs.ticket.chi_phi,cs.bao_tri.xem,cs.bao_tri.ghi_ket_qua,cs.bao_tri.tao_plan,cs.ky_thuat.lich_cua_toi,cs.yeu_cau.gui,work.viec.xem_tao,work.viec.giao,he_thong.kenh,he_thong.view_xem}'),
  ('sales_manager', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,sales.don.xem,sales.don.ghi,he_thong.view_xem}'),
  ('sales', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,sales.don.xem,sales.don.ghi,he_thong.view_xem}'),
  ('marketing', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('kho', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('ke_toan', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}'),
  ('tai_chinh', '{cs.ky_thuat.lich_cua_toi,work.viec.xem_tao,work.viec.giao,he_thong.view_xem}')
) as t(v, ds), unnest(t.ds::text[]) as q;
