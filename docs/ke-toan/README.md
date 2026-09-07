# Khu Kế toán — hoá đơn NEXIA (lát 1)

Spec: `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` · Plan lát 1:
`docs/plans/2026-09-04-ke-toan-lat-1-hoa-don-dau-vao.md`

## Kiến trúc tóm tắt

- Schema `accounting` (SalesTracking `bwzmqfbcgouhvhoslmmm`), **không expose**; app đi qua RPC
  `public.ke_toan_*` (khuôn khu Việc) qua `dataClient()` sau khi gác `chanKeToan()`
  (`requireNhanSu` + `coTheVaoKeToan`, vai trò `admin | ke_toan | tai_chinh | ceo`).
- Engine phân loại: `apps/web/lib/ke-toan/engine/dau-vao.ts` — hàm thuần, port 1:1 từ
  `gwt_ketoan/engine.py` + `gwt_ketoan/nexia.py` (Python gốc). Nghiệm thu bằng fixture T8
  (`__fixtures__/`, đã che PII) — parity **322/322** dòng tầng 0/A/B/goods.
- Luật: `accounting.rules` (seed từ Rule Excel + overrides + lịch sử tên hàng, 659 dòng). Sửa
  luật trên app từ lát 2; **file Excel Rule không còn là nguồn sự thật** sau khi seed.
- File gốc: Storage bucket `accounting` (private), đường dẫn `<kỳ>/<timestamp>-<tên file>`.
- Danh mục: `public.expense_category` gương từ Masterdata qua `sync_catalog()` (24 dòng); catalog
  từ `public.catalog_item`.

## Route

- `/ke-toan` — danh sách kỳ (`YYYY-MM`) + tạo kỳ mới.
- `/ke-toan/hoa-don/[ky]` — upload file NEXIA `.xlsx`, bảng đầu vào (cột engine: mã, TK Nợ/Có,
  VAT, độ tin cậy — dòng vàng = engine không chắc).
- `GET /ke-toan/hoa-don/[ky]/xuat` — tải Excel `_DAXULY.xlsx` (dựng bằng `exceljs`).
- Launcher "Kế toán" trong `TopNav` cho các vai trò trên.

## Config ngoài migration (ghi để dựng lại được)

- Không có (lát 1). Lát 6 sẽ thêm biến môi trường `GOOGLE_SERVICE_ACCOUNT_KEY` và
  `accounting.settings`.

## Chạy local

- Cổng dev **3501–3503** (dải riêng khu Kế toán, xem `CLAUDE.md`).
- Vai trò vào: `admin | ke_toan | tai_chinh | ceo`. Tài khoản local: `dev.admin@gwt.vn` (chuẩn,
  xem `CLAUDE.md`) hoặc tạo email khác trong Studio local bằng `tools/user-local.sh` để thử vai
  trò `ke_toan`/`tai_chinh` riêng — đừng đụng 2 tài khoản chuẩn `dev.admin@gwt.vn`/`dev.sales@gwt.vn`.
- Sinh lại fixture/seed khi tool Python đổi: `python tools/scripts/ke_toan_sinh_golden.py`,
  `python tools/scripts/ke_toan_sinh_luat_sql.py` (cần `data/ke-toan/`, có PII — không commit).

## Quy trình tháng (lát 1)

1. `/ke-toan` → tạo kỳ `YYYY-MM`.
2. Upload file NEXIA `.xlsx`.
3. Xem bảng đầu vào, dòng vàng = engine không chắc.
4. Tải `_DAXULY.xlsx` gửi kế toán (dòng chưa có mã người dùng điền tay trong Excel — lát 2 sửa
   trên app).

## Trạng thái (07/09/2026)

- Migration 00–05 đã áp lên production, ledger đã sửa khớp số hiệu file (xem "Bẫy đã gặp").
- tsc/test/build sạch. **Máy Windows không có Docker/Supabase local** → nghiệm thu e2e 07/09 làm
  bằng `next dev -p 3000` cắm **DB production** (`.env.local.prod`, CEO chốt vì không có local);
  cổng 3000 vì Supabase Auth chỉ cho redirect Google về `localhost:3000` (cổng 3501 chưa nằm
  trong Redirect URLs — thêm ở Dashboard → Authentication → URL Configuration là Config, ghi đây).
- CEO đã xem màn kỳ + màn upload 07/09: sửa tương phản (bẫy 10), ô chọn tháng, gộp một nút upload.
  Upload file T8 thật lần đầu lộ bẫy 9 → migration 05. Chưa đối chiếu Excel `_DAXULY` với golden.

## Điểm treo

