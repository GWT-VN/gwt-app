# Kế toán — Luồng hoá đơn NEXIA + đối chiếu sao kê ngân hàng

> **Ngày:** 2026-09-04 · **Khu:** Kế toán (mới) · **Nhánh:** `main` (CEO chốt làm thẳng trên main phiên này) · **Cổng dev:** 3501–3503
> **Trạng thái:** thiết kế đã được CEO duyệt 04/09 sau brainstorming + grilling 3 vòng, chưa viết code.
> Không chứa PII — an toàn commit. Dữ liệu nguồn nằm ở `data/ke-toan/` (gitignore).

---

## 1. Vì sao có việc này

Hằng tháng GWT phải xử lý hoá đơn điện tử để gửi kế toán NEXIA và điền báo cáo thu chi từ sao
kê ngân hàng. Việc này đang làm bằng **tool Python + Excel chạy tay** (bàn giao 03/09/2026, xem
`data/ke-toan/HANDOFF - Báo cáo tài chính GWT.md`). Đo trên tháng 8/2026:

| Việc | Khối lượng | Cách làm hiện tại |
|---|---|---|
| Hoá đơn đầu vào | 415 dòng hàng / 53 hoá đơn | Tool Python gán mã KMCP, TK Nợ/Có; người soát sửa vào cột Ghi chú; agent fold sang `overrides.json` |
| Hoá đơn đầu ra | 85 dòng / 53 hoá đơn | Tool gán mã nội bộ + mã khách; cột Loại/Kênh để trống |
| Đối chiếu HDCT (cổng thuế) | 250/415 dòng vào và 63/85 dòng ra là **bổ sung từ HDCT** | Làm tay, không có code |
| Báo cáo thu chi | 68 dòng chi + 59 dòng thu, 3 tài khoản | Điền tay hoàn toàn |

Ba điểm rút ra từ dữ liệu, quyết định thiết kế:

1. **HDCT là nguồn chính, không phải nguồn phụ** — hai phần ba dòng đến từ cổng thuế. Bỏ bước
   đối chiếu là thiếu hai phần ba doanh số.
2. **Khớp sao kê ↔ hoá đơn tự động chỉ được khoảng một phần ba** (12/68 chi và 17/59 thu khớp
   đúng số tiền một hoá đơn). Phải thiết kế kiểu *gợi ý + người chọn*, không phải tự động hoàn toàn.
3. **Số điện thoại trong nội dung chuyển khoản** (14/59 dòng thu) là chìa khoá nối sang bảng
   `customers` và đơn Sales — tiền cọc không bằng tiền hoá đơn nhưng bằng tiền cọc của đơn.

## 2. Quyết định đã chốt (CEO, 04/09)

