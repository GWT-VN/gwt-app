# Khu Kế toán — hoá đơn NEXIA (lát 1–2)

Spec: `docs/specs/2026-09-04-ke-toan-hoa-don-sao-ke-design.md` · Plan lát 1:
`docs/plans/2026-09-04-ke-toan-lat-1-hoa-don-dau-vao.md` · Plan lát 2:
`docs/plans/2026-09-15-ke-toan-lat-2-4-hoa-don.md`

## Kiến trúc tóm tắt

- Schema `accounting` (SalesTracking `bwzmqfbcgouhvhoslmmm`), **không expose**; app đi qua RPC
  `public.ke_toan_*` (khuôn khu Việc) qua `dataClient()` sau khi gác `chanKeToan()`
  (`requireNhanSu` + `coTheVaoKeToan`, vai trò `admin | ke_toan | tai_chinh | ceo`).
- Engine phân loại: `apps/web/lib/ke-toan/engine/dau-vao.ts` — hàm thuần, port 1:1 từ
  `gwt_ketoan/engine.py` + `gwt_ketoan/nexia.py` (Python gốc). Nghiệm thu bằng fixture T8
  (`__fixtures__/`, đã che PII) — parity **322/322** dòng tầng 0/A/B/goods.
- Luật: `accounting.rules` (seed từ Rule Excel + overrides + lịch sử tên hàng, 659 dòng). Sửa
  luật trên app từ lát 2; **file Excel Rule không còn là nguồn sự thật** sau khi seed.
- Engine tầng C (lát 2): sửa tay tại ô ghi vào `accounting.corrections` (origin `app`/`history`);
  RPC `ke_toan_thong_ke_hoc` tính 2 kiểu học — NCC (`seller_norm` ≥70% cùng mã, ≥1 lần) và tiền tố
  5 từ đầu diễn giải (`desc_norm` ≥80% cùng mã, ≥2 lần) — engine (`dau-vao.ts`) đọc gợi ý này
  SAU luật `app`/override, độ tin cậy "trung bình" (`nguon: 'hoc_ncc' | 'hoc_prefix'`).
- File gốc: Storage bucket `accounting` (private), đường dẫn `<kỳ>/<timestamp>-<tên file>`.
- Danh mục: `public.expense_category` gương từ Masterdata qua `sync_catalog()` (24 dòng); catalog
  từ `public.catalog_item`.

## Route

- `/ke-toan` — danh sách kỳ (`YYYY-MM`) + ô tháng (mặc định tháng trước, giờ VN) + nút chọn file NEXIA:
  upload tự tạo kỳ nếu chưa có rồi chuyển vào màn kỳ (CEO 15/09: không có bước "tạo kỳ" riêng). Cột
  **Trạng thái**: "Đang xử lý" hoặc "Đã gửi · N sửa" (`edits_after_sent`, mục sửa sau khi bấm Đã gửi).
- `/ke-toan/hoa-don/[ky]` — upload file `.xlsx` (chọn **Loại** nguồn: `nexia` "NEXIA (kế toán gửi)",
  `hdct_vao`/`hdct_ra` "HDCT mua vào/bán ra (cổng thuế)", `hdtq_vao`/`hdtq_ra` "HDTQ mua/bán ra" —
  màn danh sách `/ke-toan` chỉ tạo kỳ bằng NEXIA, HDCT/HDTQ luôn gộp VÀO một kỳ đã có nên chỉ chọn
  được ở màn kỳ, lát 4), bảng đầu vào (cột engine: mã, TK Nợ/Có, VAT, độ tin cậy — dòng vàng = engine
  không chắc). Bộ lọc **Nguồn** (`nguon=nexia|hdct|hdtq`, theo `first_source_kind` của dòng) bên
  cạnh bộ lọc Độ tin cậy; dòng nguồn ≠ NEXIA tô `bg-amber-200/60` (≈ Excel `FFE699`, thấp hơn màu
  cảnh báo Độ tin cậy) và có cột **Nguồn** riêng ngay sau `#`. Mỗi dòng sửa tại chỗ (`DongSua.tsx`, lát 2):
  ô **Mã** gõ-để-tìm (`OChonGoiY`), **Ghi chú cho kế toán** (lưu khi blur nếu đổi), nút **"Đặt
  thành luật"** (NCC hoặc 3 từ đầu diễn giải → mã, ghi `accounting.rules` origin `app`, xem mục
  "Luật origin app" dưới) — mọi lần sửa ghi vào `accounting.corrections` (nguồn cho engine tầng C).
  Nút **"Đã gửi kế toán"** (`NutGuiKeToan.tsx`): xác nhận nếu còn dòng cảnh báo, đổi trạng thái kỳ,
  sau đó vẫn sửa được (đếm vào `edits_after_sent`, hiện trên nút).
