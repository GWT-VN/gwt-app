# db/ — migration theo module

Mỗi module sở hữu schema riêng trên **cùng 1 Postgres** (`bwzmqfbcgouhvhoslmmm`),
migration để riêng từng thư mục, đánh số độc lập.

| Thư mục | Schema | Module |
|---|---|---|
| `db/cs/migrations/` | `public` (bảng `cs_*`, `tickets`, `may`…) | Customer Support |
| `db/work/migrations/` | `work` | Work |
| *(sau này)* `db/sales/migrations/` | `sales` | Sales |

## Khác gì `supabase/` ở gốc repo?

`supabase/` là thư mục **Supabase CLI** dùng cho **dev local** (`supabase start`,
`supabase db reset`): `config.toml`, baseline schema, seed. Nó KHÔNG phải nơi chứa
migration của module. Xem `docs/LOCAL-DEV.md`.

## Luật

- Đổi **bảng dùng chung** (`staff`, `customers`, `dim_channel`, catalog) → ghi 1 dòng
  Changelog trong `../GWT-SHARED/SYSTEM.md` + báo module kia TRƯỚC khi chạy.
- Module chỉ **ĐỌC** bảng của module khác; ghi ngược qua RPC `security definer` của module gốc.
- Chạy thử ở **local** trước, đừng chạy thẳng production.
- **RPC mới/đổi phải có phép thử smoke đi qua `/rest/v1/rpc/…`** (`tools/scripts/smoke_local.py`), không
  chỉ psql: role `authenticator` của PostgREST trên Supabase nạp `safeupdate` (chặn UPDATE/DELETE không
  WHERE, kể cả trong hàm security definer) — lỗi thật 07/09/2026 ở `ke_toan_dong_nhap`, CI xanh mà prod
  gãy vì smoke chưa gọi RPC đó qua HTTP.

