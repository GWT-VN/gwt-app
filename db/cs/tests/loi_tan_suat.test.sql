-- Test view báo cáo tần suất lỗi (migration 20261109123000). DB LOCAL, begin/rollback.
begin;
do $$
declare r record;
begin
  insert into loi_danh_muc (code, ten, aliases, trang_thai) values ('T-RO-VOI-LANH', 'Rò nước đầu vòi lạnh', '{"đầu vòi lạnh"}', 'da_duyet');
  insert into tickets (ticket_code, ticket_type, description, created_at)
  values ('TK-9911-971', 'Bảo hành', 'rò nước đầu vòi lạnh', '2026-10-31 18:00:00+00');  -- = 01/11 giờ VN
  select * into r from v_loi_ca where ticket_code = 'TK-9911-971';
  if r.thang <> '2026-11' then raise exception 'tháng phải theo giờ VN, được %', r.thang; end if;
  if r.loi_ten <> 'Rò nước đầu vòi lạnh' or r.internal_code <> '(chưa rõ)' then raise exception 'cột sai: %', row_to_json(r); end if;

  insert into sales_order_lines (source_tab, order_code, order_date, internal_code, quantity, fulfillment_status)
  values ('t', 'T1', '2026-10-05', 'ZZ-TEST-LTS', 3, 'Đã giao'),
         ('t', 'T2', '2026-10-06', 'ZZ-TEST-LTS', 5, 'Huỷ'),
         ('t', 'T3', '2026-10-07', 'ZZ-TEST-LTS', 7, 'Hoàn hàng'),
         ('t', 'T4', '2026-10-08', 'ZZ-TEST-LTS', 2, 'Hoàn thành (Không lắp)'),
         ('t', 'T5', '2026-10-09', 'ZZ-TEST-LTS', 4, 'Hủy ');
  if (select so_ban from v_loi_so_ban where internal_code = 'ZZ-TEST-LTS' and thang = '2026-10') <> 5 then
    raise exception 'so_ban phải = 5: bỏ Huỷ/Hủy/Hoàn hàng, giữ Hoàn thành (Không lắp)';
  end if;

  insert into serial_registry (serial, code, internal_code, imported_at)
  values ('ZZTEST-LTS-1', 'ZZ', 'ZZ-TEST-LTS', '2026-09-30 18:00:00+00'), ('ZZTEST-LTS-2', 'ZZ', 'ZZ-TEST-LTS', '2026-10-15 03:00:00+00');
  if (select so_nhap from v_loi_so_nhap where internal_code = 'ZZ-TEST-LTS' and thang = '2026-10') <> 2 then
    raise exception 'so_nhap theo giờ VN phải = 2';
  end if;
end $$;
rollback;
