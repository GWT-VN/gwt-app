# Quy ước Migration — CHỐT 19/08/2026 (đọc trước khi đổi DB)

> Mục tiêu: **local (Supabase CLI) và prod KHÔNG BAO GIỜ lệch schema.**
> Vấn đề cũ: Supabase CLI chỉ đọc `supabase/migrations/`, nhưng migration lịch sử nằm ở
> `db/cs/migrations` (52) + `db/work/migrations` (3) → CLI không thấy → dễ lệch.

## Sự thật kỹ thuật (không cãi được)
- `supabase db reset` / `supabase start` **chỉ áp file trong `supabase/migrations/`**. Không có cách trỏ CLI sang nhiều thư mục (chỉ seed mới đa-đường-dẫn được).
- `supabase/migrations/20250101000000_baseline.sql` = **ảnh chụp TOÀN BỘ schema prod tính đến 19/08/2026** (đã gộp kết quả của cả 52 migration CS + 3 work). Đây là lý do db reset dựng ĐÚNG schema hiện tại.

## Quy ước (áp dụng từ nay)
1. **`supabase/migrations/` là thư mục DUY NHẤT cho migration MỚI.** Local + prod đều lấy từ đây.
2. **Đặt tên file có tiền tố module** để vẫn rõ chủ sở hữu: `20260820_work_them_cot_x.sql`, `20260820_cs_sua_ticket.sql`, `20260820_sales_don_hang.sql`.
3. **`20250101000000_baseline.sql`**: chỉ để dựng LOCAL. **KHÔNG áp lại lên prod** (prod đã có sẵn nội dung này).
4. **`db/cs/migrations/`, `db/work/migrations/`**: **LỊCH SỬ (đã gộp vào baseline)** — đọc tham khảo, **KHÔNG thêm file mới vào đây**. Xem `db/*/migrations/README` (đánh dấu archive).
   - Ngoại lệ đo được 04/09/2026: `db/work/migrations/work_02`…`work_04b` KHÔNG nằm trong baseline (baseline
     dump trước khi 4 file đó được áp), và `work_13`…`work_17` chưa từng được chép sang
     `supabase/migrations/` — cả hai lỗ khiến `db reset` từ 0 gãy. Hai file
     `supabase/migrations/20260819235800_work_02_04b_truy_linh_local.sql` và
     `20260822080000_work_13_17_truy_linh_local.sql` chép lại nội dung archive để vá; chúng **CHỈ
     DÙNG LOCAL/CI, KHÔNG BAO GIỜ áp lên live** — cùng quy chế với baseline ở mục 3, vì live đã có
     sẵn các object đó rồi.
   - 04/09/2026: `sales_lich_su_chinh_sach_gia` đổi số hiệu 20260822100000 → 20260822100001 vì
     trùng version với `cs_may_gan_don_dai_ly` (replay local gãy); ledger live ánh xạ theo tên
     nên không ảnh hưởng live. Luật: hai file không được cùng số hiệu.

## Hợp thức hoá 04/09/2026 (ledger live → repo)

Đối chiếu `supabase_migrations.schema_migrations` (ledger live, cột `statements` = SQL đã
chạy thật) với `supabase/migrations/`: **32 entry ledger (19–31/08) không có file trùng tên**
(`<version>_<name>.sql`), và **7 entry khác đã có file trong repo nhưng dưới TÊN KHÁC + số
hiệu tự gõ tay đặt SAI vị trí** — nặng nhất là `ma_kh_lam_khoa_ve_tinh` (ledger `20260822064931`,
repo cũ gắn `20260822130000`) chạy SAU cả hai migration cần cột `ma_kh` nó tạo ra, nên `db reset`
từ 0 sẽ gãy ở đúng chỗ đó dù đã vá vòng 1–2.

**Luật: repo mirrors ledger.** Tên file migration mới PHẢI đúng `<version>_<name>.sql` như ledger
ghi — không tự đặt timestamp tròn giờ. Sau khi áp live bằng MCP `apply_migration` phải SELECT
lại `schema_migrations` và sửa `version` bằng `execute_sql` ngay nếu lệch với tên file (xem luật
`apply_migration` ghi `version` = giờ áp thực, không phải số hiệu trong tên — rules/supabase-mcp.md
bước 3). 32 file hợp thức hoá đã ghi header nêu rõ "KHÔNG áp lại lên live (đã có)" — cùng quy chế
mục 3/4 ở trên.

