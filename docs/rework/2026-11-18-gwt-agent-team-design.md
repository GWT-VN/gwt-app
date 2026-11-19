# GWT-Agent-Team — thiết kế

Ngày 18/11/2026 · trạng thái: **bản nháp chờ anh Dũng duyệt**. Nguồn hiện trạng: repo `gwt-discord-bot` nhánh `origin/main` (kiểm kê 18/11), `docs/rework/v2-mo-ta-app.md` mục 7.14.

## 1. Ý định

Đưa **mọi tính năng của bot Bắp** sang một repo mới **GWT-Agent-Team**, trong đó **mỗi việc do một agent có vai trò rõ ràng** đảm nhận. Các agent:

- chạy được **hai đường**: Claude API (dùng credit API khuyến mãi 100–200 đô của gói Ultra) **và** phiên Claude Code trên Mac mini (dùng gói Ultra) — đổi bằng cấu hình, không sửa code;
- đọc/ghi dữ liệu của GWT App **chỉ qua API của gwt-app**, mỗi agent một danh tính và quyền trong ma trận quyền;
- **giao việc cho nhau** và cùng làm việc trong một kênh Discord của đội agent; người vẫn tag agent nào cũng được.

Repo riêng nhưng **liên kết với gwt-app để sửa cùng lúc**; bên trong **tách rõ phần thuộc gwt-app** khỏi các kết nối khác (Shopee, Google, Admin Portal, ERP…), vì sau này agent có thể được giao việc ngoài app.

Vì sao: hiện Bắp là ~25 tính năng rải trong các phiên Claude Code + script launchd dùng chung một token, ghi thẳng vào 2 DB (có hàm DB áp tay, không có migration), không có danh tính theo người, không có đường cho nhiều agent phối hợp. v2 của app chuyển DB sang Masterdata — nếu bot vẫn ghi thẳng DB thì đổi DB là phải sửa bot ở hàng chục chỗ.

## 1b. Nguyên tắc: agent nhận việc như người — không cứng hoá tính năng bằng code (anh Dũng chốt 18/11)

- **Việc của agent = việc giao bằng lời**, như giao cho nhân viên. Giao được ở **cả hai nơi**: trên **Discord** ("@Bắp …", hoặc tag agent con) và trên **gwt-app** (chọn Bắp / agent con làm người nhận một việc trong Work).
- **Agent là "người" trong bảng người của v2** (loại `agent`, có Discord ID, vai trò, quyền theo ma trận) → giao việc cho agent = **một việc Work bình thường**, có hạn, trạng thái, bình luận, nghiệm thu như mọi việc. Agent báo cáo bằng bình luận + đổi trạng thái; người duyệt kết quả như duyệt việc của người.
- **Việc định kỳ** của agent (bản tin 8h/17h, đọc đơn HO, rà ticket quá hạn, gom đề xuất Wiki…) = **việc lặp trong Work** (lời dặn + lịch), tạo/sửa/tắt ngay trên app hoặc bằng lời trên Discord — **không deploy code** để đổi việc.
- **Code chỉ làm 2 thứ:** (1) **công cụ** — năng lực có kiểm soát mà agent gọi (đọc/ghi dữ liệu qua API gwt-app, gửi/đọc tin Discord, đọc/ghi Sheet, Shopee…); (2) **rào an toàn** — quyền theo ma trận, xác nhận 2 bước cho thao tác ghi quan trọng, nhật ký, hạn mức chi, giới hạn lượt. Một tính năng mới mà các công cụ có sẵn đã đủ → **chỉ cần giao việc / sửa lời dặn**, không viết code. Chỉ viết code khi thiếu **công cụ** hoặc thiếu **rào**.
- **Các luồng D1–D9** (mục 7.14 file mô tả app) là **việc mẫu** — bộ lời dặn khởi đầu cho Bắp/agent con, sửa được bằng lời; không phải tính năng viết cứng.
- Vai trò agent (`vai-tro.md`) giữ ngắn: nhiệm vụ chung, giọng nói, giới hạn; chi tiết từng việc nằm trong việc được giao.


## 2. Mục tiêu · không làm · coi là thất bại

**Mục tiêu**
1. Mọi tính năng Bắp hiện có chạy lại trong GWT-Agent-Team, **hành vi người dùng thấy không đổi** ở bước chuyển đầu.
2. Mọi lần ghi vào dữ liệu GWT App đi qua API gwt-app, ghi nhật ký **agent + người ra lệnh**.
3. Mỗi agent: vai trò, công cụ được phép, kích hoạt, đường chạy, hạn mức chi — khai trong một thư mục.
4. Cùng một định nghĩa agent chạy được bằng API hoặc phiên Mac mini.
5. Làm được 5 luồng Discord ↔ Work CEO yêu cầu (giao việc, báo cáo, nhắc theo giờ, task AI, việc của tôi — mục 7.14 file mô tả app).

**Không làm (ở đợt này)**
- Viết lại logic nghiệp vụ của các tính năng đang chạy ổn (ghi sổ kho, ticket từ tin, sổ quỹ…) — chỉ dời và đổi đường ghi.
- Bot NP (Zalo, `np-dichvu`) và Pancake (code nằm ở GWT-ERP) — chỉ ghi chỗ cắm, không dời.
- Giao diện quản trị agent trong app (làm sau, khi thiết kế UI v2 xong).

**Coi là thất bại dù chạy được**
- Agent trả lời nhau vô hạn trong kênh, hoặc đốt hết credit API trong vài ngày.
- Agent ghi dữ liệu mà nhật ký không biết ai ra lệnh.
- Một agent làm được việc ngoài vai (agent Kho tạo ticket, agent Sales sửa sổ quỹ).
- Mac mini tắt là mọi thứ chết mà không ai được báo.
- Chuyển xong mà tin nhắn kho/ticket bị bỏ sót hoặc ghi trùng.

