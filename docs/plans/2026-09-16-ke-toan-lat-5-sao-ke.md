# Kế toán lát 5 — Sao kê ngân hàng → Báo cáo thu chi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upload sao kê 3 tài khoản (VCB21 `.xls`, VCB63 `.xls`, TCB `.pdf`) vào kỳ → app khớp từng dòng với hoá đơn trong kỳ (chắc / ≤3 gợi ý / chọn tay / không HĐ), gán mã KMCP hoặc loại thu, rồi xuất `Báo cáo thu chi - MM.YYYY.xlsx` đúng khuôn 15 cột chi / 11 cột thu / tab Tiền mặt ngân hàng — thay việc điền tay 127 dòng/tháng.

**Architecture:** Cùng khuôn lát 1–4: bộ đọc thuần (`doc-file/vcb.ts`, `doc-file/tcb-pdf.ts`) → khoá dòng ổn định → bảng `accounting.bank_lines` qua RPC `public.ke_toan_sao_ke_*` → module thuần `khop-sao-ke.ts` (khớp) + `engine/sao-ke.ts` (phân loại theo luật `bank_keyword` trong `rules` = data) → màn `/ke-toan/sao-ke/[ky]` → `xuat/excel-thu-chi.ts` dựng workbook mới bằng exceljs. Người dùng chỉ chọn gợi ý/sửa mã tại ô; mọi chốt ghi vào `bank_lines`, upload lại không đè chốt tay.

**Tech Stack:** Next.js 16 (webpack dev), React 19, TypeScript, vitest 4, exceljs (xuất), `xlsx` 0.18 (đọc BIFF `.xls` VCB — đã có trong deps vì CSKH), **`pdfjs-dist` (mới, legacy build) đọc PDF TCB**, Supabase RPC security definer, Python 3 + `xlrd`/`pdfplumber` chỉ để sinh fixture (máy dev).

**Spec:** `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` — §2 #17 (mục tiêu sao kê), §5 bảng `bank_lines`, §6 `khop-sao-ke`, §7 route `/ke-toan/sao-ke/[ky]`, §8 Excel thu chi, §10 kiểm thử, §13 bẫy VCB. Quy ước điền tay: `data/ke-toan/…/HANDOFF - Báo cáo tài chính GWT.md` §2B.

## Sự thật đo 16/09/2026 (quyết định thiết kế — implementer đọc, không đo lại)

