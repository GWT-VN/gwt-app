# Đối chiếu DB: GWT-SalesTracking → GWT-Masterdata (trước khi gom DB cho v2)

> Plan sống của việc gom DB (27/11): lộ trình `docs/2026-11-27-lo-trinh-gwt-app-ve-masterdata.md` ở repo GWT-Masterdata (nhánh `feat/customer-care-issue-reports`, chưa push). File này là ảnh chụp 18/11.

Ngày 18/11/2026 · chỉ đọc (SELECT) trên **GWT-SalesTracking `bwzmqfbcgouhvhoslmmm`** (gọi tắt **ST** — DB app GWT hiện tại) và **GWT-Masterdata `qynpywysgltspmgnhhga`** (gọi tắt **MD**). Repo GWT-Masterdata đã `pull` ngang remote (`961eeef`). Số dòng là ước lượng thống kê của Postgres (`n_live_tup`), đủ để so lệch; chuyển thật sẽ đếm chính xác.

## 1. Lần chuyển trước — đã tìm ra

| | |
| --- | --- |
| Khi nào | **30/10/2026**, phiên Codex trên repo GWT-Masterdata |
| Lô | `migration_data.cskh_batches` id `gwt_app_cskh_20261030`: ST → MD, trạng thái `applied` lúc 09:01 UTC; lưu cả ảnh chụp dữ liệu MD trước khi thay (`expected_before`) để lùi |
| Chép gì | **chỉ 5 bảng CSKH**: customers 456 · installed_base 531 · warranty 517 · tickets 101 · customer_contacts 3 (thay bản MD cũ từ 07/2026) |
| Dựng thêm | schema `customer_care` (audits, change_requests, staff_links 3, ticket_counters, ticket_notes) + RPC ghi có gác quyền + hợp đồng đọc `api.cskh_read` cho **GWT-ERP** |
| Migration trên MD | 4 migration **đã áp live và có trong ledger**: `20261030081330_cskh_prepare_gwt_app_replacement`, `20261030081333_cskh_replace_from_gwt_app_batch`, `20261030100158_cskh_core_rpc`, `20261030115514_cskh_read_v2` — lúc 18/11 file chỉ nằm trên 2 nhánh chưa merge `codex/cskh-core-rpc`, `codex/cskh-read-v2`; **nay cả 4 file đã ở MD `main`** (kiểm 27/11) |
| Sau đó | App GWT vẫn ghi vào ST → bản MD **đứng yên từ 30/10**, đã cũ 19 ngày |

## 2. So từng bảng

Ký hiệu trạng thái: **MD cũ** = có ở MD nhưng là bản chép cũ · **chỉ ST** = MD chưa có · **gương** = ST chép từ MD (MD là nguồn) · **trùng tên khác nghĩa** = cùng tên bảng nhưng không cùng dữ liệu.

### CSKH

| Bảng ST | ST | MD | Trạng thái |
| --- | --- | --- | --- |
| `cs_customers` | 460 | `customers` 456 | MD cũ (chép 30/10; ST thêm 4) |
| `customer_contacts` | 3 | 3 | khớp số (30/10) |
| `customer_addresses` | 3 | — | chỉ ST |
| `installed_base` | 535 | 531 | MD cũ (+4) |
| `warranty` | 522 | 517 | MD cũ (+5) |
| `tickets` | 114 | 101 | MD cũ (+13; cột mới 17/11 `ngay_bao`, `cs_theo_doi` chưa có ở MD) |
| `ticket_note` · `ticket_note_tep` | 162 · 0 | `customer_care.ticket_notes` 0 | chỉ ST — **nhật ký ticket chưa từng chép** |
| `ticket_may` · `ticket_lan_loi` · `ticket_muc` | 114 · 11 · 1 | — | chỉ ST |
| `loi_danh_muc` | 25 | — | chỉ ST |
| `issue_group` · `issue_override` | 17 · 0 | 13 · 0 | MD cũ (07/2026, chưa có 4 nhóm mới 18/11) |
| `filter_replacement` | 0 | 0 | rỗng cả hai |
| `maintenance_plan` | 80 | 78 | MD cũ (07/2026 — **không** nằm trong lô 30/10) |
| `maintenance_visit` | 475 | 534 | MD cũ 07/2026 **nhiều hơn** ST → ST đã xoá/gộp lượt sau 07; ST là nguồn đúng |
| `serial_registry` · `serial_pending` · `serial_su_dung` · `serial_trang_thai` | 2394 · 9 · 45 · 10 | — | chỉ ST |
| `ky_thuat` · `ky_thuat_nghi` · `lich_ky_thuat` · `lich_ky_thuat_viec` | 1 · 0 · 2 · 2 | — | chỉ ST |
| `yeu_cau_thay_doi` · `yeu_cau_export` | 1 · 0 | `customer_care.change_requests` 0 | chỉ ST (MD có bảng tương đương mới, rỗng) |
| `audit_log` | 227 | `customer_care.audits` 0 | chỉ ST |
| `company_customers` | 84 | — | chỉ ST |
| `media` · `bang_view` | 0 · 0 | — | rỗng |

