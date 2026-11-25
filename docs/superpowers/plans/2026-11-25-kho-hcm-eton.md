# Sổ kho HCM tự động từ Eton — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Job 15 phút trên Mac mini đọc báo cáo "Nhập xuất tồn" của CCP Eton (chỉ đọc), ghi mỗi dòng vào `wh_master` `warehouse='HCM'`, đăng tin thông báo theo chứng từ, và Bắp nhắn riêng anh Dũng khi lỗi / hết phiên.

**Architecture:** Ba file cạnh bot NX trong GWT-Agent-Team: `hcm-doc.mjs` (IO trình duyệt, khoá chỉ đọc), `hcm-so.mjs` (thuần: dòng Eton → dòng sổ, gom tin, quyết báo lỗi), `hcm-chay.mjs` (một lượt + lệnh phụ). DB thêm một cột `eton_key` (Masterdata, chỉ bổ sung). App chỉ sửa chỗ hiện link chứng từ.

**Tech Stack:** Node 22 ESM, `node:test`, Playwright (Chromium, `launchPersistentContext`), Supabase REST (service_role, như `sb()` của NX), Discord REST, launchd qua `mac/cai-launchd.sh`.

**Spec:** `docs/superpowers/specs/2026-11-25-kho-hcm-eton-design.md` (repo gwt-app, nhánh `docs/kho-hcm-eton`). Kết quả spike + endpoint: `docs/kho/handoff-2026-11-25-kho-hcm-eton.md` mục 1b.

## Global Constraints

- **Không request ghi nào lên CCP.** Khoá nằm trong code (`ctx.route` fail-closed), danh sách POST cho phép chốt cứng — không dùng regex động từ như spike.
- Masterdata **chỉ bổ sung**: không sửa/xoá cột, ràng buộc, hàm `wh_*` đang có. Migration ở repo **GWT-Masterdata**, đi đủ 6 bước `~/.claude/gwt-rules/supabase-mcp.md` (CI `db-reset` xanh trước khi áp live; SELECT ledger sau khi áp).
- Mọi tình trạng hàng Eton đều tính vào tồn (CEO chốt 25/11). `condition_raw` giữ nguyên chữ Eton.
- `qty` theo quy ước sổ: `Nhập`/`Xuất` dương, `Điều chỉnh` có dấu (`wh__qty_dau`).
- `discord_msg_id` của dòng HCM = `'eton:' + eton_key`, `line_no = 1` (tiền lệ `'kiemke:'+uuid`; vì `eton_key` duy nhất nên không bao giờ đụng ràng buộc cũ `UNIQUE (discord_msg_id, line_no)`). `keeper = 'Eton'`, `reviewed_by = 'bot:eton'`.
- Discord token = token Bắp `~/.claude/channels/discord/.env` `DISCORD_BOT_TOKEN`; Supabase = `~/Bots/.secrets/admin.env` (phải chứa `qynpywysgltspmgnhhga`); DM qua `admin/chung/dm.mjs` `dmDung(text, { env: { DISCORD_BOT_TOKEN, DUNG_USER_ID } })`.
- Tin thông báo: kênh test `1566765911690575983` khi `che_do:'test'`; `#kho-eton` khi `'that'`. Không SĐT/tên khách. Không đăng tin cho dòng nạp cũ.
- Hồ sơ trình duyệt `~/Bots/.eton-ccp/` — ngoài repo, không commit. Không commit dữ liệu Eton (mã đơn sàn) vào repo/test fixture thật — fixture dùng mã giả.
- Nhãn launchd mới `com.gwt.bap.khohcm` (kiểm plist trỏ đúng `~/Bots/GWT-Agent-Team` — bẫy chung tiền tố với `gwt-discord-bot`).

## Review Focus