## 3. Ràng buộc

- **Luật DB GWT** (`~/.claude/gwt-rules/supabase-mcp.md`): bảng/hàm mới → migration ở repo **GWT-Masterdata**, đi đủ quy trình 6 bước, CI `db-reset` xanh trước khi áp live; không dùng `execute_sql` để tạo object. Các hàm bot đang dùng trên DB app (`bot_tao_ticket`, `kho_bot_ghi`, `bot_ds_don`… trong `gwt-discord-bot/db/*.sql`) **áp tay, không có migration** → phải hợp thức hoá.
- **DB đang chuyển**: app v2 chuyển GWT-SalesTracking → GWT-Masterdata (chưa có kế hoạch). API gwt-app là lớp che: agent không biết DB nằm đâu.
- **Bí mật** ở `~/Bots/.secrets/` và `~/.claude/channels/*/.env` trên Mac mini — giữ nguyên chỗ, repo chỉ chứa tên biến; đường API dùng kho bí mật của nơi chạy.
- **Discord**: một token dùng chung bị giới hạn ~1000 lần đăng nhập Gateway / 24 giờ; bot mặc định bỏ qua tin của bot khác (tránh vòng lặp).
- **Chi phí**: credit API có hạn (100–200 đô khuyến mãi) → việc nghe kênh liên tục mặc định chạy đường phiên (gói Ultra); đường API có hạn mức từng agent.
- **Hai token hiện có**: Bắp (`~/.claude/channels/discord/.env`) và GWT Admin Bot (`~/.claude/channels/discord-admin/.env`).

## 4. Các cách đã cân nhắc

| Câu hỏi | Các cách | Chọn | Vì sao |
| --- | --- | --- | --- |
| Đặt code agent ở đâu | (a) thư mục trong monorepo gwt-app · (b) repo riêng liên kết | **(b) repo riêng** — anh Dũng chốt 18/11 | agent có thể nhận việc ngoài gwt-app; gwt-app giữ sạch |
| Liên kết hai repo | (a) git submodule · (b) gói npm của gwt-app · (c) **hợp đồng API** do gwt-app sở hữu + hai repo đặt cạnh nhau | **(c)** | submodule hay lệch và khó sửa; gói npm phải phát hành; hợp đồng + đặt cạnh nhau cho phép sửa cả hai trong một phiên và CI bắt lệch |
| Biến gì thành agent | (a) chỉ việc cần suy nghĩ thành agent, việc cố định giữ script · (b) **mọi tính năng thành agent** | **(b)** — anh Dũng chốt | việc cố định trở thành **công cụ** agent gọi (giữ nguyên độ ổn định), agent chỉ được gọi khi có sự kiện thật (không gọi theo nhịp đồng hồ) |
| Chạy agent | (a) chỉ API · (b) chỉ phiên Mac mini · (c) **cả hai, chọn theo agent** | **(c)** | credit có hạn + gói Ultra sẵn có; phiên dễ sập khi Mac mini tắt, API chạy được ở nơi khác |
| Agent nói chuyện với nhau | (a) đọc thẳng tin của nhau trên Discord · (b) **hàng đợi giao việc + Discord là cửa sổ xem** | **(b)** | tránh vòng lặp, có giới hạn lượt, có trạng thái, người vẫn thấy hết trong kênh |
| Danh tính agent trên Discord | (a) một bot, đổi tên bằng webhook · (b) **mỗi agent một ứng dụng bot** | **(b)** | quyền kênh riêng, token riêng (chia giới hạn đăng nhập), tag đúng agent |

## 5. Kiến trúc

```
Người (Discord) ──tag/reply──▶ [bot của agent X] ──▶ Bộ chạy (phiên Mac mini │ API)
                                                         │  vai trò + công cụ được phép
                                                         ▼
                                          Bộ kết nối (MCP server) ─┬─ gwt-app  ──▶ API gwt-app ──▶ DB (SalesTracking → Masterdata)
                                                                   ├─ shopee   ──▶ Shopee Open API
                                                                   ├─ google   ──▶ Sheets / Drive
                                                                   ├─ admin-portal ─▶ sổ quỹ, chấm công
                                                                   ├─ erp      ──▶ trợ lý GWT-ERP
                                                                   └─ discord  ──▶ gửi tin, thread, react
Agent X ──giao việc──▶ hàng đợi (qua API gwt-app) ──▶ Agent Y   (mỗi lượt đăng vào #agent-team)
```

### 5.1 Cấu trúc repo GWT-Agent-Team

```
GWT-Agent-Team/
  agents/                      # MỖI AGENT MỘT THƯ MỤC — định nghĩa dùng chung cho 2 đường chạy
    bap/                       #   điều phối
      vai-tro.md               #   lời dặn hệ thống (thành CLAUDE.md ở đường phiên, system prompt ở đường API)
      agent.json               #   công cụ được phép · kích hoạt (kênh, lịch, sự kiện) · đường chạy (phien|api)
                               #   · model · hạn mức chi/ngày · bot Discord dùng · mã quyền gwt-app
    viec/  cskh/  kho/  sales/  admin/  tro-ly/
  ket-noi/                     # BỘ KẾT NỐI = MCP server, mỗi nguồn một thư mục
    gwt-app/                   #   ★ THUỘC GWT-APP: chỉ gọi API gwt-app theo hợp đồng ở hop-dong/
      hop-dong/                #     bản sao hợp đồng API (sinh từ gwt-app, có số phiên bản)
    shopee/  google/  admin-portal/  erp/  discord/  web/
  chay/
    phien/                     # đường phiên: sinh .mcp.json + CLAUDE.md theo agent, script tmux, plist launchd
    api/                       # đường API: dịch vụ Node dùng Claude Agent SDK, nghe Gateway của các bot, chạy lịch
  dieu-phoi/                   # luật giao việc giữa agent (số lượt tối đa, hết hạn, ai được giao cho ai)
  thu-vien/                    # dùng chung: nạp bí mật, Discord REST + Gateway tối giản, khoá file, ký Shopee, Google auth
  hooks/                       # rào an toàn của đường phiên (chặn công cụ Discord nguy hiểm, ghi nhật ký)
  tests/
  gwt.code-workspace           # mở cùng lúc GWT-Agent-Team + ../gwt-app
```

