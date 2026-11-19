# GWT-Agent-Team — Dựng đội 4 agent (Bắp · Dâu · Bơ · Nho) — kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bốn agent tên trái cây có danh tính Discord riêng, làm việc trong kênh đội #bắp-mkt, người tag thẳng agent nào cũng được, Bắp chỉ đường khi người không biết hỏi ai. Phần nào không cần API gwt-app thì chạy được ngay; phần cần API được xếp sau.

**Architecture:** Bơ và Nho là phiên Claude Code + plugin Discord, dựng theo khuôn `admin/mac/start-bot.sh`. Mỗi bot có một `DISCORD_STATE_DIR` riêng, cấu hình phiên sinh từ `agents/<tên>/agent.json`, mỗi bot do watchdog launchd giữ sống trong tmux. Dâu là dịch vụ Node riêng: nghe Gateway Discord bằng WebSocket có sẵn của Node, gọi API OpenAI bằng `fetch`, không dùng Claude. Bắp giữ nguyên đường chạy. Sau 7 ngày theo dõi, lời dặn của Bắp tách thành một bộ luật chung cho cả hai cửa (Discord và khung trợ lý gwt-app), còn MCP `bap` và MCP `troly` gộp thành một MCP có chế độ `CUA=app`. Giao việc giữa agent đi theo phương án A, làm thử trong kênh, rồi phương án B (hàng đợi qua API gwt-app) thay vào khi có API.

**Tech Stack:** Node ≥22 (ESM, `node --test`, `WebSocket`/`fetch`/`FormData` có sẵn, không thêm thư viện), zsh + tmux + launchd trên Mac mini, Claude Code + plugin `discord@claude-plugins-official`, OpenAI Responses API (công cụ `image_generation`).

**Spec:** `docs/rework/2026-11-18-gwt-agent-team-design.md` (§1b, §5.4, §5.4b, §5.5/5.5b, §5.6, §7, §8b/8c) + `docs/rework/v2-mo-ta-app.md` §3 (dock Bắp), §7.13–7.14 (D1–D9). Code nền: repo `GWT-VN/GWT-Agent-Team` (`~/Coding Agent/GWT-Agent-Team`, chạy trên Mac mini ở `~/Bots/GWT-Agent-Team`).

---

## ⚠️ Anh Dũng cần chốt trước khi làm

| # | Câu hỏi | Đề xuất (làm theo nếu anh không đổi) | Chặn task |
| --- | --- | --- | --- |
| **QĐ1** | **Giao việc giữa agent: A hay B?**<br>**A** — giao ngay trong kênh: Bắp tag agent con. Rào: agent con chỉ nhận tin của bot có ID là Bắp hoặc của người; một yêu cầu gốc tối đa 3 lượt giao; agent con không bao giờ tag agent khác.<br>**B** — bảng hàng đợi qua API gwt-app (spec §5.6) | **A làm thử ngay** (Giai đoạn 4, mọi task gắn nhãn **[A]**). **B thay A khi có API** (Giai đoạn 5, task 5.4 gỡ hết phần [A]). Chưa chốt thì bỏ Giai đoạn 4: Bắp vẫn chỉ đường bằng chữ ("việc này anh/chị tag Bơ Marketing nhé"), không cần sửa code | T12–T14 |
| QĐ2 | Ở kênh đội, cả 4 bot đều `requireMention: true`. Bắp hiện để `false` ở #bắp-mkt nên sẽ trả lời cả tin người tag Bơ, tức là hai bot cùng đáp | Đổi Bắp sang `true` (gọi bằng @Bắp, reply, hoặc tin mở đầu "Bắp…"). Tin không tag ai thì không agent nào đáp | T3 |
| QĐ3 | Bot dự phòng để chạy bản thử của Bắp song song (state `~/.claude/channels/thu/`). Khi Bơ, Nho, Dâu đã chạy thật thì không còn token nào rảnh | Anh tạo thêm bot thứ 5 "Bắp Thử", chỉ mời vào #bắp-mkt | T8, T9 |
| QĐ4 | Dâu: tên model OpenAI (chữ), hạn mức mỗi ngày, và việc tin + ảnh ở kênh nào Dâu nghe đều gửi sang OpenAI. **Sửa 19/11:** Dâu gọi tool gen ảnh của Marketing-kit (§5.4c), dùng khoá + model của tool; còn chốt: hạn mức, Drive hay lưu máy | Anh điền `model`; hạn mức `toi_da_luot_ngay: 100`, `toi_da_anh_ngay: 20`; ban đầu Dâu chỉ nghe #bắp-mkt | T7 |
| QĐ5 | Model của Bơ và Nho. Spec §5.5 ghi Opus cho việc cần suy nghĩ, còn mọi phiên đang chạy dùng Sonnet | Bơ, Nho chạy `claude-opus-5-5` theo spec; Bắp giữ `claude-sonnet-5-5` (đổi model Bắp là một việc riêng) | T1 — **ĐÃ CHỐT 19/11: Bơ, Nho chạy Opus 5.5** |
| QĐ6 | Sổ quỹ và chấm công chuyển sang Nho. Luật "một token một phiên" buộc phải gộp prompt + MCP của Admin vào phiên Nho | **Ngoài kế hoạch này**: bot Admin chạy như cũ (spec §5.4 cho phép "giữ nguyên tới khi Nho nhận lại") | — |

## Lệch so với spec / hiện trạng (người lập kế hoạch đã xử lý như sau)

1. **A trái với spec** §4 (chọn hàng đợi), §5.4 ("không đọc tin của bot khác để hành động") và §8c.2 ("Bắp chuyển việc qua hàng đợi"). Vì vậy A chỉ là bản thử, đợi QĐ1, và được tách riêng để gỡ ra trọn vẹn.
2. **Spec còn sót tên đội cũ.** §6, §7 bước 3 và §9.2 vẫn ghi 6–7 bot "Bắp Việc/CSKH/Kho/Sales/Admin". Kế hoạch theo bảng 4 agent ở §5.4.
3. **"Không chạy hai phiên cùng một token" vs hiện trạng.** Bắp đang có `bap` + `kenh-bap-*` + `nhomcv` chạy chung token Bắp. Với bot mới, kế hoạch giữ luật theo đúng chữ: mỗi token đúng một phiên. Vì thế Nho **nhận luôn phiên nhóm công việc** (T10), không mở phiên thứ hai.
4. **Ai gửi tin 8h/17h.** §5.4 giao cho Bắp, lấy số liệu từ app; §6 giao cho "Bắp Việc" (nay là Nho); thực tế job `nhomcv-bao` đang nhắn riêng Hiệp ở chế độ thử. Trước khi có API: giữ nguyên job. Có API thì Bắp đăng (task 5.6).
5. **Model.** §5.5 ghi Opus cho điều phối nhưng Bắp đang chạy Sonnet. Xem QĐ5.
6. **Sao lưu sổ kênh (§5.4b, bản tạm).** ~~File không tồn tại~~ — **đã làm ở PR #8 (99d22ee, 19/11)**: `mac/sao-luu.sh` + nhãn `com.gwt.bap.saoluu` 02:30, giữ 14 bản trong `~/Bots/.sao-luu-dem`; bản sửa lọc bí mật + ghi log lỗi theo sau. T4 chỉ còn **mở rộng** phạm vi cho đội agent.
7. **Hook `hooks/chan-discord.mjs` chặn mọi mention** (`<@`), nhưng phương án A cần Bắp tag agent và D1 cần tag người. A được nới đúng một khe (T13). D1 để đến lúc có API (task 5.2).
8. **Plugin Discord bỏ mọi tin do bot gửi** (`server.ts`: `if (msg.author.bot) return`). A cần một bản vá plugin thứ 3, chỉ có tác dụng khi `access.json` có khai `nhanTuBot` (T12). Không khai thì bản vá không làm gì, nên bot NP dùng chung cache plugin không bị ảnh hưởng.

## Global Constraints