| # | Quyết định | Chốt | Lý do |
|---|---|---|---|
| 1 | App vs file | **App là nơi làm việc; Excel + Google Sheet là đầu ra** cho kế toán, investor, nội bộ | Nhiều bên xem không qua app |
| 2 | Phạm vi lát này | **C**: cả hai tab hoá đơn + gộp HDCT/HDTQ; sau đó sao kê | HDCT là nguồn chính |
| 3 | Cột phản hồi | Trên app hiện đủ (độ tin cậy, căn cứ, ghi chú); **bản xuất ẩn hết**, chỉ giữ cột chốt + Ghi chú cho kế toán | Người ngoài không cần thấy nội bộ |
| 4 | DB | Schema **`accounting`** trên SalesTracking `bwzmqfbcgouhvhoslmmm`; danh mục gương từ Masterdata qua `sync_catalog()` có sẵn | App chỉ có một DB; không mở kết nối mới |
| 5 | Engine | **Viết lại TypeScript** trong Next.js; nghiệm thu khớp 100% Python trên dòng đã gán của T8 | 300 dòng so khớp chuỗi, không cần Python service |
| 6 | Học lịch sử | **Học từ sửa trên app** (đa số ≥70%), nạp một lần 720 dòng lịch sử cũ; nhập sổ kế toán để sau | Sổ về trễ một kỳ; sửa trên app xảy ra ngay |
| 7 | Sheet mirror | **App đẩy bằng service account**, một Sheet/năm, hai tab, cột Kỳ đứng đầu; không có chiều đọc ngược | Khoá nằm ở Vercel, không mở đường đọc DB từ ngoài |
| 8 | Xuất Excel | Nút **tải về máy** + nút **lưu vào Drive** đúng thư mục tháng; cùng một file `_DAXULY.xlsx` | Kế toán chỉ nhận Excel |
| 9 | Luật | Nạp một lần từ Excel Rule + `overrides.json` vào DB; **sửa trên app**; file Excel Rule ngừng là nguồn sự thật | Hai nguồn sự thật sẽ lệch |
| 10 | Sửa tay → luật | **Không tự động**; ghi lịch sử, engine học theo đa số; nút "Đặt thành luật" khi muốn ép | Một lần sửa nhầm không thành luật vĩnh viễn |
| 11 | Thứ tự trong kỳ | **Giữ quy trình cũ**: kỳ mở bằng file NEXIA, HDCT/HDTQ vào sau để bổ sung | CEO chốt |
| 12 | Xác nhận từng dòng | **Không bắt**; dòng không chắc tô nổi; xuất hỏi xác nhận, không chặn | 500 dòng/tháng, ép thì bấm cho xong |
| 13 | Sửa sau khi gửi | **Vẫn sửa được**, kỳ hiện nhãn "có sửa sau gửi" + số dòng | Kế toán trả lại bản sửa là chuyện thường |
| 14 | Quyền | Lát này gác bằng **danh sách vai trò cứng** `ke_toan`, `tai_chinh`, `ceo`, `admin`; ma trận quyền làm sau | CEO để sau |
| 15 | Cột Loại/Kênh/Đại lý đầu ra | **Làm, giữ đủ cột** kế toán chừa; điền được gì thì điền; tinh chỉnh sau khi chạy thật | CEO chốt |
| 16 | File gốc | Lưu vào bucket riêng tư `accounting` trên Storage, ghi kỳ/loại/người/thời điểm | Truy được khi cãi số |
| 17 | Sao kê | Mục tiêu (a) tự điền mã thay điền tay trước, (b) công nợ sau; khớp chắc mới tự nối, còn lại ≤3 gợi ý; thu nối SĐT → `customers` → đơn Sales → HĐ ra | Đo được một phần ba tự động |
| 18 | Tạm ứng nhân viên | **Chưa làm** | Nghiệp vụ riêng, cần luồng duyệt |
| 19 | Mốc | Lát 1–4 (hoá đơn) trước **5/10/2026** để chạy thật tháng 9; nghiệm thu bằng tháng 8 | File kế toán về đầu tháng sau |
| 20 | Hạ tầng theo luật GWT | Thêm CI `db-reset` cho repo trước migration đầu tiên; bảng tiếng Anh snake_case số nhiều | Luật DB toàn GWT |

**Còn treo một sự thật:** TCB Business có xuất được Excel/CSV không? Có → chỉ nhận Excel cho cả
ba tài khoản. Không → viết bộ đọc PDF cho TCB, chấp nhận sửa khi mẫu đổi. Mặc định thiết kế nhận cả hai.

## 3. Sự thật nền (đo 04/09/2026)

- **Masterdata `qynpywysgltspmgnhhga`:** `expense_category` 24 mã, có `ma`, `ten`, `dien_giai`,
  `tk_no_default`, `trang_thai`. `sales_channel` **rỗng** → điểm nợ "hợp nhất 2 bảng kênh" tự giải:
  chỉ dùng `dim_channel`.
- **SalesTracking `bwzmqfbcgouhvhoslmmm`:** schema có `public`, `work`. `catalog_item` gương 329 dòng,
  VAT nằm ở `vat_pct`/`vat_loai` (migration 20260821120000). `dim_channel` 26 dòng có `mst`,
  `channel_l1/l2`, `company_name`. Extension `http`, `pg_cron`, `supabase_vault` đã bật; cron
  `catalog-sync-daily` chạy 19:00 UTC. `expense_category` **chưa** được gương.
