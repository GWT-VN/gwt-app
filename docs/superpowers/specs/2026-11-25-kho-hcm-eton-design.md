# Thiết kế — Sổ kho HCM tự động từ Eton (CCP)

Ngày 25/11/2026 · nguồn: [`docs/kho/handoff-2026-11-25-kho-hcm-eton.md`](../../kho/handoff-2026-11-25-kho-hcm-eton.md) (mục 1b = kết quả spike)

## 1. Vì sao

Kho HCM do Eton giữ. Mỗi lần Eton nhập/xuất, phần mềm Eton (CCP) **tự cập nhật** — đó là nguồn sự thật. GWT cần
sổ HCM y như kho Nguyễn Xiển (NX): mỗi lần nhập/xuất là một dòng trong sổ kho v2 (`wh_master`), xem ở
`/kho?kho=HCM`, có chờ duyệt, báo cáo tháng, thẻ kho — **không ai phải nhắn tay**.

Khác NX: ở NX tin Discord của anh Bình, anh Linh **là nguồn** của sổ. Ở HCM, tin Discord **chỉ là thông báo**
(viết giống kiểu anh Bình, anh Linh vẫn nhắn) để mọi người biết có nhập/xuất.

## 2. Mục tiêu · không làm · thất bại dù chạy được

**Mục tiêu**
- Mỗi dòng "Nhập xuất tồn" của CCP → đúng một dòng `wh_master` `warehouse='HCM'`, tự động, ~15 phút một lần.
- Dữ liệu cũ từ 06/2026 vào sổ một lần (không đăng tin cho phần cũ).
- Có dòng mới → đăng tin thông báo, mỗi chứng từ Eton một tin. Giai đoạn đầu đăng **kênh test**, chạy ổn mới chuyển
  sang `#kho-eton` (bằng một cờ cấu hình, không sửa code).
- Lỗi / cần đăng nhập lại → **Bắp nhắn riêng ngay cho anh Dũng** (`dmDung`).

**Không làm đợt này**: tồn chốt cuối tháng từ Eton, serial kho HCM, đối chiếu tồn Shopee, đường API Eton (B).

**Thất bại dù chạy được** (tránh bằng mọi giá)
- Bot bấm/gửi bất kỳ request **ghi** nào lên CCP (CCP có nút tạo/huỷ đơn thật).
- Bot im lặng khi hết phiên / gãy — sổ đứng mà không ai biết.
- Tin HCM lọt vào bot NX và bị ghi thành dòng sổ NX.
- Ghi trùng dòng, hoặc ghi đè dòng người đã sửa tay trên app.
- Nhắn lỗi lặp mỗi 15 phút.

## 3. Ràng buộc

- **Masterdata chỉ bổ sung** (`CLAUDE.md` gwt-app, chốt 18/11): không sửa/xoá object đang có (bảng, cột, ràng buộc,
  hàm `wh_*`). Chỉ được **thêm**. Mọi thay đổi DB đi migration ở repo **GWT-Masterdata**, đủ 6 bước `supabase-mcp.md`.
- `wh_master` hiện có: `warehouse` check `NX|HCM`; `discord_msg_id text NOT NULL` + `UNIQUE (discord_msg_id, line_no)`;
  `loai` check `Nhập|Xuất|Điều chỉnh`; `keeper NOT NULL`; `internal_code` FK → `catalog_item."Mã nội bộ"`;
  có sẵn `condition_raw`, `condition_group`, `kenh_xuat (khach|noi_bo|hong)`, `sua_tay_luc/sua_tay_boi`, `test_batch`.
- `wh_app_ton` / `wh_app_bao_cao` / `wh_app_the_kho` đã lọc theo `warehouse`, **không** nhìn `condition_*`.
- Đăng nhập CCP: chỉ người đăng nhập (Claude không gõ mật khẩu). Phiên CCP là cookie phiên; `idsrv` của
  `idp.eton.vn` sống 30 ngày → trình duyệt tự vào lại.
- Mac mini: user `gwtai`, chạy launchd qua `mac/cai-launchd.sh` (danh sách nhãn trắng trong script). Bẫy: hai repo
  dùng chung tiền tố nhãn `com.gwt.bap.*`.

## 4. Các cách đã cân nhắc