- **Số dòng T8:** VCB21 27 (24 nợ / 3 có), VCB63 45 (43 nợ / 2 có), TCB 55 (1 nợ / 54 có) = 127 = đúng 68 chi + 59 thu của báo cáo tay T8.
- **VCB `.xls`** (BIFF, `xlsx` lib đọc được, exceljs KHÔNG): 1 sheet, 7 cột; hàng 14 (index 13) là header `STT No.` · `Ngày1/ TNX Date/ Số CT` · `Ngày hiệu lực` · `Số tiền ghi nợ` · `Số tiền ghi có` · `Số dư` · `Nội dung chi tiết`; dòng giao dịch = cột A là số (`1.0`), hết khi cột A không phải số; cột B dạng `03/08/2026 / 5254 - 05356` (ngày ` / ` số chứng từ); tiền dạng `5,270,776` chuỗi; `Số dư đầu kỳ/ Opening` ở hàng 11 cột C `42,892,241 VND`; `Từ/ From:` hàng 10 cột C, `Đến/ To:` cột F. Nội dung: VCB21 24/27 dòng `UHHT..268076..….DG:FACEBK *73DRRVZD42       DUBLI.5,270,776.00VND` (Facebook Ads, mỗi ngày); VCB63 41/45 `IBBIZ6076649616.017669.GWT thanh toan vat tu Xuan Lanh 0508 0608`; chuyển nội bộ `MBBIZ….GWT chuyen tien noi bo tu VCB63 sang VCB21` / `SHGD:….Remark:GWT chuyen tien noi bo tu TCB sang VCB63`; lãi `INTEREST PAYMENT`.
- **TCB `.pdf`** 4 trang, khổ ngang 842pt. `pdfplumber.extract_tables()` CHỈ ra header, không ra dòng → phải bóc theo **toạ độ chữ**: gom chữ theo `y` (±3pt), dòng giao dịch bắt đầu bằng số thứ tự 1–3 chữ số tại `x < 45`; đo được đúng **55 dòng, tổng Có 1.415.945.367 = header "Tổng tiền ghi có"**. Header cột trang 1 tại `y≈303`: `Số thứ tự`(x25) · `Ngày KH thực hiện`(60) · `Ngày giao dịch`(112) · `Số bút toán`(166) · `Ngân hàng đối ứng`(229) · `Tài khoản đối ứng`(300) · `Tên tài khoản đối ứng`(364) · `Diễn giải`(451) · `Nợ`(547) · `Có`(607) · `Phí - Lãi`(655) · `Thuế`(705) · `Số dư`(757). Giá trị: ngày GD x≈116, tên đối ứng 360–428, diễn giải 428–545, nợ 545–605, có 605–650, số dư ≥750. Trang 1 phần đầu có `Số dư đầu ngày/Opening balance 508,219,466`, `Tổng tiền ghi nợ/Total debits 500,000,000`, `Tổng tiền ghi có/ Total credits 1,415,945,367`, `Từ ngày/From:2026-08-01 Đến ngày/To:2026-08-31`, `Số dư cuối ngày/Closing balance`. SĐT trong diễn giải bị tách chữ (`091278` `8899`) → nối lại khi ghép dòng.
- **Khớp tự động (đo bằng thuật toán của plan này trên T8, HĐ kỳ 08 gom theo số HĐ, `tong_thanh_toan`):** chi 65 dòng (trừ 2 nội bộ, 1 lãi): 12 khớp đúng số tiền một HĐ, **8 chắc** (số tiền + tên NCC/số HĐ/MST trong nội dung); thu 54 (trừ 4 nội bộ, 2 lãi): 11 đúng tiền một HĐ + 6 đúng tiền nhiều HĐ, **6 chắc**, 16 có SĐT → 11 ra khách trong `public.customers` (263/399 khách có `phone_chuan`). Khớp spec "một phần ba".
- **Sales Tracking:** `public.sales_orders` **rỗng** (0 dòng), `public.sales_order_lines` 869 dòng có `customer_name`, `order_code`, `amount_vat`, `payment_status` nhưng **không có SĐT**. → Ruling plan: "thu nối SĐT → `customers` → đơn Sales → HĐ ra" (spec #17) rút thành **SĐT → `customers` → HĐ ra cùng tên khách**; đơn Sales chỉ dùng làm gợi ý theo tên khách, ghi Việc treo để bật lại khi Sales có đơn + SĐT.
- **Khuôn Excel thu chi T8** (`Báo cáo thu chi - Tháng 8.xlsx`): tab `Báo cáo chi` header hàng 1, 15 cột `Ngày · Tháng · Nội dung chi · Số tiền trước VAT · Số tiền sau VAT · Số tiền lũy kế trong tháng · Tài khoản · Phân loại chi phí · Tình trạng thanh toán · Không hoàn tiền · HĐ · Note · Đã hoàn · Tình trạng hoá đơn · Link chứng từ`; tab `Báo cáo thu` header **hàng 3**, 11 cột `Ngày · Tháng · Nội dung thu · Số tiền sau VAT · Số tiền trước VAT · Số tiền lũy kế trong tháng · Tài khoản · Phân loại thu · Mã đối tượng · Note · Column 11`; tab `Tiền mặt ngân hàng` 8 cột `Ngày · VCB 63 · VCB21 · TCB · Đầu kỳ · Thu · Chi · Cuối kỳ`. Quy ước: chi `D` = số ÂM; có HĐ và có thuế → `E` = tổng âm, `D = E/1.08`; không thì `D` = tổng, `E` trống. Thu `D` = tiền có, `E = D/1.08` chỉ dòng Bán hàng. `Tháng` = số (8). `Tình trạng thanh toán` luôn `Đã TT`, `Không hoàn tiền` luôn `Không hoàn tiền`, `HĐ` = `Có HĐ`/`Không HĐ`. `Phân loại chi phí` = mã KMCP (`cp.qc`…) hoặc `Chuyển tiền nội bộ`/`HÀNG HOÁ`. `Phân loại thu` ∈ `Bán hàng` | `Chuyển tiền nội bộ` | `Lãi ngân hàng` | `Hoàn tiền`. `Mã đối tượng` ∈ MST | `KHL` | `KHSP` | `chưa có thông tin`. `Số tiền lũy kế` để trống. `Nội dung chi` = nội dung rút gọn (VCB21: phần sau `DG:` tới dấu `.`; VCB63: bỏ tiền tố `IBBIZ…\.\d+\.`).
- **Tool Python cũ KHÔNG có code sao kê** → không có golden parity; nghiệm thu bằng số đo ở trên + CEO soát.
- 24 mã KMCP (`public.expense_category`): `cp.642khac cp.bank cp.bhxh cp.ccdc cp.congdoan cp.congtac cp.dichuyen cp.dvkt cp.freelance cp.hoahong cp.kiemdinh cp.kol cp.luong cp.phucloi cp.qc cp.quatangbh cp.shopeemall cp.tangbh cp.thuekho cp.tiepkhach cp.ttqt cp.vanhanhchung cp.vattukho DVVC`.
- `accounting.sources.kind` đã cho `bank_vcb21|bank_vcb63|bank_tcb` (migration 00). `accounting.rules.kind` check `supplier|keyword|product_name` (constraint tự đặt tên `rules_kind_check`).

## Global Constraints

- **DB:** schema `accounting` KHÔNG expose; app chỉ qua RPC `public.ke_toan_*(p_email text, …)` `language plpgsql/sql security definer set search_path = ''`, mỗi RPC gọi `accounting.nv(p_email)` (vai `admin|ke_toan|tai_chinh|ceo`), cuối migration `revoke all … from public, anon, authenticated; grant execute … to service_role`. Bảng mới: RLS bật, 0 policy, grant `service_role` tường minh.
- **PostgREST nạp `safeupdate`** (bẫy 9): mọi `UPDATE`/`DELETE` trong RPC phải có `WHERE`; mỗi RPC mới thêm smoke qua `POST /rest/v1/rpc/...` vào `tools/scripts/smoke_local.py`.
- **Migration:** `supabase/migrations/<YYYYMMDDhhmmss UTC>_ke_toan_NN_<ten>.sql`, dòng 2 "Cách lùi nếu hỏng". Workflow 6 bước (`rules/supabase-mcp.md`): commit + push → CI `db-reset` xanh trên đúng commit → `apply_migration` (MCP) → SELECT ledger, sửa `version` về số hiệu file nếu lệch → `get_advisors` → docs. Migration đã áp = bất biến. **Controller làm bước push/CI/apply (Ruling R6 lát 2–4), implementer chỉ viết file + smoke + commit.**
- **Guard test** `apps/web/lib/ke-toan-guard.test.ts`: mọi `async function` trong file action khu Kế toán chạm DB phải gọi `chanKeToan()`/`goi()`; hàm có `try {` phải `await chanKeToan()` **trước** `try`; không `p_email` từ client. Task 6 mở rộng guard sang `app/ke-toan/sao-ke/actions.ts`.
- **Máy Windows không có Docker/Supabase local:** kiểm tự động = `npx tsc --noEmit`, `npm run test`, `npm run build`, `npx eslint lib/ke-toan app/ke-toan` (từ `apps/web`); demo CEO = `cd apps/web && npx next dev --webpack -p 3000` cắm **prod**, đăng nhập `ai@gwt.vn`. Implementer không đăng nhập được → ghi kịch bản click vào report.
- **Không commit PII.** Sao kê thật ở `data/ke-toan/Báo cáo tài chính/Báo cáo tài chính/Sao kê các tài khoản NH/2026.08/` (gitignore; tên thư mục NFD → glob `B*o c*o t*i ch*nh`). Fixture ở `apps/web/lib/ke-toan/__fixtures__/` phải che: tên người → `KH-<n>`, SĐT → `0900000<nnn>` ổn định, số tài khoản/số bút toán/CIF → `#`, tên công ty giữ, số tiền giữ. Quét `python tools/scripts/scan_pii_secrets.py <file>` sạch mới commit. Golden T8 hoá đơn 322/322 giữ.
- **Excel:** xuất chỉ `exceljs`; đọc `.xls` bằng `xlsx` (đã có), đọc PDF bằng `pdfjs-dist` (thêm 1 dep, pin exact). Không thêm dep khác.
- **Luật = dữ liệu:** luật sao kê là dòng `rules` kind `bank_keyword` (seed trong migration, sửa qua DB/lát 7), engine chỉ tra; không hằng luật trong TS ngoài nhận diện cấu trúc (`noi bo`, `interest`).
- **UI:** Tailwind, màu khu `#3f8a6a`, bảng `text-xs`, ô chọn >10 mục dùng `OChonGoiY` từ `@/bang` (`MucChon = { gt, nhan, phu? }`), lọc theo `docs/CHUAN-FILTER.md` (`BoLocChon`, tham số URL). Nhãn tiếng Việt có dấu; tên hàm/biến tiếng Việt không dấu (`docVcb`, `khopSaoKe`); cột DB snake_case tiếng Anh.
- **Commit:** `feat|fix|docs(ke-toan): …`, trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; nhánh `feat/ke-toan-lat-5` cắt từ `feat/ke-toan-hoa-don` (rule CEO 16/09: lát mới gộp về nhánh khu, lên `main` khi CEO test xong cả khu); push cuối mỗi task.

---

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `supabase/migrations/20260916100000_ke_toan_11_sao_ke.sql` | bảng `bank_lines`, `rules.kind` thêm `bank_keyword` + 14 luật seed, RPC `ke_toan_sao_ke_nhap/list/sua` |
| `apps/web/lib/ke-toan/sao-ke/kieu.ts` | kiểu `TaiKhoan`, `DongSaoKe`, `SaoKe`, `HoaDonTom`, `KhachTom`, `Khop`, `KetQuaKhop` |
| `apps/web/lib/ke-toan/sao-ke/noi-dung.ts` | `rutGonNoiDung`, `timSdt`, `laNoiBo`, `laLaiNganHang`, `tuKhoa` (thuần, không crypto) |
| `apps/web/lib/ke-toan/chuan-hoa.ts` | thêm `khoaSaoKe` (sha1) |
| `apps/web/lib/ke-toan/nhap/khoa-sao-ke.ts` | `ganKhoaSaoKe(dong[], taiKhoan)` đếm `lan` như `ganKhoaDong` |
| `apps/web/lib/ke-toan/doc-file/vcb.ts` | `saoKeTuBangVcb(rows, taiKhoan)` thuần + `docVcb(buf, taiKhoan)` (xlsx) |
| `apps/web/lib/ke-toan/doc-file/tcb-pdf.ts` | `saoKeTuMucChu(items)` thuần + `mucChuTuPdf(buf)` (pdfjs) + `docTcbPdf(buf)` |
| `apps/web/lib/ke-toan/sao-ke/khop-sao-ke.ts` | `gomHoaDon(lines)`, `khopSaoKe(dong, hoaDon, khach, donHang)` |
| `apps/web/lib/ke-toan/engine/sao-ke.ts` | `phanLoaiSaoKe(dong, luatBank, khop)` |
| `apps/web/lib/ke-toan/xuat/excel-thu-chi.ts` | `dungExcelThuChi({ ky, dong, soDuDau })` |
| `apps/web/app/ke-toan/sao-ke/actions.ts` | `uploadSaoKe`, `saoKeCuaKy`, `suaSaoKe`, `danhSachHoaDonKy` |
| `apps/web/app/ke-toan/sao-ke/[ky]/{page.tsx,FormUploadSaoKe.tsx,DongSaoKe.tsx}` · `xuat/route.ts` | màn sao kê + xuất |
| `tools/scripts/ke_toan_sinh_fixture_sao_ke.py`, `tools/scripts/ke_toan_tcb_muc_chu.mjs` | sinh fixture che PII từ file thật |

---

### Task 1: Migration 11 — `bank_lines`, luật `bank_keyword`, RPC sao kê, smoke

**Files:**
- Create: `supabase/migrations/20260916100000_ke_toan_11_sao_ke.sql`
- Modify: `tools/scripts/smoke_local.py` (thêm khối sau khối migration 10)

**Interfaces (Produces):**
- `public.ke_toan_sao_ke_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb` → `{"inserted": n, "updated": n}`. Mỗi phần tử `p_rows` = cột của `bank_lines` (trừ id/period_id/source_id/edited_*). Upsert theo `(period_id, line_key)`: dòng đã có → cập nhật `raw, row_order, balance, description, counter_name, source_id`; cột khớp/chốt (`match_kind, match_id, match_conf, suggestions, code, code_name, party_code, customer_code, has_invoice`) chỉ ghi đè khi `edited_at is null` (chưa ai chốt tay).
- `public.ke_toan_sao_ke_list(p_email text, p_period_id bigint) returns jsonb` → mảng dòng `bank_lines` order by `account, row_order`.
- `public.ke_toan_sao_ke_sua(p_email text, p_line_id bigint, p_match_kind text, p_match_id bigint, p_code text, p_code_name text, p_party_code text, p_customer_code text, p_has_invoice boolean, p_note text) returns jsonb` → `{"ok": true}`; ghi `match_conf = 'tay'`, `edited_by`, `edited_at = now()`.
- `accounting.rules.kind` chấp nhận `'bank_keyword'`; 14 luật seed origin `app`, `condition = null`, `pattern` đã `norm()` (bỏ dấu, thường).

- [ ] **Step 1: Viết migration**

```sql
-- ke_toan_11_sao_ke — lát 5: bảng bank_lines (một dòng sao kê), luật bank_keyword trong rules, RPC nhập/liệt kê/sửa sao kê.
-- Cách lùi nếu hỏng: drop function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb), public.ke_toan_sao_ke_list(text,bigint), public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text); drop table accounting.bank_lines; delete from accounting.rules where kind='bank_keyword'; alter table accounting.rules drop constraint rules_kind_check, add constraint rules_kind_check check (kind in ('supplier','keyword','product_name')).

create table accounting.bank_lines (
  id            bigserial primary key,
  period_id     bigint not null references accounting.periods(id) on delete cascade,
  source_id     bigint references accounting.sources(id) on delete set null,
  account       text not null check (account in ('VCB21','VCB63','TCB')),
  line_key      text not null,
  row_order     integer not null,
  txn_date      date not null,
  doc_no        text,
  debit         numeric not null default 0,
  credit        numeric not null default 0,
  balance       numeric,
  description   text,
  counter_name  text,                                   -- TCB: tên tài khoản đối ứng
  direction     text not null check (direction in ('thu','chi')),
  raw           jsonb,
  -- khớp (engine): match_kind pending = chưa xét; invoice = nối hoá đơn (match_id = id dòng đầu nhóm HĐ); none = "không có HĐ"
  match_kind    text not null default 'pending' check (match_kind in ('pending','invoice','none')),
  match_id      bigint,
  match_conf    text check (match_conf in ('chac','goi_y','tay')),
  suggestions   jsonb,                                  -- ≤3 gợi ý [{hoaDonId, soHd, kyHieu, ten, tongTt, canCu}]
  -- chốt
  code          text,                                   -- chi: mã KMCP | 'NOI_BO'; thu: 'BAN_HANG'|'NOI_BO'|'LAI_NH'|'HOAN_TIEN'
  code_name     text,
  party_code    text,                                   -- MST | 'KHL' | 'KHSP' | null
  customer_code text,                                   -- public.customers.customer_code khi tìm được qua SĐT
  has_invoice   boolean,
  note          text,
  engine_reason text,
  edited_by     bigint,
  edited_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (period_id, line_key)
);
create index bank_lines_period_account_idx on accounting.bank_lines(period_id, account, row_order);
alter table accounting.bank_lines enable row level security;
grant select, insert, update, delete on accounting.bank_lines to service_role;
grant usage, select on sequence accounting.bank_lines_id_seq to service_role;

alter table accounting.rules drop constraint rules_kind_check;
alter table accounting.rules add constraint rules_kind_check check (kind in ('supplier','keyword','product_name','bank_keyword'));

-- Luật sao kê (data, sửa qua DB/lát 7). pattern = norm(nội dung) chứa chuỗi. priority nhỏ = xét trước.
insert into accounting.rules (kind, pattern, target_code, condition, priority, origin, active) values
  ('bank_keyword','facebk','cp.qc',null,10,'app',true),
  ('bank_keyword','luong thang','cp.luong',null,10,'app',true),
  ('bank_keyword','freelancer','cp.freelance',null,10,'app',true),
  ('bank_keyword','bhxh','cp.bhxh',null,10,'app',true),
  ('bank_keyword','kpcd','cp.congdoan',null,10,'app',true),
  ('bank_keyword','cong doan','cp.congdoan',null,10,'app',true),
  ('bank_keyword','thu phi','cp.bank',null,10,'app',true),
  ('bank_keyword','phi qltk','cp.bank',null,10,'app',true),
  ('bank_keyword','nau com','cp.phucloi',null,10,'app',true),
  ('bank_keyword','nextgentax','cp.dvkt',null,10,'app',true),
  ('bank_keyword','van hanh kho','cp.thuekho',null,20,'app',true),
  ('bank_keyword','kiem dinh','cp.kiemdinh',null,20,'app',true),
  ('bank_keyword','chuyen phat','DVVC',null,30,'app',true),
  ('bank_keyword','van chuyen','DVVC',null,40,'app',true);

create or replace function public.ke_toan_sao_ke_nhap(p_email text, p_period_id bigint, p_source_id bigint, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_ins int := 0; v_upd int := 0;
begin
  perform accounting.nv(p_email);
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'p_rows phải là mảng'; end if;
  create temp table tmp_bl on commit drop as
    select * from jsonb_populate_recordset(null::accounting.bank_lines,
      (select coalesce(jsonb_agg((e - 'id' - 'period_id' - 'source_id' - 'edited_by' - 'edited_at' - 'created_at' - 'updated_at')
         || jsonb_build_object('period_id', p_period_id, 'source_id', p_source_id)), '[]'::jsonb)
       from jsonb_array_elements(p_rows) e));
  delete from tmp_bl a using tmp_bl b where a.line_key = b.line_key and a.row_order > b.row_order;

  with up as (
    update accounting.bank_lines l
       set raw = t.raw, row_order = t.row_order, balance = t.balance, description = t.description, counter_name = t.counter_name,
           source_id = p_source_id, updated_at = now(),
           -- kết quả engine chỉ đè khi chưa ai chốt tay
           match_kind = case when l.edited_at is null then t.match_kind else l.match_kind end,
           match_id = case when l.edited_at is null then t.match_id else l.match_id end,
           match_conf = case when l.edited_at is null then t.match_conf else l.match_conf end,
           suggestions = case when l.edited_at is null then t.suggestions else l.suggestions end,
           code = case when l.edited_at is null then t.code else l.code end,
           code_name = case when l.edited_at is null then t.code_name else l.code_name end,
           party_code = case when l.edited_at is null then t.party_code else l.party_code end,
           customer_code = case when l.edited_at is null then t.customer_code else l.customer_code end,
           has_invoice = case when l.edited_at is null then t.has_invoice else l.has_invoice end,
           engine_reason = t.engine_reason
      from tmp_bl t where l.period_id = p_period_id and l.line_key = t.line_key
     returning l.id)
  select count(*) into v_upd from up;

  with ins as (
    insert into accounting.bank_lines (period_id, source_id, account, line_key, row_order, txn_date, doc_no, debit, credit, balance,
      description, counter_name, direction, raw, match_kind, match_id, match_conf, suggestions, code, code_name, party_code,
      customer_code, has_invoice, note, engine_reason)
    select p_period_id, p_source_id, account, line_key, row_order, txn_date, doc_no, debit, credit, balance,
      description, counter_name, direction, raw, coalesce(match_kind, 'pending'), match_id, match_conf, suggestions, code, code_name, party_code,
      customer_code, has_invoice, note, engine_reason
    from tmp_bl t
    where not exists (select 1 from accounting.bank_lines l where l.period_id = p_period_id and l.line_key = t.line_key)
    on conflict (period_id, line_key) do nothing returning id)
  select count(*) into v_ins from ins;
  return jsonb_build_object('inserted', v_ins, 'updated', v_upd);
end $$;

create or replace function public.ke_toan_sao_ke_list(p_email text, p_period_id bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(l) order by l.account, l.row_order), '[]'::jsonb)
  from accounting.bank_lines l
  where accounting.nv(p_email) is not null and l.period_id = p_period_id;
$$;

create or replace function public.ke_toan_sao_ke_sua(p_email text, p_line_id bigint, p_match_kind text, p_match_id bigint, p_code text, p_code_name text,
  p_party_code text, p_customer_code text, p_has_invoice boolean, p_note text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_nv bigint; v_n int;
begin
  v_nv := accounting.nv(p_email);
  if p_match_kind not in ('pending','invoice','none') then raise exception 'match_kind không hợp lệ'; end if;
  update accounting.bank_lines set match_kind = p_match_kind, match_id = p_match_id, match_conf = 'tay', code = p_code, code_name = p_code_name,
    party_code = p_party_code, customer_code = p_customer_code, has_invoice = p_has_invoice, note = p_note,
    edited_by = v_nv, edited_at = now(), updated_at = now()
  where id = p_line_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'Không thấy dòng sao kê %', p_line_id; end if;
  return jsonb_build_object('ok', true);
end $$;

do $$ begin
  execute 'revoke all on function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_nhap(text,bigint,bigint,jsonb) to service_role';
  execute 'revoke all on function public.ke_toan_sao_ke_list(text,bigint) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_list(text,bigint) to service_role';
  execute 'revoke all on function public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text) from public, anon, authenticated'; execute 'grant execute on function public.ke_toan_sao_ke_sua(text,bigint,text,bigint,text,text,text,text,boolean,text) to service_role';
end $$;
```

Kiểm tên constraint: `grep -n "kind" supabase/migrations/*ke_toan_00*` — cột `kind text not null check (...)` không đặt tên → Postgres đặt `rules_kind_check`. Nếu migration 00 đặt tên khác, dùng tên đó.

- [ ] **Step 2: Smoke** — thêm sau khối "HDCT tải lại HDCT" trong `smoke_local.py`, dùng helper `chk`, `h(SVC)`, `U`, `ky_id` sẵn có:

```python
# --- Lát 5 (migration 11): sao kê ---
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_nguon_them", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id,
    "p_kind": "bank_vcb21", "p_file_name": "smoke-vcb21.xls", "p_storage_path": "2026-08/smoke-vcb21.xls", "p_headers": {"tai_khoan": "VCB21", "so_du_dau": 1000}, "p_row_count": 2})
src_bank = r.json()["id"] if r.status_code == 200 else None
rows_bank = [
    {"account": "VCB21", "line_key": "smoke-b1", "row_order": 1, "txn_date": "2026-08-03", "doc_no": "5254-1", "debit": 5270776, "credit": 0, "balance": 100, "description": "UHHT..DG:FACEBK *X", "direction": "chi", "raw": ["1"], "match_kind": "pending", "code": "cp.qc", "code_name": "CP quảng cáo", "has_invoice": False, "engine_reason": "luật facebk"},
    {"account": "VCB21", "line_key": "smoke-b2", "row_order": 2, "txn_date": "2026-08-09", "doc_no": "5254-2", "debit": 0, "credit": 50000000, "balance": 200, "description": "GWT chuyen tien noi bo", "direction": "thu", "raw": ["2"], "match_kind": "none", "code": "NOI_BO", "code_name": "Chuyển tiền nội bộ", "has_invoice": False},
]
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src_bank, "p_rows": rows_bank})
chk("ke_toan_sao_ke_nhap 2 dòng mới → inserted 2", r.status_code == 200 and r.json() == {"inserted": 2, "updated": 0}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id})
bl = {x["line_key"]: x for x in (r.json() if r.status_code == 200 else [])}
b1 = bl.get("smoke-b1", {})
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_sua", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_line_id": b1.get("id"), "p_match_kind": "none", "p_match_id": None,
    "p_code": "cp.vanhanhchung", "p_code_name": "CP vận hành chung", "p_party_code": None, "p_customer_code": None, "p_has_invoice": False, "p_note": "sửa tay"})
chk("ke_toan_sao_ke_sua → ok", r.status_code == 200 and r.json() == {"ok": True}, (r.status_code, r.text[:80]))
rows_bank[0]["description"] = "UHHT..DG:FACEBK *Y"
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_nhap", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id, "p_source_id": src_bank, "p_rows": rows_bank})
chk("sao_ke_nhap lại → updated 2", r.status_code == 200 and r.json() == {"inserted": 0, "updated": 2}, (r.status_code, r.text[:120]))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_list", headers=h(SVC), json={"p_email": "dev.admin@gwt.vn", "p_period_id": ky_id})
bl = {x["line_key"]: x for x in (r.json() if r.status_code == 200 else [])}
chk("upload lại: mô tả cập nhật nhưng mã chốt tay giữ (cp.vanhanhchung, match_conf tay)",
    bl.get("smoke-b1", {}).get("description") == "UHHT..DG:FACEBK *Y" and bl.get("smoke-b1", {}).get("code") == "cp.vanhanhchung" and bl.get("smoke-b1", {}).get("match_conf") == "tay",
    bl.get("smoke-b1"))
chk("dòng chưa chốt tay nhận lại engine (b2 code NOI_BO)", bl.get("smoke-b2", {}).get("code") == "NOI_BO", bl.get("smoke-b2"))
r = requests.post(f"{U}/rest/v1/rpc/ke_toan_sao_ke_sua", headers=h(SVC), json={"p_email": "dev.cs@gwt.vn", "p_line_id": b1.get("id"), "p_match_kind": "none", "p_match_id": None, "p_code": None, "p_code_name": None, "p_party_code": None, "p_customer_code": None, "p_has_invoice": False, "p_note": None})
chk("vai cs: ke_toan_sao_ke_sua BỊ từ chối 403", r.status_code == 403, r.status_code)
```

Email vai `cs` lấy đúng email đã dùng ở khối "vai cs: ke_toan_dong_sua BỊ từ chối" phía trên (grep `vai cs` trong file). `python -m py_compile tools/scripts/smoke_local.py` sạch.

- [ ] **Step 3 (controller):** push → CI `db-reset` xanh trên commit → `apply_migration` tên `ke_toan_11_sao_ke` → ledger version `20260916100000` → `get_advisors`.
- [ ] **Step 4: Commit** `feat(ke-toan): migration 11 — bank_lines, luật bank_keyword, RPC sao kê`

---

### Task 2: Kiểu, rút gọn nội dung, khoá dòng sao kê

**Files:**
- Create: `apps/web/lib/ke-toan/sao-ke/kieu.ts`, `apps/web/lib/ke-toan/sao-ke/noi-dung.ts`, `apps/web/lib/ke-toan/sao-ke/noi-dung.test.ts`, `apps/web/lib/ke-toan/nhap/khoa-sao-ke.ts`
- Modify: `apps/web/lib/ke-toan/chuan-hoa.ts` (thêm `khoaSaoKe`), `apps/web/lib/ke-toan/chuan-hoa.test.ts` (nếu có; không thì thêm case vào `noi-dung.test.ts`)

**Interfaces (Produces):**
```ts
// sao-ke/kieu.ts
export type TaiKhoan = 'VCB21' | 'VCB63' | 'TCB'
export type DongSaoKe = { rowOrder: number; ngay: string; soCt: string; no: number; co: number; soDu: number | null; noiDung: string; tenDoiUng: string | null; raw: (string | number | null)[] }   // ngay = 'YYYY-MM-DD'
export type SaoKe = { taiKhoan: TaiKhoan; tu: string | null; den: string | null; soDuDau: number | null; soDuCuoi: number | null; tongNo: number | null; tongCo: number | null; headers: string[]; dong: DongSaoKe[] }
export type HoaDonTom = { id: number; direction: 'vao' | 'ra'; kyHieu: string; soHd: string; ten: string; mst: string | null; tongTt: number; thue: number; ngay: string | null; code: string | null; lineIds: number[] }
export type KhachTom = { customerCode: string; ten: string; sdt: string | null }
export type DonHangTom = { orderCode: string; tenKhach: string; tongTt: number; ngay: string | null }
export type Khop = { hoaDonId: number; soHd: string; kyHieu: string; ten: string; mst: string | null; tongTt: number; code: string | null; canCu: string }   // mst/code chép từ HoaDonTom để engine điền partyCode/mã; hoaDonId = 0 khi là đơn Sales (chỉ hiện)
export type KetQuaKhop = { chac: Khop | null; goiY: Khop[]; sdt: string | null; khach: KhachTom | null }
// sao-ke/noi-dung.ts
export function rutGonNoiDung(noiDung: string, taiKhoan: TaiKhoan): string
export function timSdt(s: string): string | null           // 10 số bắt đầu 0, cho phép cách/chấm giữa nhóm 3-3-4
export function laNoiBo(noiDung: string): boolean          // norm chứa 'noi bo' | 'noibo'
export function laLaiNganHang(noiDung: string): boolean    // norm chứa 'interest' | 'tra lai so du' | 'lai tien gui'
export function tuKhoa(ten: unknown): Set<string>          // norm → token ≥3 ký tự, bỏ từ chung
// chuan-hoa.ts
export function khoaSaoKe(taiKhoan: string, ngay: string, soCt: string, no: number, co: number, lan = 0): string   // sha1('tk|ngay|soCt|no|co|lan')
// nhap/khoa-sao-ke.ts
export function ganKhoaSaoKe(dong: DongSaoKe[], taiKhoan: TaiKhoan): string[]
```

- [ ] **Step 1: Test đỏ** `noi-dung.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { rutGonNoiDung, timSdt, laNoiBo, laLaiNganHang, tuKhoa } from './noi-dung'
import { khoaSaoKe } from '../chuan-hoa'
import { ganKhoaSaoKe } from '../nhap/khoa-sao-ke'
describe('rút gọn nội dung sao kê', () => {
  it('VCB21 UHHT lấy phần sau DG: tới dấu chấm, gộp khoảng trắng', () =>
    expect(rutGonNoiDung('UHHT..268076..1234567.      .466238...5919.7654321.DG:FACEBK *73DRRVZD42       DUBLI.5,270,776.00VND', 'VCB21')).toBe('FACEBK *73DRRVZD42 DUBLI'))
  it('VCB63 IBBIZ bỏ tiền tố mã lệnh + số chứng từ', () => {
    expect(rutGonNoiDung('IBBIZ6076649616.017669.GWT thanh toan vat tu Xuan Lanh 0508 0608', 'VCB63')).toBe('GWT thanh toan vat tu Xuan Lanh 0508 0608')
    expect(rutGonNoiDung('IBBIZ.6076650534.6219BFTVGLLB472I.GWT thanh toan Gia Bao', 'VCB63')).toBe('GWT thanh toan Gia Bao')
    expect(rutGonNoiDung('MBBIZ1234567.GWT chuyen tien noi bo tu VCB63 sang VCB21', 'VCB21')).toBe('GWT chuyen tien noi bo tu VCB63 sang VCB21')
  })
  it('SHGD lấy sau Remark:; TCB/INTEREST giữ nguyên', () => {
    expect(rutGonNoiDung('SHGD:1234567.DD:260811.BO:CT TNHH X.Remark:GWT chuyen tien noi bo tu TCB sang VCB63', 'VCB63')).toBe('GWT chuyen tien noi bo tu TCB sang VCB63')
    expect(rutGonNoiDung('INTEREST PAYMENT', 'VCB21')).toBe('INTEREST PAYMENT')
    expect(rutGonNoiDung('  LE NAM HAI  0912 788 899 may CTD50 ', 'TCB')).toBe('LE NAM HAI 0912 788 899 may CTD50')
  })
})
describe('tín hiệu', () => {
  it('timSdt bắt 10 số liền / tách 3-3-4 / chấm; không bắt số HĐ', () => {
    expect(timSdt('LE NAM HAI 0912788899 may CTD50')).toBe('0912788899')
    expect(timSdt('Thu Huong 091278 8899 may')).toBe('0912788899')
    expect(timSdt('x 0912.788.899 y')).toBe('0912788899')
    expect(timSdt('Thanh toan GWT 50% HD 001 0726 GWT R2C')).toBeNull()
    expect(timSdt('IBBIZ6076649616.017669.GWT')).toBeNull()
  })
  it('nội bộ / lãi', () => {
    expect(laNoiBo('GWT chuyen tien noi bo tu VCB63 sang VCB21')).toBe(true); expect(laNoiBo('GWT thanh toan luong')).toBe(false)
    expect(laLaiNganHang('INTEREST PAYMENT')).toBe(true); expect(laLaiNganHang('Tra lai so du tren tai khoan - thang 08/2026')).toBe(true); expect(laLaiNganHang('thanh toan')).toBe(false)
  })
  it('tuKhoa bỏ từ chung (cong ty tnhh co phan…), giữ token ≥3', () =>
    expect([...tuKhoa('CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ XÂY DỰNG XUÂN LÀNH 01')].sort()).toEqual(['lanh', 'xay', 'xuan']))
})
describe('khoá dòng sao kê', () => {
  it('ổn định và đổi theo từng trường', () => {
    const a = khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0)
    expect(a).toBe(khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0))
    expect(a).not.toBe(khoaSaoKe('VCB21', '2026-08-03', '5254-05356', 5270776, 0, 1))
    expect(a).not.toBe(khoaSaoKe('VCB63', '2026-08-03', '5254-05356', 5270776, 0))
  })
  it('ganKhoaSaoKe: 2 dòng giống hệt (TCB không số CT) → khoá khác nhau nhờ lan', () => {
    const d = { rowOrder: 1, ngay: '2026-08-10', soCt: '', no: 0, co: 1000000, soDu: null, noiDung: 'x', tenDoiUng: null, raw: [] }
    const k = ganKhoaSaoKe([d, { ...d, rowOrder: 2 }], 'TCB')
    expect(k[0]).not.toBe(k[1]); expect(ganKhoaSaoKe([d], 'TCB')[0]).toBe(k[0])
  })
})
```
- [ ] **Step 2: Chạy → FAIL** `cd apps/web && npx vitest run lib/ke-toan/sao-ke`
- [ ] **Step 3: Implement**
```ts
// sao-ke/noi-dung.ts
import { norm } from '../chuan-hoa'   // norm() không dùng crypto — chuan-hoa import node:crypto ở đầu file; file này chỉ dùng server-side (test + action), KHÔNG import từ client component
const TU_CHUNG = new Set(['cong', 'ty', 'tnhh', 'co', 'phan', 'thuong', 'mai', 'dich', 'vu', 'san', 'xuat', 'viet', 'nam', 'quoc', 'te', 'chi', 'nhanh', 'tap', 'doan', 'tong', 'va', 'cp', 'mtv', 'thanh', 'toan', 'gwt'])
export function rutGonNoiDung(noiDung: string, taiKhoan: TaiKhoan): string {
  let s = String(noiDung ?? '')
  const dg = s.indexOf('DG:')
  if (dg >= 0) s = s.slice(dg + 3).split('.')[0]                                   // VCB21 UHHT: "DG:FACEBK *X   DUBLI.5,270,776.00VND"
  else if (/^SHGD:/.test(s) && s.includes('Remark:')) s = s.slice(s.indexOf('Remark:') + 7)
  else s = s.replace(/^(IBBIZ|MBBIZ)\.?\d+\.(?:[0-9A-Z]+\.)?/, '')                 // "IBBIZ6076649616.017669.GWT…" | "IBBIZ.6076650534.6219BFTVGLLB472I.GWT…"
  void taiKhoan
  return s.replace(/\s+/g, ' ').trim()
}
export function timSdt(s: string): string | null {
  const m = /(?<!\d)(0\d{2})[ .]?(\d{3})[ .]?(\d{4})(?!\d)/.exec(String(s ?? ''))
  return m ? m[1] + m[2] + m[3] : null
}
export function laNoiBo(noiDung: string): boolean { const n = norm(noiDung); return n.includes('noi bo') || n.includes('noibo') }
export function laLaiNganHang(noiDung: string): boolean { const n = norm(noiDung); return n.includes('interest') || n.includes('tra lai so du') || n.includes('lai tien gui') }
export function tuKhoa(ten: unknown): Set<string> { return new Set(norm(ten).split(' ').filter((t) => t.length >= 3 && !TU_CHUNG.has(t))) }
```
`khoaSaoKe` trong `chuan-hoa.ts` cạnh `khoaDong`, cùng khuôn `createHash('sha1')` với chuỗi `[taiKhoan, ngay, soCt, String(no), String(co), String(lan)].join('|')`. `ganKhoaSaoKe` chép khuôn `ganKhoaDong` (đếm `lan` theo khoá tự nhiên `tk|ngay|soCt|no|co`, sắp theo `rowOrder`).
- [ ] **Step 4: Chạy → PASS**; `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `feat(ke-toan): kiểu sao kê, rút gọn nội dung, khoá dòng sao kê`

---

### Task 3: Bộ đọc VCB `.xls` + fixture che PII

**Files:**
- Create: `apps/web/lib/ke-toan/doc-file/vcb.ts`, `apps/web/lib/ke-toan/doc-file/vcb.test.ts`, `apps/web/lib/ke-toan/__fixtures__/vcb63-t8.json`, `tools/scripts/ke_toan_sinh_fixture_sao_ke.py`

**Interfaces (Produces):** `export function saoKeTuBangVcb(rows: unknown[][], taiKhoan: 'VCB21' | 'VCB63'): SaoKe` · `export function docVcb(buf: ArrayBuffer | Uint8Array, taiKhoan: 'VCB21' | 'VCB63'): SaoKe` (đồng bộ; `xlsx` đọc BIFF).

- [ ] **Step 1: Script sinh fixture** `tools/scripts/ke_toan_sinh_fixture_sao_ke.py` (chạy trên máy dev, đọc file thật, ghi JSON che PII):
```python
"""Sinh fixture sao kê VCB đã che PII: apps/web/lib/ke-toan/__fixtures__/vcb63-t8.json = { rows: string[][] } toàn bộ ô sheet (kể cả phần đầu),
che: số tài khoản/CIF/số bút toán ≥7 số → '#', SĐT 10 số → 0900000nnn ổn định, tên người trong nội dung giữ nguyên chữ HOA của công ty,
tên cá nhân (dòng luong/freelancer/thanh toan <Tên>) → 'KH-n'. Giữ số tiền, ngày, số chứng từ ngắn, mã lệnh. Chạy: python tools/scripts/ke_toan_sinh_fixture_sao_ke.py"""
import glob, json, os, re, sys, xlrd
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = glob.glob(os.path.join(ROOT, "data", "ke-toan", "B*", "B*", "Sao k*", "2026.08", "Sao kê VCB63.xls"))[0]
OUT = os.path.join(ROOT, "apps", "web", "lib", "ke-toan", "__fixtures__", "vcb63-t8.json")
sdt, ten = {}, {}
def che(s):
    s = str(s)
    s = re.sub(r"(?<!\d)(0\d{9})(?!\d)", lambda m: sdt.setdefault(m.group(1), "0900000%03d" % (len(sdt) + 1)), s)
    s = re.sub(r"\d{7,}", lambda m: "#" * len(m.group(0)), s)
    # tên cá nhân: 2–4 từ viết Hoa Chữ Đầu ngay sau 'thanh toan' / 'Freelancer' → KH-n (công ty viết HOA toàn bộ giữ nguyên)
    s = re.sub(r"((?:thanh toan|Freelancer)\s+)((?:[A-Z][a-z]+\s){1,3}[A-Z][a-z]+)", lambda m: m.group(1) + ten.setdefault(m.group(2), "KH-%d" % (len(ten) + 1)), s)
    return s
ws = xlrd.open_workbook(SRC).sheet_by_index(0)
rows = [[che(ws.cell_value(r, c)) if ws.cell_value(r, c) != "" else "" for c in range(ws.ncols)] for r in range(ws.nrows)]
for r in rows[:13]:  # phần đầu: che chủ TK/địa chỉ/CIF; giữ nhãn, ngày, số dư đầu kỳ
    for i, v in enumerate(r):
        if i == 2 and v and not re.match(r"^[\d,]+ VND$|^\d\d/\d\d/\d{4}$|^(VND|Tài khoản)", v): r[i] = "CHU TAI KHOAN"
json.dump({"rows": rows}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(OUT, len(rows), "hàng")
```
Chạy, rồi `python tools/scripts/scan_pii_secrets.py apps/web/lib/ke-toan/__fixtures__/vcb63-t8.json` sạch; mở JSON đọc lướt: không còn tên người thật ngoài `KH-n`, không số ≥7 chữ số ngoài số tiền có dấu phẩy. Scanner còn bắt → sửa `che()` cho tới khi sạch (không dùng `--no-verify`).
- [ ] **Step 2: Test đỏ** `vcb.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import * as XLSX from 'xlsx'
import { saoKeTuBangVcb, docVcb } from './vcb'
const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/vcb63-t8.json', import.meta.url)), 'utf8')) as { rows: string[][] }
describe('docVcb — sao kê VCB .xls (BIFF)', () => {
  const sk = saoKeTuBangVcb(fx.rows, 'VCB63')
  it('đọc header: kỳ, số dư đầu, tài khoản', () => {
    expect(sk.taiKhoan).toBe('VCB63'); expect(sk.tu).toBe('2026-08-01'); expect(sk.den).toBe('2026-08-31'); expect(sk.soDuDau).toBe(393025120)
    expect(sk.headers[0]).toMatch(/^STT/)
  })
  it('45 dòng giao dịch, 43 nợ / 2 có, dòng đầu đúng ngày/số CT/tiền/số dư', () => {
    expect(sk.dong).toHaveLength(45)
    expect(sk.dong.filter((d) => d.no > 0)).toHaveLength(43); expect(sk.dong.filter((d) => d.co > 0)).toHaveLength(2)
    expect(sk.dong[0]).toMatchObject({ rowOrder: 1, ngay: '2026-08-07', soCt: '5224-17669', no: 4659560, co: 0, soDu: 388365560 })
    expect(sk.dong[0].noiDung).toMatch(/^IBBIZ/)
  })
  it('tổng nợ/có tính từ dòng; số dư cuối = số dư dòng cuối', () => {
    expect(sk.tongNo).toBe(sk.dong.reduce((s, d) => s + d.no, 0)); expect(sk.soDuCuoi).toBe(sk.dong.at(-1)!.soDu)
  })
  it('docVcb đọc buffer BIFF thật (dựng bằng xlsx từ fixture) ra cùng kết quả', () => {
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(fx.rows), 'Sheet1')
    const buf = XLSX.write(wb, { type: 'array', bookType: 'biff8' }) as ArrayBuffer
    expect(docVcb(buf, 'VCB63').dong).toHaveLength(45)
  })
  it('file không có hàng STT → lỗi rõ', () => expect(() => saoKeTuBangVcb([['a', 'b']], 'VCB21')).toThrow(/không đúng khuôn sao kê VCB/))
})
```
- [ ] **Step 3: Implement** `vcb.ts`
```ts
import * as XLSX from 'xlsx'
import type { DongSaoKe, SaoKe } from '../sao-ke/kieu'
const so = (v: unknown): number => { const s = String(v ?? '').replace(/VND/i, '').replace(/,/g, '').trim(); return s ? Math.round(Number(s)) || 0 : 0 }
const ngayIso = (ddmmyyyy: string): string => { const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(ddmmyyyy); return m ? `${m[3]}-${m[2]}-${m[1]}` : '' }
const chuoi = (v: unknown) => String(v ?? '').trim()
/** VCB DigiBiz .xls: 7 cột, header ở hàng có cột A bắt đầu 'STT'; giao dịch = cột A là số; phần đầu có 'Số dư đầu kỳ' (cột C) và 'Từ/ From' (C) · 'Đến/ To' (F). */
export function saoKeTuBangVcb(rows: unknown[][], taiKhoan: 'VCB21' | 'VCB63'): SaoKe {
  const iHdr = rows.findIndex((r) => /^STT/i.test(chuoi(r[0])))
  if (iHdr < 0) throw new Error('File không đúng khuôn sao kê VCB: không thấy hàng header "STT".')
  let tu: string | null = null, den: string | null = null, soDuDau: number | null = null
  for (const r of rows.slice(0, iHdr)) {
    const a = chuoi(r[0])
    if (/^Từ\//i.test(a)) { tu = ngayIso(chuoi(r[2])) || null; den = ngayIso(chuoi(r[5])) || null }
    if (/^Số dư đầu kỳ/i.test(a)) soDuDau = so(r[2])
  }
  const dong: DongSaoKe[] = []
  for (const r of rows.slice(iHdr + 1)) {
    if (!/^\d+(\.0+)?$/.test(chuoi(r[0]))) break
    const [ngay, soCt = ''] = chuoi(r[1]).split(' / ')
    dong.push({ rowOrder: dong.length + 1, ngay: ngayIso(ngay), soCt: soCt.replace(/\s+/g, ''), no: so(r[3]), co: so(r[4]), soDu: chuoi(r[5]) ? so(r[5]) : null,
      noiDung: chuoi(r[6]), tenDoiUng: null, raw: r.slice(0, 7).map((v) => (v == null || v === '' ? null : typeof v === 'number' ? v : String(v))) })
  }
  return { taiKhoan, tu, den, soDuDau, soDuCuoi: dong.at(-1)?.soDu ?? null, tongNo: dong.reduce((s, d) => s + d.no, 0), tongCo: dong.reduce((s, d) => s + d.co, 0),
    headers: (rows[iHdr] as unknown[]).map((h) => chuoi(h).replace(/\s+/g, ' ')), dong }
}
export function docVcb(buf: ArrayBuffer | Uint8Array, taiKhoan: 'VCB21' | 'VCB63'): SaoKe {
  const wb = XLSX.read(buf instanceof Uint8Array ? buf : new Uint8Array(buf), { type: 'array', raw: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error('File không có sheet nào.')
  return saoKeTuBangVcb(XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '' }), taiKhoan)
}
```
- [ ] **Step 4: Chạy → PASS**; thử tay trên file thật (KHÔNG commit output): `npx tsx -e` hoặc test tạm — `docVcb(readFileSync(<VCB21.xls>), 'VCB21').dong.length === 27` và `soDuDau === 42892241`; ghi số vào report.
- [ ] **Step 5: Commit** `feat(ke-toan): bộ đọc sao kê VCB .xls + fixture T8 che PII`

---

### Task 4: Bộ đọc TCB `.pdf` (pdfjs-dist) + fixture mục chữ

**Files:**
- Create: `apps/web/lib/ke-toan/doc-file/tcb-pdf.ts`, `apps/web/lib/ke-toan/doc-file/tcb-pdf.test.ts`, `apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json`, `tools/scripts/ke_toan_tcb_muc_chu.mjs`
- Modify: `apps/web/package.json` (thêm `pdfjs-dist` pin exact, phiên bản mới nhất `npm view pdfjs-dist version` lúc làm)

**Interfaces (Produces):**
```ts
export type MucChu = { trang: number; x: number; y: number; chu: string }       // y đo từ MÉP TRÊN trang (đổi từ pdfjs: y = viewport.height - transform[5])
export function saoKeTuMucChu(items: MucChu[]): SaoKe                            // thuần
export async function mucChuTuPdf(buf: ArrayBuffer | Uint8Array): Promise<MucChu[]>   // pdfjs-dist legacy
export async function docTcbPdf(buf: ArrayBuffer | Uint8Array): Promise<SaoKe>
```

- [ ] **Step 1: Cài dep + script sinh fixture** — `cd apps/web && npm i -E pdfjs-dist@<latest>`. Script `tools/scripts/ke_toan_tcb_muc_chu.mjs` (chạy `node tools/scripts/ke_toan_tcb_muc_chu.mjs` từ gốc repo; dùng chính `mucChuTuPdf` — nên viết `mucChuTuPdf` trước, script import từ `apps/web/lib/ke-toan/doc-file/tcb-pdf.ts` qua `npx tsx`; nếu tsx không có thì script tự gọi pdfjs với cùng 6 dòng code):
```js
// Sinh apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json từ Sao kê TCB.pdf thật — CHE PII: chuỗi ≥7 chữ số → '#', SĐT → 0900000nnn,
// tên tài khoản đối ứng (cột x 360–428) và tên trong diễn giải viết HOA ≥2 từ không phải công ty → 'KH-n', địa chỉ/ID khách hàng ở phần đầu → 'X'.
import { readFileSync, writeFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { mucChuTuPdf } from '../../apps/web/lib/ke-toan/doc-file/tcb-pdf.ts'
const src = globSync('data/ke-toan/B*/B*/Sao k*/2026.08/Sao kê TCB.pdf')[0]
const items = await mucChuTuPdf(readFileSync(src))
const sdt = new Map(), ten = new Map()
const CTY = /\b(CONG TY|CTY|TNHH|CO PHAN|CP|JSC|BANK|NGAN HANG|GENERAL)\b/i
const che = (m) => {
  let s = m.chu.replace(/(?<!\d)0\d{9}(?!\d)/g, (p) => sdt.get(p) ?? (sdt.set(p, `0900000${String(sdt.size + 1).padStart(3, '0')}`), sdt.get(p))).replace(/\d{7,}/g, (p) => '#'.repeat(p.length))
  if (m.x >= 360 && m.x < 428 && m.y > 320 && !CTY.test(s)) s = ten.get(s) ?? (ten.set(s, `KH-${ten.size + 1}`), ten.get(s))
  if (m.trang === 1 && m.y < 300 && /Address|Địa chỉ|Customer ID|khách hàng/.test(s)) s = 'X'
  return { ...m, chu: s }
}
writeFileSync('apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json', JSON.stringify({ items: items.map(che) }))
console.log('mục chữ:', items.length)
```
Sau khi sinh: `python tools/scripts/scan_pii_secrets.py apps/web/lib/ke-toan/__fixtures__/tcb-t8-muc-chu.json` sạch + đọc lướt JSON (grep chữ HOA 2 từ ngoài công ty → còn thì mở rộng `che`). Dòng địa chỉ trang 1 (`L1, 6 TON THAT TUNG…`) và ID khách hàng phải bị che.
- [ ] **Step 2: Test đỏ** `tcb-pdf.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { saoKeTuMucChu, type MucChu } from './tcb-pdf'
const fx = JSON.parse(readFileSync(fileURLToPath(new URL('../__fixtures__/tcb-t8-muc-chu.json', import.meta.url)), 'utf8')) as { items: MucChu[] }
describe('docTcbPdf — bóc bảng giao dịch TCB theo toạ độ chữ', () => {
  const sk = saoKeTuMucChu(fx.items)
  it('header: kỳ, số dư đầu/cuối, tổng nợ/có', () => {
    expect(sk).toMatchObject({ taiKhoan: 'TCB', tu: '2026-08-01', den: '2026-08-31', soDuDau: 508219466, soDuCuoi: 1424164833, tongNo: 500000000, tongCo: 1415945367 })
  })
  it('55 dòng: 1 nợ 500.000.000, 54 có; tổng có = header', () => {
    expect(sk.dong).toHaveLength(55)
    expect(sk.dong.filter((d) => d.no > 0)).toEqual([expect.objectContaining({ no: 500000000 })])
    expect(sk.dong.reduce((s, d) => s + d.co, 0)).toBe(1415945367)
  })
  it('dòng có thứ tự theo file (mới nhất trước): dòng 1 ngày 29/08 có 72.733 số dư 1.424.164.833; dòng 55 ngày 03/08 có 1.000.000', () => {
    expect(sk.dong[0]).toMatchObject({ rowOrder: 1, ngay: '2026-08-29', co: 72733, soDu: 1424164833 })
    expect(sk.dong[54]).toMatchObject({ rowOrder: 55, ngay: '2026-08-03', co: 1000000 })
    expect(sk.dong[54].noiDung).toMatch(/dat coc may/)
  })
  it('SĐT bị tách chữ được nối lại trong noiDung (0900000nnn liền)', () => {
    expect(sk.dong.some((d) => /0900000\d{3}/.test(d.noiDung.replace(/\s/g, '')))).toBe(true)
  })
  it('thiếu header cột Nợ/Có → lỗi khuôn', () => expect(() => saoKeTuMucChu(fx.items.filter((m) => m.chu !== 'Nợ/'))).toThrow(/khuôn TCB/))
})
```
- [ ] **Step 3: Implement** `tcb-pdf.ts`
```ts
import type { DongSaoKe, SaoKe } from '../sao-ke/kieu'
export type MucChu = { trang: number; x: number; y: number; chu: string }
const so = (s: string) => Math.round(Number(String(s).replace(/,/g, ''))) || 0
const laSo = (s: string) => /^[\d,]+$/.test(s)
const ngayIso = (s: string) => { const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s); if (m) return `${m[3]}-${m[2]}-${m[1]}`; const n = /(\d{4})-(\d{2})-(\d{2})/.exec(s); return n ? n[0] : '' }
/** Gom mục chữ thành dòng: cùng trang, |Δy| ≤ 3, sắp theo x. */
function gomDong(items: MucChu[]): { trang: number; y: number; muc: MucChu[] }[] {
  const dong: { trang: number; y: number; muc: MucChu[] }[] = []
  for (const m of [...items].sort((a, b) => a.trang - b.trang || a.y - b.y || a.x - b.x)) {
    const d = dong.at(-1)
    if (d && d.trang === m.trang && Math.abs(d.y - m.y) <= 3) d.muc.push(m); else dong.push({ trang: m.trang, y: m.y, muc: [m] })
  }
  for (const d of dong) d.muc.sort((a, b) => a.x - b.x)
  return dong
}
const chuoiDong = (muc: MucChu[]) => muc.map((m) => m.chu).join(' ').replace(/\s+/g, ' ')
/** Biên cột lấy từ header trang 1 (chữ 'Tên', 'Diễn', 'Nợ/', 'Có/', 'Phí', 'Số' của 'Số dư'); thiếu → khuôn đổi. */
function bienCot(dong: ReturnType<typeof gomDong>): { yHeader: number; ten: number; dienGiai: number; no: number; co: number; phi: number; soDu: number } {
  const hdr = dong.find((d) => d.trang === 1 && d.muc.some((m) => m.chu === 'Nợ/') && d.muc.some((m) => m.chu === 'Có/'))
  if (!hdr) throw new Error('File không đúng khuôn TCB: không thấy hàng header Nợ/ Có/.')
  const x = (chu: string, sau?: string) => { const i = hdr.muc.findIndex((m, k) => m.chu === chu && (!sau || hdr.muc[k + 1]?.chu === sau)); if (i < 0) throw new Error(`File không đúng khuôn TCB: thiếu cột ${chu}`); return hdr.muc[i].x }
  return { yHeader: hdr.y, ten: x('Tên') - 4, dienGiai: x('Diễn') - 22, no: x('Nợ/') - 2, co: x('Có/') - 2, phi: x('Phí') - 5, soDu: x('Số', 'dư/') - 7 }
}
export function saoKeTuMucChu(items: MucChu[]): SaoKe {
  const dong = gomDong(items)
  const b = bienCot(dong)
  const tieuDe = dong.filter((d) => d.trang === 1 && d.y < b.yHeader).map((d) => chuoiDong(d.muc)).join('\n')
  const lay = (re: RegExp) => { const m = re.exec(tieuDe); return m ? m[1] : null }
  const tu = lay(/From:\s*(\d{4}-\d{2}-\d{2})/), den = lay(/To:\s*(\d{4}-\d{2}-\d{2})/)
  const soDuDau = lay(/Opening balance\s+([\d,]+)/), soDuCuoi = lay(/Closing balance\s+([\d,]+)/), tongNo = lay(/Total debits\s+([\d,]+)/), tongCo = lay(/Total credits\s+([\d,]+)/)
  const ra: DongSaoKe[] = []
  let hien: (DongSaoKe & { tenMuc: string[]; dgMuc: string[] }) | null = null
  const chot = () => { if (hien) { const { tenMuc, dgMuc, ...d } = hien; d.noiDung = dgMuc.join(' ').replace(/\s+/g, ' ').trim(); d.tenDoiUng = tenMuc.join(' ').replace(/\s+/g, ' ').trim() || null; ra.push(d) }; hien = null }
  let yHdrTrang = new Map<number, number>()
  for (const d of dong) if (d.muc.some((m) => m.chu === 'Nợ/') && d.muc.some((m) => m.chu === 'Có/')) yHdrTrang.set(d.trang, d.y)
  for (const d of dong) {
    const yh = yHdrTrang.get(d.trang); if (yh == null || d.y <= yh) continue           // bỏ phần trên header của mỗi trang
    const dau = d.muc[0]
    if (dau.x < 45 && /^\d{1,3}$/.test(dau.chu)) {                                        // dòng giao dịch mới
      chot()
      hien = { rowOrder: ra.length + 1, ngay: '', soCt: '', no: 0, co: 0, soDu: null, noiDung: '', tenDoiUng: null, raw: [], tenMuc: [], dgMuc: [] }
      for (const m of d.muc.slice(1)) {
        if (m.x < b.ten) { if (!hien.ngay && ngayIso(m.chu)) hien.ngay = ngayIso(m.chu); else if (m.x >= 160 && m.x < 220) hien.soCt += m.chu }
        else if (m.x < b.dienGiai) hien.tenMuc.push(m.chu)
        else if (m.x < b.no) hien.dgMuc.push(m.chu)
        else if (m.x < b.co) { if (laSo(m.chu)) hien.no = so(m.chu) }
        else if (m.x < b.phi) { if (laSo(m.chu)) hien.co = so(m.chu) }
        else if (m.x >= b.soDu) { if (laSo(m.chu)) hien.soDu = so(m.chu) }
      }
      hien.raw = d.muc.map((m) => m.chu)
    } else if (hien) {                                                                        // dòng nối (diễn giải/tên dài) — chỉ nhận chữ trong vùng tên/diễn giải
      let coChu = false
      for (const m of d.muc) { if (m.x >= b.ten && m.x < b.dienGiai) { hien.tenMuc.push(m.chu); coChu = true } else if (m.x >= b.dienGiai && m.x < b.no) { hien.dgMuc.push(m.chu); coChu = true } }
      if (!coChu) chot()                                                                    // chân trang / dòng khác → đóng giao dịch hiện tại
    }
  }
  chot()
  // TCB liệt kê mới nhất trước — giữ nguyên thứ tự file (rowOrder theo file), người xem sắp bằng bảng.
  for (const d of ra) d.noiDung = d.noiDung.replace(/(?<!\d)(0\d{2}) (\d{3}) (\d{4})(?!\d)/g, '$1$2$3')
  return { taiKhoan: 'TCB', tu, den, soDuDau: soDuDau ? so(soDuDau) : null, soDuCuoi: soDuCuoi ? so(soDuCuoi) : null, tongNo: tongNo ? so(tongNo) : null, tongCo: tongCo ? so(tongCo) : null,
    headers: ['Số thứ tự', 'Ngày KH thực hiện', 'Ngày giao dịch', 'Số bút toán', 'Ngân hàng đối ứng', 'Tài khoản đối ứng', 'Tên tài khoản đối ứng', 'Diễn giải', 'Nợ', 'Có', 'Phí - Lãi', 'Thuế', 'Số dư'], dong: ra }
}
export async function mucChuTuPdf(buf: ArrayBuffer | Uint8Array): Promise<MucChu[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({ data: buf instanceof Uint8Array ? buf : new Uint8Array(buf), useWorkerFetch: false, isEvalSupported: false, disableFontFace: true }).promise
  const ra: MucChu[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p); const vp = page.getViewport({ scale: 1 }); const tc = await page.getTextContent()
    for (const it of tc.items) if ('str' in it && it.str.trim()) ra.push({ trang: p, x: Math.round(it.transform[4]), y: Math.round(vp.height - it.transform[5]), chu: it.str.trim() })
  }
  return ra
}
export async function docTcbPdf(buf: ArrayBuffer | Uint8Array): Promise<SaoKe> { return saoKeTuMucChu(await mucChuTuPdf(buf)) }
```
pdfjs gộp/tách chữ có thể khác pdfplumber (một item = một cụm chữ) — thuật toán chỉ dựa `x` của item và `y` của dòng nên không phụ thuộc cách tách; kiểm số dòng 55 + tổng có = header là gate.
- [ ] **Step 4: Chạy → PASS**; `npm run build` phải xanh (pdfjs-dist trong bundle server Next 16 — nếu build lỗi vì worker/canvas: thêm `serverExternalPackages: ['pdfjs-dist']` vào `next.config.*`, ghi vào report). Thử tay file thật: `docTcbPdf(readFileSync(<TCB.pdf>))` → 55 dòng, tổng có 1.415.945.367 (không commit).
- [ ] **Step 5: Commit** `feat(ke-toan): bộ đọc sao kê TCB .pdf (pdfjs-dist) + fixture mục chữ T8 che PII`

---

### Task 5: Khớp sao kê ↔ hoá đơn/khách + phân loại

**Files:**
- Create: `apps/web/lib/ke-toan/sao-ke/khop-sao-ke.ts`, `apps/web/lib/ke-toan/sao-ke/khop-sao-ke.test.ts`, `apps/web/lib/ke-toan/engine/sao-ke.ts`, `apps/web/lib/ke-toan/engine/sao-ke.test.ts`

**Interfaces (Produces):**
```ts
// khop-sao-ke.ts
export function gomHoaDon(lines: { id: number; direction: 'vao' | 'ra'; ky_hieu: string | null; so_hd: string | null; ten_ban: string | null; ten_mua: string | null; mst_ban: string | null; mst_mua: string | null; tong_thanh_toan: number | null; tien_thue: number | null; ngay_lap: string | null; code: string | null; missing_in_last_upload: boolean }[]): HoaDonTom[]
export function khopSaoKe(d: { chieu: 'thu' | 'chi'; soTien: number; noiDung: string; tenDoiUng: string | null }, hoaDon: HoaDonTom[], khach: KhachTom[], donHang: DonHangTom[]): KetQuaKhop
// engine/sao-ke.ts
export type KetQuaSaoKe = { code: string | null; codeName: string; partyCode: string | null; hasInvoice: boolean; reason: string; conf: 'cao' | 'trung binh' | 'can gan tay' }
export function taoEngineSaoKe(input: { luat: Luat[]; kmcp: MucKmcp[] }): { phanLoai: (d: { chieu: 'thu' | 'chi'; noiDung: string; tenDoiUng: string | null; soTien: number }, khop: KetQuaKhop) => KetQuaSaoKe }
```
Quy tắc khớp (đo T8 → 8 chi chắc / 6 thu chắc):
- `gomHoaDon`: bỏ `missing_in_last_upload`; nhóm theo `(direction, ky_hieu, so_hd)`; `tongTt` = Σ `tong_thanh_toan` làm tròn; `thue` = Σ `tien_thue`; `ten` = `ten_ban` (vào) / `ten_mua` (ra); `mst` tương ứng; `code` = mã chung nếu mọi dòng có cùng `code` ≠ null, ngược lại null; `id` = min id; `ngay` = min `ngay_lap`.
- Ứng viên = HĐ cùng hướng (`chi`→`vao`, `thu`→`ra`) có `tongTt === soTien`.
- Tín hiệu (mỗi tín hiệu là 1 chuỗi `canCu`): `tên NCC/khách trùng từ khoá` (`tuKhoa(hd.ten) ∩ tuKhoa(noiDung + ' ' + tenDoiUng)` ≠ ∅); `số HĐ trong nội dung` (`so_hd.length ≥ 3` và regex `(?<!\d)0*${soHd}(?!\d)` trên nội dung); `MST trong nội dung`; **thu thêm:** `SĐT → khách` (`timSdt(noiDung)` khớp `khach.sdt`) rồi `tuKhoa(khach.ten) ∩ tuKhoa(hd.ten)` ≠ ∅ → tín hiệu `khách <ten> qua SĐT`.
- `chac` = đúng **một** ứng viên có ≥1 tín hiệu. `goiY` (≤3, không chứa `chac`): ứng viên đúng tiền (nhiều tín hiệu trước) → HĐ cùng bên (từ khoá trùng, hoặc khách qua SĐT) sắp theo `|tongTt − soTien|` → thu: `donHang` cùng `tuKhoa(tenKhach)` trùng khách (chỉ để hiện, `hoaDonId = 0`, `canCu = 'đơn Sales <orderCode>'`).
- Trả `sdt`, `khach` (KhachTom qua SĐT) để engine điền `customer_code`.

Quy tắc phân loại (`engine/sao-ke.ts`):
1. `laNoiBo` → `code 'NOI_BO'`, tên `Chuyển tiền nội bộ`, conf cao, hasInvoice false.
2. `laLaiNganHang` → `'LAI_NH'` / `Lãi ngân hàng`, cao.
3. `chi`: luật `bank_keyword` (active, sắp `priority` tăng, `norm(noiDung).includes(pattern)`) → `target_code` (tên từ `kmcp`), conf cao, `hasInvoice = !!khop.chac`, `partyCode = khop.chac?.mst ?? null`; không luật mà `khop.chac?.code` → code đó, conf trung bình, `hasInvoice true`, `partyCode = mst`; còn lại `code null`, conf cần gán tay, `hasInvoice = !!khop.chac`.
4. `thu`: `norm` chứa `hoan tien` → `'HOAN_TIEN'`; còn lại `'BAN_HANG'` / `Bán hàng`; `partyCode` = `khop.chac?.mst` nếu HĐ ra của công ty (mst khác MST GWT `0110530659` — lưu ý `mst_mua` của HĐ ra là MST người mua; HĐ ra cho khách lẻ `mst_mua` rỗng) → MST; không thì tên HĐ chứa `shopee` → `'KHSP'`; có `khop.khach` hoặc `khop.chac` → `'KHL'`; không gì → `null` (Excel in `chưa có thông tin`). conf: chắc → cao; có khách/gợi ý → trung bình; không → cần gán tay.

- [ ] **Step 1: Test đỏ** `khop-sao-ke.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { gomHoaDon, khopSaoKe } from './khop-sao-ke'
import type { HoaDonTom, KhachTom } from './kieu'
const HD: HoaDonTom[] = [
  { id: 1, direction: 'vao', kyHieu: 'C26TXL', soHd: '8121', ten: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ XÂY DỰNG XUÂN LÀNH 01', mst: '0311054784', tongTt: 4659560, thue: 345153, ngay: '2026-08-08', code: 'cp.vattukho', lineIds: [1, 2] },
  { id: 3, direction: 'vao', kyHieu: 'C26TET', soHd: '220', ten: 'CÔNG TY CỔ PHẦN ETON', mst: '0314031746', tongTt: 4605152, thue: 341122, ngay: '2026-08-06', code: 'cp.thuekho', lineIds: [3] },
  { id: 4, direction: 'vao', kyHieu: 'C26MYY', soHd: '5447', ten: 'CÔNG TY CP PHÚC ANH QUỐC', mst: '3002280830', tongTt: 540000, thue: 40000, ngay: '2026-08-14', code: 'cp.tiepkhach', lineIds: [4] },
  { id: 5, direction: 'vao', kyHieu: 'C26MYY', soHd: '5489', ten: 'CÔNG TY CP PHÚC ANH QUỐC', mst: '3002280830', tongTt: 540000, thue: 40000, ngay: '2026-08-15', code: 'cp.tiepkhach', lineIds: [5] },
  { id: 9, direction: 'ra', kyHieu: 'C26TGR', soHd: '207', ten: 'Nam Hai Le', mst: null, tongTt: 16957500, thue: 1256111, ngay: '2026-08-28', code: 'CTD50NG', lineIds: [9] },
  { id: 10, direction: 'ra', kyHieu: 'C26TGR', soHd: '210', ten: 'Phạm Thị Thanh Thuý', mst: null, tongTt: 16957500, thue: 1256111, ngay: '2026-08-28', code: 'CTD50NG', lineIds: [10] },
  { id: 11, direction: 'ra', kyHieu: 'C26TGR', soHd: '202', ten: 'CÔNG TY TNHH CLEAN WATER SOLUTIONS', mst: '0314937308', tongTt: 21665000, thue: 1604815, ngay: '2026-08-25', code: 'CTD50NG', lineIds: [11] },
]
const KH: KhachTom[] = [{ customerCode: 'KH0001', ten: 'Lê Nam Hải', sdt: '0900000001' }]
describe('khopSaoKe — chi', () => {
  it('đúng tiền + tên NCC trong nội dung → chắc', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4659560, noiDung: 'GWT thanh toan vat tu Xuan Lanh 0508 0608', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toMatchObject({ hoaDonId: 1, soHd: '8121' }); expect(k.chac!.canCu).toMatch(/tên/)
  })
  it('đúng tiền nhưng không tín hiệu → gợi ý 1, không chắc', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4605152, noiDung: 'IBBIZ thanh toan', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toBeNull(); expect(k.goiY.map((g) => g.soHd)).toEqual(['220'])
  })
  it('hai HĐ cùng tiền cùng NCC → không chắc, 2 gợi ý; số HĐ trong nội dung phân định → chắc', () => {
    expect(khopSaoKe({ chieu: 'chi', soTien: 540000, noiDung: 'GWT thanh toan Phuc Anh Quoc', tenDoiUng: null }, HD, KH, []).goiY).toHaveLength(2)
    expect(khopSaoKe({ chieu: 'chi', soTien: 540000, noiDung: 'GWT thanh toan Phuc Anh Quoc HD 5489', tenDoiUng: null }, HD, KH, []).chac?.soHd).toBe('5489')
  })
  it('không đúng tiền → gợi ý HĐ cùng NCC theo chênh lệch', () => {
    const k = khopSaoKe({ chieu: 'chi', soTien: 4600000, noiDung: 'GWT thanh toan ETON van hanh kho', tenDoiUng: null }, HD, KH, [])
    expect(k.chac).toBeNull(); expect(k.goiY[0]?.soHd).toBe('220')
  })
})
describe('khopSaoKe — thu', () => {
  it('SĐT → khách → HĐ ra cùng tên, đúng tiền, dù 2 HĐ cùng tiền → chắc HĐ 207', () => {
    const k = khopSaoKe({ chieu: 'thu', soTien: 16957500, noiDung: 'LE NAM HAI 0900000001 may CTD50', tenDoiUng: 'LE NAM HAI' }, HD, KH, [])
    expect(k.sdt).toBe('0900000001'); expect(k.khach?.customerCode).toBe('KH0001'); expect(k.chac?.soHd).toBe('207'); expect(k.chac!.canCu).toMatch(/SĐT/)
  })
  it('tên công ty ở tài khoản đối ứng → chắc', () =>
    expect(khopSaoKe({ chieu: 'thu', soTien: 21665000, noiDung: 'thanh toan tien may', tenDoiUng: 'CONG TY TNHH CLEAN WATER SOLUTIONS' }, HD, KH, []).chac?.soHd).toBe('202'))
  it('không tín hiệu, 2 HĐ cùng tiền → 2 gợi ý; đơn Sales cùng khách nối vào gợi ý', () => {
    const k = khopSaoKe({ chieu: 'thu', soTien: 16957500, noiDung: 'CK', tenDoiUng: null }, HD, KH, [{ orderCode: 'SO-1', tenKhach: 'Nam Hai Le', tongTt: 16957500, ngay: '2026-08-20' }])
    expect(k.chac).toBeNull(); expect(k.goiY.map((g) => g.soHd)).toEqual(['207', '210'])
  })
})
describe('gomHoaDon', () => {
  it('gom theo số HĐ, code chung nếu đồng nhất, bỏ dòng missing', () => {
    const g = gomHoaDon([
      { id: 1, direction: 'vao', ky_hieu: 'A', so_hd: '1', ten_ban: 'X', ten_mua: null, mst_ban: '1', mst_mua: null, tong_thanh_toan: 100, tien_thue: 8, ngay_lap: '2026-08-02', code: 'cp.qc', missing_in_last_upload: false },
      { id: 2, direction: 'vao', ky_hieu: 'A', so_hd: '1', ten_ban: 'X', ten_mua: null, mst_ban: '1', mst_mua: null, tong_thanh_toan: 50, tien_thue: 4, ngay_lap: '2026-08-01', code: 'cp.vattukho', missing_in_last_upload: false },
      { id: 3, direction: 'vao', ky_hieu: 'A', so_hd: '2', ten_ban: 'Y', ten_mua: null, mst_ban: '2', mst_mua: null, tong_thanh_toan: 7, tien_thue: 0, ngay_lap: null, code: null, missing_in_last_upload: true },
    ])
    expect(g).toEqual([{ id: 1, direction: 'vao', kyHieu: 'A', soHd: '1', ten: 'X', mst: '1', tongTt: 150, thue: 12, ngay: '2026-08-01', code: null, lineIds: [1, 2] }])
  })
})
```
- [ ] **Step 2: Test đỏ** `engine/sao-ke.test.ts`
```ts
import { describe, it, expect } from 'vitest'
import { taoEngineSaoKe } from './sao-ke'
import type { Luat } from './kieu'
const L: Luat[] = [{ kind: 'bank_keyword', pattern: 'facebk', targetCode: 'cp.qc', condition: null, priority: 10, origin: 'app', active: true }, { kind: 'bank_keyword', pattern: 'van chuyen', targetCode: 'DVVC', condition: null, priority: 40, origin: 'app', active: true }]
const KM = [{ ma: 'cp.qc', ten: 'CP quảng cáo', tkNoDefault: '6421' }, { ma: 'DVVC', ten: 'CP vận chuyển', tkNoDefault: '6427' }, { ma: 'cp.vattukho', ten: 'CP vật tư kho', tkNoDefault: '6423' }]
const rong = { chac: null, goiY: [], sdt: null, khach: null }
const hd = { hoaDonId: 1, soHd: '8121', kyHieu: 'C26TXL', ten: 'XUÂN LÀNH', tongTt: 4659560, canCu: 'tên' }
describe('engine sao kê', () => {
  const e = taoEngineSaoKe({ luat: L, kmcp: KM })
  it('nội bộ / lãi trước mọi luật', () => {
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', conf: 'cao', hasInvoice: false })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'INTEREST PAYMENT', tenDoiUng: null, soTien: 1 }, rong).code).toBe('LAI_NH')
  })
  it('chi: luật facebk → cp.qc cao; không luật nhưng khớp chắc → mã HĐ trung bình; không gì → cần gán tay', () => {
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'FACEBK *73DRRVZD42 DUBLI', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'cp.qc', codeName: 'CP quảng cáo', conf: 'cao' })
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'GWT thanh toan vat tu Xuan Lanh', tenDoiUng: null, soTien: 4659560 }, { ...rong, chac: { ...hd, code: 'cp.vattukho', mst: '0311054784' } as never })).toMatchObject({ code: 'cp.vattukho', conf: 'trung binh', hasInvoice: true, partyCode: '0311054784' })
    expect(e.phanLoai({ chieu: 'chi', noiDung: 'SUPABASE (25 USD)', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: null, conf: 'can gan tay', hasInvoice: false })
  })
  it('thu: mặc định Bán hàng; MST công ty / KHSP shopee / KHL khách lẻ / null', () => {
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'CK', tenDoiUng: null, soTien: 1 }, { ...rong, chac: { ...hd, mst: '0314937308', ten: 'CÔNG TY TNHH CLEAN WATER' } as never })).toMatchObject({ code: 'BAN_HANG', partyCode: '0314937308', conf: 'cao' })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'CK', tenDoiUng: null, soTien: 1 }, { ...rong, chac: { ...hd, mst: null, ten: 'Lan anh (shopee)' } as never }).partyCode).toBe('KHSP')
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'LE NAM HAI 0900000001', tenDoiUng: null, soTien: 1 }, { ...rong, khach: { customerCode: 'KH1', ten: 'Lê Nam Hải', sdt: '0900000001' } })).toMatchObject({ partyCode: 'KHL', conf: 'trung binh' })
    expect(e.phanLoai({ chieu: 'thu', noiDung: 'hoan tien don hang', tenDoiUng: null, soTien: 1 }, rong)).toMatchObject({ code: 'HOAN_TIEN', partyCode: null })
  })
})
```
`Khop` đã có `mst`/`code` từ Task 2 → bỏ các `as never` trong test trên, truyền object `Khop` đầy đủ (`{ ...hd, mst, code }`).
- [ ] **Step 3: Implement** hai module theo quy tắc trên. `khopSaoKe` giữ thuần: không đọc DB, không dùng crypto. `taoEngineSaoKe` lọc `luat.filter(l => l.kind === 'bank_keyword' && l.active)` sắp theo `priority`.
- [ ] **Step 4: Chạy → PASS** `npx vitest run lib/ke-toan/sao-ke lib/ke-toan/engine`; golden hoá đơn vẫn 322/322.
- [ ] **Step 5: Commit** `feat(ke-toan): khớp sao kê ↔ hoá đơn/khách, engine phân loại sao kê theo luật bank_keyword`

---

### Task 6: Actions sao kê + guard test

**Files:**
- Create: `apps/web/app/ke-toan/sao-ke/actions.ts`
- Modify: `apps/web/lib/ke-toan-guard.test.ts` (kiểm thêm file mới), `apps/web/app/ke-toan/actions.ts` (export `duLieuEngine`-tương đương? KHÔNG — action sao kê tự tải luật `ke_toan_luat_list` + `expense_category` như `duLieuEngine`; nếu `duLieuEngine` chưa export thì export nó và tái dùng, tránh chép 20 dòng).

**Interfaces (Produces):**
```ts
export type KetQuaUploadSaoKe = { ok: true; taiKhoan: TaiKhoan; inserted: number; updated: number; chac: number; goiY: number; khongKhop: number } | { ok: false; error: string }
export async function uploadSaoKe(_prev: unknown, form: FormData): Promise<KetQuaUploadSaoKe>   // form: ky, tai_khoan ∈ VCB21|VCB63|TCB, file
export type SaoKeRow = { id: number; account: TaiKhoan; row_order: number; txn_date: string; doc_no: string | null; debit: number; credit: number; balance: number | null; description: string | null; counter_name: string | null; direction: 'thu' | 'chi'; match_kind: 'pending' | 'invoice' | 'none'; match_id: number | null; match_conf: 'chac' | 'goi_y' | 'tay' | null; suggestions: Khop[] | null; code: string | null; code_name: string | null; party_code: string | null; customer_code: string | null; has_invoice: boolean | null; note: string | null; engine_reason: string | null; edited_at: string | null }
export type TongTaiKhoan = { taiKhoan: TaiKhoan; soDuDau: number | null; soDuCuoi: number | null; tongNo: number; tongCo: number; tongNoHeader: number | null; tongCoHeader: number | null; soDong: number; fileName: string | null }
export async function saoKeCuaKy(ky: string): Promise<{ period: KyRow | null; dong: SaoKeRow[]; tong: TongTaiKhoan[]; hoaDon: HoaDonTom[] }>
export async function suaSaoKe(input: { lineId: number; matchKind: 'pending' | 'invoice' | 'none'; matchId: number | null; code: string | null; codeName: string | null; partyCode: string | null; customerCode: string | null; hasInvoice: boolean | null; note: string | null }): Promise<{ ok: true } | { ok: false; error: string }>
```

- [ ] **Step 1: `uploadSaoKe`** — khuôn `uploadNguon`/`nhapNguon` (đọc file `apps/web/app/ke-toan/actions.ts` để chép đúng thứ tự: `chanKeToan()` → validate → đọc file → tính hết → Storage → `ke_toan_nguon_them` → nhập → dọn rác khi lỗi → audit → `revalidatePath`):
  - validate: `ky` regex; `tai_khoan` whitelist `['VCB21','VCB63','TCB']`; đuôi file: VCB `.xls`/`.xlsx`, TCB `.pdf`; ≤ 8 MB.
  - đọc: `docVcb(buf, tk)` / `await docTcbPdf(buf)`. **Assert tổng** (HANDOFF §2B): TCB có `tongNoHeader/tongCoHeader` → Σ dòng phải bằng, lệch → `{ ok:false, error: 'Tổng nợ/có bóc được (…) ≠ header sao kê (…) — file PDF đổi khuôn, báo dev.' }`; VCB: `soDuDau + Σco − Σno` phải bằng `soDuCuoi` (dòng cuối) → lệch báo tương tự. Không có dòng → lỗi.
  - kỳ: `ke_toan_ky_tao(p_ky)` (idempotent, như upload NEXIA) — nhưng sao kê thường vào sau NEXIA; nếu kỳ chưa có vẫn tạo.
  - dữ liệu khớp: `hoaDon = gomHoaDon([...dong_list vao, ...dong_list ra])`; `khach` = `dataClient().from('customers').select('customer_code, name, phone_chuan')` (≤ 500 dòng) → `KhachTom`; `donHang` = `dataClient().from('sales_order_lines').select('order_code, customer_name, amount_vat, order_date').gte('order_date', <ky>-01).lte(...)` gom theo `order_code` (Σ `amount_vat`); luật + kmcp qua `duLieuEngine()` (export từ `actions.ts` nếu chưa).
  - mỗi dòng: `chieu = co > 0 ? 'thu' : 'chi'`; `soTien = chieu==='thu' ? co : no`; `khop = khopSaoKe(...)`; `kq = engine.phanLoai(...)`; row = `{ account, line_key: ganKhoaSaoKe(...)[i], row_order, txn_date: ngay, doc_no, debit: no, credit: co, balance: soDu, description: rutGonNoiDung(noiDung, tk), counter_name, direction: chieu, raw: [noiDung gốc, ...raw], match_kind: khop.chac ? 'invoice' : kq.code === 'NOI_BO' || kq.code === 'LAI_NH' ? 'none' : 'pending', match_id: khop.chac?.hoaDonId ?? null, match_conf: khop.chac ? 'chac' : khop.goiY.length ? 'goi_y' : null, suggestions: khop.goiY, code: kq.code, code_name: kq.codeName, party_code: kq.partyCode, customer_code: khop.khach?.customerCode ?? null, has_invoice: kq.hasInvoice, engine_reason: kq.reason }`.
  - `ke_toan_nguon_them` với `p_kind: 'bank_' + tk.toLowerCase()`, `p_headers: { tai_khoan, tu, den, so_du_dau, so_du_cuoi, tong_no: tongNoHeader ?? Σ, tong_co: …, headers }`, `p_row_count`.
  - `ke_toan_sao_ke_nhap` theo lô 200. Kết quả đếm `chac`/`goiY`/`khongKhop`.
- [ ] **Step 2: `saoKeCuaKy`** — `chanKeToan()`; `ke_toan_ky_list` tìm kỳ; `ke_toan_sao_ke_list`; `tong` từ `ke_toan_nguon_list` (kind `bank_*`, lấy file mới nhất mỗi tài khoản: `headers.so_du_dau/so_du_cuoi/tong_no/tong_co`, `file_name`) + Σ dòng; `hoaDon = gomHoaDon(dong_list vao + ra)` để màn hiện tên HĐ và ô chọn tay.
- [ ] **Step 3: `suaSaoKe`** — `chanKeToan()` rồi `goi('ke_toan_sao_ke_sua', …)`; `revalidatePath('/ke-toan/sao-ke/' + ky)` (nhận `ky` trong input hoặc revalidate cả `/ke-toan/sao-ke/[ky]` layout).
- [ ] **Step 4: Guard test** — mở `apps/web/lib/ke-toan-guard.test.ts`, đưa `app/ke-toan/sao-ke/actions.ts` vào danh sách file kiểm (cùng 3 luật). Chạy `npx vitest run lib/ke-toan-guard.test.ts` xanh; `tsc`, `eslint app/ke-toan`.
- [ ] **Step 5: Commit** `feat(ke-toan): action upload/liệt kê/sửa sao kê — khớp + phân loại lúc nhập, giữ chốt tay khi upload lại`

---

### Task 7: Màn `/ke-toan/sao-ke/[ky]`

**Files:**
- Create: `apps/web/app/ke-toan/sao-ke/[ky]/page.tsx`, `apps/web/app/ke-toan/sao-ke/[ky]/FormUploadSaoKe.tsx`, `apps/web/app/ke-toan/sao-ke/[ky]/DongSaoKe.tsx`
- Modify: `apps/web/app/ke-toan/hoa-don/[ky]/page.tsx` (link "Sao kê →" cạnh nút Tải Excel), `apps/web/app/ke-toan/page.tsx` (cột/ link "Sao kê" mỗi kỳ)

- [ ] **Step 1: `FormUploadSaoKe.tsx`** (client, `useActionState(uploadSaoKe)` như `FormUpload.tsx` — chép khuôn nút một-bước): `<select name="tai_khoan">` 3 lựa chọn `VCB21 (.xls)` · `VCB63 (.xls)` · `TCB (.pdf)`; `<input type="file" accept=".xls,.xlsx,.pdf">`; hidden `ky`; nút `Chọn file & nhập sao kê`; thông báo `Nhập N dòng · cập nhật M · chắc C · gợi ý G · chưa khớp K` (`baoXanh` 2s như DongSua).
- [ ] **Step 2: `page.tsx`** (server, `dynamic = 'force-dynamic'`): `saoKeCuaKy(ky)`; header: `← Kỳ`, `Sao kê {ky}`, nút `Tải Excel thu chi` (`/ke-toan/sao-ke/[ky]/xuat`), `FormUploadSaoKe`. **Thanh tổng 3 thẻ** (VCB21 · VCB63 · TCB): file, số dư đầu → cuối, `Nợ Σ / header` · `Có Σ / header`, tô đỏ nếu lệch, "chưa upload" nếu thiếu. Lọc theo `docs/CHUAN-FILTER.md`: `BoLocChon param="tk"` (3 TK), `param="chieu"` (Thu/Chi), `param="khop"` (`chac` Khớp chắc · `goi_y` Có gợi ý · `chua` Chưa khớp · `khong` Không có HĐ · `tay` Đã chốt tay), `OTimKiem` (nội dung/tên/số HĐ), `ThanhDangLoc`. Bảng `text-xs`: `# · TK · Ngày · Nội dung · Nợ · Có · Khớp HĐ · Mã · Đối tượng · Ghi chú · Căn cứ`. Màu dòng: `match_conf==='chac'` không tô; `goi_y` `bg-amber-50`; `pending` & không code `bg-amber-100`; `edited_at` viền trái `#3f8a6a`.
- [ ] **Step 3: `DongSaoKe.tsx`** (client, nhận `d: SaoKeRow`, `hoaDon: HoaDonTom[]`, `ma: MucChon[]`, `ky`):
  - Ô **Khớp HĐ**: `match_kind==='invoice'` → chip `HĐ {soHd} · {ten} · {tongTt}` + nút `×` (→ `suaSaoKe({ matchKind:'pending', matchId:null, hasInvoice:false, …giữ code })`); `pending` → tới 3 nút gợi ý từ `suggestions` (`hoaDonId===0` = đơn Sales: hiện nhãn xám, không bấm) mỗi nút gọi `suaSaoKe({ matchKind:'invoice', matchId, hasInvoice:true, partyCode: hd.mst ?? d.party_code, code: d.code ?? hd.code })`; `OChonGoiY` "Chọn HĐ…" `tuyChon = hoaDon.filter(cùng hướng).map(h => ({ gt: String(h.id), nhan: `${h.soHd} · ${h.ten}`, phu: h.tongTt.toLocaleString('vi-VN') }))`; nút `Không có HĐ` (→ `matchKind:'none', hasInvoice:false`).
  - Ô **Mã**: `OChonGoiY` — chi: `ma` (KMCP từ `danhSachMa()` lọc `cp.`/`DVVC`) + `{ gt:'NOI_BO', nhan:'Chuyển tiền nội bộ' }`; thu: 4 mục cố định `BAN_HANG Bán hàng · NOI_BO Chuyển tiền nội bộ · LAI_NH Lãi ngân hàng · HOAN_TIEN Hoàn tiền`. Chọn → `suaSaoKe({ code, codeName })`.
  - Ô **Đối tượng**: text nhỏ `party_code ?? '—'` + `customer_code` mờ; sửa được bằng input `onBlur`.
  - Ô **Ghi chú**: input `onBlur` → `suaSaoKe({ note })`. Mỗi `suaSaoKe` gửi đủ các trường hiện tại của dòng (RPC ghi đè toàn bộ). Thông báo lỗi `role="alert"`.