- **Repo:** `apps/web/lib/nen-tang/db.ts` có `authClient()`/`dataClient()`; vai trò `ke_toan`,
  `tai_chinh` đã có trong `lib/nen-tang/vai-tro.ts`; app-launcher có ô "Kế toán" `live:false`;
  đã có thư viện `xlsx`; chưa có thư viện Google; CI chỉ có typecheck/lint/test + quét PII,
  **chưa có db-reset**; lint đang đỏ từ 22/08 (7 lỗi, ngoài phạm vi việc này).
- **File NEXIA T8:** tab `HĐ đầu vào` 44 cột thô + 6 cột thêm; tab `HĐ Đầu ra` 43 cột thô + 2 cột
  thêm. Cột thô có **trùng tên** ("Ghi chú 2", "Số lô", "Hạn dùng" ×3) và **2 cột không tên**.
  Dòng bổ sung HDCT tô `FFE699`. Cột phản hồi người dùng là "Ghi chú" (AX, cột 50).
- **Sao kê:** VCB21/VCB63 là XLS cũ (xlrd), 1 sheet, 7 cột, bảng bắt đầu dòng 14; nội dung
  chuyển khoản VCB thường là mã lệnh ("IBBIZ…", "UHHT…"), ít tên. TCB là PDF 4 trang, bóc chữ được.
- **Tool Python cũ** (`data/ke-toan/…/gwt_ketoan/`): engine 4 tầng (override tay → rule NCC → rule
  từ khoá → học lịch sử); `overrides.json` 17 NCC + 16 tên hàng + 26 từ khoá; `ref/` 5 JSON;
  SQLite 8.666 bút toán T1–T6. **Không có code HDCT.**

## 4. Quy trình tháng (đích)

1. Kế toán gửi file NEXIA → upload → **kỳ** tháng mở, trạng thái *đang xử lý*.
2. Engine phân loại cả hai tab ngay khi upload.
3. Upload HDCT mua vào / bán ra / HDTQ khi có → gộp theo **khoá dòng**, dòng mới thêm và nhớ nguồn.
4. Người soát trên app: dòng không chắc tô nổi; sửa mã trên ô; mỗi lần sửa vào `corrections`;
   "Đặt thành luật" khi muốn ép.
5. Xuất Excel `_DAXULY.xlsx` (tải về / lưu Drive). Bấm **Đã gửi kế toán** → kỳ đổi trạng thái, đẩy Sheet.
6. Upload sao kê 3 tài khoản → khớp → người chọn gợi ý → xuất Excel thu chi / Sheet.

## 5. Dữ liệu — schema `accounting`

Migration đặt ở `db/ke-toan/migrations/` + `supabase/migrations/` theo `db/MIGRATIONS-CONVENTION.md`.
Mọi bảng: RLS bật, **0 policy** (chỉ `service_role` qua `dataClient()`), grant tường minh cho
`service_role`; `authenticated`/`anon` không đọc, **không cấp `usage` cho `anon`**. Schema **phải
expose** qua PostgREST vì `dataClient().schema('accounting')` đi qua PostgREST: thêm `accounting`
vào `[api] schemas` của `supabase/config.toml` (local, phải `supabase stop && start`) và vào
Exposed schemas trên Dashboard (live — là Config, ghi vào `docs/ke-toan/`). Thiếu → `406 PGRST106`.
RLS 0 policy vẫn chặn anon/authenticated dù schema đã expose.