**Luật tách "thuộc gwt-app":** mọi thứ đọc/ghi dữ liệu GWT App (Việc, CSKH, Sales, Kho, Nhân viên, thông báo) **chỉ được nằm trong `ket-noi/gwt-app/`** và chỉ gọi API. Thêm việc ngoài app = thêm một thư mục trong `ket-noi/`, không đụng `gwt-app/`. Agent nào dùng nguồn nào khai trong `agent.json`.

### 5.2 Liên kết với gwt-app

- **gwt-app sở hữu hợp đồng**: các endpoint `apps/web/app/api/agent/v1/*` + lược đồ đầu vào/đầu ra viết một lần (zod) → sinh `openapi.json` có số phiên bản.
- **GWT-Agent-Team giữ bản sao** trong `ket-noi/gwt-app/hop-dong/`; lệnh `npm run dong-bo-hop-dong` chép bản mới từ `../gwt-app`. CI của GWT-Agent-Team gọi thử từng công cụ với bản sao này; CI của gwt-app chặn đổi hợp đồng phá vỡ mà không tăng phiên bản.
- **Sửa cùng lúc**: hai repo đặt cạnh nhau (`~/Coding Agent/gwt-app`, `~/Coding Agent/GWT-Agent-Team`), mở bằng `gwt.code-workspace`; một phiên Claude sửa endpoint ở gwt-app rồi công cụ ở GWT-Agent-Team trong cùng lần.

### 5.3 Danh tính, quyền, nhật ký

- **Mỗi agent là một "nhân viên" trong gwt-app**: dòng `staff` loại `agent`, vai `agent_viec`, `agent_cskh`… tick quyền trên ma trận như người thật. Agent Kho không có `cs.ticket.tao_sua` thì API từ chối.
- **Khoá API riêng mỗi agent** (lưu dạng băm, thu hồi được); đường phiên và đường API dùng chung khoá của agent đó.
- **Người ra lệnh**: mọi lời gọi ghi kèm Discord ID người ra lệnh → API tra bảng **nối Discord ID ↔ nhân viên** → quyền thực hiện = **giao của quyền agent và quyền người ra lệnh** (nhân viên Sales nhờ agent không làm được việc nhân viên Sales không được làm). Việc chạy theo lịch thì người ra lệnh = "hệ thống".
- **Nhật ký thao tác** của app ghi: agent · người ra lệnh · kênh + link tin · hành động · trước → sau.

### 5.4 Discord

- **Mỗi agent một ứng dụng bot** (tên, avatar riêng): Bắp, Bắp Việc, Bắp CSKH, Bắp Kho, Bắp Sales, Bắp Admin (token Admin hiện có), Bắp Trợ lý (không cần Discord).
- **Bắp là boss điều phối** (anh Dũng chốt 18/11): không biết hỏi ai thì gọi @Bắp, Bắp chia việc cho agent con. **Người vẫn gọi thẳng được một agent cụ thể** (@Nho Trợ lý, @Bơ Marketing…; anh Dũng chốt 18/11 chiều): agent đó nhận việc trong vai của nó, việc ngoài vai thì trả lời "việc này của @<agent khác>" hoặc chuyển Bắp, không tự làm. Agent con vẫn tự nghe kênh nghiệp vụ của mình như hiện nay.
- **Đội 4 agent, tên trái cây** (anh Dũng chốt 18/11; thay các tên "Bắp Việc/CSKH/Kho/Sales/Admin/Trợ lý" ở mục 6 và các mục khác):

  | Tên | Vai | Gánh các vai cũ | Chạy bằng | Bot Discord |
  | --- | --- | --- | --- | --- |
  | **Bắp** | điều phối (boss) + bán hàng + kho + **trợ lý nội bộ của gwt-app** (một agent, hai cửa: Discord + khung trợ lý trong gwt-app — anh Dũng 19/11) + **đăng bản tổng hợp việc 8h/17h vào từng nhóm** (lấy từ app, không đọc tin của Nho) | Bắp, Bắp Sales (Shopee, đơn, doanh số), Bắp Kho (sổ kho, serial), Bắp Trợ lý (nay ở GWT-ERP, đích chuyển về gwt-app) | Claude | token Bắp hiện có |
  | **Dâu Designer** | thiết kế: ảnh, banner, ấn phẩm, mockup (mới) | — | **API ChatGPT (OpenAI)**: runner riêng gọi API OpenAI (không phải phiên Claude Code); khoá OpenAI anh Dũng tự đặt trên máy | **tạo mới** |
  | **Bơ Marketing** | nội dung, chiến dịch, lịch đăng, khuyến mại (mới) | — | Claude | **tạo mới** |
  | **Nho Trợ lý** | quản lý việc + **tổng hợp việc từ nhóm chat → lên thẳng app** (đọc 23 kênh nhóm công việc + kênh riêng; tách ai · việc · hạn · xong/vướng; tạo/cập nhật việc Work kèm ghi chú + link tin gốc = luồng D1/D2 mục 7.14 file mô tả app) + chăm sóc khách hàng + hành chính | Bắp Việc (giao, nhắc, báo cáo, tóm tắt 8h/17h), Bắp CSKH (ticket, CTS20), Bắp Admin (sổ quỹ, chấm công) | Claude | **tạo mới** (server GWT chỉ còn bot Bắp — anh Dũng 18/11); bot Admin đang chạy sổ quỹ/chấm công giữ nguyên tới khi Nho nhận lại việc đó |
