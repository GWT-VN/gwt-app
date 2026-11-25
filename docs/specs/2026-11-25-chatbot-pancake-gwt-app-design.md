# Bot Pancake về gwt-app — tự trả lời khách (thiết kế)

Ngày 25/11/2026 · người chốt: anh Dũng · nhánh làm từ `rework/v2.0.0`, PR vào `rework/v2.0.0`.

## 1. Vì sao

Bot đọc tin fanpage (Pancake) đang sống ở repo GWT-ERP, mọc dần quanh Discord: mỗi khách một bài Forum, nháp cho
nhân viên, Bắp chấm nháp, vòng học, cẩm nang. Bot chưa từng thật sự trả lời khách — phần tự gửi có sẵn nhưng bị khoá sau
bước Bắp chấm (log `tuGuiTat: CAN_BAP_CHAM`), và cả job đã tắt trên Mac mini từ 20/11.

Anh Dũng muốn: **gwt-app quản lý hẳn bot này, và bot chạy thật** — khách nhắn fanpage thì bot **gửi câu trả lời thẳng cho
khách qua Pancake**, không chỉ đăng nháp lên Discord.

## 2. Đã chốt (anh Dũng, 25/11/2026)

1. **Claude phân loại** tin khách, **GPT viết** câu trả lời.
2. **Bỏ** bước Bắp chấm nháp (Codex review).
3. **Không chép dữ liệu.** Dữ liệu chatbot giữ ở Masterdata (`qynpywysgltspmgnhhga`, schema `chatbot`); gwt-app đọc/ghi
   thẳng vào đó.
4. **Chạy thật = gửi khách qua Pancake.**
5. **Discord: giữ một kênh báo gọn** — mỗi tin bot đã gửi khách và mỗi ca chuyển người là **một dòng** trên một kênh
   Discord. Không bài riêng từng khách, không Bắp.
6. **Cách làm A + 1** (xem §4): script trong gwt-app do Mac mini gọi mỗi phút; GPT viết bằng vòng tự tra cứu (chuyển từ
   Haiku tự tra sang GPT).