1. **Hết phiên giữa chừng** — CCP chuyển về `idp.eton.vn/login` hoặc trả HTML thay JSON → lượt dừng, **không ghi gì**, DM `dang_nhap` đúng một lần. Test: Task 2 `quyetBaoLoi` + Task 3 `docNhapXuat` ném `LoiDangNhap` khi body không phải JSON.
2. **Hai dòng Eton cùng `eton_key` trong một lượt** → cộng `qty`, không mất số. Test: Task 2 `gopTrungKhoa`.
3. **Tình trạng lạ chưa gặp** (`[Kho] Hư hết`, `Thất lạc`…) → vẫn ghi, trả về cảnh báo để log. Test: Task 2 `dongSo` trả `canh_bao`.
4. **Chứng từ lẫn dòng có mã và dòng chưa mã** → vẫn đăng một tin, dòng chưa mã có `⏳`; dòng chưa mã vào sổ `need_review`. Test: Task 2 `tinThongBao`.
5. **Điều chỉnh không có `ObjectCode`** (AdjustInventory) → `chungTu` = `TransType`, khoá vẫn duy nhất, không sinh `discord_msg_id = 'eton:'` rỗng. Test: Task 2 `khoaEton`/`chungTu`.

---

### Task 1: Cột `eton_key` trên `wh_master` (GWT-Masterdata)

**Files:**
- Create: `supabase/migrations/<UTC yyyymmddHHMMSS>_wh_master_eton_key.sql` (repo GWT-Masterdata, worktree mới từ `origin/main`, nhánh `feat/wh-eton-key`)
- Modify: `scripts/smoke_local.py` (thêm một khối kiểm cuối file)
- Modify: `docs/` schema wh (dòng mô tả cột mới — file nào đang mô tả `wh_master` thì thêm vào đó)

**Interfaces:**
- Produces: `public.wh_master.eton_key text null` + ràng buộc `wh_master_eton_key_key UNIQUE (eton_key)` (không dùng chỉ mục một phần: PostgREST `on_conflict` không suy được chỉ mục có `WHERE` → 42P10; NULL vẫn được nhiều dòng). REST upsert được bằng `on_conflict=eton_key`.

- [ ] **Step 1: Viết migration** — header 1 dòng "Cách lùi nếu hỏng: `alter table public.wh_master drop constraint if exists wh_master_eton_key_key, drop column if exists eton_key;`". Thân: `alter table public.wh_master add column if not exists eton_key text;` + thêm ràng buộc `wh_master_eton_key_key unique (eton_key)` (guard tồn tại qua `pg_constraint` trong khối `do $$`). Không grant mới (bảng đã có grant).
- [ ] **Step 2: Thêm smoke** — trong `smoke_local.py`, theo kiểu `sql_vai`/psql đang có: insert 2 dòng `wh_master` `warehouse='HCM'` cùng `eton_key='SMOKE|X|SO_PACKED|1'` (dòng 2 dùng `discord_msg_id` khác) → lệnh thứ hai phải lỗi `23505`; xoá dòng smoke. `chk("wh_master.eton_key: trùng khoá bị chặn", …)`.
- [ ] **Step 3: Chạy local nếu máy có Docker** — `npx supabase db reset && python scripts/smoke_local.py` → ALL OK.
- [ ] **Step 4: Commit + push, chờ CI** — `git commit -m "feat(wh): cột eton_key cho sổ kho HCM (Eton)"`; `gh run list -w db-reset -c <sha>` → ✓.
- [ ] **Step 5: Áp live** — gọi tên đích "GWT-Masterdata qynpy…"; `apply_migration` tên khớp file; SELECT `supabase_migrations.schema_migrations` → version ≠ số hiệu file thì sửa bằng `execute_sql`; `get_advisors` security (báo WARN/ERROR mới).
- [ ] **Step 6: Docs schema + push** — commit docs, push; mở PR.

### Task 2: Phần thuần `hcm-so.mjs`

**Files:**
- Create: `admin/kho/hcm-so.mjs`, `admin/kho/hcm-so.test.mjs` (repo GWT-Agent-Team)