- Tab 5 Excel Rule ("TK Nợ bắt buộc", vd `cp.qc → 6417`) KHÁC `expense_category.tk_no_default`
  (6427). App theo Masterdata. CEO quyết với Masterdata.
- Lint CI đỏ từ 22/08 (7 lỗi cũ) — ngoài phạm vi khu này; đếm lỗi không được tăng khi commit vào
  khu Kế toán (xem `npx eslint .`).

## Bẫy đã gặp (khi build lát 1)

1. **MCP `apply_migration` ghi `version` = giờ áp thực tế, không lấy số hiệu trong tên file** —
   ledger 4 migration Kế toán đã bị lệch, đã sửa lại đúng số hiệu `20260904040000…040300` trong
   cùng phiên (luật `supabase-mcp.md`: sau khi áp phải SELECT ledger đối chiếu).
2. **`create extension http` phải nằm trong migration 00**, không tách riêng — CI `db-reset` và
   `branch` dựng từ 0 nên extension phải có mặt trước khi các migration sau dùng nó.
3. **`expense_category` phải revoke `anon`/`authenticated` tường minh** — default ACL của schema
   `public` cấp quyền rộng hơn mong muốn cho bảng gương này; migration phải tự chỉnh, không dựa
   vào ACL "sẵn có" trên live.
4. **Migration 03 tồn tại vì migration 02 tính sai `so_canh_bao`**: cột này đang đếm cả dòng
   hướng `ra` (hoá đơn đầu ra) thay vì chỉ đếm dòng `vao` (đầu vào, việc của lát 1). Migration 02
   đã áp lên live nên **bất biến** — không sửa, phải vá bằng migration 03 riêng.
5. **2 luật NCC cá nhân bị che tên khi sinh seed SQL** (`tools/scripts/ke_toan_sinh_luat_sql.py`,
   nhóm `CA_NHAN`) — pattern trong DB thành `ncc ca nhan {i} (che ten — nhap lai qua app)`, không
   còn khớp tên NCC thật. Chưa ảnh hưởng T8 (không phát sinh giao dịch qua 2 luật này trong batch
   đó) nhưng phải nhập lại tên thật qua app ở lát sau (mục "Việc treo" bên dưới).
6. **Engine `catalogLookup` lọc `cp.*`/tính chất "Dịch vụ" SỚM hơn Python**: `nexia.py._is_goods()`
   không lọc trước khi dựng `_CAT_EXACT`/`_CAT_HARD`, chỉ loại 4 mã dịch vụ (`DVVC`/`DVBT`/`DVLD`/
   `DVSC`) SAU khi lookup; bản TS (`apps/web/lib/ke-toan/engine/dau-vao.ts`) lọc ngay lúc dựng
   `catExact`/`catHard`/`catTc`. Trung tính với catalog hiện tại (đúng 4 dòng tính chất "Dịch vụ"
   trong `expense_category` là 4 mã đó) — xem comment tại chỗ trong file; sẽ lệch nếu Masterdata
   thêm dòng "Dịch vụ" mã khác.
7. **Guard test `apps/web/lib/ke-toan-guard.test.ts` chỉ bắt hàm khai báo `async function`**, dựa
   trên tách chuỗi theo từ khoá đó — một action viết dạng arrow function
   (`export const foo = async (...) => {}`) sẽ lọt qua cả 4 assertion mà không báo lỗi, kể cả khi
   thiếu `chanKeToan()`. Hiện tại (04/09) mọi action trong `app/ke-toan/actions.ts` đều là
   `async function` nên chưa lộ ra, nhưng đây là lỗ hổng test — xem "Việc treo".
8. **File NEXIA thật có thể liệt kê CÙNG một dòng nhiều lần trong 1 hoá đơn** (cùng ký hiệu/số
   HĐ/tên hàng chuẩn hoá/thành tiền — vd hoá đơn nhà hàng liệt kê 1 món ăn 4 lần) — `khoaDong()`
   bản đầu (không có `lan`) sinh CÙNG line_key cho các dòng này → vi phạm unique
   `(period_id, line_key)` ngay trong lô insert đầu tiên (đo được: file T8 thật có 12 nhóm trùng,
   415 dòng chỉ có 387 khoá tự nhiên). Vá bằng `lan` (thứ tự xuất hiện, xem
   `lib/ke-toan/nhap/khoa-dong.ts`) trong line_key + dedupe intra-lô/`on conflict do nothing` ở
   `ke_toan_dong_nhap` (migration 04) — mục "Việc treo" c cũ, nay đã sửa.