| Bảng | Một dòng là | Cột chính |
|---|---|---|
| `periods` | Một kỳ tháng | `id`, `ky` (`2026-08`, unique), `status` (`dang_xu_ly` \| `da_gui`), `sent_at`, `sent_by`, `edits_after_sent int`, timestamps |
| `sources` | Một file upload | `id`, `period_id`, `kind` (`nexia` \| `hdct_vao` \| `hdct_ra` \| `hdtq_vao` \| `hdtq_ra` \| `bank_vcb21` \| `bank_vcb63` \| `bank_tcb`), `storage_path`, `file_name`, `headers jsonb` (mảng header gốc theo thứ tự, mỗi tab), `row_count`, `uploaded_by`, `uploaded_at` |
| `invoice_lines` | Một dòng hàng hoá đơn | `id`, `period_id`, `direction` (`vao` \| `ra`), `line_key` (unique trong kỳ), 26 cột nghiệp vụ tách riêng (`ky_hieu`, `so_hd`, `ngay_lap`, `mccqt`, `ten_ban`, `mst_ban`, `ten_mua`, `mst_mua`, `ten_hang`, `dvt`, `so_luong`, `don_gia`, `thue_suat`, `thanh_tien`, `tien_thue`, …), `raw jsonb` (toàn bộ ô thô theo header gốc, kể cả cột trùng tên, giữ thứ tự bằng mảng), `first_source_id`, `last_source_id`, `missing_in_last_upload bool`, **kết quả engine**: `engine_code`, `engine_conf` (`cao` \| `trung_binh` \| `can_review` \| `khong_ro`), `engine_reason`, `engine_kind` (`goods` \| `muahang` \| `kmcp` \| `unknown`); **giá trị chốt**: `code` (KMCP hoặc mã nội bộ), `code_name`, `tk_no`, `tk_co`, `vat_1331`, `customer_code`, `product_group` (`POE` \| `POU-Countertop` \| `POU-Undersink` \| `Others`), `channel_l1`, `channel_l2`, `dealer_name`; `note_for_accountant`; `edited_by`, `edited_at` |
| `rules` | Một luật | `id`, `kind` (`supplier` \| `keyword` \| `product_name`), `pattern` (đã bỏ dấu), `target_code`, `priority int`, `condition text`, `origin` (`rule_excel` \| `override_json` \| `app`), `created_by`, `created_at`, `active bool` |
| `corrections` | Một lần sửa | `id`, `line_id`, `field`, `old_value`, `new_value`, `seller_norm`, `desc_norm`, `by`, `at` |
| `bank_lines` | Một dòng sao kê | `id`, `period_id`, `account` (`VCB21` \| `VCB63` \| `TCB`), `source_id`, `line_key`, `txn_date`, `doc_no`, `debit`, `credit`, `balance`, `description`, `direction` (`thu` \| `chi`); **khớp**: `match_kind` (`invoice` \| `sales_order` \| `none` \| `pending`), `match_id`, `match_conf`, `suggestions jsonb` (≤3); **chốt**: `code`, `party_code` (MST \| `KHL` \| `KHSP` \| …), `customer_code`, `has_invoice bool`, `note`; `edited_by`, `edited_at` |
| `settings` | Cặp khoá–giá trị | `key` (`sheet_id.2026`, `drive_root_folder_id`, …), `value`, `updated_by`, `updated_at` |

Bổ sung ngoài schema:

- `public.expense_category` **gương** từ Masterdata: thêm vào mảng `v_tables` của `sync_catalog()`
  và whitelist của `replace_catalog_table()` (migration mới, không sửa file 13 cũ).
- Bucket Storage `accounting` (private). Tạo bằng SQL trong migration để `db reset` replay được.
- Seed (trong migration, không PII): 24 KMCP đã có qua gương; `rules` từ Excel Rule (66 NCC + 25
  từ khoá, tên công ty — không PII) và `overrides.json` (59 dòng); bảng nhóm sản phẩm theo tiền tố mã.
- Nạp tay (script, **không commit**): 720 dòng lịch sử chi phí → `corrections` giả lập (origin
  `history`), `name2code.json` 444 tên hàng → `rules` kind `product_name`, `kh_map.json` (348 tên
  người — **PII**) → bảng phụ `customer_aliases` chỉ tồn tại trên DB.

**Khoá dòng hoá đơn** = `sha1(direction | ky_hieu | so_hd | norm(ten_hang) | round(thanh_tien))`.
**Khoá dòng sao kê** = `sha1(account | txn_date | doc_no | debit | credit)`.