- [ ] **Step 4: Link** — `hoa-don/[ky]/page.tsx` header thêm `<Link href={`/ke-toan/sao-ke/${ky}`}>Sao kê →</Link>`; `ke-toan/page.tsx` mỗi kỳ thêm link `Sao kê`.
- [ ] **Step 5: Kiểm** tsc/test/eslint/build; đọc lại JSX đếm `<th>`/`<td>`; ghi kịch bản click vào report: upload VCB21 T8 → 27 dòng, 24 FACEBK có mã `cp.qc`; upload VCB63 → 45 dòng, ≥8 chắc; upload TCB → 55 dòng, ≥6 chắc, thanh tổng TCB "Có 1.415.945.367 / 1.415.945.367"; bấm gợi ý → chip; sửa mã → viền xanh; F5 giữ; upload lại VCB63 → `cập nhật 45`, chốt tay còn nguyên.
- [ ] **Step 6: Commit** `feat(ke-toan): màn sao kê — upload 3 tài khoản, thanh tổng, chọn gợi ý/chốt tay tại ô`

---

### Task 8: Excel thu chi

**Files:**
- Create: `apps/web/lib/ke-toan/xuat/excel-thu-chi.ts`, `apps/web/lib/ke-toan/xuat/excel-thu-chi.test.ts`, `apps/web/app/ke-toan/sao-ke/[ky]/xuat/route.ts`

