-- HỢP THỨC HOÁ từ ledger live 04/09/2026 (supabase_migrations.schema_migrations, version 20260824122715, name sales_don_ma_khach_cu_va_chan_trung_sdt).
-- Nội dung dưới đây = đúng SQL đã chạy trên GWT-SalesTracking. File tồn tại để `db reset` local/CI replay
-- được từ 0; KHÔNG áp lại lên live (đã có). md5(statements) = 786ef62bd3ffdd47d0f997394bf4678f.

-- Don 428 dong khach mang ma CU + chan khong cho mot SDT deo hai ma khach.
-- CEO chot 24/08/2026: "DM_KHACH co bao nhieu khach thi giu lai" -> giu dung 398 dong
-- cua the he moi, xoa phan con lai.
--
-- ⚠️ SAO LUU TRUOC KHI XOA. Bang duoi day la ban chup NGUYEN VEN 428 dong sap xoa —
-- muon phuc hoi thi `insert into customers select ... from` chinh no. Khong dua vao ban
-- sao luu tu dong cua Supabase, vi do la khoi phuc CA DATABASE chu khong phai mot bang.
create table if not exists public.customers_ma_cu_luu_20260824 as
select * from public.customers where customer_code !~ '^KH00[0-3][0-9][0-9]$';

alter table public.customers_ma_cu_luu_20260824 enable row level security;

comment on table public.customers_ma_cu_luu_20260824 is
  'Ban chup 428 dong khach mang ma CU (truoc khi nut "Dung lai DM_KHACH" danh so lai tu KH00001), xoa khoi customers ngay 24/08/2026 theo CEO chot. Giu de phuc hoi neu can.';

delete from public.customers where customer_code !~ '^KH00[0-3][0-9][0-9]$';

-- ══ Chan mot SDT deo hai ma khach ═══════════════════════════════════════════════
--
-- CEO chot 24/08. Day CHINH LA thu se chan duoc su co hom nay: khi 398 ma moi duoc
-- them vao canh 428 ma cu, co 263 cap TRUNG SDT — index nay se lam dot sync GAY NGAY
-- va bao loi ro rang, thay vi lang le nhan doi bang khach roi khong ai biet.
--
-- Index RIENG PHAN (partial): bo qua dong khong co SDT. 144/398 khach hien khong co so,
-- ma trong Postgres nhieu NULL khong dung nhau — nhung chuoi RONG thi co, nen phai loai
-- ca '' chu khong chi NULL.
--
-- ⚠️ DANH DOI, CEO CAN BIET: tu nay neu Google Sheet sinh ra HAI khach cung SDT thi
-- **ca lo sync khach se hong**, khong phai chi mot dong. Do la CO Y — that bai on ao
-- con hon hong im lang. Doi lai, ngay 21/08 CEO tung chot KHONG dat rang buoc nay vi
-- so gay sync; quyet dinh hom nay thay the quyet dinh do.
create unique index if not exists customers_phone_chuan_duy_nhat
  on public.customers (phone_chuan)
  where phone_chuan is not null and phone_chuan <> '';

comment on index public.customers_phone_chuan_duy_nhat is
  'Mot SDT chi deo mot ma khach. CEO chot 24/08/2026 sau su co danh so lai DM_KHACH. '
  'Rieng phan vi 144/398 khach chua co SDT. Sync sinh trung SDT se gay ca lo — co y.';