**Interfaces:**
- Consumes: `chuanTen` từ `../../shopee/kho-nx-doc.mjs`.
- Produces:
  - `chungTu(x) -> string` — `x.ObjectCode || x.TransType`.
  - `khoaEton(x) -> string` — `` `${chungTu(x)}|${x.Sku}|${x.TransType}|${x.ConditionType}` ``.
  - `loaiCua(x) -> 'Nhập'|'Xuất'|'Điều chỉnh'` — `ObjectType==='AdjustInventory' || TransType==='Other'` → Điều chỉnh; `ActualQty<0` → Xuất; còn lại Nhập.
  - `taoGhepMa({ catalog, aliasSp, whAlias }) -> (sku, client, rawName) => {ma, cach}|null` — `catalog`: `[{ "Mã nội bộ", "Mã đối tác/Kho" }]`; `aliasSp`: `[{alias, internal_code}]` (`product_code_alias`); `whAlias`: `[{raw_norm, internal_code}]`. Thứ tự, dừng ở cái ra đúng một mã: với `s` lần lượt `sku`, `client`: (1) `s` = Mã nội bộ, (2) `s` là một token (tách `/[^A-Za-z0-9-]+/`) của đúng một dòng "Mã đối tác/Kho", (3) `alias === s`; cuối cùng (4) `whAlias` theo `chuanTen(rawName)`. `cach` ∈ `'ma_noi_bo'|'ma_kho'|'alias_sp'|'wh_alias'`.
  - `dongSo(x, ghep, { luc }) -> { dong, canh_bao: string|null }` — dòng `wh_master` (cột theo bảng 5.3 spec): `warehouse:'HCM', eton_key, discord_msg_id:'eton:'+eton_key, line_no:1`, `ngay: x.TransDate.slice(0,10)`, `loai`, `qty` (|ActualQty| trừ Điều chỉnh), `raw_name: `${x.Sku} ${x.ProductName}``, `internal_code`, `condition_raw: x.ConditionTypeName`, `condition_group: 'moi'`, `kenh_xuat: SO_PACKED→'khach'`, `*TRANSFER*`→`'noi_bo'`, khác null, `purpose: x.TransDesc`, `note`: `đơn <ObjectExternalCode>` khi khác `ObjectCode`, `keeper:'Eton'`, `map_status` `'auto'|'pending'`, `review_status` `'approved'|'need_review'`, `reviewed_by` `'bot:eton'|null`, `source_ts: luc`. `canh_bao` khi `ConditionTypeName` ∉ `TINH_TRANG_BIET`.
  - `TINH_TRANG_BIET = ['Hàng mới', '[Client] Hư hộp', 'Hàng chờ xử lý', '[Client] Hư 1 phần']`.
  - `gopTrungKhoa(items) -> items` — cùng `khoaEton` thì cộng `ActualQty`, giữ dòng đầu.
  - `tinThongBao(dongs, tenMa: Map<ma,ten>) -> [{ chung_tu, noi_dung }]` — một tin mỗi chứng từ (`chung_tu = eton_key.split('|')[0]`); dòng đầu `` `${dd/mm} kho HCM ${nhập|xuất|điều chỉnh}` `` (nhiều loại → ghép bằng ` · `), mỗi dòng hàng `` `${tenMa.get(ma) ?? ProductName} : ${qty}` `` + ` (đơn X)` nếu có + ` (${condition_raw})` nếu ≠ Hàng mới + ` ⏳` nếu chưa mã. ≤ 1900 ký tự (cắt, thêm `… (+n dòng)`).
  - `quyetBaoLoi(trangThai, ketQua) -> { nhan: string|null, trangThai }` — `trangThai = { mo: { [loai]: {tu, dem} } }`; `ketQua = { loi: null | {loai, chi_tiet} }`. `dang_nhap`, `bi_chan`, `ghi_loi` → nhắn ngay lần đầu; `eton_loi` → nhắn khi `dem` đạt 2; cùng loại đang mở → `nhan:null`. `ketQua.loi===null` và có loại đang mở → `nhan` = `"Kho HCM chạy lại bình thường."`, xoá `mo`. Chữ nhắn `dang_nhap` đúng như spec 5.6.