- `GET /ke-toan/hoa-don/[ky]/xuat` — tải Excel `_DAXULY.xlsx`: mở **chính file NEXIA gốc** (tải từ
  Storage) và điền khối cột đề xuất vào đó (`lib/ke-toan/xuat/excel-hoa-don.ts` → `dienExcelHoaDon`),
  giữ nguyên Sheet1/độ rộng/định dạng như tool Python; file đã có khối cột (bản Python cũ, xuất lần 2)
  thì ghi đè, không nối bộ thứ hai. File gốc không còn trên Storage, hoặc dòng DB không có trong file /
  lệch Số HĐ → quay về màn kỳ với `?loi=` (upload lại), **không** dựng file khác, không ghi sai dòng.
  Đọc lẫn xuất đều bằng `exceljs` (bỏ `xlsx` khỏi khu này 15/09/2026 — dep vẫn còn vì CSKH
  `NhapKhoSerial` dùng phía trình duyệt).
- Tab **HĐ đầu ra** (`?tab=ra`, live từ 15/09/2026): engine `engine/dau-ra.ts` chạy khi upload
  (mã nội bộ gợi ý, mã khách theo MST/Shopee, nhóm SP theo Danh mục cấp 2/3, kênh theo
  `dim_channel`). Bảng có cột riêng Mã khách/Nhóm/Kênh/Đại lý, sửa tại ô như tab đầu vào nhưng ô
  mã chỉ gợi ý catalog (không KMCP) và không có nút "Đặt thành luật". Xuất Excel điền cả khối 2 cột
  đề xuất lẫn cột có sẵn trong template gốc (Mã hàng/Loại/Kênh/Đại lý — `dienTab` tab `ra`).
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

## Quy trình tháng (lát 1–2, theo spec §4)

1. `/ke-toan` → chọn tháng `YYYY-MM` + chọn file NEXIA `.xlsx` (một nút; kỳ tự tạo).
2. App chuyển vào màn kỳ; upload lại file mới hơn ngay trong màn kỳ.
3. Xem bảng đầu vào, dòng vàng = engine không chắc. Có file HDCT/HDTQ (cổng thuế) bổ sung thì chọn
   **Loại** tương ứng ở form upload rồi gộp — dòng trùng khoá với NEXIA thì giữ nguyên (không đè
   `raw`/`row_order` gốc), dòng mới nối cuối, tô cam để phân biệt (lát 4).
4. Sửa trên app (lát 2, thay cho "sửa tay trong Excel" của lát 1): sửa mã/ghi chú tại ô
   (`DongSua.tsx`), mỗi lần sửa ghi vào `accounting.corrections`; "Đặt thành luật" khi muốn ép
   một NCC/diễn giải luôn về một mã (ghi `accounting.rules` origin `app`).
5. Tải `_DAXULY.xlsx` gửi kế toán, rồi bấm **"Đã gửi kế toán"** (`NutGuiKeToan.tsx`) — đổi trạng
   thái kỳ; vẫn sửa được sau đó, đếm vào `edits_after_sent`.