| | Cách | Được | Mất |
|---|---|---|---|
| **1 (chọn)** | Job launchd 15 phút; mỗi lượt mở Chromium **ngầm** bằng hồ sơ đã đăng nhập, gọi JSON báo cáo, ghi sổ, đăng tin, đóng | Gọn, không tiến trình treo, lượt hỏng thì lượt sau tự chạy; giống khuôn bot NX | Mỗi lượt tốn vài giây mở trình duyệt |
| 2 | Trình duyệt mở thường trực, job khác nối CDP | Thấy trình duyệt trên màn hình | Tốn RAM; tab đơ / máy khởi động lại → bot im |
| 3 | Bỏ trình duyệt, gọi HTTP bằng cookie | Nhẹ nhất | Tự làm mới phiên OIDC idp→ccp rất dễ gãy; khoá chỉ đọc viết lại |

Ở tầng nguồn: spike chọn **gọi thẳng JSON** `POST /Report/GetReportInventoryInboundAndOutbound` (cách đọc bảng trên
màn hình và tải Excel đều bị bỏ — JSON đủ cột, có phân trang, không giới hạn 60 ngày). Đường API Eton (B) vẫn để mở:
bộ đọc tách riêng để sau thay nguồn không đụng bộ ghi.

## 5. Thiết kế

### 5.1 Chỗ đặt code

Repo **GWT-Agent-Team**, cạnh bot NX:
- `admin/kho/hcm-doc.mjs` — **bộ đọc CCP** (IO): mở trình duyệt, khoá chỉ đọc, gọi JSON, trả mảng dòng Eton thô.
- `admin/kho/hcm-so.mjs` — **thuần, không IO**: dòng Eton → dòng `wh_master`; gom tin thông báo; quyết định báo lỗi.
- `admin/kho/hcm-chay.mjs` — vòng một lượt: đọc → ghép mã → ghi sổ → đăng tin → báo lỗi; lệnh phụ `dang-nhap`, `nap-cu`.
- `kenh/kho-hcm.json` — cấu hình, cùng khuôn `kenh/kho-nx.json`: `che_do: 'test'|'that'`, `kenh_test`
  (`1566765911690575983`, kênh kho test đang có), `kenh_that` (id `#kho-eton`), `test_batch`, `bat_dau` (mốc đăng tin).
- launchd nhãn mới `com.gwt.bap.khohcm`, `StartInterval 900`, thêm vào danh sách nhãn của `mac/cai-launchd.sh`,
  chạy qua `mac/chay-dinh-ky.sh khohcm`.
- Hồ sơ trình duyệt: `~/Bots/.eton-ccp/` (ngoài repo, không commit). Chuyển hồ sơ đã đăng nhập từ spike
  `~/Bots/ccp-spike/ho-so` sang đó, rồi xoá thư mục spike (kể cả `nxt-2026.json` có mã đơn sàn).

### 5.2 Bộ đọc CCP — khoá chỉ đọc nằm trong code

- `chromium.launchPersistentContext(~/Bots/.eton-ccp, { headless: true })`; lệnh `dang-nhap` mở **có giao diện**
  (người đăng nhập qua VNC, xong đóng cửa sổ).
- `ctx.route(/eton\.vn/)` **fail-closed**: chỉ cho qua GET/OPTIONS và **danh sách URL POST cụ thể** đo được ở spike
  (`/signin-oidc`, `idp…/login`, `/reportHub/negotiate`, `/Report/GetReportInventoryInboundAndOutbound`,
  `/Report/All*` nếu cần). Mọi request khác → `abort` **và ghi nhận** để báo lỗi (dấu hiệu Eton đổi giao diện).
  Không dùng regex động từ như spike — danh sách chốt cứng. Không có lệnh click nào trong code chạy định kỳ.
- Gọi bằng `fetch` trong trang (cookie của phiên): `FromDate = hôm nay − 7 ngày` (00:00 giờ VN = `17:00Z` hôm trước),
  `ToDate = hôm nay`, `WarehouseId=-1`, `RecordsPerPage=1000`, lặp `PageIndex` tới `TotalPages`.
- **Nhận biết hết phiên**: trang bị chuyển về `idp.eton.vn` / không trả JSON / `HasError=true` → lượt dừng, không ghi
  gì, phát lỗi loại `dang_nhap` hoặc `eton_loi`.

### 5.3 Ghi sổ

**DB thêm (migration GWT-Masterdata, chỉ bổ sung):** cột `wh_master.eton_key text` + unique index một phần
`where eton_key is not null`. Không đụng ràng buộc cũ.

Mỗi dòng Eton → một dòng `wh_master`:

| `wh_master` | Lấy từ |
|---|---|
| `warehouse` | `'HCM'` |
| `eton_key` | `ObjectCode|Sku|TransType|ConditionType` (spike: 0 trùng / 208 dòng) |
| `discord_msg_id`, `line_no` | `'eton:'+ObjectCode` và số thứ tự ổn định của dòng trong chứng từ (sắp theo `eton_key`) — chỉ để thoả `NOT NULL`/unique cũ |
| `ngay` | `TransDate` (ngày giờ VN) |
| `loai` | `RECEIVE_NEW`, `RECEIVE_RETURN`, `PO_RECEIVE_DAMAGE`, `*TRANSFER_RECEIVED`, `SO_CANCEL` → `Nhập`; `SO_PACKED`, `*TRANSFER_PACKED` → `Xuất`; `ObjectType='AdjustInventory'` / `Other` → `Điều chỉnh` |
| `qty` | `ActualQty` — theo dấu quy ước của sổ NX (builder đối chiếu `wh__qty_dau`) |
| `raw_name` | `ProductName`; `internal_code` = mã ghép (5.4) |
| `condition_raw` / `condition_group` | `ConditionTypeName` / `'moi'` khi `ConditionType=1`, ngược lại `'hu'` |
| `kenh_xuat` | `SO_PACKED` → `'khach'`; luân chuyển → `'noi_bo'`; khác → null |
| `purpose` / `note` | `TransDesc` / `ObjectExternalCode` (mã đơn sàn), `RefExternalCode` |
| `keeper` | `'bot:eton'`; `source_ts` = lúc đọc |
| `review_status` | ghép được mã → `'approved'` (`reviewed_by='bot:eton'`); không ghép → `'need_review'` kèm `suggest_*` |
| `test_batch` | khi `che_do='test'` |

- Ghi bằng REST Supabase như NX, **chỉ thêm mới**: `on_conflict=eton_key` + `Prefer: resolution=ignore-duplicates`.
  Dòng đã có thì không đụng → không bao giờ ghi đè dòng đã sửa tay. (Eton sửa/xoá chứng từ cũ: ngoài phạm vi, xem 6.)
- **Tình trạng hàng (CEO chốt 25/11):** `[Client] Hư hộp` và `Hàng chờ xử lý` = hộp bẩn / hơi móp nhưng **vẫn là hàng
  mới** → `condition_group='moi'`, tính vào tồn. Cặp điều chỉnh `CONVERT_DAMAGE_TO_QUARANTINE` (hư hộp → chờ xử lý) vì
  thế cộng trừ về 0. `[Client] Hư 1 phần` cũng **tính vào tồn** (CEO chốt 25/11). → **Mọi tình trạng đều tính vào tồn**;
  `condition_raw` giữ nguyên tình trạng Eton để xem. Đối chiếu 25/11: 561 có mã + 34 SKU chưa mã = 595 = tổng Eton.
- Vì mọi tình trạng đều tính, **không cần hàm tồn mới**: `wh_app_ton` hiện có (không lọc tình trạng) dùng được luôn;
  bỏ đề xuất `wh_app_ton_v2`. Tình trạng lạ chưa gặp (Hư hết, Thất lạc…) → vẫn ghi, kèm cảnh báo log để CEO xem. `wh_app_ton` hiện không lọc
  tình trạng và không được sửa → **thêm** một hàm đọc mới (vd `wh_app_ton_v2(p jsonb)` có lọc `condition_group`)
  cho `kho_app_doc`, app gọi hàm mới khi `kho=HCM`. *(Cách làm cụ thể là việc của builder — xem 7.)*

### 5.4 Ghép SKU → mã nội bộ

Theo thứ tự, dừng ở cái đầu tiên ra **đúng một** mã: `Sku` rồi `ClientPrivateSKU` so với
(1) `catalog_item."Mã nội bộ"`, (2) cột `"Mã đối tác/Kho"`, (3) `product_code_alias`, (4) `wh_alias`.
Spike: 26/34 SKU ghép được. 8 phụ kiện/vỏ (`KH182-B, KH182-T, KH192-B, SHELL-*` ×4, `TU30A`) → chờ duyệt.
Người duyệt trên `/kho/cho-duyet` như NX (`wh_duyet_dong`, "nhớ tên" → `wh_alias`) → lần sau tự ghép qua (4).

### 5.5 Tin thông báo

- Sau khi ghi, mỗi **chứng từ** (`ObjectCode`) có dòng mới → một tin, chỉ cho chứng từ có `ngay ≥ bat_dau`
  (nạp cũ không đăng). Mẫu:
  ```
  25/11 kho HCM xuất
  GN620 : 1  (đơn 261101696AA5FV)
  Lõi CFNC CTD50 : 2
  ```
  Tên hàng = tên ngắn trong catalog nếu ghép được, không thì `ProductName`. Dòng hư ghi thêm `(hàng hư)`; dòng chờ
  duyệt thêm `⏳`. Không SĐT/tên khách.