## 6. Module (`apps/web/lib/ke-toan/`)

Hàm thuần, không import React, không đụng DB trừ nơi ghi rõ. Mỗi module có test riêng.

| Module | Vào | Ra | Ghi chú |
|---|---|---|---|
| `doc-file/` | Buffer xlsx/xls/pdf | `{ tabs: { name, headers: string[], rows: unknown[][] }[] }` | Nhận diện tab và cột **theo tên**, chịu trùng tên/không tên. `nexia.ts`, `hdct.ts` (cùng cấu trúc, ánh xạ tên cột), `vcb.ts` (xlrd → dùng `xlsx` lib đọc BIFF), `tcb-pdf.ts` (pdf-parse) |
| `chuan-hoa.ts` | chuỗi | chuỗi bỏ dấu, gộp khoảng trắng; `lineKey()`, `bankKey()` | Chuyển từ `norm`/`sd` Python, test bằng cùng input |
| `engine/` | một dòng + `rules[]` + thống kê lịch sử | `{ code, conf, reason, kind, tkNo, tkCo, vat1331 }` | 4 tầng đúng thứ tự Python: override tay → rule NCC → rule từ khoá → học (NCC ≥70%, tiền tố diễn giải ≥80%). `dau-vao.ts` (KMCP/hàng hoá/156), `dau-ra.ts` (mã nội bộ, mã khách, nhóm SP, kênh qua MST) |
| `gop-nguon.ts` | dòng mới + dòng đã có trong kỳ | `{ insert[], updateRaw[], keep[], missing[] }` | Trùng khoá giữ chốt; dòng vắng đánh dấu, không xoá |
| `khop-sao-ke.ts` | dòng sao kê + hoá đơn kỳ + khách + đơn Sales mở | `{ sure?: match, suggestions: match[≤3] }` | Chắc = số tiền đúng **và** ≥1 tín hiệu (SĐT, số HĐ, MST, tên NCC). Thu: SĐT → `customers` → đơn Sales → HĐ ra |
| `xuat/` | dữ liệu kỳ | workbook Excel; mảng ô cho Sheet | `excel-hoa-don.ts` tái tạo header gốc + cột chốt, tô màu theo nguồn/loại; `excel-thu-chi.ts` (chi 15 cột, thu 11 cột, tiền mặt NH tính từ sao kê); `sheet-rows.ts` |
| `google/` | — | client Sheets/Drive từ SA key trong env | Duy nhất nơi gọi Google. Env `GOOGLE_SERVICE_ACCOUNT_KEY`; ID Sheet/thư mục từ `settings` |

Server Actions ở `apps/web/app/ke-toan/**/actions.ts`: gác vai trò (`requireStaff` + danh sách
vai trò cứng), nối module với `dataClient().schema('accounting')`, ghi `corrections`. Không logic
nghiệp vụ trong action.

## 7. Màn hình (route-group `apps/web/app/ke-toan/`)

| Route | Nội dung | Lát |
|---|---|---|
| `/ke-toan` | Danh sách kỳ: kỳ, trạng thái, số dòng, số cảnh báo, nút tạo kỳ | 1 |
| `/ke-toan/hoa-don/[ky]` | Thanh trên: upload nguồn (loại chọn), tải Excel, lưu Drive, cập nhật Sheet, Đã gửi kế toán. Hai tab Đầu vào / Đầu ra. Bảng theo chuẩn `apps/web/bang/` (`docs/CHUAN-FILTER.md`): lọc nguồn, độ tin cậy, mã, NCC/khách; ô mã dùng `OChonGoiY`. Cột phản hồi hiện đủ. Menu dòng: Đặt thành luật, Ghi chú cho kế toán | 1 (xem) · 2 (sửa) · 3 (đầu ra) · 4 (HDCT) |
| `/ke-toan/sao-ke/[ky]` | Ba tài khoản, tổng nợ/có so với sao kê ở đầu trang, mỗi dòng: khớp chắc / 3 gợi ý / chọn tay / "không có HĐ" | 5 |
| `/ke-toan/luat` | Danh sách luật, thêm/sửa/tắt, lọc theo loại và nguồn gốc | 7 |
| `/ke-toan/cau-hinh` | ID Sheet theo năm, ID thư mục Drive (chỉ `admin`) | 6 |