- **Bắp và trợ lý nội bộ là MỘT agent; trợ lý thuộc gwt-app, không thuộc ERP** (anh Dũng 19/11). Hiện trạng: worker `tro-ly` đọc hàng đợi `assistant.*` trong DB ERP, màn `/work/agent` ở repo GWT-ERP — đích: khung trợ lý nằm trong gwt-app v2, hàng đợi qua API gwt-app (DB ở schema GWT-App trên Masterdata, chỉ thêm). Gộp: chung luật (tri thức, giá/khuyến mại, Shopee, cách trả lời — viết một lần, hai cửa cùng nạp), chung bộ công cụ (gộp MCP `bap` `shopee/mcp.mjs` + MCP `troly` `tro-ly/mcp.mjs`; quyền theo NGƯỜI HỎI: gwt-app theo tài khoản, Discord theo Discord ID), cùng tên Bắp. Nhớ: sổ kênh + kiến thức dùng chung; hội thoại riêng trong gwt-app không lộ ra Discord. Làm SAU khi bước 1 chuyển nguyên trạng xong (đợt 5 chuyển `com.gwt.troly` nguyên như cũ). Nghiệm thu: cùng một câu hỏi ở hai cửa → cùng câu trả lời; người không có quyền tài chính hỏi ở cửa nào cũng không thấy số tiền.
- **Kênh đội agent**: #bắp-mkt sẽ đổi tên thành kênh chung của cả đội (anh Dũng 18/11) — đủ 4 bot của 4 agent trong kênh; đây là kênh `#agent-team` dưới đây.
- **Kênh đội agent** `#agent-team`: mọi lượt giao việc giữa agent được đăng ở đây (ai giao · cho ai · việc · kết quả).
- Agent **không đọc tin của bot khác để hành động**; phối hợp chỉ qua hàng đợi (5.6). Ngoại lệ có kiểm soát: tin của chính bot kho/ticket cũ trong giai đoạn chuyển.
- Giữ các rào hiện có: hook chặn công cụ Discord, kiểm quyền kênh mỗi giờ, nghe tin bị sửa (`MESSAGE_UPDATE`) → cập nhật, tin bị xoá → huỷ bản nháp.

### 5.4b Sổ kênh — context lâu dài của từng kênh (anh Dũng chốt 18/11)

**Hiện trạng:** chỉ 4 kênh riêng có nhớ, là file trên Mac mini (`~/Bots/bap-kenh/<id>/nho.md`, `tasklist.md`); Bắp chung và 23 kênh nhóm công việc không có nhớ theo kênh. File ngoài git/DB: máy hỏng là mất, app không thấy, agent chạy API (Dâu) không đọc được.

**Ba lớp:**
1. **Tin gốc** để nguyên trên Discord, cần thì đọc lại (`fetch_messages`) — không chép.
2. **Sổ kênh** trong app: bảng mới ở schema GWT-App trên Masterdata (chỉ thêm), đọc/ghi qua API gwt-app. Mỗi dòng: kênh · loại (`muc_dich` mục đích kênh và người phụ trách · `quyet_dinh` đã chốt · `luat` riêng của kênh · `nho` điều được nhờ nhớ) · nội dung · người ghi + link tin gốc · ngày ghi · **hiệu lực đến** (bỏ trống = không hạn) · trạng thái `dang_dung | het_han | thay_the | da_bo` · thay bằng dòng nào. Cả 4 agent đọc chung; xem/sửa trên app.
3. **Việc và kiến thức không nằm trong sổ:** việc → Work (Nho, D1/D2); kiến thức sản phẩm/quy trình → đề xuất Wiki (D9). Sổ chỉ giữ thứ giúp agent hiểu kênh.

**Ghi thêm:** người nhắn "nhớ giúp…" → ghi ngay (như `ghi_nho` hiện nay). Cuối ngày Nho đọc lại kênh, thêm quyết định/luật mới có link tin gốc.

**Dọn sổ — xoá cái đã xong, hết hạn, không cần:**
- **Đã xong:** việc không bao giờ vào sổ (ở Work), nên việc xong tự biến mất khỏi ngữ cảnh. Dòng `nho` gắn với một việc (vd "nhớ gửi báo giá khách X") → việc Work xong thì dòng đó `da_bo`.
- **Hết hạn:** dòng có "hiệu lực đến" (CTKM tới 30/11, quy định tạm tuần này…) tự chuyển `het_han` qua ngày — không cần ai dọn.
- **Bị thay:** quyết định/luật mới trái với dòng cũ → dòng cũ `thay_the` (trỏ sang dòng mới); agent chỉ nạp dòng `dang_dung`.
- **Không cần nữa:** người trong kênh nhắn "bỏ / quên điều …" → `da_bo`, ghi ai bỏ. Dòng `nho` 60 ngày không ai nhắc tới → Nho đưa vào danh sách **đề xuất bỏ**.
- **Dọn hằng tuần:** Nho gửi người phụ trách kênh một tin "đề xuất dọn sổ" (dòng cũ, trùng, trái nhau, quá dài cần gộp); người đó trả lời số dòng hoặc "ok hết" → Nho mới đổi trạng thái. Không tự bỏ dòng `quyet_dinh`/`luat` khi chưa có người duyệt.
- **Không xoá hẳn:** bỏ = đổi trạng thái, giữ lịch sử (ai bỏ, khi nào) để khôi phục được; xem trên app.
- **Trần độ dài:** phần `dang_dung` của một kênh giữ dưới ~1.500 chữ; vượt thì đợt dọn tuần ưu tiên gộp các dòng cùng chủ đề.