**Interfaces (Produces):**
```ts
export type DongThuChi = { taiKhoan: TaiKhoan; ngay: string; noiDung: string; no: number; co: number; soDu: number | null; code: string | null; codeName: string | null; partyCode: string | null; hasInvoice: boolean; thueHoaDon: number; note: string | null }
export async function dungExcelThuChi(input: { ky: string; dong: DongThuChi[]; soDuDau: Record<TaiKhoan, number | null> }): Promise<Uint8Array>
```
Quy tắc (đo khuôn T8):
- Tab `Báo cáo chi` (dòng `no > 0`, sắp theo ngày rồi tài khoản): header hàng 1 đúng 15 tên; `A` = ngày (kiểu Date, định dạng `dd/mm/yyyy`); `B` = tháng số; `C` = `noiDung`; `E` = `-no` nếu `hasInvoice && thueHoaDon > 0` else null; `D` = `E != null ? Math.round(-no / 1.08 * 1000) / 1000 : -no`; `F` null; `G` = tài khoản; `H` = `code === 'NOI_BO' ? 'Chuyển tiền nội bộ' : code ?? ''`; `I` `Đã TT`; `J` `Không hoàn tiền`; `K` = `hasInvoice ? 'Có HĐ' : 'Không HĐ'`; `L` = note; `M..O` trống.
- Tab `Báo cáo thu` (dòng `co > 0`): hàng 1–2 trống, header hàng 3 đúng 11 tên (kể cả `Column 11`); `D` = co; `E` = `code === 'BAN_HANG' ? co/1.08 : null`; `G` TK; `H` = map `BAN_HANG→Bán hàng, NOI_BO→Chuyển tiền nội bộ, LAI_NH→Lãi ngân hàng, HOAN_TIEN→Hoàn tiền`; `I` = `partyCode ?? 'chưa có thông tin'`; `J` note.
- Tab `Tiền mặt ngân hàng`: một dòng mỗi ngày của tháng `ky` (1..cuối tháng): `B/C/D` = số dư TK sau giao dịch cuối của ngày ≤ hôm đó (dùng `soDu` dòng; ngày chưa có giao dịch → `soDuDau` của TK; TK chưa upload → null); `E Đầu kỳ` = Σ 3 TK cuối ngày hôm trước (ngày 1: Σ `soDuDau`); `F Thu` = Σ `co` trong ngày; `G Chi` = Σ `no`; `H Cuối kỳ` = `E + F − G`. Cột `B` tiêu đề `VCB 63` (có dấu cách, đúng khuôn).
- Định dạng: số `#,##0`, header đậm nền `F2F2F2`, `coCotTheoNoiDung` từ `excel-hoa-don.ts` cho mỗi tab.