**Chưa xử lý xong (ghi lại để không quên):** rà ledger đầy đủ 19/08→31/08 lộ thêm ~20 file khác
cũng mang số hiệu tự gõ tay (tròn giờ, kiểu `20260821120000`) lệch với version ledger thật, nhưng
KHÔNG đổi thứ tự tương đối gây gãy replay (đã qua CI round 1–2 không lỗi) — nên CHƯA đổi, chỉ ghi
nhận rủi ro. Đồng thời `nen_tang_xoa_nhan_su` xuất hiện 2 lần trong ledger (`20260821000000` —
`statements` NULL, và `20260821075222` — có nội dung thật, 2130 ký tự); repo chỉ có file khớp
version đầu. Không đụng vì CI đã qua điểm này không lỗi; cần rà kỹ hơn nếu sau này đổi 2 file đó.

- Vòng 2 cùng ngày: 19 file có tên khớp ledger nhưng số hiệu tay lệch được `git mv` về đúng version ledger (nội dung nguyên) để replay đúng thứ tự phụ thuộc; danh sách trong git log commit này.

## Guard dữ liệu live 04/09/2026 (db reset local/CI gãy vì bảng mirror rỗng)

Sau khi hết lỗi thứ tự file, `db reset` gãy ở `20260831075028_sales_nhap_ctkm_ban_le_t1_t9.sql`:
`insert into public.sales_ctkm_kenh` FK `channel_id → dim_channel(id)` — trên **live** `dim_channel`
có sẵn (mirror từ Masterdata qua `sync_catalog()`, chạy bằng cron/job không có trên local/CI), trên
**local rỗng** vì bảng chỉ được TẠO ở baseline, không có dòng nào. `channel_id` trong hai migration
này là literal (`90`, `81`) viết tay trong `VALUES`, không tự suy từ `dim_channel`, nên chắc chắn vi
phạm FK khi bảng rỗng.

**Luật thêm:** migration dữ liệu tham chiếu bảng mirror-từ-Masterdata (`dim_channel`, `catalog_item`,
`product_price`, …) mà insert bằng ID/mã VIẾT TAY (không tự suy từ chính bảng mirror đó) phải bọc
`where exists (select 1 from <bảng mirror> x where x.id = <giá trị viết tay>)` ở đúng statement
insert đó — no-op trên live (hàng đã có), tránh FK 23503 trên local/CI (hàng chưa có). Không cần
bọc khi giá trị SELECT ra thẳng TỪ bảng mirror (vd `cross join dim_channel d` rồi dùng `d.id`) —
trường hợp đó tự an toàn vì không thể tạo ra ID không tồn tại.

Đã áp cho `20260831075028_sales_nhap_ctkm_ban_le_t1_t9.sql` và
`20260831091127_sales_ctkm_ban_le_dung_gia_va_qua.sql` (cả hai insert `sales_ctkm_kenh` với
`channel_id` viết tay). Đã soát `20260831074946_sales_nhap_chinh_sach_gia_3_cap.sql` (không đụng
bảng mirror nào) và `20260831092608_sales_chinh_sach_va_km_loi_loc.sql` (join/cross join
`product_price`/`dim_channel` nhưng lấy ID thẳng từ bảng mirror hoặc INNER JOIN nên rỗng = 0 dòng,
không lỗi) — cả hai KHÔNG cần guard.

## Vòng đời 1 migration mới (local → prod)
```bash
# 1. Tạo file trong supabase/migrations/
supabase migration new work_them_cot_ghi_chu     # -> supabase/migrations/<ts>_work_them_cot_ghi_chu.sql
#    (sửa file .sql)

# 2. Áp + test LOCAL (giữ data đang có)
supabase migration up          # KHÔNG dùng db reset nếu muốn giữ data đã nạp

# 3. Áp lên PROD: qua Supabase MCP apply_migration (cùng tên) — nhờ Claude áp.
#    KHÔNG áp baseline lên prod.
```
→ Cùng 1 FILE dùng cho cả local (bước 2) lẫn prod (bước 3) → không lệch.

## Định kỳ gộp baseline (tuỳ chọn, khi supabase/migrations/ nhiều file mới)
```bash
supabase db dump --schema public,work -f supabase/migrations/20250101000000_baseline.sql
# rồi xoá các file migration đã gộp vào baseline (giữ lịch sử ở db/cs, db/work).
```
Giữ local rebuild nhanh + baseline luôn bám prod.

## ⚠️ Lưu ý phối hợp
Layout `db/<module>/migrations/` do phiên restructure đặt. Quy ước này **đặt migration MỚI ở `supabase/migrations/`** (chỗ CLI đọc). Nếu đội muốn giữ nguồn theo module ở `db/<module>/`, cần thêm **script copy `db/*/migrations/*.sql` → `supabase/migrations/`** trước khi `db reset` — nhưng đơn giản nhất là dùng 1 thư mục `supabase/migrations/` + tiền tố tên như trên.