App-launcher: ô "Kế toán" `live` khi vai trò thuộc danh sách cứng. Dựng màn đi qua router
`gwt-ui-skills:designing-ui` theo luật CLAUDE.md; hai gate `verifying-visual-changes` và
`reviewing-finished-ui` trước khi báo xong.

## 8. Xuất & mirror

**Excel hoá đơn** (`{MM}.{YYYY} - GWT - NEXIA_DAXULY.xlsx`): tab `HĐ đầu vào`, `HĐ Đầu ra`;
header = header gốc của nguồn NEXIA (từ `sources.headers`) + cột chốt đúng tên bản T8
(`Mã KMCP (đề xuất)`, `Tên KMCP`, `TK Nợ`, `TK Có`, `Nợ 1331 (VAT)`, `Ghi chú` / `Mã nội bộ (đề xuất)`,
`Mã khách hàng`; đầu ra điền thêm cột template `Mã hàng`, `Loại`, `Kênh`, `Đại lý` nếu header có).
Màu: `FFE699` dòng từ HDCT/HDTQ; `DDEBF7` dòng hàng hoá/156; `FFF2CC` dòng chưa khớp. **Không** có
cột độ tin cậy/căn cứ. Cột `Ghi chú` = `note_for_accountant`. Xuất khi còn dòng cảnh báo → hộp
xác nhận nêu số dòng, không chặn.

**Excel thu chi** (`Báo cáo thu chi - {MM}.{YYYY}.xlsx`): tab `Báo cáo chi` 15 cột, `Báo cáo thu`
11 cột, `Tiền mặt ngân hàng` số dư theo ngày tính từ `bank_lines`. Số trước VAT = sau VAT / 1.08
chỉ khi có hoá đơn (quy ước bàn giao §2B).

**Sheet mirror:** một Sheet/năm (`sheet_id.{YYYY}` trong `settings`), tab `HĐ đầu vào`, `HĐ đầu ra`,
`Thu`, `Chi`. Cột đầu `Kỳ`. Chỉ cột thô + cột chốt. Đẩy: xoá mọi dòng có `Kỳ` = kỳ đang đẩy rồi
append; không đụng kỳ khác. Kích hoạt: nút "Cập nhật Sheet" hoặc tự động khi "Đã gửi kế toán".

**Drive:** thư mục gốc từ `settings`, thư mục con theo năm và `{MM}.{YYYY}`; ghi đè file cùng tên.

## 9. Phân quyền lát này

`VAI_TRO_VAO_KE_TOAN = ['ke_toan', 'tai_chinh', 'ceo', 'admin']` trong `lib/ke-toan/vao-cua.ts`,
dùng cho launcher, `proxy.ts`/layout và mọi action. `/ke-toan/cau-hinh` chỉ `admin`. Nhóm quyền
chi tiết (`ke_toan.hoa_don.xem/sua`, `ke_toan.luat`) → backlog, làm khi CEO bật ma trận.

## 10. Kiểm thử & nghiệm thu

- **Fixture che PII** từ T8: script `tools/scripts/che-pii-nexia.py` thay tên người mua/bán cá nhân,
  MST, địa chỉ bằng giá trị giả **ổn định** (cùng input → cùng output) để khoá dòng vẫn so được;
  giữ tên hàng, số tiền, ký hiệu, trạng thái. Commit vào `apps/web/lib/ke-toan/__fixtures__/`.
- **Engine parity:** bảng kết quả Python (cũng che) làm expected; test fail nếu lệch bất kỳ dòng
  Python đã gán; dòng Python trống mà TS điền được → in danh sách để CEO soát (không fail).