### Sales

| Bảng ST | ST | MD | Trạng thái |
| --- | --- | --- | --- |
| `customers` (khách Sales, mã KH/KA) | 514 | `customers` là **khách CSKH** | **trùng tên khác nghĩa** |
| `customer_purchases` | 1088 | — | chỉ ST |
| `sales_order_lines` (gương Sheet) · `sales_order_sheet_bo_sung` | 1086 · 613 | — | chỉ ST |
| `sales_orders` · `sales_order_items` | 1 · 3 | — | chỉ ST |
| `sales_bac_khach` · `sales_chinh_sach_gia` | 4 · 62 | — | chỉ ST |
| `sales_ctkm` (+ `_kenh` `_khach` `_qua` `_sp` `_tru_nhom`) | 21 (+45 · 0 · 19 · 38 · 0) | — | chỉ ST |
| `dim_channel` | 26 | foreign table `sales_channel` → ST (trả 0 dòng) | chỉ ST |
| `product_price` | 51 | 51 | **gương** (MD: chủ là Admin-Portal) |
| — | — | `sales.shopee_*` (ERP: orders 771, lines 1016, payouts 956, traffic 290, stocks 45) | chỉ MD (của ERP) |

### Catalog

| Bảng ST | ST | MD | Trạng thái |
| --- | --- | --- | --- |
| `catalog_item` · `catalog_category` · `supplier_code` · `product_bundle` · `product_filter` · `product_warranty` | 329 · 64 · 46 · 19 · 38 · 20 | bằng nhau | **gương** — MD là nguồn (`gen_catalog_sync`) |
| `catalog_sync_log` | 116 | — | nhật ký đồng bộ gương, bỏ khi chuyển |

### Nền tảng · Việc · Kế toán · Wiki

| Bảng ST | ST | MD | Trạng thái |
| --- | --- | --- | --- |
| `staff` | 8 | `staff` 4 (Admin-Portal) | **trùng tên khác tập** — phải gộp |
| `quyen_vai_tro` (ma trận quyền) · `nhat_ky_lech_quyen` | 201 · 2 | — | chỉ ST |
| `cs_staff` | 2 | — | cũ (đã gộp vào `staff` 28/07), bỏ |
| `expense_category` | 27 | 27 | **gương** (MD: chủ Admin-Portal) |
| `work.*` (16 bảng: task 5, activity 45, team 4, team_member 16, auto_rule 3…) | ~90 dòng | — | chỉ ST |
| `accounting.*` (corrections 849, invoice_lines 408, rules 719, periods 1…) | ~2000 | — | chỉ ST (module Kế toán, code chưa merge vào app) |
| `wiki.*` (ingest_runs, proposals, watermarks) | 5 | — | **bỏ, không chuyển** (18/11: tính năng Wiki Training Ingest bỏ; Bắp làm thay sau — luồng D9) |

### Bảng sao lưu / tạm ở ST — đề xuất không chuyển (lưu file rồi bỏ)

`_backup_50_notes` 73 · `cs_customer_code_remap_20260812` 120 · `cs_customer_code_remap_20260824` 128 · `customers_an_thongtin_luu_20260831` 107 · `customers_ma_cu_luu_20260824` 428 · `warranty_bak_combo_backfill_20260811` 371 · `report_allowlist` 0.

## 3. Phát hiện cần biết trước khi quyết