## Trạng thái (15/09/2026, lát 2)

- Lát 3+4 (HDCT/HDTQ bổ sung sau NEXIA): migration 10 (`ke_toan_dong_list` thêm `first_source_kind`,
  `ke_toan_dong_nhap` v3 nối đuôi nguồn khác nexia thay vì đè), `nhapNguon`/`uploadNguon` đọc `loai`,
  exporter nối dòng bổ sung tô cam, UI chọn Loại khi upload + lọc/tô "Nguồn" — code xong trên nhánh
  `feat/ke-toan-lat-2`, **migration 10 chưa áp live**, **CEO chưa xem**. Fixture HDCT/HDTQ vẫn là
  khuôn NEXIA tạm (Bẫy 14) — chờ CEO chép file T8 thật (Việc treo bb).
- Task 8 (tab đầu ra): `duLieuEngine()` thêm `kenh` (`dim_channel`) + catalog `capHai/capBa`;
  `taoEngineDauRa` chạy trong `nhapNexia` cho mọi dòng `ra`; `dongSql` ghi `customer_code/
  product_group/channel_l1/channel_l2/dealer_name` (cột đã có sẵn từ migration 00, không cần
  migration mới). Bảng tab ra + exporter điền template — xong trên nhánh `feat/ke-toan-lat-2`,
  **chưa merge `main`**, CEO chưa xem. `DongSua.tsx` bỏ hẳn `<td>` "Đặt thành luật" khi
  `huong==='ra'` (không chỉ để trống) để khớp số cột header tab ra.
- Migration 09 (`ke_toan_09_sua_tay_hoc.sql`) đã áp live: RPC `ke_toan_dong_sua`, `ke_toan_luat_them`,
  `ke_toan_thong_ke_hoc`, `ke_toan_ky_gui`, `ke_toan_lich_su_nap`; `ke_toan_ky_list` thêm
  `edits_after_sent`. Actions `suaDong`/`datThanhLuat`/`guiKeToan`/`danhSachMa`, màn `DongSua.tsx`/
  `NutGuiKeToan.tsx`, cột Trạng thái ở `/ke-toan` — xong trên nhánh `feat/ke-toan-lat-2`, **chưa
  merge `main`**, CEO chưa xem.
- Lịch sử chi phí T1–T6/2026 (bảng `expense` tool Python): `tools/scripts/ke_toan_nap_lich_su.py --dry`
  đếm **720 dòng** (`ma_kmcp` khác rỗng) sẽ nạp vào `accounting.corrections` origin `history` để engine
  tầng C có dữ liệu học ngay cả trước khi ai sửa tay trên app. **Đã chạy thật 15/09** → 720 dòng
  origin `history`; `ke_toan_thong_ke_hoc` cho 83 NCC + 69 tiền tố. Đo trên kỳ 2026-08 (bỏ 12 luật
  app để mô phỏng kỳ chưa ai sửa): học phủ **91/93** dòng "không rõ", đúng mã CEO 63/91 (~69%, còn
  lại sai → vì thế học chỉ xếp `trung binh`, phải review). Có đủ luật app + học: 415/415 khớp CEO,
  0 lệch. Nạp lại: xem docstring trong script (xoá origin `history` trước, RPC không dedupe).

## Trạng thái (07/09/2026)

- Migration 00–07 đã áp lên production, ledger đã sửa khớp số hiệu file (xem "Bẫy đã gặp").
- tsc/test/build sạch. **Máy Windows không có Docker/Supabase local** → nghiệm thu e2e 07/09 làm
  bằng `next dev -p 3000` cắm **DB production** (`.env.local.prod`, CEO chốt vì không có local);
  cổng 3000 vì Supabase Auth chỉ cho redirect Google về `localhost:3000` (cổng 3501 chưa nằm
  trong Redirect URLs — thêm ở Dashboard → Authentication → URL Configuration là Config, ghi đây).