- **Không sửa `CLAUDE.md` ở gốc GWT-Agent-Team**, vì đó là prompt đang chạy của Bắp. T8 soạn bản thay rồi đưa diff cho anh Dũng duyệt.
- **Trong 7 ngày theo dõi bước 1** (đợt 3 Admin và đợt 4 khonx chạy tối 19/11): không sửa các file phiên đang đọc (`CLAUDE.md`, `bot-settings.json`, `kenh/`, `admin/bot/`, `.claude/`, `admin/kho/`, `mac/start-bot.sh`, `mac/va-plugin.mjs`). Giai đoạn 1–2 chỉ **thêm file mới**, thêm nhãn vào `mac/cai-launchd.sh` và `mac/chay-dinh-ky.sh` rồi cài bằng `--chi <nhãn>`, và sửa `access.json` của #bắp-mkt (QĐ2).
- **Một token ↔ một tiến trình nghe Gateway.** Bơ, Nho mỗi bot một phiên `claude`; Dâu một tiến trình Node. Không chạy bản thử bằng token thật: bản thử chạy bằng bot dự phòng `thu`, chỉ ở #bắp-mkt, `requireMention: true`.
- **Không mở phiên từ SSH** vì SSH không vào được Keychain. Phiên được mở trong server tmux do launchd dựng: watchdog dựng, hoặc gõ `tmux new-session -d …` vào server đó.
- **Thư mục làm việc mới phải trust trước, ngay trên màn hình Mac mini** (`cd <thư mục> && claude` → "Yes, I trust this folder" → `/exit`). `start-agent.sh` không chạy nếu thư mục chưa được trust.
- tmux: phiên tên `agent-<tên>` (không mở đầu bằng `bap`), gọi bằng `-t "=agent-<tên>"` cho khớp đúng tên. Format `-F` nhiều cột tách bằng `|~|`, không dùng TAB.
- Mọi phiên Claude: `--permission-mode dontAsk` vĩnh viễn; không `--strict-mcp-config`; không WebFetch; `deny` phải chứa trọn `deny` trong `bot-settings.json` của Bắp; hook `chan-discord.mjs` fail-closed (`|| exit 2`).
- Kênh đội: #bắp-mkt `1556863437219430491` (sẽ đổi tên sau, chỉ dùng ID).
- Bí mật: token ở `~/.claude/channels/{dau,bo,nho,thu}/.env`, khoá OpenAI ở `~/Bots/.secrets/dau-openai.env`. Không đưa vào repo, `mcp.json` hay `agent.json`; repo chỉ ghi tên biến.
- Discord cho ~1000 lần IDENTIFY trong 24 giờ cho mỗi token, nên mọi vòng chạy lại đều giãn chờ gấp đôi, tối đa 1 giờ (khuôn `kenh/start-kenh.sh`).
- Giai đoạn 1–4 **không đụng DB**. Giai đoạn 5 theo luật DB 6 bước; migration nằm ở GWT-Masterdata, **Masterdata chỉ bổ sung** (mục "BẢO VỆ GWT-MASTERDATA" ở `GWT-Masterdata/rules/supabase-mcp.md` trên `origin/main`; bản checkout local đang sau origin, nên `git pull` trước).
- Superpowers (spec §10): mỗi giai đoạn một nhánh + worktree; mỗi công cụ hay rào mới làm theo TDD; `verification-before-completion` trước khi đánh dấu xong. Test mới đặt trong `tests/` để CI `test-repo` tự chạy. Test của `hooks/` và `mac/` chạy tay bằng `node --test hooks/chan-discord.test.mjs mac/cau-hinh.test.mjs mac/va-plugin.test.mjs`.
- Triển khai lên Mac mini: merge `main`, rồi `git pull` **trong Terminal trên màn hình Mac mini** (theo RUNBOOK).

## Review Focus

1. **Hai bot cùng đáp một tin ở kênh đội.** Kỳ vọng: chỉ agent được tag mới trả lời. → Nghiệm thu ở T3 bước 7; test `xetTin: tin tag Bơ, không tag Dâu → Dâu bỏ qua` ở T6.
2. **Bot lặp vô hạn [A].** Kỳ vọng: Bắp bỏ mọi tin bot; agent con chỉ nhận tin của Bắp; agent con không tag được ai. → Test ở T12 (`vaNhanTuBot`), T13 (`agent con tag agent → chặn`), T6 (`bot ngoài nhanTuBot → bỏ`).
3. **Phiên mới kẹt ở hộp thoại trust, im lặng không báo.** Kỳ vọng: không chạy `claude`, ghi `CHƯA TRUST` vào log, watchdog không mở lại liên tục. → Test `daTrust` ở T1 + test tĩnh ở T2.
4. **Dâu tốn tiền vượt mức hoặc OpenAI lỗi.** Kỳ vọng: chạm hạn mức thì trả lời một câu và không gọi OpenAI; OpenAI lỗi thì báo một tin, không thử lại. → Test ở T6 (`het_han_muc`, `loi_openai_mot_tin`).
5. **Số tiền lộ qua cửa app hoặc qua Bơ.** Kỳ vọng: không có quyền tài chính thì `bao_cao_ban_hang` không có thực nhận/phí, dù hỏi ở cửa nào. → Test ở T9 (`cua app: khong tai chinh`) + T1 (`Bơ: TRO_LY_TAI_CHINH = "0"`).

---

## Giai đoạn 1 — Bơ và Nho vào kênh đội (làm ngay, trong lúc theo dõi 7 ngày)

Nhánh: `feat/doi-agent-gd1`. Xong giai đoạn này: tag @Bơ Marketing hay @Nho Trợ lý ở #bắp-mkt thì có trả lời đúng vai; Bắp không đổi gì ngoài QĐ2.

**Điều kiện trước (anh Dũng):** 3 bot (Dâu, Bơ, Nho) đã có token; anh gửi **Application ID** của cả 4 bot (Bắp, Dâu, Bơ, Nho; trên Developer Portal, Application ID chính là bot user ID); bật **Message Content Intent** cho cả 3 bot mới; mời Bơ và Nho vào #bắp-mkt với quyền View Channel, Send Messages, Send Messages in Threads, Read Message History, Add Reactions.

### Task 1: Định nghĩa 4 agent + bộ sinh cấu hình phiên

**Files:**
- Create: `agents/{bap,bo,nho,dau}/agent.json`, `agents/{bo,nho,dau}/vai-tro.md`, `agents/doi.md`
- Create: `chay/phien/agent.mjs`
- Test: `tests/agents.test.mjs`

**Interfaces:**
- Produces, khuôn `agent.json` (riêng `dau` thay `mcp`/`cho_phep` bằng `"duong_chay":"api"`, `"model":""`, `"toi_da_luot_ngay":100`, `"toi_da_anh_ngay":20`, `"kenh":["1556863437219430491"]`):
  ```json
  { "ten": "bo", "ten_hien_thi": "Bơ Marketing", "duong_chay": "phien", "model": "claude-opus-5-5",
    "discord": { "state": "bo", "bot_id": "<Application ID>" },
    "cong_cu_goc": ["WebSearch"],
    "mcp": { "doc": { "file": "tro-ly/mcp.mjs", "env": { "TRO_LY_WIKI": "1", "TRO_LY_SHOPEE": "1", "TRO_LY_TAI_CHINH": "0" } } },
    "cho_phep": ["mcp__doc__tim_tri_thuc", "mcp__doc__doc_tai_lieu", "mcp__doc__so_lieu_may", "mcp__doc__doc_khuyen_mai",
                 "mcp__doc__tim_san_pham", "mcp__doc__xem_giam_gia"] }
  ```
  - `nho`: `mcp.kenh = { file: "shopee/mcp-kenh.mjs", env: { KENH_IDS: "1556863437219430491", KENH_DIR: "~/Bots/agent-nho" } }`, `cho_phep` = `mcp__kenh__{doc_lich_su_kenh,luu_tasklist,ghi_nho,tim_tri_thuc,doc_tai_lieu,so_lieu_may}`.
  - `bap`: `{ ten, ten_hien_thi:"Bắp", duong_chay:"phien", model:"claude-sonnet-5-5", discord:{state:"discord", bot_id} }`. File này chỉ để mô tả: Bắp vẫn chạy bằng `mac/start-bot.sh`.
- Produces, trong `chay/phien/agent.mjs`:
  - `docAgent(ten: string, repo: string) → object`: ném lỗi nếu thiếu trường.
  - `taoSettings(agent, botSettingsBap: object) → object`: settings JSON của phiên.
  - `taoMcp(agent, repo: string, home: string) → { mcpServers }`: đường dẫn tuyệt đối, `~` đã mở rộng.
  - `daTrust(dir: string, claudeJsonText: string) → boolean`.
  - CLI `node chay/phien/agent.mjs <settings|mcp|model|tools|state|da-trust> <tên>`: in ra stdout; `da-trust` thoát 0 hoặc 1, đọc `~/.claude.json`.