- [ ] **Step 1: Test đỏ**
```ts
import { describe, it, expect } from 'vitest'
import ExcelJS from 'exceljs'
import { dungExcelThuChi, type DongThuChi } from './excel-thu-chi'
const D: DongThuChi[] = [
  { taiKhoan: 'VCB21', ngay: '2026-08-03', noiDung: 'FACEBK *73DRRVZD42 DUBLI', no: 5270776, co: 0, soDu: 37621465, code: 'cp.qc', codeName: 'CP quảng cáo', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null },
  { taiKhoan: 'VCB63', ngay: '2026-08-07', noiDung: 'GWT thanh toan vat tu Xuan Lanh', no: 4659560, co: 0, soDu: 388365560, code: 'cp.vattukho', codeName: 'CP vật tư kho', partyCode: '0311054784', hasInvoice: true, thueHoaDon: 345153, note: 'HĐ 8121' },
  { taiKhoan: 'VCB63', ngay: '2026-08-09', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', no: 50000000, co: 0, soDu: 338365560, code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null },
  { taiKhoan: 'VCB21', ngay: '2026-08-09', noiDung: 'GWT chuyen tien noi bo tu VCB63 sang VCB21', no: 0, co: 50000000, soDu: 87621465, code: 'NOI_BO', codeName: 'Chuyển tiền nội bộ', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null },
  { taiKhoan: 'TCB', ngay: '2026-08-03', noiDung: 'LE NAM HAI 0900000001 may CTD50', no: 0, co: 1000000, soDu: 509219466, code: 'BAN_HANG', codeName: 'Bán hàng', partyCode: 'KHL', hasInvoice: true, thueHoaDon: 74074, note: null },
  { taiKhoan: 'TCB', ngay: '2026-08-25', noiDung: 'INTEREST PAYMENT', no: 0, co: 5843, soDu: 509225309, code: 'LAI_NH', codeName: 'Lãi ngân hàng', partyCode: null, hasInvoice: false, thueHoaDon: 0, note: null },
]
async function doc(buf: Uint8Array) { const wb = new ExcelJS.Workbook(); await wb.xlsx.load(buf); return wb }
describe('Excel thu chi', () => {
  it('tab chi: 15 cột đúng tên, D/E theo quy ước VAT, HĐ, phân loại', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Báo cáo chi')!
    expect(ws.getRow(1).values).toEqual([undefined, 'Ngày', 'Tháng', 'Nội dung chi', 'Số tiền trước VAT', 'Số tiền sau VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại chi phí', 'Tình trạng thanh toán', 'Không hoàn tiền', 'HĐ', 'Note', 'Đã hoàn', 'Tình trạng hoá đơn', 'Link chứng từ'])
    expect(ws.rowCount).toBe(4)
    expect(ws.getCell(2, 4).value).toBe(-5270776); expect(ws.getCell(2, 5).value).toBeNull(); expect(ws.getCell(2, 8).value).toBe('cp.qc'); expect(ws.getCell(2, 11).value).toBe('Không HĐ'); expect(ws.getCell(2, 2).value).toBe(8)
    expect(ws.getCell(3, 5).value).toBe(-4659560); expect(ws.getCell(3, 4).value).toBeCloseTo(-4314407.407, 2); expect(ws.getCell(3, 11).value).toBe('Có HĐ'); expect(ws.getCell(3, 12).value).toBe('HĐ 8121')
    expect(ws.getCell(4, 8).value).toBe('Chuyển tiền nội bộ'); expect(ws.getCell(2, 9).value).toBe('Đã TT'); expect(ws.getCell(2, 10).value).toBe('Không hoàn tiền')
  })
  it('tab thu: header hàng 3, E=D/1.08 chỉ Bán hàng, mã đối tượng', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Báo cáo thu')!
    expect(ws.getRow(3).values).toEqual([undefined, 'Ngày', 'Tháng', 'Nội dung thu', 'Số tiền sau VAT', 'Số tiền trước VAT', 'Số tiền lũy kế trong tháng', 'Tài khoản', 'Phân loại thu', 'Mã đối tượng', 'Note', 'Column 11'])
    expect(ws.getCell(4, 4).value).toBe(1000000); expect(ws.getCell(4, 5).value).toBeCloseTo(925925.926, 2); expect(ws.getCell(4, 8).value).toBe('Bán hàng'); expect(ws.getCell(4, 9).value).toBe('KHL')
    expect(ws.getCell(5, 8).value).toBe('Chuyển tiền nội bộ'); expect(ws.getCell(5, 5).value).toBeNull(); expect(ws.getCell(5, 9).value).toBe('chưa có thông tin')
    expect(ws.getCell(6, 8).value).toBe('Lãi ngân hàng')
  })
  it('tab tiền mặt: 31 ngày, số dư kéo theo ngày, Đầu/Thu/Chi/Cuối', async () => {
    const wb = await doc(await dungExcelThuChi({ ky: '2026-08', dong: D, soDuDau: { VCB21: 42892241, VCB63: 393025120, TCB: 508219466 } }))
    const ws = wb.getWorksheet('Tiền mặt ngân hàng')!
    expect(ws.getRow(1).values).toEqual([undefined, 'Ngày', 'VCB 63', 'VCB21', 'TCB', 'Đầu kỳ', 'Thu', 'Chi', 'Cuối kỳ'])
    expect(ws.rowCount).toBe(32)
    expect(ws.getCell(2, 5).value).toBe(42892241 + 393025120 + 508219466)                     // ngày 1: đầu kỳ = Σ số dư đầu
    expect(ws.getCell(2, 3).value).toBe(42892241)                                              // VCB21 ngày 1 chưa giao dịch → số dư đầu
    expect(ws.getCell(4, 3).value).toBe(37621465); expect(ws.getCell(4, 7).value).toBe(5270776) // ngày 3: VCB21 sau FACEBK; Chi = 5.270.776
    expect(ws.getCell(4, 6).value).toBe(1000000)                                               // Thu ngày 3 = TCB 1.000.000
    expect(ws.getCell(10, 9).value).toBe(ws.getCell(10, 5).value as number + 50000000 - 50000000) // ngày 9 nội bộ: cuối = đầu
  })
})
```
- [ ] **Step 2: Implement** `excel-thu-chi.ts` bằng exceljs `new Workbook()` (không template), 3 tab theo quy tắc; ngày kiểu `Date` (UTC 00:00) `numFmt 'dd/mm/yyyy'`; tiền `numFmt '#,##0'`. Route `xuat/route.ts`: `chanKeToan` qua `saoKeCuaKy(ky)` → map `SaoKeRow` → `DongThuChi` (`thueHoaDon` = `hoaDon.find(h => h.id === match_id)?.thue ?? 0`, `hasInvoice = !!has_invoice`), `soDuDau` từ `tong`; trả `Content-Disposition: attachment; filename*=UTF-8''Báo cáo thu chi - MM.YYYY.xlsx` (mẫu `hoa-don/[ky]/xuat/route.ts`); không có dòng → redirect `?loi=Chưa có sao kê`.
- [ ] **Step 3: Chạy → PASS**; mở file xuất từ dữ liệu thật (test tạm, không commit) so với `Báo cáo thu chi - Tháng 8.xlsx`: cùng số dòng chi 68 / thu 59; ghi số dòng khác mã vào report.
- [ ] **Step 4: Commit** `feat(ke-toan): xuất Báo cáo thu chi MM.YYYY.xlsx (chi 15 cột, thu 11 cột, tiền mặt NH theo ngày)`

