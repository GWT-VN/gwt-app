-- Khu Kho (03/11/2026): seed ma trận cho quyền mới kho.ton.xem (lib/nen-tang/quyen.ts).
-- Mức mặc định trong code: TCS + chiXem  => admin, cs_manager, ceo  (khớp luật cũ 'QUANLY' ở trang /kho).
-- Không có dòng nào thì khi cầu dao MA_TRAN_QUYEN=on, ô Kho ẩn với MỌI người.
-- Cấp thêm cho vai khác (vd sales_manager) → TICK trên màn ma trận, không sửa code.
-- Cách lùi: delete from public.quyen_vai_tro where ma_quyen = 'kho.ton.xem';
insert into public.quyen_vai_tro (vai_tro, ma_quyen)
select v, q from (values
  ('admin','kho.ton.xem'), ('cs_manager','kho.ton.xem'), ('ceo','kho.ton.xem')
) as t(v,q)
where not exists (
  select 1 from public.quyen_vai_tro x where x.vai_tro = t.v and x.ma_quyen = t.q
);