- [ ] **Step 1: Viết test (đỏ)** trong `tests/agents.test.mjs`:
  - `agent.json: 4 agent đủ trường; bot_id khớp /^\d{17,20}$/; bot_id không trùng nhau`
  - `settings: deny ⊇ deny của bot-settings.json; allow không chứa Bash|Write|Edit|WebFetch|Read; allow có mcp__plugin_discord_discord__{reply,fetch_messages,react}`
  - `settings: PreToolUse matcher "mcp__plugin_discord_discord__.*" gọi 'node "$BAP_REPO/hooks/chan-discord.mjs" || exit 2'`
  - `settings: enabledPlugins, deniedMcpServers, syncClaudeAiPlugins=false chép y từ bot-settings.json`
  - `mcp: file có thật, args là đường dẫn tuyệt đối, env không có khoá khớp /TOKEN|KEY|SECRET|PASS/`
  - `Bơ: TRO_LY_TAI_CHINH === "0"`
  - `daTrust: projects[dir].hasTrustDialogAccepted===true → true; thiếu dir / false / JSON hỏng → false`
  - `vai-tro: bo/nho/dau đều có "việc này của" (chỉ đường khi việc ngoài vai), có "không tag", và chứa @doi.md`
- [ ] **Step 2:** `node --test tests/agents.test.mjs` → FAIL (thiếu file).
- [ ] **Step 3: Viết `agent.json` cho 4 agent, `chay/phien/agent.mjs`, và các file lời dặn.**
  - `vai-tro.md` theo §1b, ngắn: nhiệm vụ chung · giọng (xưng "em") · giới hạn · việc ngoài vai thì nói "việc này của <tên agent>" hoặc "anh/chị hỏi Bắp" (chỉ gõ chữ, không tag) · luôn có dòng `@doi.md`.
  - `agents/doi.md` = bảng đội §5.4 (tên · vai · ai gọi khi nào) + luật "người tag thẳng agent nào cũng được; không biết hỏi ai thì gọi Bắp".
  - `taoSettings` lấy `deny` từ `bot-settings.json` ngay lúc chạy, không chép tay một danh sách riêng.
- [ ] **Step 4:** `node --test tests/agents.test.mjs` → PASS.
- [ ] **Step 5: Commit** `feat(agents): định nghĩa 4 agent + sinh settings/mcp cho phiên`.

### Task 2: Bộ chạy phiên agent + watchdog + nhãn launchd

**Files:**
- Create: `chay/phien/start-agent.sh`, `chay/phien/watchdog-agent.sh`
- Modify: `mac/cai-launchd.sh` (thêm `com.gwt.agent.bo`, `com.gwt.agent.nho` vào lệnh `viet`, regex `--chi` và **cả hai** vòng `for n`)
- Test: `tests/chay-phien.test.mjs`

**Interfaces:**
- Consumes: CLI `chay/phien/agent.mjs` (T1).
- Produces: `zsh chay/phien/start-agent.sh <tên>` (vòng lặp, chạy trong tmux `agent-<tên>`); `zsh chay/phien/watchdog-agent.sh <tên>`; nhãn `com.gwt.agent.<tên>` (600 giây, RunAtLoad true).

- [ ] **Step 1: Viết test tĩnh (đỏ)**, theo kiểu `mac/cau-hinh.test.mjs`:
  - `start-agent: unset DISCORD_BOT_TOKEN DISCORD_ACCESS_MODE; export DISCORD_STATE_DIR="$HOME/.claude/channels/$STATE" BAP_REPO`
  - `start-agent: --permission-mode dontAsk, không --strict-mcp-config, gọi mac/va-plugin.mjs trước claude`
  - `start-agent: chưa trust → ghi "CHƯA TRUST" vào logs/agent-<tên>.log, sleep 300, không gọi claude`
  - `start-agent: giãn chờ như start-kenh (cho*2, trần 3600, chạy ≥600s thì về 15)`
  - `start-agent: mỗi vòng chép agents/<tên>/vai-tro.md → $WD/CLAUDE.md và agents/doi.md → $WD/doi.md` (khuôn chép `huong-dan.md` của `start-kenh.sh`; import ra ngoài thư mục làm việc sẽ bật hộp thoại)
  - `watchdog-agent: has-session -t "=agent-$TEN"; tên tmux không bắt đầu bằng "bap"; format -F nhiều cột chỉ dùng |~|`
  - `cai-launchd: com.gwt.agent.bo/nho có trong cả hai vòng for n; zsh mac/cai-launchd.sh --in --chi com.gwt.agent.bo in plist gọi chay/phien/watchdog-agent.sh bo`
- [ ] **Step 2:** `node --test tests/chay-phien.test.mjs` → FAIL.
- [ ] **Step 3: Viết hai script, sửa `mac/cai-launchd.sh`.** `start-agent.sh` theo khuôn `kenh/start-kenh.sh`; thư mục làm việc `WD=~/Bots/agent-<tên>`; lệnh chạy là `claude --channels plugin:discord@claude-plugins-official --model "$(agent.mjs model)" --tools "$(agent.mjs tools)" --settings "$DISCORD_STATE_DIR/settings.json" --mcp-config "$DISCORD_STATE_DIR/mcp.json" --permission-mode dontAsk`. `watchdog-agent.sh` chép từ `admin/mac/watchdog.sh`, đổi biến thành `$TEN`, ghi log ra `logs/watchdog-agent.log`.
- [ ] **Step 4:** `node --test tests/chay-phien.test.mjs mac/cau-hinh.test.mjs` → PASS.
- [ ] **Step 5: Commit** `feat(chay/phien): bộ chạy + watchdog phiên agent, nhãn com.gwt.agent.*`.

### Task 3: Đưa Bơ và Nho lên #bắp-mkt (vận hành trên Mac mini)

**Files:** Modify: `RUNBOOK.md` (mục mới "Đội agent"). Ngoài repo: `~/.claude/channels/{bo,nho}/access.json`, `~/.claude/channels/discord/access.json` (QĐ2).

- [ ] **Step 1: `access.json` cho Bơ và Nho** (tạo mới, chmod 600, không đụng `.env`):
  ```json
  { "dmPolicy": "allowlist", "allowFrom": [], "pending": {},
    "groups": { "1556863437219430491": { "requireMention": true, "allowFrom": [] } },
    "mentionPatterns": ["^\\s*(bơ|bo)([\\s,:!?]|$)"] }
  ```
  Nho dùng `"^\\s*nho([\\s,:!?]|$)"`. Plugin dựng regex với cờ `i`, không có `u`, nên không dùng `\p{L}` hay `\b`.
- [ ] **Step 2 (QĐ2):** trong `~/.claude/channels/discord/access.json`, đổi `groups["1556863437219430491"].requireMention` thành `true`. Plugin đọc lại file mỗi tin. Kiểm tra: tin "Bắp ơi giá CTS20" ở #bắp-mkt vẫn được trả lời; tin không tag ai thì Bắp im.
- [ ] **Step 3: Trust trước, trên màn hình Mac mini:** `mkdir -p ~/Bots/agent-bo ~/Bots/agent-nho && git init -q ~/Bots/agent-bo && git init -q ~/Bots/agent-nho`, rồi trong từng thư mục chạy `claude` → trust → `/exit`. Kiểm tra: `node chay/phien/agent.mjs da-trust bo && node chay/phien/agent.mjs da-trust nho` → cả hai thoát 0.
- [ ] **Step 4:** `git pull` trên màn hình Mac mini, rồi `zsh mac/cai-launchd.sh --chi com.gwt.agent.bo` và `zsh mac/cai-launchd.sh --chi com.gwt.agent.nho`.
- [ ] **Step 5: Kiểm sống.** `tmux ls -F '#{session_name}|~|#{session_created}' | grep '^agent-'` ra 2 dòng; `pgrep -P $(pgrep -f 'channels/bo' | head -1) bun` có tiến trình; `logs/watchdog-agent.log` không có dòng `KẸT`.
- [ ] **Step 6:** `ps -Eww` của từng `claude` mang đúng `DISCORD_STATE_DIR` của bot đó. Mỗi bot chỉ có một tiến trình bun.
- [ ] **Step 7: Nghiệm thu ở #bắp-mkt** (mỗi câu, ghi bot nào trả lời):
  - "@Bơ Marketing viết 3 caption cho CTS20" → chỉ Bơ trả lời, có số liệu từ `so_lieu_may` hoặc `tim_san_pham`.
  - "@Nho Trợ lý nhớ giúp: họp marketing thứ Sáu 9h" → chỉ Nho trả lời; `ghi_nho` báo thành công và `grep -r "thứ Sáu 9h" ~/Bots/agent-nho` ra dòng mới.
  - "@Bơ Marketing sửa giá CTS20 trên Shopee" → Bơ đáp "việc này của Bắp…", không gọi công cụ ghi, không có ping.
  - "@Bắp …" → chỉ Bắp. Tin không tag ai → không bot nào đáp.
  - "@Bơ Marketing báo cáo doanh thu thực nhận tháng 10" → không có số thực nhận/phí.
