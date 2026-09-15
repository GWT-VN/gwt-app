-- ke_toan_08_luat_ky08 — luật CEO chốt 15/09/2026 sau khi duyệt 93 dòng kỳ 2026-08 (origin 'app').
-- Data-only, KHÔNG khoá cứng: dòng nằm trong accounting.rules, sửa/tắt (active=false) bằng data như luật khác.
-- Cách lùi nếu hỏng: delete from accounting.rules where origin = 'app' and created_at < '2026-09-16';
--
-- condition của luật origin 'app' (engine dau-vao.ts đọc):
--   'kw:<chuỗi norm()>'  → luật chỉ áp khi DIỄN GIẢI chứa chuỗi đó (tách một NCC thành nhiều mã theo nội dung)
--   'khong_phai_hang'    → NCC này bỏ qua tầng "hàng hoá" (nhà hàng: "lẩu vị muối" từng khớp mã muối viên MUOIAD)
-- pattern đã norm(): bỏ dấu, thường, đ→d.
insert into accounting.rules (kind, pattern, target_code, condition, priority, origin)
select v.kind, v.pattern, v.target_code, v.condition, v.priority, 'app'
from (values
  -- Xanh SM: chở hàng cho khách (diễn giải có "Tên hàng hóa:") → vận chuyển; còn lại (đi lại, phí nền tảng, chiết khấu, phí quản lý) → di chuyển
  ('supplier', 'di chuyen xanh va thong minh gsm', 'DVVC',            'kw:ten hang hoa',  0),
  ('supplier', 'di chuyen xanh va thong minh gsm', 'cp.dichuyen',     null,               1),
  -- Viettel kho vận: vận hành kho ↔ chuyển phát
  ('supplier', 'kho van viettel',                  'cp.thuekho',      'kw:van hanh kho',  2),
  ('supplier', 'kho van viettel',                  'DVVC',            'kw:chuyen phat',   3),
  -- Nhà hàng: mọi món ăn = vận hành chung, không để tầng hàng hoá bắt nhầm
  ('supplier', 'dragoncello',                      'cp.vanhanhchung', 'khong_phai_hang',  4),
  ('supplier', 'tsuiteru',                         'cp.vanhanhchung', 'khong_phai_hang',  5),
  ('supplier', 'am thuc unicb',                    'cp.vanhanhchung', 'khong_phai_hang',  6),
  ('supplier', 'an phu group',                     'cp.vanhanhchung', 'khong_phai_hang',  7),  -- bia; CEO: "sai sửa tay sau"
  -- Khác
  ('supplier', 'tap doan cong nghiep - vien thong quan doi', 'cp.vanhanhchung', null,     8),
  ('supplier', 'van tai a dong',                   'DVVC',            null,               9),
  ('keyword',  'te deu vesbo',                     'cp.vattukho',     null,              10),  -- vật tư ống nước chưa có mã catalog
  ('keyword',  'bang cuon ong nuoc',               'cp.vattukho',     null,              11)
) as v(kind, pattern, target_code, condition, priority)
where not exists (
  select 1 from accounting.rules r
  where r.origin = 'app' and r.kind = v.kind and r.pattern = v.pattern and r.target_code = v.target_code
    and r.condition is not distinct from v.condition
);