7. **Báo giá theo Masterdata** (§7a) và giữ nguyên rào R1–R11 (§7).
8. **Giọng và trí nhớ** (anh Dũng thêm 25/11, nguyên văn: *"Câu nào không trả lời được thì chuyển người. … Ở đầu câu: Chào
   hỏi Anh/Chị <tên> (nếu có context cô, bác hay gì đó thì tự học. yêu cầu lưu thêm mini context cho đoạn hội thoại và lưu
   trong 7 ngày nếu được). Luôn ạ ở cuối câu"*) — cách làm ở §6.6.
9. **Câu tự giới thiệu** (anh Dũng thêm 25/11: *"Tôi cần câu giới thiệu ở đầu để tự giới thiệu bot là trợ lý ảo của máy
   lọc nước GE"*) — lúc nào xuất hiện + câu mẫu ở §6.6.

## 3. Mục tiêu · không làm · thất bại nếu

**Mục tiêu**
- Một job trong gwt-app, mỗi phút: đọc hội thoại Pancake mới → Claude phân loại → nếu được phép thì GPT soạn bằng công cụ
  tra chỉ-đọc → gửi khách → một dòng Discord. Không được phép → một dòng Discord "chuyển người".
- Bật/tắt, chọn page, giờ chạy đều bằng biến môi trường; tắt được trong ≤ 1 phút.
- Bot cũ ở ERP tắt hẳn; không lúc nào hai bản cùng trả lời một page.

**Không làm đợt này**
- Bài Forum từng khách, nháp cho nhân viên, Bắp (chấm / lệnh duyệt / gắn tag), vòng học từ câu NV, cẩm nang, nạp kiến
  thức (`nap-kho`), thẻ trả lời nhanh, gửi ảnh, nhận máy qua ảnh khách. Job mới chỉ **đọc** kho
  (`chatbot.chunks`). Kiểm 25/11: 357 mục anh Như duyệt (`pancake_kien_thuc` `da_nap`, mới nhất duyệt 21/11) đều đã có
  đoạn trong kho; 222 mục `cho_duyet` chưa duyệt thì chưa vào. ⚠️ Đường nạp tự động cũ chạy **bên trong** job ERP (đang
  tắt, sẽ tắt hẳn) → mục anh Như duyệt **sau này** phải nạp tay bằng script ERP như lần 25/11, tới khi có việc riêng
  chuyển phần nạp kiến thức sang gwt-app.
- Màn hình trong gwt-app (xem log, bật tắt). Làm sau nếu cần.
- Chạy trên Vercel (cron/webhook): nhánh `rework/v2.0.0` không được Vercel dựng (`vercel.json` chỉ dựng `main`, `preview/*`).
- Migration Masterdata: đợt này **không cần bảng/cột mới** (§6.3).

**Thất bại dù chạy được nếu**
- Bot báo sai giá / khuyến mãi / chính sách, hoặc hứa điều GWT không làm.
- Bot trả lời chen lúc nhân viên đang chat với khách, hoặc gửi trùng một câu hai lần.
- Bot trả lời ca khiếu nại / máy hỏng thay vì để người.
- Hai bản bot (ERP + gwt-app) cùng chạy một page.
- SĐT / nội dung khách lọt vào log file hay commit.

## 4. Các cách đã cân nhắc

**Chạy ở đâu**
- **A. Script Node trong gwt-app, launchd Mac mini gọi mỗi phút** — ✅ chọn. Đúng khuôn bot cũ đã chạy ổn; Mac mini tắt
  thì bot im (an toàn: không gửi gì sai).
- B. Vercel Cron mỗi phút / C. Pancake webhook → route Vercel — không cần Mac mini, C còn trả lời tức thì; nhưng nhánh v2
  không được dựng tới khi v2 thay v1. Để sau.

**GPT viết thế nào**
- **1. Chuyển vòng tự tra (`tu-tra.ts`) sang GPT** — ✅ chọn. Giữ bản tốt nhất đang có: model tự gọi công cụ tìm tài liệu /
  tra máy / bảng giá / tồn kho, ghi căn cứ trích nguyên văn, code kiểm căn cứ. Việc chính là adapter gọi công cụ kiểu OpenAI.
- 2. Lõi cũ `traLoiLuot` chạy bằng GPT — đã có nhánh OpenAI, nhưng kéo ~3–4 nghìn dòng và là bản yếu hơn.

## 5. Luồng một lượt (mỗi page, mỗi phút)

0. Job chỉ chạy các page trong danh sách của nó (`PANCAKE_PAGES` của env job mới — đợt thử: một page) và **chỉ trong khung giờ
   bot** (R2). Ngoài khung: thoát ngay, không đọc, không báo (giờ làm NV trực trên Pancake). *(Em quyết: page khác / giờ
   làm không có dòng "chuyển người" — tránh ~40 dòng/ngày vô ích.)*
1. Giữ khoá page trong `chatbot.pancake_sync_state` (khoá dùng chung với bot cũ → kể cả lỡ bật cả hai, không chạy cùng lúc).
2. Lấy hội thoại INBOX có động tĩnh từ `max(lan_chay_cuoi − 5 phút, giờ chạy − 30 phút)`: bỏ nhóm Zalo, bỏ hội thoại đã có
   NV/bot trả lời sau tin khách cuối (`dangCho`, nhận tin bot bằng dấu vô hình U+2063). **Tin khách cũ hơn 30 phút lúc bot
   thấy → bỏ qua im lặng** (không gửi, không báo): đêm đầu không quét tồn từ 20/11, và tin 16:00 NV bỏ sót thì không bị bot
   trả lời lúc 18:00. *(Em quyết.)*
3. **Claude phân loại** (`phan-loai.ts` giữ nguyên lời dặn + schema + `luatCungGap`; gọi Messages API bằng `fetch`, model
   `PANCAKE_PHAN_LOAI_MODEL`, mặc định **`claude-sonnet-5-5`** — anh Dũng chốt 25/11; bot cũ dùng Haiku). Ghi `chatbot.pancake_conversations` (`trang_thai='cho'`).
4. Chờ khách yên 120 giây (trần 300 giây) như bot cũ.
5. **Cổng tự gửi** (§7). Không qua → dòng Discord "chuyển người" (một lần cho mỗi lượt tin khách).
6. **GPT soạn** bằng vòng công cụ (§6.2). GPT tự đánh `can_nv` / `khong_tra_loi`, hoặc kiểm căn cứ hỏng → chuyển người.
7. **Đọc lại tin hội thoại ngay trước khi gửi**: có tin NV/bot mới hơn tin khách đang trả lời → bỏ, không gửi.
8. Code dựng tin gửi (§6.6: lời chào/xưng hô đầu, "ạ" cuối mỗi tin, câu hotline/xin SĐT ở cuối lượt đầu) rồi gửi qua
   `gui-khach.ts` (cửa gửi duy nhất, `reply_inbox`, không thử lại): mỗi đoạn một tin, nghỉ 1 giây. Mọi tin kết bằng U+2063.
   Ghi sổ hội thoại (`so_cuoc`) sau khi gửi được.
9. Một dòng Discord "đã gửi" kèm đúng chữ đã gửi. Hội thoại chuyển `trang_thai='da_xu_ly'`.
10. Nhả khoá, ghi `lan_chay_cuoi`. In **một dòng JSON đếm số** mỗi page ra log (không tin khách, không SĐT).

## 6. Phần kỹ thuật đã quyết

### 6.1 Chỗ đặt code trong gwt-app
- Code thuần trong `apps/web/lib/chatbot/pancake/` (một thư mục, import tương đối), test vitest cạnh nó.
- Script chạy `apps/web/scripts/pancake-luot.mjs` (hoặc tương đương) — gọi một lượt, đọc env từ file `ENV_FILE`.
- **Chép có chọn lọc** từ GWT-ERP `lib/chatbot/…`: `doc.ts` (đọc Pancake), `loc.ts`, `phan-loai.ts`, phần cần của `kho.ts`,
  `tu-gui.ts`, `gui-khach.ts`, `tu-tra.ts` (bỏ thẻ, ảnh, sổ cuộc), `cong-cu-tra.ts` + phần truy hồi/nhúng + đọc số liệu máy
  Masterdata. Mỗi file chép mang dòng đầu "chép từ GWT-ERP <đường dẫn> @<commit>".
- Không thêm thư viện: Claude và OpenAI gọi bằng `fetch`; Supabase dùng `@supabase/supabase-js` đã có.
- Cách chạy TypeScript trên Mac mini (strip-types của Node hay `tsx`) chốt ở plan.

### 6.2 GPT tự tra
- Cùng bộ công cụ chỉ-đọc: `tim_tai_lieu`, `tra_may`, `bang_gia`, `ton_kho`, `chot_tra_loi` (bỏ trường `the`, `the_tin`,
  `may_trong_anh`; giữ `so_cuoc`; thêm `xung_ho` — §6.6). Tối đa 5 vòng gọi công cụ.
- Giữ kiểm căn cứ: mỗi ý có câu trích nguyên văn có thật trong dữ liệu đã đưa model; mỗi con số đáng kể của câu trả lời
  nằm trong một câu trích. Hỏng → không gửi, chuyển người.
- Không dán cẩm nang vào lời dặn — đúng như bot ERP đang chạy (`camNang: ""` từ 22/10; kiến thức đã duyệt nằm trong kho tra).
- Model đặt bằng `PANCAKE_TRA_LOI_MODEL` (khoá `OPENAI_API_KEY` đang có trên Mac mini). Bản cụ thể chốt ở plan sau khi chạy
  thử trên ~30 câu khách thật đã có trong `pancake_conversations`.

### 6.3 Dữ liệu (Masterdata `chatbot`, chỉ bảng đã có)
- Đọc/ghi: `pancake_conversations`, `pancake_sync_state`. Đọc: `chunks` (RPC truy hồi), số liệu máy / khuyến mãi /
  `sales.shopee_stocks` như công cụ cũ.
- Không cần `pancake_tin_bot` (đang nằm ở nhánh Masterdata `chatbot-pancake-tin-bot`, **chưa áp live**): bảng đó để nhận
  ra tin **ảnh** của bot; bản này chỉ gửi chữ, dấu U+2063 đủ (đo 23 và 26/10: dấu còn nguyên trên tin chữ qua Messenger — spec ERP 2026-10-26 gửi thẻ §kết quả).
- **Trí nhớ giữa các lượt, không thêm cột** *(em quyết)*:
  - "đã báo dòng Discord cho lượt tin khách này" (chuyển người một lần; chế độ `thu` không đăng lại mỗi phút) → dùng lại cột
    có sẵn `discord_bao_luc` (≥ `tin_khach_luc` = đã báo). Bot cũ nếu phải bật lại vẫn chạy được (nó tạo bài mới khi
    `discord_thread_id` rỗng).
  - ≤ 3 lượt bot/hội thoại/ngày → đếm tin mang U+2063 trong 24 giờ ở lịch sử đã GET (không tốn thêm lời gọi).
  - ≤ 20 hội thoại/ngày/page → file đếm theo ngày trên Mac mini (`~/Bots/state/`), mất file thì chỉ reset trần trong ngày.
- **Không xoá dòng nào** ở Masterdata: bỏ `xoaCu` (xoá >90 ngày) của bot cũ; giữ `hetHanCho` (chỉ UPDATE `cho`→`da_xu_ly`
  sau 7 ngày). Hội thoại sau khi bot gửi tự thành `da_xu_ly` vì đã có tin GWT sau tin khách.
- Log mọi tin đã gửi = dòng Discord + lịch sử chính Pancake (tin bot mang U+2063). Muốn truy vấn được bằng SQL thì thêm
  bảng ở đợt sau (đi đủ workflow DDL Masterdata).

### 6.4 Kênh Discord báo gọn
- Một webhook kênh chữ thường (không phải Forum) — anh Dũng tạo, đặt vào `DISCORD_WEBHOOK_PANCAKE_BAO`.
- Dòng "đã gửi": `✉️ <kênh> · <nhóm> · <tóm tắt ≤80 ký tự>` + chữ bot đã gửi + link mở hội thoại trên Pancake.
- Dòng "chuyển người": `🙋 <kênh> · <nhóm> · <lý do> · <tóm tắt>`; khiếu nại thêm `🔴` và nhắc role `PANCAKE_PING_KHIEU_NAI`.
- Không chép SĐT (tóm tắt đã cấm SĐT; chữ bot gửi không chứa SĐT khách).

### 6.5 Mac mini
- Bản gwt-app riêng cho job, vd `~/Bots/gwt-app-pancake` (nhánh `rework/v2.0.0`), env `~/Bots/.secrets/gwtapp-pancake.env` (600).
- Nhãn launchd mới (vd `com.gwt.pancake.app`) thêm vào bộ cài launchd có sẵn ở GWT-Agent-Team (`mac/cai-launchd.sh`,
  `mac/chay-dinh-ky.sh`) — một thay đổi nhỏ ở repo đó.
- Bot cũ: giữ `com.gwt.pancake` **disabled** và gỡ plist; ghi vào RUNBOOK. Kiểm lại ngay trước khi bật bản mới.

### 6.6 Giọng và trí nhớ hội thoại (yêu cầu 25/11)

**Trí nhớ ("mini context") — dùng cột có sẵn, không migration.** `chatbot.pancake_conversations` đã có cột `so_cuoc jsonb`
(áp live 21/10, ≤ 6000 ký tự, RLS 0 policy, chỉ service_role) — đúng là sổ ngắn cho từng hội thoại `{nhu_cau, da_xong[],
con_mo[]}`, viết bằng code `so-cuoc.ts` của bot cũ (chép sang). Thêm một khoá `xung_ho` vào cùng object JSON (CHECK chỉ
đòi object + độ dài → không cần đổi schema).
- GPT nhận sổ cũ khi soạn, trả sổ mới trong `chot_tra_loi`; code chuẩn hoá (`chuanSoCuoc`) rồi mới ghi.
- **Không chứa thông tin cá nhân:** sổ qua `anPii` (che SĐT, email, địa chỉ…) trước khi ghi; không ghi tên. Tên khách lấy
  từ cột `ten_khach` (tên Facebook, bot cũ đã lưu sẵn), không chép vào sổ.
- **7 ngày:** sổ của hội thoại có tin khách cuối cũ hơn 7 ngày → job đặt `so_cuoc = null` (UPDATE, không xoá dòng) ở bước
  `hetHanCho` có sẵn; lúc đọc cũng bỏ qua sổ quá 7 ngày, phòng khi bước dọn chưa chạy.
- Đã cân nhắc và bỏ: cột/bảng mới (migration Masterdata đủ 6 bước để có cái đã có); file trên Mac mini (máy hỏng là mất,
  không ai khác đọc được, lại là nơi thứ hai giữ dữ liệu khách).

**Xưng hô.** GPT trả `xung_ho` trong `chot_tra_loi`: `goi` ∈ {anh, chị, anh/chị, cô, chú, bác, ông, bà, em} + `xung` ∈ {em,
cháu} — suy từ hội thoại theo luật đang có (`LUAT_XUNG_HO`, `LUAT_GIONG`: khách xưng "cô/chú/bác" thì gọi lại vậy và xưng
"cháu"; chưa rõ nam/nữ thì "anh/chị", không đoán). Code lưu vào `so_cuoc.xung_ho`; lượt sau GPT được nhắc cách gọi đã biết.
Giá trị ngoài danh sách → "anh/chị" / "em".

**Lời chào đầu — code ghép, không để GPT tự viết.** *(Em đề xuất, anh chốt.)*
Ba trường hợp, tính cho **tin đầu của mỗi lượt** bot trả lời (các tin sau trong cùng lượt không chào):

| Trường hợp | Tin đầu mở bằng |
|---|---|
| **Lần đầu** bot nói với hội thoại này, hoặc sổ hội thoại đã hết hạn (khách im > 7 ngày) | Lời chào + **câu tự giới thiệu** (anh Dũng yêu cầu 25/11) |
| Khách quay lại sau > 6 giờ (trong 7 ngày) | Lời chào, không giới thiệu lại |
| Trong cùng mạch chat | `Dạ <gọi> <tên>, …` — vẫn gọi tên |

**Câu mẫu để anh duyệt** (tên giả):
- Lần đầu: «Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ. Dạ, máy CTS20 bên em giá … ạ.»
  … tin cuối lượt: «Nếu anh cần tư vấn kỹ hơn có thể để lại SĐT để được chuyên gia liên hệ hỗ trợ ạ. Hoặc nếu cần hỗ trợ
  nhanh hơn anh có thể gọi hotline <số> ạ.» (câu hotline có sẵn ở bot cũ, chỉ lượt đầu)
- Lần đầu, khách là cô/chú/bác: «Chào cô Lan! Cháu là trợ lý ảo của máy lọc nước GE ạ. …»
- Chưa rõ nam/nữ, tên lạ: «Chào anh/chị! Em là trợ lý ảo của máy lọc nước GE ạ. …»
- Quay lại sau > 6 giờ: «Chào chị Mai! Dạ, …»
- Trong mạch: «Dạ anh Hùng, lõi CFNC thay sau 12 tháng ạ.»

Chữ đổi từ "trợ lý tự động" (bot cũ) sang **"trợ lý ảo"** theo anh. Code nhận ra hội thoại đã được giới thiệu (`coCauBao`
trong `loc.ts`) phải nhận cả câu mới lẫn hai câu cũ, để khách đã gặp bot cũ không bị giới thiệu lại.
- `<tên>` = tên Facebook đã làm sạch (`tenGoi` có sẵn: bỏ emoji/ký hiệu; tên có số, link, quá 30 ký tự → bỏ tên, chỉ
  "Chào anh/chị!").
- GPT được dặn KHÔNG tự chào; code bỏ câu chào thừa nếu GPT vẫn viết.

**"ạ" cuối câu — GPT viết, code bảo đảm.** Lời dặn đã đòi mỗi câu kết "ạ". Code kiểm **từng tin** trước khi gửi: tin không
kết bằng "ạ" (trước dấu . ? ! cuối) thì code thêm "ạ" vào cuối tin. Không chặn gửi vì thiếu "ạ" giữa tin — để GPT lo.

**Không trả lời được → chuyển người.** Khớp R3–R5: nhóm cấm, GPT đánh `can_nv` / `khong_tra_loi` / thiếu tài liệu, kiểm
căn cứ hỏng → không gửi gì, một dòng Discord "chuyển người" ghi lý do.

## 7. Rào an toàn tự gửi — anh Dũng giữ nguyên đề xuất (25/11)

Số đo 30 ngày (`pancake_conversations`, tới 20/11): page `435158503014641` ~990 hội thoại (55% hỏi giá, 13% tư vấn, 23%
chưa phân loại được), page `214555728409778` ~180, hai Zalo cá nhân ~50 mỗi kênh. Giờ đông nhất 20–22h và 6–9h.

| # | Rào | Đề xuất đợt thử |
|---|---|---|
| R1 | **Page** | Chỉ **một page Facebook: `214555728409778`** (nhỏ, ~6 hội thoại/ngày). Không bao giờ: Zalo cá nhân (`pzl_`, bot nói thay tài khoản người thật), Shopee. |
| R2 | **Giờ** | Chỉ **ngoài giờ làm**: T2–T7 trước 8:00 và từ 18:00, cả Chủ nhật (như luật cũ). 3 đêm đầu chỉ **18:00–22:00** để có người theo dõi kênh Discord. |
| R3 | **Nhóm bot KHÔNG trả lời** (chuyển người) | `khieu_nai`, `su_co`, `lead` (khách để số / xin gặp người), `don_hang` (giao, lắp, đơn — bot không có dữ liệu đơn), `khac`, chưa phân loại được, cờ gấp. |
| R4 | **Nhóm bot được trả lời** | `tu_van`, `loi_loc`, `hoi_gia` — báo giá + KM đúng như Masterdata ghi (§7a, đã chốt). |
| R5 | **Câu trả lời** | Không gửi nếu: GPT đánh `can_nv`/`khong_tra_loi`; kiểm căn cứ hỏng; quá 6 đoạn; khách gửi ảnh/tệp trong khối tin đang chờ; câu trả lời rỗng. |
| R6 | **Không chen NV** | Đọc lại tin ngay trước khi gửi; có tin NV mới hơn → bỏ. Hội thoại có NV trả lời trong 24 giờ qua → không gửi (khách đang làm việc với người). |
| R7 | **Trần** | ≤ 5 lượt gửi/lượt chạy/page; ≤ 20 hội thoại/ngày; mỗi hội thoại bot trả lời ≤ 3 lượt/ngày, quá → chuyển người. |
| R8 | **Tắt nhanh** | `PANCAKE_TU_GUI=tat` trong file env (job đọc mỗi phút → hiệu lực lượt sau), hoặc `launchctl disable` nhãn job. Một lệnh ssh, ghi ở RUNBOOK. Lỗi gửi 3 lần trong một lượt → page đó thôi gửi tới lượt sau. |
| R9 | **Ghi lại** | Mỗi tin gửi và mỗi ca chuyển người một dòng Discord (§6.4); log file chỉ đếm số. |
| R10 | **Thử trước** | `PANCAKE_TU_GUI=thu` 1–2 đêm: chạy đủ luồng nhưng chỉ đăng Discord "✉️ THỬ — bot SẼ gửi: …", không gửi khách. Anh Dũng / anh Như xem rồi mới `bat`. |
| R11 | **Ca ngoài giờ cần người** | Đợt thử **không** gửi câu chờ ("nhân viên sẽ liên hệ…") cho ca chuyển người — để nguyên cho NV sáng hôm sau. *(Muốn có câu chờ cố định cho khiếu nại / sự cố thì anh nói.)* |

### 7a. Hỏi giá — đã chốt (a) "Theo Masterdata", 25/11

Hỏi giá là 55% tin. Công cụ tra giá đọc Masterdata và, theo luật chốt 21/10, **máy đang khuyến mãi thì báo giá sau KM làm
giá chính** (kèm giá gốc). **Chốt:** bot báo giá + KM đúng như Masterdata ghi; số nào cũng có căn cứ trích từ công cụ, code
kiểm. Quà tặng, trả góp, giảm thêm, mặc cả ("giá tốt hơn được không") → chuyển người.

Đã cân nhắc và bỏ: (b) chỉ giá gốc — trái luật 21/10, khách thấy giá cao hơn giá đang bán; (c) chặn hẳn `hoi_gia` — bot chỉ
đỡ ~15% tin.

**Thứ tự mở rộng sau đợt thử** (mỗi bước anh duyệt): bỏ giới hạn 18–22h → page `435158503014641` → nâng trần ngày.

## 8. Kiểm tra trước khi gọi anh duyệt đợt thử
- vitest: phân loại (đọc JSON), cổng tự gửi (mỗi rào R1–R7 một ca), dựng tin gửi (chào lượt đầu / "Dạ <gọi> <tên>" lượt
  sau / cô-chú-bác xưng cháu / thêm "ạ" / hotline / U+2063), sổ hội thoại (che PII, quá 7 ngày bỏ), kiểm căn cứ,
  "đọc lại trước khi gửi".
- Chạy khô trên máy dev với Masterdata live, chế độ `thu` + webhook Discord thử: đếm số, đọc 10 câu bot SẼ gửi.
- Trước tin đầu tới khách thật: gửi anh Dũng **đúng file cấu hình đợt thử** (tên biến + giá trị không bí mật) và chờ anh đồng ý.

## 9. Để lại cho người làm
- Cách chạy TS trên Mac mini; tên nhãn launchd, tên file env; bố cục file trong `lib/chatbot/pancake/`.
- Chọn model GPT cụ thể (§6.2) và đo chi phí ước tính mỗi đêm.
- Định dạng link Pancake trong dòng Discord.
- RUNBOOK: `apps/web/lib/chatbot/pancake/README.md` (bật / tắt / đổi page / xem log / quay về bot cũ).