- CEO đã xem màn kỳ + màn upload 07/09: sửa tương phản (bẫy 10), ô chọn tháng, gộp một nút upload.
  Upload file T8 thật lần đầu lộ bẫy 9 → migration 05. Đối chiếu DB ↔ golden Python: tầng lát 1
  322/322 khớp; 93 dòng vàng = tầng học lịch sử (lát 2). So file `_DAXULY` với bản Python lộ lặp cột +
  mất định dạng → viết lại exporter điền vào file gốc (migration 06, bẫy 11–12).

## Luật origin `app` — CEO chốt 15/09 (migration 08, dữ liệu sửa được)

Kỳ 08: 93 dòng engine "không rõ" được Claude đề xuất mã, CEO duyệt/chốt trên file rồi ghi thẳng vào
`invoice_lines` (ghi chú `CEO duyệt 15/09` / `CEO chốt 15/09`). Luật rút ra nằm ở
`supabase/migrations/20260915090000_ke_toan_08_luat_ky08.sql` → bảng `accounting.rules`, `origin = 'app'`.
**Không khoá cứng**: sửa/tắt bằng data (`active=false`, đổi `target_code`), không sửa engine. Engine đọc
luật `app` TRƯỚC override, độ tin cậy "cao"; `condition` có nghĩa cấu trúc (`kw:<x>` = chỉ áp khi diễn giải
chứa x; `khong_phai_hang` = NCC bỏ tầng hàng hoá). Test: `engine/dau-vao.test.ts` khối "luật origin app"
đọc thẳng file migration. Nội dung:

1. NCC chứa `di chuyen xanh va thong minh gsm` (Xanh SM): diễn giải chứa `ten hang hoa` → `DVVC` (chở
   hàng cho khách); còn lại (điểm đi/đến, phí nền tảng, chiết khấu, phí quản lý) → `cp.dichuyen`. Luật NCC
   có điều kiện tách, cùng kiểu Be Group.
2. NCC `kho van viettel`: `van hanh kho` → `cp.thuekho`; `chuyen phat` → `DVVC`.
3. NCC `dragoncello` → `cp.vanhanhchung` (CEO: đồ ăn = vận hành chung, không phải tiếp khách).
4. NCC `tap doan cong nghiep - vien thong quan doi` → `cp.vanhanhchung`.
5. NCC `an phu group` (bia) → `cp.vanhanhchung` (CEO 15/09, "sai sửa tay sau"); NCC `van tai a dong` →
   `DVVC`; vật tư ống nước Xuân Lành (`te deu vesbo`, `bang cuon ong nuoc`) → `cp.vattukho` cho tới khi
   Masterdata có mã catalog.

**Lỗi thứ tự tầng lộ ra 15/09 (đã xử lý bằng `khong_phai_hang`):** tầng 0 "hàng hoá" chạy TRƯỚC luật NCC
nên "Dưa chuột muối"/"Lẩu vị muối" (Tsuiteru, nhà hàng) khớp gần catalog `MUOIAD` (muối viên) thành mua
hàng nội bộ. Luật app của Tsuiteru/DragonCello/UNICB/An Phú mang cờ này.

## Điểm treo

- `nhomSpCua()` (`engine/dau-ra.ts`) map "Danh mục cấp 2" = `POU Filters` → nhóm `POU-Undersink`
  (comment tại chỗ ghi "CEO chốt") — **chưa thật sự có CEO gật riêng cho nhóm này**, đoán theo suy
  luận filter POU thường đi kèm máy Undersink. Chờ CEO xác nhận khi xem tab đầu ra.
- `dim_channel.mst` rỗng ở toàn bộ 0/26 dòng hiện tại (đo 15/09) → nhánh "kênh theo MST" trong
  `phanLoaiRa()` chưa bắn được (luôn rơi về `channelL1/L2` rỗng trừ trường hợp Shopee theo tên
  người mua) cho tới khi Sales điền `mst` vào `dim_channel`.
