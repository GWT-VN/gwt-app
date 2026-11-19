-- Vai trò thứ 15 `sua_ds_nguoi` — "Sửa danh sách người (CS theo dõi, kỹ thuật)" (Hiệp 19/11/2026).
--
-- Trước: quyền thêm / xoá người ở /danh-sach-nguoi là danh sách email cố định trong code (admin@, ai@) — không có
-- chỗ nào trên app để xem hay đổi. Sau: là một cột vai trò ở bánh răng › Nhân viên (nhóm "DS người", cột "Sửa");
-- tích / bỏ tích cho từng người, không cần sửa code.
--
-- Bộ phận riêng nên KHÔNG loại trừ với Trưởng / NV CSKH. Vai trò này không kéo theo quyền nào trong ma trận
-- (quyen_vai_tro): chỉ mở trang Danh sách người. Tab Kỹ thuật vẫn cần thêm quyền "Hồ sơ kỹ thuật viên".
--
-- Dữ liệu: gán sẵn cho admin@ và ai@ → ai sửa được giữ y như hiện tại.
-- Áp TRƯỚC khi gộp code (code mới đọc vai trò; code cũ bỏ qua vai trò lạ nên áp trước an toàn).
--
-- Hoàn tác:
--   update public.staff set vai_tro = array_remove(vai_tro, 'sua_ds_nguoi') where 'sua_ds_nguoi' = any(vai_tro);
--   (rồi đặt lại chk_vai_tro như migration 20260820020000)

alter table public.staff drop constraint if exists chk_vai_tro;
alter table public.staff add constraint chk_vai_tro
  check (vai_tro <@ '{
    ceo, admin, quan_tri_ht,
    kt_giam_doc, ky_thuat, ctv_lap_dat,
    cs_manager, cs,
    sua_ds_nguoi,
    sales_manager, sales,
    marketing, kho, ke_toan, tai_chinh
  }'::text[]);

update public.staff
   set vai_tro = array_append(vai_tro, 'sua_ds_nguoi')
 where lower(email) in ('admin@gwt.vn', 'ai@gwt.vn')
   and not ('sua_ds_nguoi' = any(vai_tro));