- [ ] **Step 1: Viết test** (fixture giả, không dùng mã đơn thật):
  - `khoaEton`/`chungTu`: dòng AdjustInventory `ObjectCode:null, TransType:'Giảm tồn ( CONVERT_DAMAGE_TO_QUARANTINE 1 )'` → khoá bắt đầu bằng TransType; `discord_msg_id` ≠ `'eton:'`.
  - `loaiCua`: `SO_PACKED, -1` → Xuất; `RECEIVE_RETURN, 2` → Nhập; `AdjustInventory, -23` → Điều chỉnh.
  - `taoGhepMa`: `GTEC-30A02-G` qua `"Mã quốc tế v2: GTEC-30A02-G"` → `{ma:'GTEC-30A01-G', cach:'ma_kho'}`; `C00000131` + alias → `VOISEN-LOITHOM`; `Sku:'GT-PCF10-F02G', client:'LX-PCF-004-G'` → `GT-PCF10-F02G` `ma_noi_bo`; `KH182-B` → `null`; token xuất hiện ở 2 dòng catalog → không chọn bước (2).
  - `dongSo`: SO_PACKED −1 có mã → `qty 1, loai 'Xuất', review_status 'approved', kenh_xuat 'khach'`; Điều chỉnh −23 → `qty -23`; `[Kho] Hư hết` → `canh_bao` khác null, dòng vẫn có.
  - `gopTrungKhoa`: hai item cùng khoá `-1` và `-2` → một item `-3`.
  - `tinThongBao`: chứng từ có 1 dòng có mã + 1 dòng chưa mã → 1 tin, chứa `⏳`, dòng hư hộp có `([Client] Hư hộp)`.
  - `quyetBaoLoi`: `eton_loi` lượt 1 → null, lượt 2 → nhắn; `dang_nhap` hai lượt liền → nhắn 1 lần; lượt sạch sau lỗi → "Kho HCM chạy lại bình thường."
- [ ] **Step 2: Chạy, thấy FAIL** — `cd admin && node --test kho/hcm-so.test.mjs` → lỗi import.
- [ ] **Step 3: Viết `hcm-so.mjs`** theo Interfaces, không IO.
- [ ] **Step 4: Chạy, thấy PASS** — cùng lệnh; `cd admin && npm test` vẫn xanh.
- [ ] **Step 5: Commit** — `git commit -m "feat(kho-hcm): phần thuần dòng Eton → sổ, gom tin, báo lỗi"`.

### Task 3: Bộ đọc CCP `hcm-doc.mjs`

**Files:**
- Create: `admin/kho/hcm-doc.mjs`, `admin/kho/hcm-doc.test.mjs`
- Modify: `admin/package.json` (thêm `"playwright": "1.65.1"` — bản đã cài thử trên Mac mini), `admin/package-lock.json`

**Interfaces:**
- Produces:
  - `HO_SO = join(homedir(), 'Bots', '.eton-ccp')`.
  - `POST_CHO` (so theo `origin + pathname`, bỏ query) = đăng nhập `https://idp.eton.vn/login`, `https://ccp.eton.vn/signin-oidc`; dữ liệu `https://ccp.eton.vn/Report/GetReportInventoryInboundAndOutbound`; và 7 POST đọc mà trang báo cáo tự gọi khi mở (đo ở spike 25/11): `/reportHub/negotiate`, `/ActionCenter/GetActionCenterInformation`, `/Report/AllWarehouses`, `/Report/AllObjectTypes`, `/Report/AllTradingTypes`, `/Report/GetConditionTypes`, `/Category/GetCategoryByClient` (tiền tố `https://ccp.eton.vn`). Không có trong danh sách → chặn + `biChan` (dấu hiệu Eton đổi giao diện).
  - `choPhep(method, url) -> boolean` — `GET`/`OPTIONS` → true; `POST` có `origin+pathname` ∈ `POST_CHO` → true; còn lại false.
  - `class LoiDangNhap extends Error`, `class LoiEton extends Error`.
  - `moTrinhDuyet({ coGiaoDien = false, biChan }) -> { ctx, page, dong() }` — `chromium.launchPersistentContext(HO_SO, { headless: !coGiaoDien, viewport: null })`; `ctx.route(/eton\.vn/, …)` dùng `choPhep`, abort kèm gọi `biChan(method, url)` (bỏ qua `idp.eton.vn/csp/report` — chặn nhưng không báo).
  - `docNhapXuat(page, { tu: 'YYYY-MM-DD', den: 'YYYY-MM-DD' }) -> Items[]` — `page.goto('https://ccp.eton.vn/Report/ReportInventoryInboundAndOutbound')`; URL sau goto thuộc `idp.eton.vn` → ném `LoiDangNhap`. Gọi `fetch` trong trang (form-urlencoded, header `x-requested-with: XMLHttpRequest`) với `FromDate` = `tu` 00:00 giờ VN dưới dạng ISO UTC (ngày trước `T17:00:00.000Z`), `ToDate` = `den` 23:59:59 VN, `WarehouseId=-1`, `RecordsPerPage=1000`, lặp `PageIndex` tới `TotalPages`. Body không parse được JSON → `LoiDangNhap`; `HasError` → `LoiEton(ErrorMessages)`.
  - `mocNgay(ngay) -> string` (thuần, export để test): `'2026-11-25'` → `'2026-11-24T17:00:00.000Z'`.