**Agent nạp gì khi được gọi trong một kênh:** sổ kênh (chỉ `dang_dung`) + việc Work đang mở của kênh + vài chục tin gần nhất.

**Tạm thời (trước bước 2 — API gwt-app):** giữ file như hiện nay, thêm sao lưu thư mục `bap-kenh/` mỗi đêm; khi có API thì chuyển `nho.md` vào sổ kênh.

### 5.5 Hai đường chạy

| | Đường phiên (Mac mini, gói Ultra) | Đường API (Claude API, credit) |
| --- | --- | --- |
| Vòng suy nghĩ | Claude Code + plugin Discord (như Bắp hiện nay) | dịch vụ Node dùng **Claude Agent SDK** |
| Vai trò | `vai-tro.md` → CLAUDE.md của phiên | `vai-tro.md` → system prompt |
| Công cụ | `.mcp.json` sinh từ `agent.json` | cùng các MCP server trong `ket-noi/` |
| Kích hoạt | tin kênh qua plugin; lịch qua launchd | Gateway của bot agent; lịch trong dịch vụ |
| Giữ sống | watchdog tmux + launchd (như hiện nay) | chạy được trên Mac mini hoặc server/cloud |
| Hợp với | agent nghe kênh liên tục, nhiều lượt | lịch hẹn ngắn, nhắc việc, cần chạy khi Mac mini tắt |

- **Đổi đường** = sửa `duong_chay` trong `agent.json`, chạy lại `chay/` — không sửa vai trò, công cụ.
- **Model**: điều phối và việc cần suy nghĩ dùng `claude-opus-5-5`; việc lặp đơn giản (đọc tin kho, ticket từ tin) dùng `claude-haiku-5-5`; cache phần vai trò.
- **Hạn mức chi** mỗi agent mỗi ngày ở đường API; chạm hạn mức → tự chuyển đường phiên (nếu agent khai cho phép) hoặc dừng và báo admin.
- **Chỉ gọi model khi có sự kiện thật**: tin kho mới, tin ticket mới, đến giờ nhắc. Việc dò "có gì mới không" do công cụ làm (không tốn token); vòng 20 giây hiện nay của kho chuyển sang nghe Gateway.
- **Mac mini tắt**: agent đường API vẫn chạy; một agent API nhỏ kiểm "nhịp tim" các phiên mỗi 10 phút, mất nhịp → báo #agent-team + DM admin.

### 5.5b "Cắm API trực tiếp" — chạy ở đâu

Ở cả hai đường, **model luôn chạy ở Anthropic**. Câu hỏi là **chương trình agent** (nghe Discord, hẹn giờ, gọi công cụ) chạy ở đâu:

| Cách | Ai chạy chương trình | Mac mini tắt | Ghi chú |
| --- | --- | --- | --- |
| Phiên Mac mini | Claude Code trên Mac mini | dừng | hiện nay; gói Ultra |
| Agent SDK trên Mac mini | Node trên Mac mini, gọi Claude API | dừng | trả theo token |
| Agent SDK trên server | server/VPS của mình, gọi Claude API | **vẫn chạy** | thuê server, đưa bí mật lên đó |
| **Managed Agents** ("cắm API trực tiếp") | **Anthropic chạy vòng agent và lịch hẹn giờ**, mình chỉ khai agent + công cụ + lịch | **vẫn chạy** | không cần server; bí mật để trong kho bí mật (vault) của Anthropic; công cụ gọi API gwt-app qua địa chỉ công khai của app trên Vercel; trả theo token (credit API) |

**Đề xuất:** agent **hẹn giờ** (nhắc việc đến giờ, tóm tắt 8h/17h, tổng kết tháng, gửi thông báo app ra Discord, kiểm nhịp tim các phiên) chạy bằng **Managed Agents** — đúng nghĩa "cắm API trực tiếp", sống khi Mac mini tắt, không thuê server. Agent **nghe kênh liên tục** vẫn chạy **phiên Mac mini** (gói Ultra), vì nghe Gateway Discord cần một chương trình chạy suốt. Đổi một agent giữa hai đường vẫn chỉ là sửa `agent.json`.

### 5.6 Agent giao việc cho nhau

- Bảng **hàng đợi giao việc** (qua API gwt-app, lưu ở schema `agent` — migration trong repo GWT-Masterdata): người giao · agent nhận · việc · ngữ cảnh (link tin, mã ticket/đơn) · trạng thái `cho → dang_lam → xong | loi | het_han` · kết quả · số lượt.
- Luật (`dieu-phoi/`): tối đa **3 lượt chuyển** cho một yêu cầu gốc; hết hạn 30 phút thì báo người ra lệnh; agent chỉ giao cho agent nằm trong danh sách được phép; mỗi lượt đăng vào `#agent-team`.
- Ví dụ: chị Trang tag Bắp "đơn HO mới đã lên chưa, có thì tạo việc cho Hiệp gọi khách" → Bắp giao **Bắp Sales** kiểm đơn HO → kết quả về → Bắp giao **Bắp Việc** tạo việc cho Hiệp → Bắp trả lời chị trong thread.