---

### Task 9: README, việc treo, kịch bản CEO

**Files:**
- Modify: `docs/ke-toan/README.md` (Route thêm `/ke-toan/sao-ke/[ky]`; Quy trình tháng bước 6; Trạng thái lát 5; Bẫy 15: TCB PDF bóc theo toạ độ — khuôn đổi thì gate tổng có/nợ chặn; Bẫy 16: VCB `.xls` BIFF chỉ `xlsx` đọc được; Điểm treo: TCB có Excel? → thay `docTcbPdf` bằng nhánh Excel, giữ `saoKeTuMucChu` làm dự phòng; Việc treo: "đơn Sales chưa có SĐT → khớp thu chưa nối đơn; bật khi `sales_orders` có dữ liệu"; "công nợ từ kết quả khớp (Q23-b)"; "luật `bank_keyword` sửa qua DB tới lát 7"), `HANDOFF.md` mục khu Kế toán (1 dòng route mới).

- [ ] **Step 1:** viết README theo khuôn các mục sẵn có (đọc file trước, thêm vào đúng chỗ, giữ đánh số Bẫy/Việc treo liên tục).
- [ ] **Step 2:** Kịch bản CEO (ghi report + README "Nghiệm thu lát 5"): `localhost:3000/ke-toan/hoa-don/2026-08` → `Sao kê →` → upload VCB21/VCB63/TCB T8 → thanh tổng 3 TK khớp header → lọc `Có gợi ý` → bấm gợi ý → `Tải Excel thu chi` → so 3 tab với `Báo cáo thu chi - Tháng 8.xlsx`.
- [ ] **Step 3: Commit** `docs(ke-toan): lát 5 — sao kê, thu chi, bẫy TCB/VCB, việc treo`

