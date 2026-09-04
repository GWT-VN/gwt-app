-- Tìm khách LINH ĐỘNG cho ô chọn khách lúc lên đơn — CEO giao 24/08/2026.
--
-- Vì sao phải làm dưới DB chứ không lọc ở app: ô này tra tập KHÔNG nạp trước được
-- (hàng trăm khách và còn tăng), nên phải hỏi server từng lượt gõ. Mà PostgREST
-- `.or()` không diễn tả được "MỌI từ đều phải khớp, mỗi từ được khớp ở một cột khác
-- nhau", cũng không gọi được `word_similarity()`. Gói thành một hàm là gọn nhất.
--
-- Bản cũ: `name.ilike.%<nguyên chuỗi>%`. Ba ca CEO nêu đều trượt:
--   · gõ KHÔNG DẤU        — `linh` không khớp `Linh` có dấu ở khách khác, và `phuong`
--                            không bao giờ khớp `Phượng`;
--   · gõ ĐẢO THỨ TỰ       — `SG Linh` không phải chuỗi con của `Anh Linh SG`;
--   · gõ SAI MỘT CHỮ      — `Ling SG` ra rỗng.
--
-- Cách làm: chuẩn hoá cả hai đầu về không-dấu (`khong_dau()` — cùng hàm mà `ten_kd`
-- và `dia_chi_kd` đang sinh sẵn), cắt câu gõ thành TỪ, rồi bắt **mọi từ đều phải
-- khớp** — mỗi từ được tự chọn khớp ở tên / địa chỉ / SĐT / mã KH. Từ nào không khớp
-- thẳng thì cho khớp GẦN ĐÚNG bằng trigram để nuốt lỗi gõ.
--
-- ⚠️ `khong_dau()` (SQL) phải cho ra ĐÚNG kết quả của `boDau()` (apps/web/bang/timkiem.ts).
-- Lệch nhau là gõ ra rỗng mà không ai hiểu vì sao. Xem apps/web/bang/sql/khong_dau.sql.

create extension if not exists pg_trgm;

-- gin_trgm_ops phục vụ được cả `ilike` lẫn regex `~`. Ở cỡ hiện tại (~424 khách)
-- Postgres vẫn quét bảng vì vế lọc nằm trong hàm con theo dòng — index này là để
-- dành cho lúc bảng lớn, và cho các truy vấn `ten_kd ~ '\m…'` sẵn có bên CSKH.
create index if not exists customers_ten_kd_trgm_idx
  on public.customers using gin (ten_kd gin_trgm_ops);
create index if not exists customers_dia_chi_kd_trgm_idx
  on public.customers using gin (dia_chi_kd gin_trgm_ops);

drop function if exists public.sales_tim_khach(text, integer);

create or replace function public.sales_tim_khach(q text, gioi_han integer default 20)
returns table (
  customer_code text,
  name          text,
  phone         text,
  phone_chuan   text,
  province      text,
  province_moi  text,
  diem          real
)
language sql
stable
security invoker
set search_path = public
as $$
  with tk as (
    -- Bỏ dấu, hạ chữ thường, mọi ký tự lạ thành khoảng trắng. Sau bước này từ khoá chỉ
    -- còn [a-z0-9 ] nên nhét thẳng vào regex bên dưới là an toàn — không cần thoát.
    select btrim(regexp_replace(public.khong_dau(coalesce(q, '')), '[^a-z0-9]+', ' ', 'g')) as kw
  ),
  tu as (
    select nullif(kw, '') as kw,
           string_to_array(nullif(kw, ''), ' ') as tu
    from tk
  ),
  cham as (
    select
      c.customer_code, c.name, c.phone, c.phone_chuan, c.province, c.province_moi,
      (
        -- Điểm của MỘT từ trên MỘT khách: 1 = khớp thẳng, <1 = khớp gần đúng, 0 = trượt.
        select array_agg(
          case
            -- Khớp theo ĐẦU TỪ trên tên/địa chỉ. Dùng `\m` chứ không phải `%…%` vì
            -- chuỗi con giữa từ kéo theo rất nhiều rác: `huong` ra cả Phương/Thường.
            when c.ten_kd ~ ('\m' || t) or coalesce(c.dia_chi_kd, '') ~ ('\m' || t) then 1.0
            -- SĐT và mã KH: khớp chuỗi con, vì người ta hay gõ 4 số đuôi hoặc `2432`.
            when coalesce(c.phone, '') like '%' || t || '%'
              or coalesce(c.phone_chuan, '') like '%' || t || '%'
              or public.khong_dau(coalesce(c.customer_code, '')) like '%' || t || '%'
              or public.khong_dau(coalesce(c.ma_kh, '')) like '%' || t || '%' then 1.0
            -- Gõ sai một chữ (`Ling` cho `Linh`). word_similarity so từ khoá với ĐOẠN
            -- khớp nhất trong tên, nên `ling` vs `anh linh sg` được 0.6 — trong khi
            -- similarity() cả chuỗi chỉ 0.46 và dễ trượt ngưỡng.
            -- Chỉ mở cho từ từ 3 ký tự: `an`, `sg` mà cho khớp gần đúng thì ra cả bảng.
            when length(t) >= 3 and word_similarity(t, c.ten_kd) >= 0.5
              then word_similarity(t, c.ten_kd)::numeric
            else 0.0
          end
        )
        from unnest((select tu from tu)) as t
      ) as diem_tung_tu
    from public.customers c
    where (select kw from tu) is not null
  )
  select
    customer_code, name, phone, phone_chuan, province, province_moi,
    -- Xếp hạng: khách khớp thẳng cả câu lên trước khách chỉ khớp gần đúng.
    (select avg(d) from unnest(diem_tung_tu) as d)::real as diem
  from cham
  -- MỌI từ đều phải khớp. `bool_and` chứ không `bool_or`: gõ thêm chữ phải LỌC HẸP lại,
  -- gõ càng dài mà danh sách càng dài là ô tìm kiếm phản trực giác.
  where (select bool_and(d > 0) from unnest(diem_tung_tu) as d)
  order by diem desc, name
  limit greatest(1, least(coalesce(gioi_han, 20), 50));
$$;

comment on function public.sales_tim_khach(text, integer) is
  'Tim khach cho o chon khach khi len don: khong dau, nhieu tu (AND, khong ke thu tu), '
  'khop dau tu tren ten/dia chi, khop chuoi con tren SDT/ma KH, va khop gan dung (trigram) '
  'cho tu tu 3 ky tu tro len de nuot loi go. CEO giao 24/08/2026.';
