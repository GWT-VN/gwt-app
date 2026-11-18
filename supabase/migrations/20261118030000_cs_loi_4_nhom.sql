-- cs — DANH MỤC LỖI CHIA LẠI 4 NHÓM + "Không phải lỗi" (18/11/2026)
--
-- Chị Trang (#ai-team CS - App 17/11) + CEO: loại lỗi theo 4 nhóm Main · Rò rỉ nước · Chất lượng nước · App;
-- mỗi mã lỗi cũ là một nhóm con. Bảo trì / thay lõi / hướng dẫn tách "Không phải lỗi" (không tính vào báo cáo lỗi).
-- Ticket không đổi: ticket gắn MÃ lỗi (ticket_may.loi_code), nhóm lấy qua loi_danh_muc.nhom → tự vào nhóm mới.
-- 12 nhóm cũ không xoá (trang Nhóm lỗi cũ + issue_override còn tham chiếu), chỉ đánh dấu dang_dung = false.
-- Nhóm mới có mau_mo_ta = '$^' (không khớp gì) để không tự gom ticket theo regex kiểu cũ.
--
-- ROLLBACK:
--   update public.loi_danh_muc d set nhom = v.cu from (values
--     ('BAN-MAN-HINH','BAN-MANHINH'),('BAN-LOI-E1-E3-E7','BAN-QUA-NHIET'),('BAN-BOC-KHOI','BAN-QUA-NHIET'),('GTUN-8600-E5','BAN-QUA-NHIET'),
--     ('CTD50-E4','CTD50-BINH-E4'),('CTD50-LOC-CHAM','CTD50-BINH-E4'),('POE-MAIN-MAN-HINH','POE-MAIN-DO'),('KHONG-RA-NUOC','KHONG-RA-NUOC'),
--     ('HONG-BOM','KHONG-RA-NUOC'),('BAN-KHONG-LANH',null),('MAY-KEU-TO',null),('NUOC-CAN-BUI-TRANG','CHAT-LUONG-NUOC'),
--     ('NUOC-VUOT-CHUAN','CHAT-LUONG-NUOC'),('MUI-LA','MUI-LA'),('WIFI-IOT','WIFI-IOT'),('CTS20-RO-DAY','RO-RI-CHUNG'),
--     ('CTS20-RO-VOI-LANH','RO-RI-CHUNG'),('RO-CONG-KET-NOI','RO-RI-CHUNG'),('RO-RI-NUOC','RO-RI-CHUNG'),('CTS10-RO-RI','CTS10-RO-RI'),
--     ('CTD50-TIA-NUOC','CTD50-TIA-NUOC'),('DV-BAO-TRI','DV-BAO-TRI'),('DV-HUONG-DAN-TRA-CUU','DV-BAO-TRI'),('DV-THAY-LOI','DV-THAY-LOI')
--   ) v(code, cu) where d.code = v.code;
--   delete from public.issue_group where code in ('MAIN','RO-RI-NUOC','APP','KHONG-PHAI-LOI');
--   alter table public.issue_group drop column if exists dang_dung;

alter table public.issue_group add column if not exists dang_dung boolean not null default true;
comment on column public.issue_group.dang_dung is 'false = nhóm kiểu cũ (trước 18/11/2026), không còn cho chọn; giữ lại cho lịch sử.';

insert into public.issue_group (code, ten, mo_ta, muc_do, mau_mo_ta, thu_tu) values
  ('MAIN',           'Main',            'Phần cứng, điện: bo mạch, màn hình, bơm, làm lạnh, lỗi E', 'nghiem_trong', '$^', 1),
  ('RO-RI-NUOC',     'Rò rỉ nước',      'Rò đáy, rò vòi, bung cổng nối, tia nước',                   'thuong',       '$^', 2),
  ('APP',            'App',             'Wifi, app không kết nối / sai dữ liệu',                      'nhe',          '$^', 4),
  ('KHONG-PHAI-LOI', 'Không phải lỗi',  'Bảo trì, thay lõi, hướng dẫn / tra cứu',                     'khong_loi',    '$^', 9)
on conflict (code) do update set ten = excluded.ten, mo_ta = excluded.mo_ta, thu_tu = excluded.thu_tu, dang_dung = true;

update public.issue_group set ten = 'Chất lượng nước', thu_tu = 3, dang_dung = true where code = 'CHAT-LUONG-NUOC';
update public.issue_group set dang_dung = false
 where code not in ('MAIN', 'RO-RI-NUOC', 'CHAT-LUONG-NUOC', 'APP', 'KHONG-PHAI-LOI');

update public.loi_danh_muc d set nhom = v.moi from (values
  ('BAN-MAN-HINH','MAIN'),('BAN-LOI-E1-E3-E7','MAIN'),('BAN-BOC-KHOI','MAIN'),('GTUN-8600-E5','MAIN'),('CTD50-E4','MAIN'),
  ('CTD50-LOC-CHAM','MAIN'),('POE-MAIN-MAN-HINH','MAIN'),('KHONG-RA-NUOC','MAIN'),('HONG-BOM','MAIN'),('BAN-KHONG-LANH','MAIN'),
  ('MAY-KEU-TO','MAIN'),
  ('CTS20-RO-DAY','RO-RI-NUOC'),('CTS20-RO-VOI-LANH','RO-RI-NUOC'),('RO-CONG-KET-NOI','RO-RI-NUOC'),('RO-RI-NUOC','RO-RI-NUOC'),
  ('CTS10-RO-RI','RO-RI-NUOC'),('CTD50-TIA-NUOC','RO-RI-NUOC'),
  ('NUOC-CAN-BUI-TRANG','CHAT-LUONG-NUOC'),('NUOC-VUOT-CHUAN','CHAT-LUONG-NUOC'),('MUI-LA','CHAT-LUONG-NUOC'),
  ('WIFI-IOT','APP'),
  ('DV-BAO-TRI','KHONG-PHAI-LOI'),('DV-HUONG-DAN-TRA-CUU','KHONG-PHAI-LOI'),('DV-THAY-LOI','KHONG-PHAI-LOI')
) v(code, moi) where d.code = v.code;
