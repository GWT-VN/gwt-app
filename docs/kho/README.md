# Khu Kho (`/kho`) — xem sổ kho

**Chỉ xem.** Dữ liệu là **sổ số lượng kho v2** (`wh_master`, DB **GWT-Masterdata** `qynpywysgltspmgnhhga`, KHÁC DB của app).
Ai ghi sổ: bot **Bắp** đọc kênh Discord kho Nguyễn Xiển mỗi 5 phút (anh kỹ thuật nhắn "`<ngày> kho xuất/nhập` + `tên : SL lý do`",
code ở `GWT-VN/gwt-discord-bot` `admin/kho/nx-chay.mjs`). Duyệt mã / kiểm kê làm trên Google Sheet "Kho máy GWT – theo dõi"
(hoặc Portal "Duyệt kho"). App không ghi gì.

| Trang | Hàm DB (role `kho_app_doc`) | Nội dung |
|---|---|---|
| `/kho` | `wh_app_ton` | Tồn theo mã (chỉ dòng đã duyệt), cảnh báo sắp hết / âm, số dòng chờ duyệt |
| `/kho/nhat-ky` | `wh_app_nhat_ky` | Mọi dòng sổ, lọc loại / trạng thái / ngày / từ khoá, link tin Discord |
| `/kho/cho-duyet` | `wh_app_cho_duyet` | Tên hàng bot chưa biết mã (chưa tính vào tồn) |
| `/kho/bao-cao` | `wh_app_bao_cao` | Đầu kỳ · nhập · xuất · điều chỉnh · cuối kỳ theo tháng |
| `/kho/ma/[ma]` | `wh_app_the_kho` | Thẻ kho một mã, số dư chạy |

`?kho=HCM` xem kho HCM (mặc định NX).

## Kết nối
- `lib/kho/doc.ts`: `pg` tới Supabase pooler bằng role **`kho_app_doc`** — chỉ EXECUTE các hàm đọc trên, giao dịch mặc định
  read-only, không đọc thẳng bảng. Migration: GWT-Masterdata `supabase/migrations/20261103090112_wh_kho_app_doc.sql`
  (nguồn + test PGlite: gwt-discord-bot `db/kho-serial/app-doc.sql`, `shopee/kho-app-doc.test.mjs`).
- Env (local `.env.local` + Vercel): `KHO_DB_URL=postgresql://kho_app_doc.qynpywysgltspmgnhhga:<mật khẩu>@<pooler>.supabase.com:6543/postgres`;
  `KHO_DB_CA` (tuỳ chọn, PEM chứng chỉ gốc Supabase để xác minh SSL). Thiếu `KHO_DB_URL` → trang báo rõ, không vỡ.
- Quyền: `kho.ton.xem` (nhóm Kho, mức TCS = luật cũ `QUANLY`: admin + cs_manager). Gác ở `app/kho/_gac.ts`, menu ở `components/TopNav*.tsx`.

## Bật lần đầu
1. Áp migration `20261103090112_wh_kho_app_doc.sql` lên GWT-Masterdata (CI db-reset xanh) + ghi ledger.
2. SQL Editor Masterdata: `alter role kho_app_doc login password '<mật khẩu mạnh>';`
3. Đặt `KHO_DB_URL` trên Vercel (Production) → merge nhánh.
