# Khu Kho (`/kho`) — xem + sửa sổ kho

**Xem** cho mọi nhân sự có `kho.ton.xem`; **sửa** (Đợt 3, 04/11/2026) cho người có `kho.so.sua` (mặc định chỉ admin). Dữ liệu là **sổ số lượng kho v2** (`wh_master`, DB **GWT-Masterdata** `qynpywysgltspmgnhhga`, KHÁC DB của app).
Ai ghi sổ: bot **Bắp** đọc kênh Discord kho Nguyễn Xiển liên tục (~20 giây/lượt, `nx-chay.mjs theo-doi`) (anh kỹ thuật nhắn "`<ngày> kho xuất/nhập` + `tên : SL lý do`",
code ở `GWT-VN/gwt-discord-bot` `admin/kho/nx-chay.mjs`). Sửa / huỷ dòng, duyệt mã, kiểm kê làm được **trên app** hoặc trên
Google Sheet "Kho máy GWT – theo dõi" (hoặc Portal "Duyệt kho") — **sửa hai chiều**: app và Sheet cùng ghi qua ĐÚNG các hàm DB
`wh_*` bên dưới, DB vẫn là nguồn duy nhất, Sheet cập nhật từ DB ~20 giây/lượt (chỉ ghi tab có thay đổi); trang app tự làm mới mỗi 20 giây (`app/kho/_tu-lam-moi.tsx`). Mọi lần sửa ghi vào `wh_nhat_ky_sua` (hành động,
nguồn app / sheet / portal / bot, người = email, trước → sau, lý do) → trang `/kho/lich-su-sua`.

| Trang | Hàm DB (role `kho_app_doc`) | Nội dung |
|---|---|---|
| `/kho` | `wh_app_ton` | Tồn theo mã (chỉ dòng đã duyệt), cảnh báo sắp hết / âm, số dòng chờ duyệt |
| `/kho/nhat-ky` | `wh_app_nhat_ky` | Mọi dòng sổ, lọc loại / trạng thái / ngày / từ khoá, link tin Discord |
| `/kho/cho-duyet` | `wh_app_cho_duyet` | Tên hàng bot chưa biết mã (chưa tính vào tồn) |
| `/kho/bao-cao` | `wh_app_bao_cao` | Đầu kỳ · nhập · xuất · điều chỉnh · cuối kỳ theo tháng |
| `/kho/ma/[ma]` | `wh_app_the_kho` | Thẻ kho một mã, số dư chạy |
| `/kho/kiem-ke` | `wh_app_ton` + `wh_app_danh_muc` → ghi `wh_kiem_ke` | Chỉ người có `kho.so.sua`. Tồn theo mã + ô "SL đếm" → bảng kết quả (tồn trước, đếm, chênh) |
| `/kho/lich-su-sua` | `wh_app_lich_su_sua` | Lịch sử sửa sổ (lúc, hành động, nguồn, người, trước → sau, lý do), lọc nguồn / hành động, phân trang |

### Sửa trên app (người có `kho.so.sua`)
| Ở đâu | Thao tác | Hàm DB |
|---|---|---|
| `/kho/nhat-ky` mỗi dòng | **Sửa** (ngày, loại, mã, SL, lý do / cho ai, ghi chú, lý do sửa) — chỉ gửi trường đổi; gán mã cho dòng chờ = duyệt luôn. Sửa xong dòng bị **khoá** (nhãn "sửa tay · người · ngày"): bot không ghi đè khi tin Discord gốc bị sửa | `wh_sua_dong` |
| `/kho/nhat-ky` mỗi dòng | **Huỷ** (bắt buộc lý do, hỏi xác nhận) — không xoá, đánh dấu `rejected` | `wh_huy_dong` |
| `/kho/cho-duyet` mỗi dòng | Chọn mã (điền sẵn mã bot gợi ý) + "Nhớ tên này cho lần sau" (mặc định bật → gửi `raw_norm` = `chuanTen(raw_name)`, bot tự nhận lần sau) → **Duyệt** | `wh_duyet_dong` |
| `/kho/cho-duyet` mỗi dòng | **Bỏ qua** (không phải hàng kho, lý do tuỳ chọn) | `wh_bo_qua_dong` |
| `/kho/kiem-ke` | Ghi kiểm kê: mã lệch → dòng "Điều chỉnh" đã duyệt, ngày hôm nay, **có hiệu lực ngay** | `wh_kiem_ke` |