- [ ] **Step 1: Viết test** cho phần thuần: `choPhep('GET', 'https://ccp.eton.vn/Product/CreateSingle')` → true; `choPhep('POST', 'https://ccp.eton.vn/Report/GetReportInventoryInboundAndOutbound')` → true; `choPhep('POST', 'https://ccp.eton.vn/SaleOrder/Cancel')` → false; `choPhep('POST', 'https://ccp.eton.vn/Report/AllWarehouses')` → true; `choPhep('POST', 'https://ccp.eton.vn/Report/GetInventoryReport')` → false (đọc nhưng không cần — danh sách là trắng, không theo động từ); `choPhep('POST', 'https://idp.eton.vn/login?signin=abc')` → true; `choPhep('PUT', 'https://ccp.eton.vn/x')` → false; `mocNgay('2026-11-25')` như trên; `mocNgay('2026-01-01')` → `'2025-12-31T17:00:00.000Z'`.
- [ ] **Step 2: Chạy, thấy FAIL** — `cd admin && node --test kho/hcm-doc.test.mjs`.
- [ ] **Step 3: Viết `hcm-doc.mjs`** + thêm playwright vào `admin/package.json`, `npm i` (không `playwright install` trên CI — test không mở trình duyệt).
- [ ] **Step 4: Chạy, thấy PASS**; `npm test` admin xanh.
- [ ] **Step 5: Thử thật trên Mac mini (chỉ đọc)** — chép hồ sơ spike `cp -R ~/Bots/ccp-spike/ho-so ~/Bots/.eton-ccp`; `node -e` gọi `moTrinhDuyet` + `docNhapXuat({tu:'2026-11-18', den:'2026-11-25'})` → in số dòng (> 0) và 0 lần `biChan` ngoài csp/report.
- [ ] **Step 6: Commit** — `git commit -m "feat(kho-hcm): bộ đọc CCP Eton chỉ đọc (khoá route trong code)"`.

### Task 4: Một lượt + lệnh phụ `hcm-chay.mjs`, cấu hình `kho-hcm.json`

**Files:**
- Create: `admin/kho/hcm-chay.mjs`, `admin/kho/hcm-chay.test.mjs`, `kenh/kho-hcm.json`

