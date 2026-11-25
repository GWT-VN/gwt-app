# Handoff 25/11/2026 — Sổ kho HCM (Eton) như kho Nguyễn Xiển

**Mục tiêu (CEO chốt 25/11):** kho HCM do Eton giữ cũng có sổ nhập/xuất y như kho NX — mỗi lần nhập/xuất thành
một dòng trong sổ kho v2, xem ở `/kho?kho=HCM`, chờ duyệt, báo cáo tháng, thẻ kho. Không ai phải nhắn tay.

**Trạng thái:** mới xong bước tìm hiểu. Chưa có code, chưa có thiết kế duyệt. Phiên tiếp theo chạy trên **MacBook →
Mac mini** (máy Windows không có Tailscale nên không SSH được Mac mini).

## 1. Việc tiếp theo (theo thứ tự)

1. **Đổi mật khẩu tài khoản phần mềm kho Eton** — 25/06 có tin trong #e-com dán tài khoản + mật khẩu (ghi ở
   handoff Marketing-kit 17/11). Xoá tin đó.
2. **Spike xem CCP (vứt đi, ~15 phút):** trên Mac mini mở một hồ sơ trình duyệt riêng (Playwright
   `launchPersistentContext`, có giao diện — xem qua VNC), CEO **tự đăng nhập** `https://ccp.eton.vn` (Claude không
   gõ mật khẩu). Claude chỉ ĐỌC, không bấm nút ghi nào, ghi lại:
   - trang nào có **nhập/xuất theo chứng từ** (ngày, loại, SKU, SL, mã phiếu/đơn), trang nào có **tồn**;
   - có nút **xuất Excel/CSV** không, file có những cột gì;
   - phiên đăng nhập sống bao lâu, có captcha / OTP / 2FA không;
   - SKU trên CCP có trùng `internal_code` của GWT không.
   → Kết quả spike quyết bộ đọc nên **đọc bảng trên màn hình** hay **tải file**.
3. Brainstorm → grilling → thiết kế (`docs/superpowers/specs/…`) → CEO duyệt → plan. Đừng code trước bước này.

## 2. Hướng đã chọn: A — trình duyệt trên Mac mini đọc CCP

| | A. Trình duyệt đọc CCP *(chọn)* | B. API Eton | C. Xuất file CCP → tải lên app |
|---|---|---|---|
| Tiền | 0đ | thuê bao năm (mục 4) | 0đ |
| Tự động | Có (lịch launchd) | Có | Không |
| Độ bền | Gãy khi Eton đổi giao diện; hết phiên phải đăng nhập lại | Bền nhất | Gãy khi đổi mẫu file |

**Tách hai phần** để sau đổi nguồn không phải làm lại:
- **Bộ ghi sổ HCM**: nhận dòng nhập/xuất đã chuẩn hoá → ghi `wh_master` với `warehouse = 'HCM'`. Khoá chống trùng =
  mã chứng từ Eton + SKU (thay cho `discord_msg_id` + `line_no` của NX). Tên/SKU lạ → `need_review` (chờ duyệt).
- **Bộ đọc**: bây giờ là CCP qua trình duyệt; có API thì thay bằng `inventory-inbound-outbound`.

**Khoá chỉ đọc phải nằm trong code, không trông vào Claude tự giữ** (luật C "fail-closed ở tầng harness"): chặn mọi
request không phải GET tới CCP (Playwright `page.route` → `abort`), chỉ mở ngoại lệ cho đúng request đăng nhập /
xuất file đã liệt kê. CCP có nút tạo/huỷ đơn — bấm nhầm là đơn thật.

## 3. Kho NX đang chạy thế nào (để làm HCM giống)

- Code bot: `GWT-VN/GWT-Agent-Team` (từ 23/11 gộp `gwt-discord-bot` vào; bản cũ `admin/kho/nx-chay.mjs`). Chạy trên
  Mac mini `~/Bots/`, launchd 5 phút, lặp 20 giây. **Bẫy:** hai repo dùng chung nhãn launchd `com.gwt.bap.*` — kiểm
  plist trỏ thư mục nào trước khi cài lịch mới.