- Kênh theo `che_do` của `kenh/kho-hcm.json`. Bot phải có quyền gửi ở kênh (23/11 Bắp bị 403 ở `#kho-eton` → cấp quyền
  trước khi chuyển `that`).
- Đăng xong ghi lại id tin vào file trạng thái (`~/Bots/logs/khohcm-trang-thai.json`) để không đăng lại.
- Bot NX không đọc tin này: `kho-nx.json` đang `che_do:'that'` (chỉ đọc kênh NX thật + tin của 2 anh kỹ thuật).
  ⚠️ Nếu NX chuyển `che_do:'test'` thì nó đọc **mọi** tin ở kênh test → lúc đó HCM phải đổi kênh test khác.

### 5.6 Báo lỗi cho anh Dũng qua Bắp

Dùng `admin/chung/dm.mjs` `dmDung`. Loại lỗi và lời nhắn:

| Loại | Khi nào | Nhắn |
|---|---|---|
| `dang_nhap` | trang về idp / mất phiên | "Kho HCM: CCP hết phiên. Mở VNC Mac mini (user gwtai), chạy `node admin/kho/hcm-chay.mjs dang-nhap`, đăng nhập, đóng cửa sổ." |
| `eton_loi` | `HasError`, HTTP lỗi, JSON hỏng — **2 lượt liền** | lỗi rút gọn |
| `bi_chan` | khoá chặn một request không có trong danh sách | URL bị chặn — có thể Eton đổi giao diện |
| `ghi_loi` | Supabase / Discord lỗi | lỗi rút gọn |

Chống lặp: nhớ loại lỗi đang mở trong file trạng thái; cùng loại chỉ nhắn **một lần**; khi lượt chạy sạch trở lại nhắn
một tin "Kho HCM chạy lại bình thường". Hàm quyết định nhắn/không nằm trong `hcm-so.mjs` (thuần, có test).

### 5.7 Quyết định sau vòng đọc kiểm (đánh dấu: *quyết của Claude*, CEO xem lại)

- *Chế độ test chỉ áp cho **tin thông báo**, không áp cho sổ.* Dữ liệu Eton là thật → ghi sổ thật ngay từ đầu, không
  gắn `test_batch`. `nap-cu` chạy một lần ở chế độ thật trước khi bật lịch. Không cần bước dọn test cho sổ.
- *`raw_name` = `"<Sku> <ProductName>"`.* "Nhớ tên" trên `/kho/cho-duyet` ghi `wh_alias` theo `chuanTen(raw_name)`
  → lần sau bot tra `wh_alias` bằng đúng `chuanTen(raw_name)` đó (bước (4) ở 5.4 tra theo tên này, không theo SKU).
  Không cần bảng alias SKU mới.
- *Gộp trước khi ghi:* trong một lượt, các dòng Eton cùng `eton_key` được **cộng `qty`** thành một dòng trước khi
  insert → nếu Eton có hai dòng cùng chứng từ/SKU/loại/tình trạng thì không mất số lượng. Kèm cảnh báo log khi gặp.
- *Người đọc khác của tồn HCM:* `GWT-Admin-Portal/bots/kho/mirror.mjs` đọc `v_wh_stock_hcm` (view chung, không lọc tình
  trạng). Không sửa view (luật chỉ bổ sung); ghi nhận: nếu mirror còn chạy thì nó sẽ tính cả hàng hư. Builder kiểm mirror
  còn chạy không trước khi nạp cũ.

## 6. Rủi ro đã biết

- Eton sửa/huỷ chứng từ sau khi bot đã ghi: bot chỉ thêm mới nên không thấy. Ghi nhận, xử lý đợt sau (vd lượt đối
  chiếu tuần so `eton_key` trong 60 ngày).
- Eton đổi giao diện/URL → `bi_chan`/`eton_loi` báo ngay; sửa danh sách URL.
- Hết phiên ~30 ngày một lần → cần người đăng nhập lại (đã có báo).

## 7. Để lại cho builder

- Dấu `qty` đúng quy ước sổ (`wh__qty_dau`), và `Điều chỉnh` hư→cách ly có cộng trừ về 0 trên tồn hàng mới không.
- Cách lọc hàng hư khỏi tồn mà không sửa hàm cũ (hàm mới + chỗ app gọi), và `wh_app_nhat_ky` hiện link Discord từ
  `discord_msg_id` — dòng `eton:` cần hiện mã chứng từ thay link.
- Seed + smoke Masterdata cho cột mới; CI `db-reset` xanh trước khi áp.
- Test thuần cho `hcm-so.mjs`: map loại giao dịch, khoá, ghép mã, gom tin, chống lặp báo lỗi.