**Interfaces:**
- Consumes: Task 2 (mọi hàm), Task 3 (`moTrinhDuyet`, `docNhapXuat`, `LoiDangNhap`, `LoiEton`), `sb` không dùng lại — viết `dbHcm(env)` riêng cùng khuôn `sb()` NX (fetch REST + `demLuuLuong` từ `./bo-dem.mjs`), `guiKenh` từ `../sales/bao-don.mjs`, `dmDung` từ `../chung/dm.mjs`.
- `kenh/kho-hcm.json`: `{ "_help": "...", "che_do": "test", "kenh_test": "1566765911690575983", "kenh_that": "<id #kho-eton>", "bat_dau": "<ISO lúc bật>", "lui_ngay": 7 }`.
- Trạng thái: `~/Bots/logs/khohcm-trang-thai.json` = `{ tin: { [discord_msg_id]: discord_message_id }, mo: {...} }` (ghi nguyên tử: file tạm + `renameSync`).
- Produces:
  - `dbHcm(e) -> { danhMuc(), aliasSp(), whAlias(), daCo(khoas: string[]) -> Set<string>, ghi(dongs) }` — `daCo` = `wh_master?select=eton_key&eton_key=in.(…)` (chia lô 100; mỗi giá trị bọc ngoặc kép, `"` và `\` thoát bằng `\`, rồi `encodeURIComponent` — khoá điều chỉnh có dấu cách và ngoặc); `ghi` = `POST wh_master?on_conflict=eton_key` với `Prefer: resolution=ignore-duplicates,return=minimal`.
  - `chayLuot({ doc, db, gui, dm, ch, tt, homNay }) -> { tt, ket_qua: { moi, tin, canh_bao: string[], loi } }` — đọc `[homNay − lui_ngay, homNay]` → `gopTrungKhoa` → `dongSo` → bỏ khoá `daCo` → `ghi` → `tinThongBao` cho chứng từ mới có `ngay ≥ bat_dau.slice(0,10)` và chưa có trong `tt.tin` → `gui(kenh, noi_dung)` lưu id → `quyetBaoLoi` → `dm(nhan)` nếu có. Lỗi: `LoiDangNhap`→`dang_nhap`, `LoiEton`/mạng→`eton_loi`, lỗi Supabase/Discord→`ghi_loi`; có `biChan` ngoài csp/report → `bi_chan`. Lỗi đọc → không ghi, không gửi.
  - CLI: `node admin/kho/hcm-chay.mjs luot` (launchd), `dang-nhap` (mở có giao diện, chờ đóng cửa sổ), `nap-cu --tu 2026-06-01` (đọc tới hôm nay, ghi, **không gửi tin**, in tổng `qty` có dấu theo mã để đối chiếu Eton).

- [ ] **Step 1: Viết test `chayLuot`** với `doc/db/gui/dm` giả:
  - 2 item mới (1 có mã, 1 chưa mã) cùng chứng từ → `db.ghi` nhận 2 dòng, `gui` gọi 1 lần, `tt.tin` có chứng từ.
  - chạy lại cùng dữ liệu (`daCo` trả đủ khoá) → `ghi` không gọi, `gui` không gọi.
  - chứng từ `ngay` < `bat_dau` → ghi nhưng không gửi.
  - `doc` ném `LoiDangNhap` → `ghi`/`gui` không gọi, `dm` gọi 1 lần với chữ chứa `dang-nhap`; lượt 2 cùng lỗi → `dm` không gọi thêm.
  - `gui` ném lỗi → `ket_qua.loi.loai === 'ghi_loi'`, dòng sổ vẫn đã ghi, chứng từ không vào `tt.tin` (lượt sau thử gửi lại).
- [ ] **Step 2: Chạy, thấy FAIL** — `cd admin && node --test kho/hcm-chay.test.mjs`.
- [ ] **Step 3: Viết `hcm-chay.mjs`** + `kenh/kho-hcm.json` (`che_do: "test"`). `dang-nhap` dùng `moTrinhDuyet({ coGiaoDien: true })` và `ctx.waitForEvent('close')`.
- [ ] **Step 4: Chạy, thấy PASS**; `npm test` admin xanh.
- [ ] **Step 5: Commit** — `git commit -m "feat(kho-hcm): lượt đọc Eton → sổ HCM → tin thông báo, báo lỗi qua Bắp"`.

### Task 5: Lịch launchd `com.gwt.bap.khohcm`

**Files:**
- Modify: `mac/chay-dinh-ky.sh` (dòng chú thích + `khohcm) exec node admin/kho/hcm-chay.mjs luot ;;` + chuỗi `dùng:`), `mac/cai-launchd.sh` (thêm vào danh sách trắng nhãn dòng 63, vòng nạp dòng 65 & 90, và `viet com.gwt.bap.khohcm 900 false /bin/zsh "$DIR/mac/chay-dinh-ky.sh" khohcm`)
- Test: `mac/cau-hinh.test.mjs` (nếu test liệt kê nhãn/case thì thêm `khohcm`)

- [ ] **Step 1:** Thêm ca vào test `mac/cau-hinh.test.mjs` theo đúng kiểu các nhãn đang có (vd mỗi nhãn trong `cai-launchd.sh` phải có case trong `chay-dinh-ky.sh`).
- [ ] **Step 2:** `node --test mac/cau-hinh.test.mjs` → FAIL.
- [ ] **Step 3:** Sửa hai file shell.
- [ ] **Step 4:** `node --test mac/cau-hinh.test.mjs` → PASS; `zsh -n mac/chay-dinh-ky.sh mac/cai-launchd.sh` không lỗi.
- [ ] **Step 5: Commit** — `git commit -m "chore(mac): lịch com.gwt.bap.khohcm 15 phút"`.

### Task 6: App hiện mã chứng từ Eton thay link Discord (gwt-app)

**Files:**
- Modify: `apps/web/lib/kho/nhan.ts` (hàm tạo link ở dòng ~26 và chỗ `LinkTin` render)
- Test: `apps/web/lib/kho/nhan.test.ts` (tạo nếu chưa có, theo khuôn test vitest đang có trong `lib/kho/`)

**Interfaces:**
- Produces: `chungTuEton(id: string | null): string | null` — `'eton:SOGWTN6GGYPSN|CTD50NG|SO_PACKED|1'` → `'SOGWTN6GGYPSN'`; id số Discord / `'kiemke:…'` / null → `null`. `LinkTin` khi `chungTuEton(id)` khác null hiện chữ mã đó (không link).

- [ ] **Step 1:** Test `chungTuEton` 4 ca trên. **Step 2:** `npm --prefix apps/web run test -- nhan` → FAIL. **Step 3:** Viết hàm + nhánh hiển thị. **Step 4:** test + `npx --prefix apps/web tsc --noEmit` xanh. **Step 5:** Commit trên nhánh `feat/kho-hcm-chung-tu` cắt từ `origin/main` (worktree riêng, `bash tools/wt.sh moi`), mở PR.

### Task 7: Bật thật (Mac mini, có người)

Không code — làm theo thứ tự, báo từng bước.

- [ ] **Step 1:** Task 1 đã áp live (SELECT `information_schema.columns` có `eton_key`). Admin-Portal `bots/kho/mirror.mjs` còn chạy không (`launchctl list | grep -i mirror`, crontab) — ghi lại.
- [ ] **Step 2:** `git pull` trên Mac mini `~/Bots/GWT-Agent-Team`, `cd admin && npm ci`, `npx playwright install chromium` (đã có 1255 thì bỏ qua).
- [ ] **Step 3:** `node admin/kho/hcm-chay.mjs nap-cu --tu 2026-06-01` → tổng theo mã khớp `GetInventoryReport` `InStock` (cộng mọi tình trạng): kỳ vọng 26 mã có mã, tổng 561 + 10 dòng chờ duyệt (đối chiếu Sheet "Kho HCM (Eton) – theo dõi" ngày 25/11, cộng phát sinh sau đó). Lệch → dừng, báo.
- [ ] **Step 4:** Xem `/kho?kho=HCM` trên app (local trỏ DB live chỉ đọc, hoặc production) — tồn khớp bước 3.
- [ ] **Step 5:** `kenh/kho-hcm.json` `bat_dau` = lúc này; `bash mac/cai-launchd.sh` (chỉ nhãn `com.gwt.bap.khohcm`) → chờ 2 lượt, xem `logs/` + kênh test.
- [ ] **Step 6:** Cấp quyền gửi tin cho Bắp ở `#kho-eton` (người làm), điền `kenh_that`, đổi `che_do: "that"` khi CEO đồng ý.
- [ ] **Step 7:** Dọn spike: `tmux kill-session -t ccp`; `rm -rf ~/Bots/ccp-spike` (có `nxt-2026.json`, `nxt-all.json` mang mã đơn sàn). Cập nhật `docs/kho/README.md` + handoff (gwt-app) trạng thái "đã chạy".