- [ ] **Step 8:** viết mục "Đội agent" vào RUNBOOK: bật / tắt (`launchctl bootout gui/$(id -u)/com.gwt.agent.<tên>` rồi `tmux kill-session -t =agent-<tên>`) / kiểm sống / bẫy trust / cách lùi QĐ2. Commit `docs(runbook): đội agent — Bơ, Nho`.

### Task 4: Mở rộng sao lưu đêm cho đội agent (spec §5.4b, bản tạm)

> Job sao lưu đã có từ PR #8 (`mac/sao-luu.sh`, `com.gwt.bap.saoluu` 02:30, 14 bản, lọc bí mật). Task này **chỉ thêm** phạm vi, không viết lại script, giữ giờ 02:30.

**Files:**
- Modify: `mac/sao-luu.sh` (thêm `~/Bots/agent-*` nếu T2 tạo thư mục làm việc ở đó + `~/.claude/channels/*/access.json`)
- Test: test có sẵn của `sao-luu.sh` trong `mac/cau-hinh.test.mjs`

- [ ] **Step 1: Test (đỏ):** archive có `channels/<bot>/access.json` + thư mục agent; vẫn KHÔNG có `.env`, `*token*`, `*mcp*.json`.
- [ ] **Step 2:** chạy test → FAIL. **Step 3:** thêm đường dẫn vào danh sách nguồn (bộ lọc bí mật giữ nguyên).
- [ ] **Step 4:** test PASS; trên Mac mini `zsh mac/cai-launchd.sh --chi com.gwt.bap.saoluu` rồi `launchctl kickstart gui/$(id -u)/com.gwt.bap.saoluu` → `tar tzf … | grep -cE '\.env$|token'` ra `0`.
- [ ] **Step 5: Commit** `feat(mac): sao lưu đêm thêm access.json + thư mục agent`.

---

## Giai đoạn 2 — Dâu Designer (thuộc GWT-Marketing-kit, spec §5.4c)

> **Thay thế toàn bộ Giai đoạn 2 cũ bằng §5.4e (anh Dũng chốt 19/11):** Dâu là phiên **Claude** + công cụ tạo ảnh (OpenAI qua `tools/gen_anh`); Bơ, Nho, Dâu chạy **API** (Claude Agent SDK), phiên là đường lùi; Bắp giữ phiên. T5 (Gateway tối giản) giữ — dùng cho bộ chạy API chung; **T6 (runner OpenAI) bỏ**, thay bằng: **T6′ bộ chạy API chung** `chay/api/agent.mjs` (Gateway → Agent SDK với settings/mcp/allow-deny/hook từ `chay/phien/agent.mjs`, vai trò + luật từ nhà, sổ tay, hạn mức chi/ngày, tự lùi về phiên) + **T6″ MCP `anh`** ở Marketing-kit gọi `tools/gen_anh` (chạy `local.py` thường trực, nhãn `com.gwt.mkt.genanh`) trả đường dẫn ảnh để agent đính vào tin. T7 = đưa Bơ → Nho → Dâu sang API lần lượt, mỗi con thử ở #bắp-mkt trước. Kế hoạch chi tiết T6′/T6″ viết khi bắt đầu giai đoạn này (cần đọc tài liệu Claude Agent SDK hiện hành).