- Test đọc file: header trùng tên, cột không tên, tab thiếu, xls BIFF, pdf TCB mẫu (che số TK).
- Test gộp nguồn: trùng khoá giữ chốt, dòng vắng đánh dấu, 3 hoá đơn trùng của T8.
- Test khớp sao kê: bộ nội dung chuyển khoản thật đã che, kỳ vọng chắc / gợi ý / không.
- Test xuất: đọc lại workbook, so header và số dòng với fixture; màu đúng nguồn.
- Đối chiếu trên **file thật** chỉ chạy tay trên máy này, kết quả ghi vào phiên, không commit.
- Trước khi mời CEO: `tsc --noEmit`, `npm test`, `npm run build` xanh; server local cổng 3501
  trỏ DB local (`npm run env:local`).

## 11. Lát dọc

| Lát | Gồm | Demo | Mốc |
|---|---|---|---|
| 1 | CI `db-reset`; migration schema + bucket + gương `expense_category`; `doc-file/nexia`, `chuan-hoa`, `engine/dau-vao`; màn kỳ chỉ xem; tải Excel đầu vào | Upload T8 → thấy mã KMCP → tải Excel so với bản Python | trước 5/10 |
| 2 | Sửa tay trên ô; `corrections`; học từ app; Đặt thành luật; seed luật | Sửa 1 dòng, upload lại vẫn giữ; engine nhớ | trước 5/10 |
| 3 | `engine/dau-ra`: mã nội bộ, mã khách, nhóm SP, kênh/đại lý qua `dim_channel`; Excel đầu ra đủ cột template | Tab đầu ra đầy, Excel ra 45 cột | trước 5/10 |
| 4 | `doc-file/hdct`, `gop-nguon`; upload HDCT/HDTQ; tô màu nguồn | Upload HDCT T8 → 250 dòng thêm vàng cam | trước 5/10 |
| 5 | `doc-file/vcb`, `tcb-pdf`; `bank_lines`; `khop-sao-ke`; màn sao kê; Excel thu chi | T8 khớp ~1/3 tự động, còn lại chọn | sau 5/10 |
| 6 | `google/`; Sheet mirror; lưu Drive; `/ke-toan/cau-hinh`; wizard tạo service account cho CEO | Bấm cập nhật → mở Sheet thấy số | sau lát 5 |
| 7 | `/ke-toan/luat` đầy đủ | Thêm luật không cần dev | sau |

Mỗi lát: migration (nếu có) → module + test → action → màn → CEO xem local → merge/push.

## 12. Ngoài phạm vi (ghi backlog)

Nhập sổ kế toán + tra cứu chứng từ (hướng A) · Báo cáo investor · Shopee lãi lỗ · Tạm ứng nhân
viên · Nhóm quyền chi tiết · Đọc hoá đơn thẳng từ cổng thuế · Công nợ từ kết quả khớp (Q23-b) ·
Sửa 7 lỗi lint đang làm CI đỏ (việc riêng, nên làm trước lát 1 để CI có nghĩa).

## 13. Bẫy đã biết

- Tool Python đọc cột theo **chỉ số** ở `nexia_fill.py` nhưng theo **tên** ở `nexia.py`; app chỉ theo tên.
- Cột "Ghi chú 2" xuất hiện 2 lần ở đầu vào: dòng gốc điền cột 35, dòng HDCT điền cột 38 → lưu
  `raw` theo **vị trí**, không theo tên, mới tái tạo đúng.
- 3 hoá đơn đầu ra T8 có ở cả hai nguồn nhưng vẫn được thêm dòng → khoá dòng phải gồm tên hàng
  + thành tiền, không chỉ số hoá đơn.
- VCB ghi nội dung là mã lệnh → tên NCC gần như không đọc được từ sao kê VCB; khớp chi dựa vào
  số tiền + ngày + lịch sử NCC đã trả bằng số tiền đó.
- Migration đã áp lên live là bất biến; MCP `apply_migration` ghi `version` theo giờ áp → phải
  SELECT ledger sau khi áp và sửa nếu lệch (luật supabase-mcp).
- Vercel build mọi commit lên `main` → docs-only commit cũng deploy, vô hại nhưng CEO nên biết.