1. **Bản CSKH trên MD đang có người đọc**: GWT-ERP đọc qua `api.cskh_read` — dữ liệu đó đã cũ 19 ngày (thiếu 13 ticket, toàn bộ nhật ký ticket, lịch bảo trì mới).
2. **Repo MD lệch ledger**: 4 migration CSKH 30/10 đã áp live nhưng file chỉ ở 2 nhánh Codex chưa merge. Theo luật DB phải đưa file về `main` trước khi thêm migration mới.
3. **Hai hệ khách vẫn còn**: MD `customers` = khách CSKH (từ `cs_customers`), ST `customers` = khách Sales. Gom DB buộc phải chốt **một hệ khách** (v2 yêu cầu) hoặc đặt tên tách bạch.
4. **Luật masterdata gốc** "`customers`, `installed_base`, `customer_contacts`, `catalog_item` chỉ chị Trang thêm mã" đụng với việc CSKH/Sales hằng ngày tạo khách, lắp máy → phải chốt lại phạm vi luật này cho v2.
5. **Lô 30/10 chỉ là thay 5 bảng**, không phải chuyển cả app. Lần này phải chuyển **toàn bộ** (khoảng 60 bảng có dữ liệu), chép lại từ đầu tại thời điểm chuyển, không cộng dồn từ lô 30/10.
6. **Nhân viên hai nơi**: `staff` ST 8 người (có vai trò mảng, ma trận quyền) và MD 4 người (Portal) — cần gộp theo email.
7. **ID chéo**: lô 30/10 giữ ID kênh/nhân viên của ST như tham chiếu thô, chưa nối với `staff`/kênh của MD.

## 4. Đã chốt (anh Dũng 18/11)

- **Chỉ v2 dùng Masterdata.** v1 vẫn chạy trên GWT-SalesTracking tới khi v2 thay; dữ liệu chuyển **một lần lúc v2 lên chạy thật**.
- 🛡️ **Masterdata chỉ bổ sung** — mọi dữ liệu và object đang có giữ nguyên; chỉ được sửa phần đã chuyển từ GWT-App ngày 30/10 (lô `gwt_app_cskh_20261030`: dòng GWT-App trong 5 bảng CSKH + `customer_care` + `api.cskh_read`). Luật ghi ở `GWT-Masterdata/rules/supabase-mcp.md` (PR GWT-VN/GWT-Masterdata#34), `GWT-Masterdata/CLAUDE.md`, file mô tả app mục 6.
- **Repo GWT-Masterdata liên kết với gwt-app** (đặt cạnh nhau, `gwt.code-workspace`): migration DB v2 viết ở Masterdata.

## 5. Cách làm (đề xuất, theo luật trên)

1. **Đưa 4 migration CSKH 30/10 về `main` của Masterdata** (merge `codex/cskh-core-rpc`, `codex/cskh-read-v2` hoặc chép 4 file) — đây là phần "đã chuyển", được phép đụng; repo khớp ledger, CI `db-reset` xanh.
2. **Cấu trúc v2 = schema mới cho từng module GWT-App** (không trộn vào schema đang có, trừ `customer_care`); bảng đang có (`staff` — chỉ dùng đăng nhập, catalog, giá, kho, chấm công, sổ quỹ, chatbot, video, `sales.shopee_*`) chỉ đọc; thêm trường cho bảng đang có → bảng mở rộng 1–1.
3. **Lô dữ liệu cuối** lúc v2 lên: đóng băng ghi app + bot, chép toàn bộ từ SalesTracking (bảng mới: INSERT; 5 bảng CSKH: upsert chỉ dòng GWT-App), ghi lô vào `migration_data` (ảnh chụp trước + số đếm), đếm khớp từng bảng; SalesTracking giữ chỉ đọc 30 ngày.
4. **Đổi đích cùng lúc**: app v2, bot Bắp (ticket, serial, đơn), ERP vẫn đọc `api.cskh_read` (giờ có dữ liệu mới).

## 6. Câu còn cần anh trả lời

1. **Một hệ khách**: khách Sales (514, ST `customers`) đi vào đâu — gộp với khách CSKH ở `public.customers` (là bảng ngoại lệ, chỉ dòng GWT-App) hay bảng mới trong schema Sales của v2?
2. ~~Luật masterdata gốc~~ **Đã chốt 18/11 (cách 1):** app v2 tạo khách/máy trực tiếp, chị Trang rà sau; catalog chỉ đọc (PR GWT-VN/GWT-Masterdata#36).
3. ~~`staff`~~ **Đã chốt 18/11:** giữ `public.staff` để đăng nhập (chỉ đọc); giao việc theo **tên người** — bảng người mới trong schema GWT-App nối tới tài khoản `staff`, không theo email.
4. **Kế toán** (chỉ ở ST): chuyển cùng đợt v2 hay để sau? *(Wiki đã chốt 18/11: không có DB phải chuyển — ingest bỏ, Bắp làm thay.)*