Lỗi nghiệp vụ từ DB (`raise exception` tiếng Việt, vd "Mã X không có trong danh mục") hiện nguyên văn cho người dùng.
`chuanTen` ở `lib/kho/sua.ts` là bản chép ĐÚNG hàm cùng tên của bot (`gwt-discord-bot/shopee/kho-nx-doc.mjs`) — bot đổi thì đổi theo
(test `lib/kho/sua.test.ts` chốt ví dụ chạy thật trên file gốc).

`?kho=HCM` xem kho HCM (mặc định NX).

## Kết nối
- `lib/kho/doc.ts` (đọc): `pg` tới Supabase pooler bằng role **`kho_app_doc`** — chỉ EXECUTE các hàm `wh_app_*`, giao dịch mặc định
  read-only, không đọc thẳng bảng.
- `lib/kho/ghi.ts` (ghi, Đợt 3): dùng CHUNG pool của `doc.ts`; mỗi lệnh lấy MỘT client, chạy `BEGIN READ WRITE` → `select public.wh_xxx($1::jsonb)`
  → `COMMIT` (lỗi → `ROLLBACK`, rollback hỏng thì huỷ client). Chỉ gọi 5 hàm trong `HAM_GHI`, luôn kèm `nguon:'app'` + `nguoi:<email>`.
  Phần thuần (kiểm dữ liệu, `chuanTen`, chữ "trước → sau") ở `lib/kho/sua.ts`. Server Action: `app/kho/actions.ts` — mỗi action
  `requireNhanSu()` + `coQuyen('kho.so.sua', 'ADMIN')`, trả `{ok:true,…} | {ok:false,error}`.
  Migration hàm ghi: GWT-Masterdata `supabase/migrations/20261104140000_wh_sua_hai_chieu.sql` (nguồn + test PGlite: gwt-discord-bot
  `db/kho-serial/sua-hai-chieu.sql`, `shopee/kho-sua-hai-chieu.test.mjs`). Migration: GWT-Masterdata `supabase/migrations/20261103090112_wh_kho_app_doc.sql`
  (nguồn + test PGlite: gwt-discord-bot `db/kho-serial/app-doc.sql`, `shopee/kho-app-doc.test.mjs`).
- Env (local `.env.local` + Vercel): `KHO_DB_URL=postgresql://kho_app_doc.qynpywysgltspmgnhhga:<mật khẩu>@<pooler>.supabase.com:6543/postgres`;
  `KHO_DB_CA` (tuỳ chọn, PEM chứng chỉ gốc Supabase để xác minh SSL). Thiếu `KHO_DB_URL` → trang báo rõ, không vỡ.
- Quyền: `kho.ton.xem` (xem — mức NS, mọi vai trò từ 04/11/2026) và `kho.so.sua` (sửa — mức A = luật cũ `ADMIN`, CEO chốt "ai cầm
  tài khoản ai@gwt.vn được sửa"). Gác ở `app/kho/_gac.ts` (`chanKho`, `coTheSuaKho`) + `app/kho/actions.ts`, menu ở `components/TopNav*.tsx`
  (mục "Kiểm kê" chỉ hiện khi có `kho.so.sua`). Prod cần dòng `quyen_vai_tro ('admin','kho.so.sua')` khi bật `MA_TRAN_QUYEN`.

## Bật lần đầu
1. ✅ 03/11/2026: áp migration `20261103090112_wh_kho_app_doc.sql` lên GWT-Masterdata (CI db-reset xanh) + ghi ledger.
2. ✅ 03/11/2026: `kho_app_doc` bật login (mật khẩu đặt bằng bản băm SCRAM; chuỗi kết nối lưu ở Mac mini
   `~/Bots/.secrets/kho-app-doc.env`). Đã kiểm kết nối thật: đọc OK; đọc thẳng bảng / ghi / gọi hàm duyệt đều bị chặn.
3. Đặt `KHO_DB_URL` trên Vercel (Production + Preview, loại Sensitive) → merge nhánh.
4. Đợt 3 (sửa trên app): áp migration `20261104140000_wh_sua_hai_chieu.sql` lên GWT-Masterdata + thêm dòng
   `quyen_vai_tro ('admin','kho.so.sua')` trên DB app **TRƯỚC** khi merge. Chưa áp migration mà đã merge → nút Sửa báo
   "DB kho chưa có hàm ghi", trang nhật ký vẫn xem được (bản `wh_app_nhat_ky` cũ chỉ thiếu cờ sửa tay).