### 5.7 API gwt-app cho agent (v1)

Mọi endpoint nhận: khoá agent · Discord ID người ra lệnh (tuỳ chọn) · link tin nguồn. Trả lỗi tiếng Việt đọc được.

| Nhóm | Endpoint (đề xuất) | Thay cho |
| --- | --- | --- |
| Nhân viên | tra nhân viên theo Discord ID / tên | danh sách Discord ID rải trong bot |
| Việc | tạo việc · cập nhật trạng thái/ghi chú · bình luận · tìm việc của một người (Cần gấp / Cần làm / Để lâu) · tìm việc đang mở để chọn · đặt / huỷ lời nhắc · lời nhắc đến giờ | (mới — D1–D5) |
| Ticket | tạo ticket từ tin (chống trùng theo id tin) · tra ticket · thêm ghi chú · đọc/ghi đồng bộ CTS20 | `bot_tao_ticket`, `bot_tra_ticket`, `bot_dong_bo_cts20_*` |
| Kho | ghi dòng sổ từ tin (chống trùng theo id tin) · sửa/huỷ khi tin sửa/xoá · danh sách chờ duyệt mã · duyệt/bỏ qua · ghi sự kiện serial · serial lạ vào hàng chờ | `wh_master`/`wh_alias` REST service_role, `wh_*`, `kho_bot_ghi` |
| Đơn | đơn mới từ mốc · doanh số ngày · đơn app chưa lên Sheet + đánh dấu đã lên · tồn Shopee | `bot_ds_don`, `bot_ds_don_app`, `sales.ghi_ton_shopee` |
| Thông báo | lấy thông báo chờ gửi theo kênh · đánh dấu đã gửi | `work.notification` (hiện không ai gửi) |
| Hàng đợi agent | giao việc · nhận việc · trả kết quả | (mới) |

Sổ quỹ, chấm công (Admin Portal), Shopee, Google, trợ lý ERP **không** đi qua API gwt-app — nằm ở `ket-noi/` tương ứng.

## 6. Đội agent và bản đồ chuyển

| Agent | Vai | Tính năng hiện có chuyển sang | Kết nối | Đường mặc định |
| --- | --- | --- | --- | --- |
| **Bắp** (điều phối) | nhận yêu cầu của người, trả lời tra cứu, chia việc, **gom dữ liệu + gửi đề xuất Wiki** (D9, thay Wiki Training Ingest đã bỏ 18/11) | hỏi đáp chung + tri thức + web + mở thread; chuyển yêu cầu cho anh Dũng; giá/khuyến mãi (tra cứu); phiên kênh riêng + tasklist; phát hiện kênh mới | gwt-app (tra cứu), masterdata tri thức qua gwt-app hoặc `web`, discord | phiên |
| **Bắp Việc** | giao việc, báo cáo, nhắc, việc của tôi, tổng hợp | tóm tắt 8h/17h (nhóm công việc); **mới**: D1 giao việc · D2 báo cáo · D3 nhắc theo giờ · D4 task AI · D5 việc của tôi · tổng kết tháng · gửi thông báo app ra Discord | gwt-app, discord | nghe kênh: phiên · nhắc + tóm tắt + tổng kết: API |
| **Bắp CSKH** | ticket từ tin, đồng bộ, nhắc ticket | ticket từ #chăm-sóc-khách-hàng; Sheet CTS20 ↔ ticket | gwt-app, google | phiên |
| **Bắp Kho** | sổ kho từ tin, duyệt mã, serial | kho Nguyễn Xiển (sổ + Sheet + Drive + react ✅⏳❌ + lịch sử serial); kho theo serial (đang tắt); báo sắp hết | gwt-app, google | phiên (Haiku) |
| **Bắp Sales** | đơn, doanh số, Shopee | báo đơn mới + doanh số 20:00; đơn app → Sheet Sales; tra doanh số; Shopee đọc/sửa 2 bước/báo cáo/bản tin/định kỳ/tồn → DB; hàng tặng → DON_TANG; **mới**: đơn Hannah Olala, đối soát VTP | gwt-app, shopee, google | bản tin + định kỳ: API · Shopee hỏi đáp: phiên |
| **Bắp Admin** | sổ quỹ, chấm công | sổ quỹ (3 kênh + báo cáo 20:30 + bù mỗi giờ); chấm công (kênh + 00:30); nghe tin sửa; kiểm quyền kênh; DM lỗi | admin-portal, google, discord | phiên (token Admin hiện có) |
| **Bắp Trợ lý** | trả lời trợ lý nội bộ GWT-ERP | worker `tro-ly` (hàng đợi `assistant.*`, mỗi câu một lượt) | erp, shopee | API hoặc phiên |
| (giữ ngoài) | — | đồng bộ wiki → tri thức chatbot, Pancake đọc/báo (code ở GWT-ERP); Apps Script Sheet Sales → app (chạy ở Google) | — | không dời đợt này |

## 7. Thứ tự làm

Mỗi bước dùng được ngay, có thể dừng giữa chừng.