- Ghi sổ: REST Supabase **GWT-Masterdata** `qynpy…` bảng `wh_master` (`warehouse`, `ngay`, `loai`, `internal_code`,
  `raw_name`, `qty`, `purpose`, `note`, `review_status`…), upsert `on_conflict=discord_msg_id,line_no`.
- App đọc qua role `kho_app_doc` (chỉ hàm `wh_app_*`), sửa qua `wh_sua_dong`… — xem `docs/kho/README.md`.
  `apps/web/lib/kho/nhan.ts` đã có kho `HCM`.
- **Chưa kiểm:** `wh_master` hiện có dòng `HCM` nào chưa, ai nhập. Kênh Discord `#kho-eton` đang có ai nhắn
  nhập/xuất không (Nho có quét kênh này; Bắp bị 403 ở đó ngày 23/11).
- Sổ HCM cần cột nào mà `wh_master` chưa có (mã chứng từ Eton) → migration ở **repo GWT-Masterdata**, đi đủ 6 bước
  `supabase-mcp.md`.

## 4. API Eton (đường B — đang hỏi giá, chưa ký)

Docs: `https://api.eton.vn/` (Redoc), spec `https://api.eton.vn/swagger/V0.2/swagger.json` (đọc 25/11).

- Server `http://exp.eton.vn` (spec ghi http — hỏi có https). OAuth2 client credentials, scope `externalapi`,
  token `POST {STS_HOST}/connect/token/` (STS_HOST hỏi Eton; token mẫu có `iss` = `idt.eton.vn` — đoán).
- **Bắt buộc whitelist IP tĩnh** (403 nếu lạ) → Vercel không gọi được; gọi từ Mac mini/VPS.
- Lệnh đọc kho (v0.2) — 3 lệnh đọc dùng POST vì có bộ lọc:

  | Việc | Endpoint |
  |---|---|
  | Danh mục SKU | `GET /api/v0.2/products` |
  | Nhập/xuất theo ngày | `POST /api/v0.2/inventories/inventory-inbound-outbound` (`warehouseCode`, `listSku`, `fromDate`, `toDate`) |
  | Tồn hiện tại | `POST /api/v0.2/inventories/search` → `sku, clientSKU, inStock, available, pendingIn, pendingOut, allocated, reserved` |
  | Tồn chốt theo ngày | `POST /api/v0.2/inventories/audit` (`warehouseCode`, `auditDate`) |
  | Mã kho | `GET /api/v0.2/warehouses` |

- API danh sách chỉ trả **60 ngày gần nhất** → phải đồng bộ đều.
- **Báo giá API** (19/11) là tài liệu bảo mật của Eton → **không chép vào repo**; file gốc CEO giữ. Cấu trúc: phí
  khởi tạo 1 lần + gói tháng bắt buộc (hợp đồng theo năm, tính theo "giao dịch thành công") + hỗ trợ kỹ thuật tuỳ chọn.
  Dữ liệu xem/xuất **miễn phí** qua CCP — lý do chọn hướng A.
- **Đang hỏi Eton (25/11):** phí kiểm thử có bắt buộc không; "giao dịch" có đếm toàn bộ đơn khi GWT chỉ đọc không;
  số API trong báo giá lệch với 14 mục GWT gửi; đăng ký IP.

## 5. Dữ liệu cần lấy (dù nguồn nào)

1. Danh mục SKU Eton (`sku`, `clientSku`, tên) → ghép `internal_code`.
2. Từng lần nhập/xuất: ngày, loại, SKU, SL, mã chứng từ (đơn bán/đơn nhập/hoàn) → dòng sổ.
3. Tồn hiện tại → đối chiếu sổ; `available` cho đối chiếu tồn Shopee hằng tuần.
4. Tồn chốt cuối tháng → đầu kỳ/cuối kỳ báo cáo.
5. (nếu cần) serial máy — chưa thấy endpoint, hỏi CEO có cần theo dõi serial kho HCM không.