---

## Sau plan này

| Lát | Điều kiện vào | Ghi chú |
|---|---|---|
| 5b | CEO trả lời TCB Business có xuất Excel/CSV | thêm `docTcbExcel`, đo header bằng `ke_toan_do_header.py`; PDF thành dự phòng |
| 6 Google | service account + share Sheet/Drive | Sheet mirror thêm tab `Thu`, `Chi` từ `bank_lines` |
| 7 màn luật | — | thêm kind `bank_keyword` vào bộ lọc |
| Công nợ | lát 5 chạy thật 2 tháng | Q23-b spec §12 |

## Self-review (16/09)

- **Spec coverage:** #17 (a) tự điền mã → Task 5/6/8; khớp chắc mới tự nối, ≤3 gợi ý → Task 5 (`chac`/`goiY` ≤3) + Task 7 UI; thu nối SĐT → `customers` → HĐ ra → Task 5 (đơn Sales rút thành gợi ý, ghi Việc treo — lệch spec có chủ đích vì `sales_orders` rỗng); §5 `bank_lines` → Task 1 (thêm `counter_name`, `engine_reason`, bỏ `settings` không đụng); §6 `doc-file/vcb`, `tcb-pdf`, `khop-sao-ke` → Task 3/4/5; §7 route sao kê "ba tài khoản, tổng nợ/có so với sao kê, mỗi dòng chắc/3 gợi ý/chọn tay/không có HĐ" → Task 7; §8 Excel thu chi 15/11 cột + Tiền mặt NH → Task 8; §10 test đọc file xls BIFF + pdf TCB che số TK → Task 3/4 fixture; "assert tổng nợ/có khớp 100% trước khi ghi" (HANDOFF) → Task 6 gate. Chưa phủ: lưu Drive/Sheet (lát 6), công nợ (ngoài phạm vi).
- **Placeholder:** không còn TBD; các bước "chép khuôn X" đều chỉ tên file + hàm cụ thể.
- **Type consistency:** `Khop` có `mst`, `code` (Task 2 định nghĩa, Task 5 engine dùng); `KetQuaKhop` dùng ở Task 5/6; `SaoKeRow.suggestions: Khop[]`; `DongThuChi.thueHoaDon` lấy từ `HoaDonTom.thue` (Task 5 `gomHoaDon` tính); `TaiKhoan` dùng xuyên suốt; RPC `ke_toan_sao_ke_sua` 10 tham số khớp `suaSaoKe` 8 trường + `p_email` + `p_line_id`.