> **Sửa theo §5.4c (anh Dũng chốt 19/11 — Bơ, Dâu thuộc Marketing-kit; tool gen ảnh đã vào `main` Marketing-kit, PR #17):**
> - **T6 không gọi thẳng `api.openai.com`.** `goiOpenAI(body)` đổi thành `goiGenAnh(yeuCau)` gọi API của tool `tools/gen_anh` chạy bản máy (`local.py`, `127.0.0.1:8770`) — tool đã có style `.md`, prompt JSON, nhiều góc máy, hạn mức tính tiền. Phần trả lời chữ (không vẽ) vẫn qua Responses API nếu cần, cùng khoá của tool. Test `taoYeuCau`/`docKetQua` viết lại theo API của tool (đọc `tools/gen_anh/api/index.py`).
> - **Khoá OpenAI:** dùng khoá của tool (`tools/gen_anh/.env.local` trên Mac mini), không tạo thêm `~/Bots/.secrets/dau-openai.env` (bỏ chỗ nhắc file đó ở T6, T7, QĐ4).
> - **T7 thêm:** đưa Marketing-kit lên Mac mini (T7a, Giai đoạn 2b) + nhãn `com.gwt.mkt.genanh` chạy `local.py` thường trực (`GEN_ANH_DRIVE=may` nếu Mac mini chưa có token Drive marketing — anh Dũng chốt).
> - **Định nghĩa Dâu** (`agent.json`, `vai-tro.md`) nằm ở Marketing-kit `agents/dau/` (T7b).


Nhánh: `feat/doi-agent-dau`. T5–T6 làm được trước khi có khoá; T7 phải chờ khoá và QĐ4.

### Task 5: Thư viện Gateway Discord tối giản

**Files:** Create: `thu-vien/gateway.mjs`; Test: `tests/gateway.test.mjs`

**Interfaces:**
- Produces: `moGateway({ token, intents, onDispatch(t: string, d: object), WebSocket = globalThis.WebSocket, timers = globalThis, now, ngau = Math.random, log }) → { dung(): void }`. Hàm này lo Hello, nhịp tim (mất ACK thì nối lại), Identify, op 7/9, và nối lại với thời gian chờ 5 giây gấp đôi tới 5 phút (chỉ về 5 giây khi kết nối vừa đứt đã sống được trên 5 phút). Mã đóng 4004 và 4010–4014 thì dừng hẳn. Lõi chép từ `admin/chung/nghe-sua.mjs`. Hàm không chạy lệnh tmux.
  `# ponytail: lõi trùng với nghe-sua.mjs — sau khi hết theo dõi, cho nghe-sua dùng lại moGateway nếu cần`.

- [ ] **Step 1: Test (đỏ)**, dùng WebSocket giả và đồng hồ giả (khuôn `admin/chung/nghe-sua.test.mjs`):
  - `identify gửi đúng intents truyền vào` (ws.sent có `{op:2, d:{intents:33281}}`)
  - `MESSAGE_CREATE → onDispatch('MESSAGE_CREATE', d)`; `READY → onDispatch('READY', d)`
  - `mất ACK → đóng + nối lại sau 5s, lần sau 10s`
  - `đóng 4004 → không nối lại, log lỗi`
  - `dung() → không nối lại nữa`
- [ ] **Step 2–4:** chạy test FAIL → viết → `node --test tests/gateway.test.mjs` PASS.
- [ ] **Step 5: Commit** `feat(thu-vien): Gateway Discord tối giản dùng chung`.

### Task 6: Bộ chạy Dâu (OpenAI)

**Files:** Create: `chay/api/dau.mjs`; Test: `tests/dau.test.mjs`

**Interfaces:**
- Consumes: `moGateway` (T5); `chiaTin(s, tran)` từ `kenh/nhom-cv.mjs`, dùng với `tran = 2000`; `agents/dau/agent.json`, `agents/dau/vai-tro.md`, `agents/doi.md` (T1).
- Produces, từ `chay/api/dau.mjs`:
  - `xetTin(tin, access, botId) → boolean`: cổng giống `gate()` của plugin. Kênh phải nằm trong `access.groups`; `allowFrom` rỗng thì ai cũng được; `requireMention` thì cần tag `botId`, hoặc reply vào tin của `botId`, hoặc khớp `mentionPatterns` (cờ `i`). `tin.author.bot` thì chỉ nhận khi `access.nhanTuBot` có ID đó. Tin của chính mình thì bỏ. Thread thì bỏ (`# ponytail: chưa hỗ trợ thread, thêm khi Dâu có kênh riêng`).
  - `anhDuocDung(attachments) → string[]`: chỉ lấy `content_type` bắt đầu bằng `image/`, kích thước ≤ 20 MB, tối đa 4 ảnh.
  - `taoYeuCau({ model, vaiTro, lichSu: string[], tin: string, anh: string[] }) → object`: thân `POST https://api.openai.com/v1/responses` = `{ model, instructions: vaiTro, input: [{ role:'user', content:[{type:'input_text', text}, …{type:'input_image', image_url}] }], tools: [{ type:'image_generation' }] }`.
  - `docKetQua(json) → { chu: string, anh: Buffer[] }`: ghép `output[].type==='message'` → `content[].type==='output_text'`, và `output[].type==='image_generation_call'` → `Buffer.from(result,'base64')`.
  - `taoTinGui({ chu, anh, traLoi }) → FormData[]`: mỗi phần ≤ 2000 ký tự; `payload_json.allowed_mentions = { parse: [] }`; `message_reference.message_id = traLoi`; ảnh đính vào phần cuối, tên `dau-<i>.png`.
  - `xuLyTin(tin, deps) → Promise<void>`. `deps = { access, botId, agent, vaiTro, layLichSu(kenh)→string[], goiOpenAI(body)→json, gui(kenh, FormData), dem: { doc()→{luot,anh}, ghi(x) } }`. File đếm là `logs/dau-dem-<YYYY-MM-DD giờ VN>.json`.
  - Chạy chính: `agent.model === ''` thì thoát 1, báo "chưa đặt model (QĐ4)". Bí mật nạp từ `~/Bots/.secrets/dau-openai.env` (`OPENAI_API_KEY`) và `~/.claude/channels/dau/.env` (`DISCORD_BOT_TOKEN`). Intents `33281` (GUILDS | GUILD_MESSAGES | MESSAGE_CONTENT).

- [ ] **Step 1: Test (đỏ):**
  - `xetTin: kênh ngoài groups → false; tag Dâu → true; "Dâu ơi vẽ…" khớp pattern → true; reply tin Dâu → true; không tag + requireMention → false`
  - `xetTin: tin tag Bơ, không tag Dâu → false` (Review Focus 1)
  - `xetTin: bot ngoài nhanTuBot → false; bot trong nhanTuBot + tag Dâu → true; tin của chính Dâu → false`
  - `anhDuocDung: bỏ application/pdf, bỏ ảnh 25 MB, tối đa 4`
  - `taoYeuCau: model/instructions đúng, tools = [{type:'image_generation'}], mỗi url thành một input_image, lichSu nằm trong input_text`
  - `docKetQua: fixture message + image_generation_call → chu 'ok', anh.length 1`
  - `taoTinGui: allowed_mentions.parse = []; message_reference đúng; chữ 4500 ký tự → 3 phần; ảnh ở phần cuối`
  - `het_han_muc: dem.luot = 100 → gui đúng 1 lần (câu báo hết lượt hôm nay), goiOpenAI không được gọi`
  - `loi_openai_mot_tin: goiOpenAI ném lỗi → gui đúng 1 lần, chữ mở đầu "Dâu chưa làm được", không thử lại, dem.luot vẫn +1`
- [ ] **Step 2–4:** FAIL → viết → `node --test tests/dau.test.mjs` PASS.
- [ ] **Step 5: Commit** `feat(chay/api): Dâu Designer — runner OpenAI, cổng tin, hạn mức`.

### Task 7: Đưa Dâu lên (Mac mini)

**Files:** Modify: `mac/chay-dinh-ky.sh` (case `dau) exec node chay/api/dau.mjs ;;`), `mac/cai-launchd.sh` (`viet com.gwt.agent.dau giu true … dau`, thêm vào regex `--chi` và cả hai vòng `for n`), `mac/cau-hinh.test.mjs`, `agents/dau/agent.json` (model theo QĐ4), `RUNBOOK.md`.

- [ ] **Step 1: Test (đỏ → xanh):** `Dâu: com.gwt.agent.dau KeepAlive, có trong cả hai vòng for n; chay-dinh-ky có case dau; không dùng tmux, không gọi claude`.
- [ ] **Step 2 (anh Dũng):** đặt `OPENAI_API_KEY` vào `~/Bots/.secrets/dau-openai.env` (chmod 600), điền `model`, mời Dâu vào #bắp-mkt. Tạo `~/.claude/channels/dau/access.json` theo khuôn T3, pattern `"^\\s*(dâu|dau)([\\s,:!?]|$)"`.
- [ ] **Step 3:** `git pull` trên màn hình Mac mini, rồi `zsh mac/cai-launchd.sh --chi com.gwt.agent.dau`. Kiểm tra: `logs/com.gwt.agent.dau.log` có `READY`; `pgrep -fl 'chay/api/dau.mjs'` ra đúng 1 dòng.
- [ ] **Step 4: Nghiệm thu ở #bắp-mkt:** "@Dâu Designer vẽ banner 1200x628 CTKM lọc nước tháng 12" → một tin trả lời kèm ảnh, không ping ai; tin "@Bơ …" → Dâu im; file đếm của ngày tăng `luot` 1 và `anh` 1. Đổi tạm `toi_da_luot_ngay` xuống 1 rồi tag thêm lần nữa → nhận câu báo hết lượt; trả lại giá trị cũ sau khi thử.
- [ ] **Step 5:** thêm mục Dâu vào RUNBOOK (bật/tắt/khoá/hạn mức). Commit `feat(mac): chạy Dâu thường trực`.

---

## Giai đoạn 2b — Bơ, Dâu về nhà Marketing-kit (spec §5.4c)

Làm được ngay (không phụ thuộc 7 ngày theo dõi: chỉ thêm file + thêm repo trên Mac mini). Nhánh GWT-Agent-Team `feat/doi-agent-nha-mkt`; nhánh Marketing-kit `feat/agents-bo-dau`.

### Task 7a: Đưa GWT-Marketing-kit lên Mac mini
- [ ] Bare repo `~/Bots/GWT-Marketing-kit.git` + clone `~/Bots/GWT-Marketing-kit` (nhánh `main`), đẩy qua ssh như GWT-Agent-Team (Mac mini không kéo được GitHub). Không chép `.env*`, token.
- [ ] Kiểm: `git -C ~/Bots/GWT-Marketing-kit log -1` = `origin/main`; `tools/gen_anh/local.py` có.

### Task 7b: Định nghĩa Bơ, Dâu sống trong Marketing-kit
**Files (Marketing-kit):** Create `agents/bo/{agent.json,vai-tro.md}`, `agents/dau/{agent.json,vai-tro.md}`, `agents/README.md` (ai sửa gì: đội marketing sửa vai trò/luật/style; rào an toàn ở GWT-Agent-Team).
- `vai-tro.md` trỏ luật có sẵn bằng `@` đường dẫn tương đối trong repo: `rules/ad-compliance-vn.md`, `rules/tu-nhay-cam-nen-tang.md`, `rules/prompt-anh-ai.md` (Dâu), giọng văn; giữ luật chung "việc này của …", "không tag", `@doi.md`.
- Test (Marketing-kit, pytest hoặc node): mọi `@` trong `vai-tro.md` trỏ file có thật; `agent.json` đủ trường như T1.

**Files (GWT-Agent-Team):** Modify `chay/phien/agent.mjs` — `docAgent(ten, repo)` đọc `$MKT_REPO/agents/<ten>/` khi `agents/<ten>/agent.json` có `"nha": "mkt"` (file ở GWT-Agent-Team chỉ còn `{ ten, nha: "mkt" }`); `start-agent.sh` chép `vai-tro.md` từ nhà mới; `MKT_REPO` mặc định `$HOME/Bots/GWT-Marketing-kit`.
- Test: `nha: "mkt"` + `MKT_REPO` giả → đọc đúng file; thiếu `MKT_REPO`/file → `start-agent.sh` ghi lỗi + không chạy claude (không rơi về cấu hình cũ âm thầm).
- WD của Bơ vẫn `~/Bots/agent-bo` (đã trust); luật marketing được chép/import vào WD mỗi vòng như `vai-tro.md` (import ra ngoài WD sẽ bật hộp thoại).

### Task 7c: Bơ đọc dữ liệu marketing (chỉ đọc)
- MCP mới ở **Marketing-kit** (`tools/mcp-marketing/`): `tim_y_tuong`, `tu_khoa_noi_dung`, `kho_hook`, `kich_ban_da_duyet`, `phan_tich_video` — chỉ SELECT các bảng kit sở hữu (`video_ideas`, `content_keywords`, `hook_library`, `script_approved`, `video_analyses`, `video_deep_analysis`) + schema `video` (đọc).
- **DB:** nếu cần vai trò Postgres chỉ đọc riêng cho agent → là thay đổi Schema → đi luật DB 6 bước, migration ở repo giữ schema của DB đó (Masterdata: **chỉ bổ sung**). Trước khi làm: xác định DB nào đang chứa các bảng này (đọc `scripts/sql/` Marketing-kit) và gọi tên đích.
- Ghi (thêm ý tưởng, lưu kịch bản) **chưa làm** — chờ anh Dũng duyệt từng loại.
- `agents/bo/agent.json` (Marketing-kit) thêm server `marketing` vào `mcp` + tên công cụ vào `cho_phep`.

### Task 7d: Chuyển Bơ sang nhà mới + nghiệm thu
- [ ] Trên Mac mini: pull cả hai repo; tắt/mở lại `com.gwt.agent.bo` (bootout → kill `=agent-bo` → `--chi`). Một token một phiên — kiểm đúng 1 plugin Discord với `DISCORD_STATE_DIR=…/bo`.
- [ ] #bắp-mkt: "@Bơ Marketing gợi ý 3 hook cho video CTS20 từ kho hook" → có dữ liệu từ `kho_hook`; câu chữ không vi phạm `ad-compliance-vn` (chạy `scripts/ra-tu-nhay-cam.py` trên câu trả lời mẫu).

### Task 7e: Mọi agent học từ kênh — bản tạm trước API (spec §5.4d)

**Files:** Create `chay/phien/so-tay.mjs` (MCP chung: `ghi_nho`, `quen`, `doc_so_tay`, `de_xuat_luat`), `tests/so-tay.test.mjs`; Modify `chay/phien/start-agent.sh` (nạp `CLAUDE.md` = vai trò + luật gốc rồi dòng `@so-tay.md`), `agents/nho/agent.json` + `agents/bo` (Marketing-kit) thêm server `so_tay`; nhãn `com.gwt.agent.<tên>.hoc` (cuối ngày 22:30) chạy một lượt `claude -p` đọc lại kênh → ghi sổ tay.
- `so-tay.md`: mỗi dòng `- [dang_dung|het_han|thay_the|da_bo] <ngày> · <nội dung> · <link tin gốc> · hạn:<ngày|—>`; công cụ chỉ ghi sổ của agent gọi (`AGENT_TEN` trong env của server).
- Test (đỏ trước): ghi → dòng mới `dang_dung`; `quen` → `da_bo`, dòng vẫn còn; quá hạn → `doc_so_tay` không trả dòng đó; nội dung đòi thêm quyền/bỏ rào ("được sửa giá", "bỏ qua hook") → từ chối ghi, trả "chuyển thành đề xuất"; `de_xuat_luat` ghi file `de-xuat/<ngày>.md` + nhật ký, không tự sửa repo; trần 1.500 chữ → báo cần dọn.
- Nghiệm thu #bắp-mkt: "Bơ nhớ: caption CTS20 không quá 80 chữ" → lượt sau Bơ viết ≤ 80 chữ; "Bơ quên điều đó" → hết áp dụng.
- Sau khi có API (Giai đoạn 5, task 5.3): `so-tay.mjs` đổi chỗ lưu sang sổ kênh trên app, giữ nguyên tên công cụ.

## Giai đoạn 3 — Bắp hai cửa, Nho nhận việc đang chạy (sau khi hết 7 ngày theo dõi mà không có lỗi)

Nhánh: `feat/doi-agent-gd3`. Điều kiện vào: đợt 3–4 xong 7 ngày, không sót hay trùng tin kho/ticket (tiêu chí bước 1); QĐ3 đã có bot "thu".

### Task 8: Một bộ luật Bắp cho hai cửa + Bắp biết đội

**Files:**
- Create: `agents/bap/luat-chung.md`, `agents/bap/cua-discord.md`, `agents/bap/cua-app.md`, `tests/fixtures/CLAUDE.de-xuat.md` (3 dòng import, đúng nội dung đề xuất cho `CLAUDE.md` ở gốc)
- Modify: `tro-ly/lenh.mjs` (thêm `ghepHuongDan(repo) → string` = luat-chung + cua-app + doi, worker ghi ra `tro-ly/phien/huong-dan.md` lúc khởi động); `tro-ly/worker.mjs` (dùng file đó); `mac/cau-hinh.test.mjs` (hàm `docBap()` mở các dòng `@import` của `CLAUDE.md` ở gốc trước khi so)
- **Đề xuất, chờ anh Dũng duyệt diff:** thay toàn bộ `CLAUDE.md` ở gốc bằng 3 dòng `@agents/bap/luat-chung.md`, `@agents/bap/cua-discord.md`, `@agents/doi.md`
- Test: `tro-ly/lenh.test.mjs`, `mac/cau-hinh.test.mjs`

**Cách chia:** `luat-chung.md` gồm các mục trùng giữa `CLAUDE.md` và `tro-ly/huong-dan.md`: "Khuyến mại và giá bán — thứ tự nguồn", "Trả lời câu hỏi sản phẩm / kỹ thuật", "Cách trả lời" và quy tắc không nêu thông tin khách. Hai bản khác chữ nhau thì lấy bản của `CLAUDE.md`. `cua-discord.md` là phần còn lại của `CLAUDE.md`. `cua-app.md` là phần riêng của `huong-dan.md`, đổi "ERP / màn Home" thành "khung trợ lý (dock) trong gwt-app".

- [ ] **Step 1: Test (đỏ):** `docBap('tests/fixtures/CLAUDE.de-xuat.md') chứa đủ mọi câu mà các test cau-hinh hiện có đang kiểm trên CLAUDE.md` (mỗi test cũ chạy trên cả hai nguồn); `ghepHuongDan: có luat-chung + cua-app + doi, không có chữ "mo_thread" hay "Reply xác nhận"`; `luat-chung không nhắc Discord hay ERP`.
- [ ] **Step 2–4:** viết 3 file + hàm. `node --test mac/cau-hinh.test.mjs` và `(cd tro-ly && npm test)` → PASS. `CLAUDE.md` thật vẫn chưa đổi; sau khi cắt chuyển ở bước 7, xoá fixture và cho test đọc `docBap('CLAUDE.md')`.
- [ ] **Step 5: Chạy bản thử song song**, không đụng Bắp thật:
  1. Trên Mac mini: `git -C ~/Bots/GWT-Agent-Team worktree add ~/Bots/GWT-Agent-Team-thu feat/doi-agent-gd3`, rồi chép đề xuất vào `~/Bots/GWT-Agent-Team-thu/CLAUDE.md` (chỉ trong worktree thử).
  2. Trust `~/Bots/GWT-Agent-Team-thu` trên màn hình Mac mini.
  3. Tạo `~/.claude/channels/thu/access.json`: chỉ #bắp-mkt, `requireMention: true`, pattern `"^\\s*thử([\\s,:!?]|$)"`.
  4. Gõ vào server tmux của launchd: `tmux new-session -d -s thu-bap -c ~/Bots/GWT-Agent-Team-thu "DISCORD_STATE_DIR=$HOME/.claude/channels/thu zsh mac/start-bot.sh"`.
- [ ] **Step 6: Nghiệm thu:** 10 câu mẫu (giá CTS20, CTKM tháng này, tra 1 mã đơn, sức khoẻ shop, bài wiki clo dư, "ai làm banner được?", "viết bài quảng cáo giúp", "nhớ giúp…", "sửa giá…", câu ngoài phạm vi) hỏi cả "@Bắp" lẫn "@Bắp Thử". Kỳ vọng: nội dung tương đương; với câu thiết kế, nội dung, việc, bản thử chỉ đúng Dâu/Bơ/Nho bằng chữ, không tag. Dừng bản thử: `tmux kill-session -t =thu-bap`.
- [ ] **Step 7 (anh Dũng duyệt):** đưa diff `CLAUDE.md` ở gốc → anh OK → merge → `git pull` trên màn hình Mac mini → dừng tiến trình `claude` của tmux `bap` (vòng `start-bot.sh` chạy lại sau 15 giây với prompt mới). Lùi bằng `git revert` rồi làm lại bước này.
- [ ] **Step 8: Commit** `feat(bap): một bộ luật cho hai cửa (Discord + dock gwt-app), Bắp biết đội`.

### Task 9: Một bộ công cụ Bắp cho hai cửa

**Files:**
- Move: `tro-ly/mcp.mjs` → `shopee/cua-app.mjs` (export `taoServerCuaApp`, giữ nguyên thân `taoServerTroLy`); `tro-ly/mcp.test.mjs` → `shopee/cua-app.test.mjs`
- Modify: `shopee/mcp.mjs` (chạy chính: `process.env.CUA === 'app'` thì dùng `taoServerCuaApp()`, ngược lại dùng router như cũ); `tro-ly/lenh.mjs` (mcp.json: khoá `bap`, args `shopee/mcp.mjs`, env có thêm `CUA: 'app'`); `tro-ly/settings.json` (allow đổi `mcp__troly__*` thành `mcp__bap__*`, cùng danh sách); `tro-ly/package.json` (script test bỏ `mcp.test.mjs`); `mac/cau-hinh.test.mjs` (test "Trợ lý ERP" kiểm `mcp__bap__`); `agents/bo/agent.json` (`mcp.doc.file = "shopee/mcp.mjs"`, env thêm `CUA: "app"`)
- Create: `tro-ly/hoi-thu.mjs` (một câu hỏi qua `claude -p` dùng `thamSoClaude` + `ghepHuongDan`; cờ `--tai-chinh`, `--shopee`; in câu trả lời). Mục đích: nghiệm thu cửa app khi chưa có dock.

- [ ] **Step 1: Test (đỏ):**
  - `cua app: chỉ đăng ký lệnh đọc` (không có `sua_shop|chuan_bi|in_phieu|mo_thread|chuyen_cho_dung|thuc_hien`)
  - `cua app: khong tai chinh → bao_cao_ban_hang không có "Thực nhận" hay "Phí"` (Review Focus 5)
  - `cua discord: danh sách tên lệnh = các mcp__bap__* trong bot-settings.json` (chặn đổi nhầm phía Discord)
  - `lenh: mcp.json khoá "bap", trỏ shopee/mcp.mjs, env CUA=app`
- [ ] **Step 2–4:** FAIL → làm → `(cd shopee && npm test) && (cd tro-ly && npm test) && node --test mac/cau-hinh.test.mjs tests/agents.test.mjs` PASS.
- [ ] **Step 5: Nghiệm thu (spec §5.4):** cùng 5 câu hỏi qua `node tro-ly/hoi-thu.mjs "<câu>" --shopee` và qua bản thử Discord ("@Bắp Thử") → cùng nội dung. "báo cáo bán hàng tháng 10" khi không có `--tai-chinh` → không có số tiền thực nhận; hỏi Bắp Thử bằng tài khoản Discord không có quyền tài chính → cũng không có. Khởi động lại Bơ (`tmux kill-session -t =agent-bo`, watchdog mở lại trong ≤10 phút), hỏi lại 1 câu ở T3 bước 7.
- [ ] **Step 6: Commit** `refactor(bap): gộp MCP troly vào MCP bap — chế độ CUA=app cho cửa gwt-app`.

### Task 10: Nho nhận phiên nhóm công việc (một token, một phiên)

**Files:**
- Modify: `kenh/nhom-cv.mjs` (`mo --state <dir> [--them <id kênh>]`: chỉ ghi `access.json` vào `<dir>`; không tạo, không ghi đè `.env` có sẵn; `groups` = kênh trong `nhom-cv.json` + `--them`). `mo` không có `--state` thì giữ nguyên hành vi cũ.
- Modify: `agents/nho/agent.json` (`"nhom_cv": true`; `mcp.kenh.env.KENH_DIR = "~/Bots/bap-kenh/nhom-cv"`; `cho_phep` thêm các lệnh `mcp__kenh__*` mà `kenh/bot-settings.json` đang cho phiên nhóm); `chay/phien/start-agent.sh` (khi `nhom_cv` thì mỗi vòng chạy `nhom-cv.mjs mo --state "$DISCORD_STATE_DIR" --them 1556863437219430491`, `KENH_IDS = $(nhom-cv.mjs kenh-ids),1556863437219430491`, thư mục làm việc = `~/Bots/bap-kenh/nhom-cv`, chép thêm `kenh/huong-dan-nhom.md`); `agents/nho/vai-tro.md` (thêm `@huong-dan.md`)
- Modify: `kenh/nhom-cv.json` (`nghe_bat: false`, để tắt tmux `nhomcv` cũ; tmux `nhomcv-bao` giữ nguyên)
- Test: `kenh/nhom-cv.test.mjs`, `tests/agents.test.mjs`

- [ ] **Step 1: Test (đỏ):** `mo --state: .env có sẵn giữ nguyên byte; thiếu .env → không tạo`; `mo --state --them X: groups = kênh nhom-cv + X, requireMention giữ như nhom-cv.json`; `mo không --state: hành vi cũ` (test cũ vẫn xanh); `taoMcp(nho): KENH_IDS chứa kênh đội`.
- [ ] **Step 2–4:** FAIL → làm → `(cd shopee && npm test) && node --test kenh/nhom-cv.test.mjs tests/*.test.mjs` PASS.
- [ ] **Step 5 (anh Dũng):** mời Nho vào 23 kênh trong `nhom-cv.json` với quyền như ở T3.
- [ ] **Step 6: Chuyển, không để hai phiên cùng chạy.** Merge + pull với `nghe_bat: false` → chờ tới khi `tmux has-session -t =nhomcv` báo lỗi (job `com.gwt.bap.kenh` tắt trong ≤2 phút) → kiểm `pgrep -fl discord-nhom-cv` rỗng → `tmux kill-session -t =agent-nho` (watchdog mở lại theo cấu hình mới). Kiểm `da-trust` cho `~/Bots/bap-kenh/nhom-cv` trước khi làm.
- [ ] **Step 7: Nghiệm thu:** ở một kênh nhóm, "@Nho Trợ lý đọc lại kênh, lập tasklist" → ra tasklist 4 nhóm như trước; Bắp không đáp ở kênh đó; tin 8h/17h vẫn tới Hiệp. Lùi: `nghe_bat: true` + bỏ `nhom_cv` khỏi `agent.json`.
- [ ] **Step 8: Commit** `feat(nho): Nho nhận phiên nhóm công việc (thay tmux nhomcv dùng token Bắp)`.

### Task 11: Ticket CSKH chạy dưới danh tính Nho

**Files:** Modify: `admin/kho/nx-chay.mjs` (đường token ở lời gọi `chayTicket`, quanh dòng 485 → hằng `TOKEN_TICKET = ~/.claude/channels/nho/.env`; kho và báo đơn vẫn dùng token Bắp); Test: `admin/tinh-nang.test.mjs`.

- [ ] **Step 1: Test (đỏ):** `ticket đăng/react bằng token Nho; kho + báo đơn vẫn token Bắp` (test tĩnh trên nguồn).
- [ ] **Step 2–4:** làm → `(cd admin && npm test)` PASS.
- [ ] **Step 5 (anh Dũng):** mời Nho vào #chăm-sóc-khách-hàng (Read History, Send, Add Reactions). Không thêm kênh này vào `access.json` của Nho, vì việc nghe kênh vẫn do job làm.
- [ ] **Step 6:** pull trên Mac mini; `launchctl kickstart -k gui/$(id -u)/com.gwt.bap.khonx`; gửi 1 tin thử ở kênh CSKH → ticket được tạo một lần, ✅ do Nho thả. Đối chiếu số ticket trong ngày với số tin (không sót, không trùng). Commit `feat(nho): ticket CSKH dưới danh tính Nho`.

---

## Giai đoạn 4 — **[A]** Giao việc trong kênh đội (chỉ làm khi QĐ1 = A)

Nhánh: `feat/doi-agent-giao-viec-a`. Mọi thay đổi ở giai đoạn này gắn chú thích `[A] gỡ ở task 5.4`.

### Task 12 [A]: Bản vá plugin 3 — nhận tin của bot có trong danh sách

**Files:** Modify: `mac/va-plugin.mjs` (`vaNhanTuBot`, dấu `[GWT-nhan-tu-bot]`, vá trong cùng vòng với 2 bản vá cũ); Test: `mac/va-plugin.test.mjs`.

**Interfaces:** Produces: khoá `nhanTuBot: string[]` trong `access.json`. Neo: `"  if (msg.author.bot) return\n"` → thay bằng `if (msg.author.bot && !(loadAccess().nhanTuBot ?? []).includes(msg.author.id)) return`.

- [ ] **Step 1: Test (đỏ):** `vaNhanTuBot: neo xuất hiện đúng 1 lần → thay, có dấu`; `chạy lại → da-va`; `neo 0 hoặc ≥2 lần → khong-khop, không sửa file`; `bản vá chỉ nhận ID trong nhanTuBot` (chuỗi chèn chứa `nhanTuBot` và `includes(msg.author.id)`).
- [ ] **Step 2–4:** làm → `node --test mac/va-plugin.test.mjs` PASS. Trên Mac mini, sau khi pull: `node mac/va-plugin.mjs` → log ghi `[nhan-tu-bot]: vua-va`.
- [ ] **Step 5: Commit** `feat(va-plugin)[A]: nhận tin của bot có trong nhanTuBot`.

### Task 13 [A]: Rào giao việc trong hook + luật điều phối

**Files:** Create: `dieu-phoi/luat.json`; Modify: `hooks/chan-discord.mjs` (`xetGiaoViec`), `hooks/chan-discord.test.mjs`.

**Interfaces:**
- `dieu-phoi/luat.json` = `{ "kenh_doi": "1556863437219430491", "toi_da_luot": 3, "duoc_giao": { "discord": ["bo","nho","dau"], "thu": ["bo","nho","dau"] } }`. Khoá trong `duoc_giao` là tên state dir; `bot_id` lấy từ `agents/*/agent.json`.
- `xetGiaoViec(input, { luat, botIds: Record<ten,id>, state: string, daGiao(goc: string) → number }) → string|null`: trả lý do chặn, hoặc `null` nếu cho qua. Mỗi lần cho qua, hook ghi `{goc, den, ts}` vào `logs/giao-viec.jsonl`; `daGiao` đếm số dòng cùng `goc` trong 24 giờ. `state = basename(DISCORD_STATE_DIR ?? 'discord')`.
- Luật `MENTION` cũ vẫn áp cho mọi mention không phải "tag agent hợp lệ".

- [ ] **Step 1: Test (đỏ):**
  - `Bắp tag Bơ ở kênh đội, có reply_to → cho qua`
  - `Bắp tag Bơ ở kênh khác → chặn`; `không có reply_to → chặn`
  - `Bắp tag người (ID không phải agent) → chặn như cũ`; `tag agent kèm @everyone → chặn`
  - `lượt thứ 4 cùng reply_to → chặn "quá 3 lượt"`
  - `state "bo" hoặc "nho" hoặc "discord-kenh-…" tag agent → chặn` (agent con không bao giờ tag)
  - `luat.json hỏng → chặn (fail-closed)`
- [ ] **Step 2–4:** làm → `node --test hooks/chan-discord.test.mjs mac/cau-hinh.test.mjs` PASS.
- [ ] **Step 5: Commit** `feat(hook)[A]: Bắp được tag agent con trong kênh đội, tối đa 3 lượt mỗi yêu cầu gốc`.

### Task 14 [A]: Bật giao việc + nghiệm thu

**Files:** Modify: `agents/doi.md` (mục "[A] Giao việc trong kênh đội"); `agents/bap/cua-discord.md`. Ngoài repo: `access.json` của bo, nho, dau (`"nhanTuBot": ["<bot_id Bắp>"]`).

Lời dặn: Bắp giao bằng `reply` vào tin của người, mẫu `<@ID> [giao] <việc> — người hỏi: <tên>`. Agent con gặp tin của Bắp có `[giao]` thì làm việc đó, trả lời bằng reply vào tin của Bắp, gọi người hỏi bằng tên (không tag). Bắp không chờ kết quả, cũng không đọc kết quả.

- [ ] **Step 1:** sửa 2 file lời dặn. Chạy lại bản thử (T8 bước 5, có thêm `"thu"` trong `duoc_giao`), hỏi "@Bắp Thử viết bài + làm banner CTKM tháng 12" → bản thử tag Bơ và Dâu, mỗi agent đáp một lần. Bản thử chưa có trong `nhanTuBot`, nên lúc này tạm thêm ID bot thử vào `nhanTuBot` của 3 agent con, thử xong gỡ ra.
- [ ] **Step 2 (anh Dũng duyệt):** merge, pull, thêm `nhanTuBot` = ID Bắp, rồi khởi động lại Bắp, Bơ, Nho (`tmux kill-session -t =<tên>`; watchdog mở lại). Dâu đọc `access.json` mỗi tin nên không cần khởi động lại.
- [ ] **Step 3: Nghiệm thu (theo §5.6, phần không cần API):** "@Bắp …" một việc cần 2 agent → 2 lượt giao, cả hai đáp, Bắp im với các tin của agent con; giả lập lượt thứ 4 (bỏ qua mẫu trong lời dặn, gọi thẳng) → hook chặn, `logs/cong-cu-*.jsonl` ghi lý do chặn; Bơ được dặn "tag Dâu giúp" → hook chặn.
- [ ] **Step 4: Theo dõi 3 ngày:** số tin bot đăng ở #bắp-mkt mỗi giờ ≤ 30 (đếm bằng `fetch_messages` hoặc REST). Vượt thì gỡ `nhanTuBot` ngay, đó là lệnh lùi. Commit `feat(doi)[A]: bật giao việc trong kênh đội`.

---

## Giai đoạn 5 — Chờ API gwt-app (spec bước 2)

**Điều kiện vào:** hợp đồng API v1 (`apps/web/app/api/agent/v1/*`, `openapi.json` có số phiên bản) đã có trong `ket-noi/gwt-app/hop-dong/`; DB mới đi đủ luật 6 bước ở GWT-Masterdata (chỉ bổ sung, CI `db-reset` xanh). Hợp đồng chưa có thì chưa viết được chữ ký cụ thể, nên **mỗi mục dưới đây sẽ có kế hoạch riêng** (`writing-plans`) lúc hợp đồng xong. Ở đây chỉ chốt thứ tự làm và cách nghiệm thu.

| # | Việc | Dựa trên | Xong khi |
| --- | --- | --- | --- |
| 5.1 | 4 agent thành "người" loại `agent` trong bảng người v2; bảng nối Discord ID ↔ người; khoá API riêng mỗi agent | spec §5.3, §1b | Gọi API bằng khoá của Bơ để làm việc ngoài quyền → bị từ chối |
| 5.2 | `ket-noi/gwt-app/` MCP công cụ Work; Nho làm D1 (giao việc), D2 (báo cáo), D5 (việc của tôi) bằng lời dặn mẫu; hook có danh sách mention theo agent (Nho được tag người nhận và người giao) | §7.14 D1/D2/D5 | Nghiệm thu D1: giao thử 3 việc → cả 3 vào Work đúng người, đúng hạn |
| 5.3 | Sổ kênh lên app (§5.4b): chuyển `nho.md` của các kênh sang bảng sổ kênh; agent nạp các dòng `dang_dung`; bỏ job sao lưu ở T4 | §5.4b | Sửa một dòng trên app → agent dùng ngay ở lượt sau |
| 5.4 | **B thay A:** hàng đợi giao việc qua API, mỗi lượt đăng vào kênh đội; **gỡ mọi phần [A]** (`nhanTuBot`, `vaNhanTuBot`, `xetGiaoViec` chuyển sang giao qua công cụ hàng đợi) | §5.6 | Ví dụ ở §5.6 chạy trọn; `grep -r "\[A\]"` trong repo ra rỗng |
| 5.5 | Dock Bắp trong gwt-app v2: hàng đợi hỏi đáp qua API thay hàng đợi `assistant.*` của ERP; worker `tro-ly` đọc từ API, dùng `CUA=app` (T9) + `ghepHuongDan` (T8); quyền theo tài khoản đăng nhập | v2-mo-ta-app §3 | Cùng một câu ở hai cửa → cùng câu trả lời; không có quyền tài chính thì không thấy số tiền |
| 5.6 | Bắp đăng tổng hợp 8h/17h vào từng nhóm, lấy số liệu từ app; tắt `nhomcv-bao` | §5.4 | Một tuần tin 8h/17h khớp tab "Mọi người" trên app |

---

## Self-review (đã chạy)

- **Độ phủ spec:** §1b có T1 (lời dặn ngắn, không viết cứng tính năng) và 5.2 (D1–D9 là việc mẫu). §5.4 bảng đội có T1/T3/T7; gọi thẳng agent có T3 bước 7; Bắp chỉ đường có T8; kênh đội có T3; bot Admin giữ nguyên theo QĐ6. §5.4b có T4 + 5.3. §5.5/5.5b: Bơ, Nho chạy đường phiên; Dâu là runner API riêng (OpenAI, theo §5.4). Managed Agents và nhịp tim nằm ngoài kế hoạch này, chờ §8c.4. §5.6 có A ở T12–T14 và B ở 5.4. §7: bước 3 có T1–T3, bước 4–5 có Giai đoạn 5. §8b.2 (người ra lệnh) để sang 5.1/5.2. §8c.3 (đường phiên mặc định) có T2.
- **Đặt tên:** `agent.mjs` (`docAgent`, `taoSettings`, `taoMcp`, `daTrust`), `moGateway`, `xetTin`, `xuLyTin`, `xetGiaoViec`, `nhanTuBot`, `ghepHuongDan`, `taoServerCuaApp` dùng thống nhất giữa các task. Khoá MCP: `doc` (Bơ), `kenh` (Nho), `bap` (Bắp, cả hai cửa).
- **Còn hở, có chủ ý:** Dâu chưa hỗ trợ thread; sao lưu chỉ nằm trên cùng máy. Cả hai đã đánh dấu `ponytail` kèm điều kiện nâng cấp.