- Tab 5 Excel Rule ("TK Nợ bắt buộc", vd `cp.qc → 6417`) KHÁC `expense_category.tk_no_default`
  (6427). App theo Masterdata. CEO quyết với Masterdata.
- Lint CI đỏ từ 22/08 (7 lỗi cũ) — ngoài phạm vi khu này; đếm lỗi không được tăng khi commit vào
  khu Kế toán (xem `npx eslint .`).
- `get_advisors` (security) 15/09: 2 ERROR có sẵn TRƯỚC lát 2, của khu khác — `security_definer_view`
  (18 view `public`), `rls_disabled_in_public` (10 bảng `sales_*`) — ngoài phạm vi Kế toán, không sửa
  ở đây. INFO `rls_enabled_no_policy` trên 6 bảng `accounting` là cố ý (chỉ `service_role` qua
  `dataClient()`, xem spec §5).

## Bẫy đã gặp (khi build lát 1–2)

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

11. **exceljs sau `xlsx.load` cho các ô cùng xf dùng CHUNG một object `style`** — `cell.fill = X` là
   sửa object chung: đo được 07/09 trên file T8 thật, tô cột đề xuất làm 50 dòng HDCT mất màu cam ở
   cột B. Phải gán `cell.style = { ...cell.style, fill }` (thay object) — xem `datFill()` + test hồi
   quy trong `excel-dien-goc.test.ts`.
12. **File trong "Data đã xử lý để gửi kế toán" là bản ĐÃ qua tool Python** (có sẵn 6 cột đề xuất, Sheet1
   ghi chú, dòng HDCT tô cam) — không phải file thô kế toán gửi. Bộ đọc/xuất phải chịu được cả hai.
13. **`chuan-hoa.ts` (hàm `norm()`) import `node:crypto`** — component client không được import file
   này thẳng (vỡ bundle, Ruling R2 lát 2). Pattern của "Đặt thành luật" phải tính ở server
   (`datThanhLuat` trong `actions.ts`), `DongSua.tsx` chỉ gửi `tenBan`/`tenHang` thô lên action.
14. **Khuôn HDCT/HDTQ chưa đo** (máy Windows không có file, 15/09) — khi có file:
   `python tools/scripts/ke_toan_do_header.py <file>` rồi đối chiếu mảnh `timCot` trong `docTab`;
   fixture `hdct-t8-vao.json` hiện là khuôn NEXIA tạm.

## Việc treo sau lát 1–2

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
h. ~~`tuHdct` trong export gán nhầm khi upload NEXIA lần 2 cùng kỳ.~~ **Bỏ hẳn `tuHdct` + nhánh nối
   cuối** (audit 15/09): lát 1 mọi dòng đều từ file gốc; dòng DB không có trong file → từ chối xuất.
   Lát 4 (HDCT bổ sung) thêm lại có chủ đích.
i. ~~Headers export lấy từ nguồn đầu tiên.~~ **Hết** — bỏ đường dựng từ đầu, header luôn là của file gốc.
j. ~~`xlsx@0.18.5` có advisory~~ — khu Kế toán đọc bằng `exceljs` (15/09); dep `xlsx` còn vì CSKH
   `components/NhapKhoSerial.tsx` dùng phía trình duyệt (ngoài khu này).
k. 9 entry ledger live 20260820–20260821 có `statements` rỗng (tồn đọng trước nhánh) — branch
   Supabase sẽ thiếu.
l. E2e file NEXIA thật chưa chạy trên máy này.
m. `uploadNexia`: nếu `ke_toan_nguon_them` lỗi SAU khi upload Storage xong thì file gốc thành rác
   (chưa dọn) — mở rộng cleanup bọc cả bước đó.