| Bước | Làm gì | Xong khi |
| --- | --- | --- |
| **0. Chuẩn bị** | Tạo repo GWT-Agent-Team (GitHub GWT-VN, riêng tư); hợp thức hoá các hàm DB bot đang dùng (`db/sales`, `db/ticket` áp tay) thành migration; chốt câu hỏi mục 9 | repo có CI; ledger DB khớp file |
| **1. Dời nguyên trạng** | Repo mới mang **nguyên lịch sử và bố cục** của gwt-discord-bot + khung thư mục mới (file dời vào `ket-noi/` ở bước 2, lúc viết lại từng kết nối); bỏ đường dẫn cứng; **giữ nguyên hành vi, token, DB**; chuyển launchd **từng đợt, giữ nhãn job, có lệnh lùi** (không chạy song song hai bản vì job ghi sẽ ghi trùng). Kế hoạch: `docs/rework/2026-11-18-gwt-agent-team-plan-buoc-0-1.md` | 1 tuần chạy không sót/trùng tin kho, ticket; mọi lịch launchd chạy từ repo mới |
| **2. API gwt-app + bộ kết nối gwt-app** | Endpoint 5.7 (trước hết: ticket, kho, đơn), bảng nối Discord ID, khoá agent, nhật ký; đổi các chỗ ghi thẳng DB sang gọi API | không còn chỗ nào trong GWT-Agent-Team ghi thẳng DB của app |
| **3. Danh tính agent** | Tách 6 ứng dụng bot; mỗi agent `agent.json` + vai trò + quyền ma trận; chia tính năng theo bảng mục 6 | mỗi agent chỉ làm được việc trong vai (thử gọi công cụ ngoài vai → bị chặn) |
| **4. Agent nhận việc như người** | Agent thành "người" trong Work; giao việc cho agent trên app hoặc Discord; việc định kỳ = việc lặp; nạp **việc mẫu** D1–D9 (không viết cứng) + công cụ còn thiếu (đặt nhắc, gửi thông báo, tổng kết tháng) | nghiệm thu theo mục 7.14 file mô tả app (giao thử 3 việc, nhắc 5 phút…) |
| **5. Đội agent** | Hàng đợi giao việc, `#agent-team`, đường API cho agent hẹn giờ, hạn mức chi, nhịp tim | ví dụ 5.6 chạy trọn; tắt Mac mini thì nhắc việc vẫn chạy và admin được báo |
| **6. Đổi DB** | Khi app v2 chuyển sang Masterdata: chỉ sửa phía sau API gwt-app | GWT-Agent-Team không sửa dòng nào |

## 8. Kiểm thử

- Công cụ trong `ket-noi/` có test gọi API thật trên DB local (Supabase CLI của gwt-app) và test hợp đồng.
- Agent: bộ tin mẫu (tin kho, tin ticket, câu giao việc, câu nhắc) → so kết quả mong đợi; chạy cả hai đường.
- Chuyển nguyên trạng (bước 1): đối chiếu số dòng sổ kho / ticket tạo ra giữa bản cũ và mới trong cùng khoảng thời gian.

## 8b. Quyết định của người viết (anh Dũng soát lại)

Sau vòng đọc kiểm của người build, các điểm dưới đây người viết tự chốt; đổi được nếu anh thấy khác.

