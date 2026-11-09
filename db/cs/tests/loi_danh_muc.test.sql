-- Test loi_danh_muc + cs_loi_khop (migration 20261109120000) — DB LOCAL, begin/rollback.
-- Chạy: docker exec -i supabase_db_gwt-platform psql -U postgres -d postgres -v ON_ERROR_STOP=1 < db/cs/tests/loi_danh_muc.test.sql
begin;
do $$
begin
  if not exists (select 1 from loi_danh_muc where code = 'CHUA_PHAN_LOAI' and trang_thai = 'da_duyet') then
    raise exception 'thiếu dòng CHUA_PHAN_LOAI';
  end if;

  insert into loi_danh_muc (code, ten, aliases, ma_may, trang_thai, huong_xu_ly) values
    ('T-RO-NUOC-DAY', 'Rò nước đáy', '{"rò nước đáy","chảy nước dưới đáy","ri nuoc day"}', '{"TCTS20%"}', 'da_duyet', 'Kiểm tra gioăng van xả đáy'),
    ('T-RO-NUOC', 'Rò nước (chung)', '{"rò nước","rò rỉ"}', '{}', 'da_duyet', null),
    ('T-E5', 'Lỗi E5 – gia nhiệt', '{"E5"}', '{"TGTUN%"}', 'da_duyet', null),
    ('T-NHAP', 'Chưa duyệt', '{"tiếng ồn"}', '{}', 'cho_duyet', null);

  -- khớp không dấu, ưu tiên mục riêng cho model + alias dài nhất
  if cs_loi_khop('Khách báo RÒ NƯỚC ĐÁY máy', 'TCTS20NG') <> 'T-RO-NUOC-DAY' then raise exception 'không khớp mục riêng model'; end if;
  if cs_loi_khop('khach bao ri nuoc day', 'TCTS20NG') <> 'T-RO-NUOC-DAY' then raise exception 'không khớp alias không dấu'; end if;
  -- model khác → rơi về mục chung
  if cs_loi_khop('rò nước đáy', 'TXYZ') <> 'T-RO-NUOC' then raise exception 'mục riêng model lọt sang model khác'; end if;
  -- không biết model → chỉ mục chung
  if cs_loi_khop('báo lỗi E5', null) <> 'CHUA_PHAN_LOAI' then raise exception 'E5 không có model vẫn khớp'; end if;
  if cs_loi_khop('báo lỗi E5', 'TGTUN-8600HP-G') <> 'T-E5' then raise exception 'E5 không khớp'; end if;
  -- mục chưa duyệt không được dùng
  if cs_loi_khop('máy có tiếng ồn', null) <> 'CHUA_PHAN_LOAI' then raise exception 'mục cho_duyet bị dùng'; end if;
  -- null an toàn
  if cs_loi_khop(null, null) <> 'CHUA_PHAN_LOAI' then raise exception 'null không ra CHUA_PHAN_LOAI'; end if;

  -- ràng buộc mã
  begin
    insert into loi_danh_muc (code, ten) values ('sai mã', 'x');
    raise exception 'mã sai dạng vẫn vào được';
  exception when check_violation then null;
  end;
end $$;
rollback;