9. **PostgREST trên Supabase nạp `safeupdate`** (`authenticator` có `session_preload_libraries =
   supautils, safeupdate`) → mọi `UPDATE`/`DELETE` **không có WHERE** bị chặn, kể cả bên trong hàm
   `security definer` gọi qua RPC. Đo được 07/09/2026 khi upload file NEXIA T8 thật lên production:
   "UPDATE requires a WHERE clause" — `update tmp_dong set …` trong `ke_toan_dong_nhap` (migration 02/04).
   Vá bằng migration 05 (gắn cột ngay lúc dựng temp table, không UPDATE). CI `db-reset` không bắt được
   vì smoke chưa gọi `dong_nhap` — nay smoke gọi qua HTTP như app. **Luật rút ra:** RPC nào cũng phải có
   phép thử smoke đi qua `/rest/v1/rpc/…`, và không viết UPDATE/DELETE trần trên temp table.
10. **Windows dark mode làm chữ không khai báo màu thành trắng**: `globals.css` đổi `--foreground`
   theo `prefers-color-scheme: dark` trong khi nền trang vẫn `bg-slate-50`. Khu Kế toán gán
   `text-slate-900` ở `<main>`; bẫy này là toàn app (xem "Việc treo" r).

## Việc treo sau lát 1

Không ghi `BACKLOG.md`/`backlog/*.md` (hệ backlog do CEO quản, xem
`docs/agents/issue-tracker.md`) — CEO tự chuyển các mục dưới vào backlog nếu muốn theo dõi.

a. Sửa baseline migration dựng-từ-0 đầy đủ (phương án 2), thay cho bản truy lĩnh local-only
   19/08 + 22/08 hiện tại.
b. Rule Excel tab 5 ("TK Nợ bắt buộc") lệch `expense_category.tk_no_default` — cần chị Trang/CEO
   chốt bên nào đúng (xem "Điểm treo").
c. ~~`ke_toan_dong_nhap` nên đổi sang `on conflict do nothing` để tái nhập không lỗi.~~ **Đã sửa**
   (migration 04, cùng lúc thêm dedupe intra-lô cho lỗi `lan`/line_key trùng — mục 8, "Bẫy đã gặp").
d. Nhập lại tên thật cho 2 NCC cá nhân đã bị che tên trong seed luật (mục 5, "Bẫy đã gặp").
e. Engine `catalogLookup` lọc sớm hơn Python (mục 6, "Bẫy đã gặp") — cân nhắc đồng bộ hai bên khi
   Masterdata thêm dòng "Dịch vụ" mã mới, hoặc chấp nhận lệch có ghi chú.
f. Guard test `ke-toan-guard.test.ts` chưa bắt action viết dạng arrow function (mục 7, "Bẫy đã
   gặp") — mở rộng regex tách hàm để bắt cả hai dạng khai báo.
g. 2 luật rác `Mã hàng` / `_x0008_LDPOU` trong seed 01 — CEO quyết xoá bằng data migration (chưa
   xoá vì golden T8/parity đọc seed 01).
h. `tuHdct` trong export gán nhầm khi upload NEXIA lần 2 cùng kỳ.
i. Headers export lấy từ nguồn đầu tiên — cần kiểm shape khi file sau khác cột.
j. `xlsx@0.18.5` có advisory (prototype pollution/ReDoS) — chỉ 4 vai mới upload được, cân nhắc đổi
   parser.
k. 9 entry ledger live 20260820–20260821 có `statements` rỗng (tồn đọng trước nhánh) — branch
   Supabase sẽ thiếu.
l. E2e file NEXIA thật chưa chạy trên máy này.
m. `uploadNexia`: nếu `ke_toan_nguon_them` lỗi SAU khi upload Storage xong thì file gốc thành rác
   (chưa dọn) — mở rộng cleanup bọc cả bước đó.
n. `ghiAudit('ke_toan.upload_nexia_loi')` trong nhánh lỗi chưa bọc try — nếu audit lỗi sẽ che mất
   thông điệp lỗi gốc.
o. `ke_toan_dong_nhap` dedupe trong lô im lặng (dồn vào `kept`) — nên trả thêm `deduped` để lộ hồi quy
   của `lan` phía app.
p. `missing_in_last_upload` chưa có chỗ nào set `true` (chỉ set `false` khi update) — lát 2 làm khi
   xử lý upload lại file đã sửa.
q. `ganKhoaDong` map theo `rowOrder` và giả định duy nhất — `rowOrder` trùng sẽ gộp khoá im lặng.
r. `globals.css` đổi màu chữ theo dark mode của OS dù app không có giao diện tối (bẫy 10) — sửa tận
   gốc là bỏ khối `@media (prefers-color-scheme: dark)`; file dùng chung, cần CEO gật + báo khu khác.
s. Màn Kế toán dùng xanh lá `#3f8a6a` tự đặt, khác accent teal `#0e8c9a` của Sales/Work — đồng bộ khi
   polish.