1. **"Mọi tính năng thành agent" với việc đang chạy bằng luật cố định** (đọc tin kho, ticket từ tin, báo đơn, đơn app → Sheet): mỗi việc **thuộc về một agent** (danh tính, bot, quyền, nhật ký của agent đó), nhưng **đường thường ngày vẫn là công cụ chạy luật cố định, không gọi model**. Model chỉ được gọi khi luật không xử lý được: tên hàng lạ, tin không hiểu, cần hỏi lại người gửi, tóm tắt. Lý do: giữ tiêu chí "không sót, không trùng" và không đốt token cho mỗi tin; vẫn đúng ý "agent hết" vì agent quyết định khi có ngoại lệ.
2. **Người ra lệnh ở luồng nghe thụ động** (ticket từ mọi tin ở #chăm-sóc-khách-hàng, sổ kho từ tin KTV, báo cáo bằng reply): người ra lệnh = **tác giả tin** nếu đã nối Discord ID; chưa nối → ghi là "hệ thống", **vẫn ghi dữ liệu** bằng quyền của agent và gắn cờ "chưa nối người" để admin nối sau. Luật "giao của quyền agent và người ra lệnh" chỉ áp cho **lệnh chủ động** (người bảo agent làm một việc), không áp cho việc ghi nhận tin. Không bao giờ bỏ tin vì thiếu quyền.
3. **Danh sách quyền đang nằm trong bot** (3 người được sửa Shopee, 2 KTV kho, 3 người xem số tiền): bước 1–3 giữ trong cấu hình bộ kết nối tương ứng; khi ma trận quyền có mã cho Shopee/tài chính thì chuyển vào ma trận (gwt-app trả về quyền theo Discord ID, kết nối Shopee hỏi qua đó).
4. **Bảng nối Discord ID** — **cập nhật 18/11 (anh Dũng):** Discord ID gắn vào **bảng người** của GWT-App (người ≠ tài khoản đăng nhập; giao việc theo tên người, không theo email). Ở v1 tạm dùng `work.staff_channel`; v2 dùng bảng người trên Masterdata. "Người ra lệnh" của bot = người tra từ Discord ID.
5. **Kho đi qua API gwt-app** dù sổ kho `wh_*` nằm ở Masterdata: Kho là một module của GWT App (`/kho` đọc nó), nên gwt-app là cổng ghi cho kho; tồn Shopee cũng vậy (thuộc khu Sales). Sổ quỹ, chấm công thuộc Admin Portal → kết nối `admin-portal/` riêng. Luật tách: **dữ liệu của module trong GWT App → API gwt-app, bất kể nằm DB nào**.
6. **Mốc dời nguyên trạng**: **bản đang chạy trên Mac mini** (gồm các commit chưa push và file ngoài git như `shopee/gia-plan.json`) — bước 0 đẩy hết lên `origin/main` của gwt-discord-bot và kiểm khớp; **đóng băng tính năng mới** ở gwt-discord-bot từ lúc bắt đầu bước 1 (chỉ sửa lỗi, sửa song song ở cả hai repo).
7. **D4, D6 ở bước 4 chỉ làm phía Discord**: màn nghiệm thu và màn cấu hình thông báo làm cùng UI v2. D4 ghi checklist yêu cầu bằng cách **mở pull request vào nhánh tài liệu** của repo app tương ứng, không push thẳng `main`; cấu hình thông báo tạm là file trong repo GWT-Agent-Team.

## 8c. Anh Dũng đã chốt (18/11)

1. **API agent làm trên `main` ngay**: lớp riêng `apps/web/app/api/agent/v1/*` trên bản v1 đang chạy; hợp đồng có phiên bản; **v2 khi dựng lại phải giữ đúng hợp đồng này** (thêm vào yêu cầu của v2). Bảng mới (hàng đợi agent…) đặt ở Masterdata theo luật.
2. **Bắp là "boss" điều phối các agent con**: người chỉ cần gọi @Bắp cho mọi việc; Bắp chuyển việc cho agent con qua hàng đợi. Agent con vẫn có danh tính riêng (để đăng kết quả, react, ghi nhật ký) và **tự nghe kênh nghiệp vụ của mình** không cần tag (kênh kho, #chăm-sóc-khách-hàng, sổ quỹ, chấm công, #e-com) — như hành vi hiện nay.
3. **Gói Ultra đủ cho nhiều phiên thường trực** (đang chạy bap + admin + nhomcv + troly + tới 4 phiên kênh ổn định) → agent nghe kênh mặc định chạy **đường phiên**.
4. **Đường API — chờ anh xác nhận phương án ở 5.5b.**

## 9. Câu cần chốt trước khi làm

Còn mở (đề xuất mặc định, làm theo đề xuất nếu anh không đổi):
1. Tên kênh đội agent: `#agent-team`; người vào: anh Dũng, chị Trang, Hiệp.
2. Tạo 4 ứng dụng bot Discord mới (Bắp Việc, Bắp CSKH, Bắp Kho, Bắp Sales); Bắp và Admin giữ token cũ — anh Dũng tạo trên Discord Developer Portal (không tự động được).
3. Hàng đợi agent: schema `agent` ở Masterdata (luật "tính năng mới → Masterdata"); danh tính agent + bảng nối Discord ID ở nơi `staff` đang nằm (DB app), đi theo app khi v2 chuyển DB.
4. Hạn mức chi đường API: tổng ≤ 3 đô/ngày lúc đầu, xem lại sau 2 tuần.
5. Đường API: Managed Agents cho agent hẹn giờ (5.5b) — **chờ anh xác nhận**.
6. Bot NP và Pancake: giữ ngoài đợt này.

## 10. Quy trình triển khai và vận hành — bắt buộc dùng Superpowers

Anh Dũng chốt 18/11: **mọi việc triển khai và vận hành GWT-Agent-Team dùng bộ skill Superpowers** (cùng toolchain chuẩn GWT ở `../GWT-SHARED/TOOLCHAIN-CLAUDE.md`). `CLAUDE.md` của repo mới ghi luật này ngay từ commit đầu.

**Triển khai (mỗi bước ở mục 7):**

| Lúc | Skill |
| --- | --- |
| Bắt đầu một bước | `superpowers:writing-plans` — viết kế hoạch chi tiết từ bản thiết kế này |
| Chỗ làm | `superpowers:using-git-worktrees` — mỗi bước một nhánh + worktree riêng (cả gwt-app lẫn GWT-Agent-Team) |
| Thực hiện | `superpowers:subagent-driven-development` (việc tách được) hoặc `superpowers:executing-plans` (làm tuần tự) |
| Mỗi công cụ / endpoint mới | `superpowers:test-driven-development` — test hợp đồng + test gọi API thật trên DB local viết trước |
| Gặp lỗi | `superpowers:systematic-debugging`; lỗi chập chờn (Gateway rớt, tin trùng) → `diagnosing-bugs` |
| Trước khi báo xong | `superpowers:verification-before-completion` — chạy test, đối chiếu số tin/ticket/dòng kho, có bằng chứng |
| Trước khi merge | `superpowers:requesting-code-review` → `superpowers:finishing-a-development-branch` |
| Nhiều việc độc lập | `superpowers:dispatching-parallel-agents` |
| DB | luật DB GWT 6 bước (migration ở GWT-Masterdata, CI `db-reset` xanh, áp qua MCP, kiểm ledger, advisors) |

**Vận hành (sau khi chạy thật):**
- **Agent đường phiên nạp sẵn Superpowers**: khi agent gặp lỗi công cụ hoặc kết quả lạ, vai trò dặn dùng `systematic-debugging` trước khi thử lại, và `verification-before-completion` trước khi báo "đã ghi xong" lên Discord.
- **Sự cố** (agent im, ghi trùng, đốt hạn mức): người trực mở phiên Claude ở repo, dùng `systematic-debugging`; sửa xong viết lại thành mục trong `RUNBOOK.md` (bẫy đã gặp + cách nhận ra + cách sửa).
- **Đổi vai trò / thêm agent / thêm kết nối**: coi là việc mới → `superpowers:brainstorming` → `writing-plans`, không sửa thẳng trên Mac mini.
- **Rà định kỳ** (hằng tuần lúc đầu): chi phí theo agent, số lượt giao việc, lỗi API, tin bị bỏ sót — báo vào `#agent-team`.

## 11. Để người làm tự quyết

Tên hàm/endpoint cụ thể, cách sinh `.mcp.json`, cấu trúc test, thư viện Discord cho đường API, định dạng tin đăng ở `#agent-team` — miễn theo các luật ở mục 5.