n. `ghiAudit('ke_toan.upload_nexia_loi')` trong nhánh lỗi chưa bọc try — nếu audit lỗi sẽ che mất
   thông điệp lỗi gốc.
o. `ke_toan_dong_nhap` dedupe trong lô im lặng (dồn vào `kept`) — nên trả thêm `deduped` để lộ hồi quy
   của `lan` phía app.
p. ~~`missing_in_last_upload` chưa có chỗ nào set `true`~~ **Đã sửa** (migration 07: `ke_toan_nguon_chot`
   gọi sau mỗi lần upload; nhánh UPDATE của `dong_nhap` cập nhật cả `row_order`). Màn kỳ chưa hiện
   dòng thiếu — xuất Excel đã bỏ chúng.
q. `ganKhoaDong` map theo `rowOrder` và giả định duy nhất — `rowOrder` trùng sẽ gộp khoá im lặng.
r. `globals.css` đổi màu chữ theo dark mode của OS dù app không có giao diện tối (bẫy 10) — sửa tận
   gốc là bỏ khối `@media (prefers-color-scheme: dark)`; file dùng chung, cần CEO gật + báo khu khác.
s. Màn Kế toán dùng xanh lá `#3f8a6a` tự đặt, khác accent teal `#0e8c9a` của Sales/Work — đồng bộ khi
   polish.
t. Route `xuat` chưa có test tích hợp (nhánh redirect `?loi=` khi không có file gốc / lệch dòng) —
   cần khung mock Next route handler.
u. Chưa đo bộ nhớ `exceljs` load + write trên Vercel với file 8 MB (trần upload) — đo một lần với T8
   trước khi kế toán dùng thật, ghi số vào đây.
v. Màn kỳ chưa hiện dòng `missing_in_last_upload` (dòng của lần upload trước không còn trong file mới) —
   hiện chỉ đếm ở thông báo upload và bị bỏ khi xuất.
w. ~~Sửa mã sai phải tải Excel về, điền tay, gửi lại kế toán~~ **Đã sửa lát 2**: sửa tại ô ngay trên
   app (`DongSua.tsx` → `suaDong`), ghi `accounting.corrections`.
x. ~~Không có cách ép một NCC/diễn giải luôn về một mã~~ **Đã sửa lát 2**: nút "Đặt thành luật"
   (`datThanhLuat`) ghi `accounting.rules` origin `app`.
y. `tenVaTk` (`actions.ts`, gọi trong `suaDong` mỗi lần sửa 1 dòng) gọi lại `duLieuEngine()` — 4
   truy vấn (luật + catalog + expense_category + thongKe học) cho một lần đổi mã — tách/cache riêng
   khi volume sửa tăng.
z. Ô Ghi chú (`DongSua.tsx`) blur so với prop gốc `d.note_for_accountant`: nếu cha chưa kịp
   refresh sau lần sửa trước, blur kế tiếp có thể gọi `suaDong` thừa một round-trip — vô hại (ghi
   đúng giá trị) nhưng phí request.
aa. `so_canh_bao` tính KHÁC nhau ở 2 RPC: `ke_toan_ky_gui` (ghi vào audit log sau khi gửi) loại
   `missing_in_last_upload` khỏi đếm; `ke_toan_ky_list` (hộp xác nhận trong `NutGuiKeToan.tsx` đọc
   `period.so_canh_bao` từ đây, TRƯỚC khi gửi) thì không loại — hộp xác nhận có thể đếm cao hơn số
   dòng audit ghi lại. Đồng bộ công thức ở migration sau.
bb. CEO chép 4 file T8 HDCT/HDTQ vào
   `data/ke-toan/Báo cáo tài chính/Báo cáo tài chính/HDCT/2026.08/` (mục "Bẫy đã gặp" 14) — sau đó
   đo header lại bằng `ke_toan_do_header.py` và sinh lại `hdct-t8-vao.json` bằng `ke_toan_sinh_golden.py`.
