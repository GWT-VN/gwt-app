# GWT-Agent-Team — Bước 0–1: chuẩn bị + dời nguyên trạng — kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bắp chạy toàn bộ từ repo mới GWT-Agent-Team trên Mac mini, hành vi người dùng thấy không đổi, và mọi hàm DB bot dùng trên GWT-SalesTracking có migration.

**Architecture:** Repo mới **giữ nguyên lịch sử git** của `gwt-discord-bot` (đẩy lịch sử cũ sang remote mới), thêm khung thư mục của thiết kế nhưng **chưa dời file nào trong bước 1** — chỉ bỏ đường dẫn cứng. Chuyển sang chạy repo mới bằng cách **giữ nguyên nhãn job launchd, đổi đường dẫn chương trình**, từng đợt, mỗi job có lệnh lùi. Song song, hợp thức hoá 9 hàm bot trên DB app bằng một migration truy lĩnh trong repo gwt-app (repo giữ schema của GWT-SalesTracking), kèm dựng CI `db-reset` cho gwt-app.

**Tech Stack:** Node ≥22 (ESM, `node --test`), bash/zsh + launchd + tmux trên macOS, Claude Code + plugin Discord, Supabase (Postgres) qua MCP, GitHub Actions.

**Spec:** `docs/rework/2026-11-18-gwt-agent-team-design.md` (mục 7 bước 0–1, mục 8b quyết định 6, mục 10 Superpowers).

**Lệch so với spec (người lập kế hoạch quyết):** spec bước 1 ghi "chép code sang `ket-noi/`, `thu-vien/`, `chay/phien/`". Kế hoạch này **giữ nguyên bố cục thư mục cũ ở bước 1** (chỉ thêm khung rỗng) vì dời file = sửa hàng trăm đường import → không còn là "nguyên trạng" và rủi ro sót. File được dời vào `ket-noi/…` ở bước 2, đúng lúc mỗi bộ kết nối được viết lại để gọi API.

## Global Constraints

- Luật DB GWT (`~/.claude/gwt-rules/supabase-mcp.md`): gọi tên đích trước lệnh DB đầu tiên (**GWT-SalesTracking `bwzmqfbcgouhvhoslmmm`**); `git pull` repo giữ schema trước; DDL chỉ qua `apply_migration`, có file migration số hiệu giờ UTC + dòng "cách lùi"; CI `db-reset` xanh trên đúng commit trước khi áp live; sau khi áp SELECT ledger và sửa `version` cho khớp tên file; `get_advisors` security sau DDL; không đụng `catalog_item / customers / installed_base / customer_contacts`.
- Không commit bí mật: file trong `~/Bots/.secrets/`, `~/.claude/channels/*/.env`, `admin/bo-may/credentials.json`, `admin/bo-may/token*.json`, `admin/bot/mcp.json` — chỉ ghi tên.
- Mac mini (`gwtai@bella-mac-mini.tail0de2dd.ts.net`) **không đăng nhập được GitHub qua ssh** → mọi đường git giữa Mac mini và GitHub đi qua máy anh Dũng (fetch qua ssh) hoặc deploy key chỉ đọc.
- **Không bao giờ có hai bản cùng chạy một job ghi** (kho NX, ticket, báo đơn, đơn app → Sheet, sổ quỹ, chấm công, CTS20): nạp bản mới chỉ sau khi bản cũ đã gỡ.
- Giữ nguyên **nhãn launchd** (`com.gwt.bap.*`, `com.gwt.admin.*`, `com.gwt.troly`, `com.gwt.wiki.dongbo`, `com.gwt.pancake`); chỉ đổi đường dẫn trong `ProgramArguments`.
- Ngoài phạm vi, không đụng: `com.gwt.np.*` (bot NP), `com.gwt.don-o-dia`, `com.gwt.dong-bo-ctkm` (chạy code GWT-ERP). `com.gwt.bap.erp` đã chết (script `cap-nhat-erp.py` không dùng) → gỡ.
- Superpowers bắt buộc: `using-git-worktrees` cho mọi thay đổi ở gwt-app; `test-driven-development` cho mọi script mới; `verification-before-completion` trước khi đánh dấu xong task; `systematic-debugging` khi job lỗi sau chuyển.
- Repo GitHub mới: `GWT-VN/GWT-Agent-Team`, **riêng tư**. Tạo repo và deploy key là thao tác của anh Dũng (kế hoạch ghi rõ bước chờ).

## Review Focus

1. **Ghi trùng khi chuyển job** — bản cũ chưa gỡ hẳn mà bản mới đã chạy → kho/ticket ghi hai lần. Kỳ vọng: script chuyển từ chối nạp bản mới khi còn tiến trình chạy từ đường dẫn cũ. → Task 6 test `tu_choi_khi_ban_cu_con_chay`.
2. **Sót tin trong khoảng chuyển** — tin kho/ticket đến lúc giữa gỡ và nạp. Kỳ vọng: bản mới đọc tiếp từ con trỏ tin cuối của bản cũ (file trạng thái được chép), không sót, không đọc lại. → Task 6 test `con_tro_khong_lui` + Task 7 đối chiếu số dòng.
3. **Thiếu file trạng thái / bí mật nằm trong thư mục repo cũ** — bot khởi động nhưng lỗi im lặng (Shopee token, Google OAuth, trạng thái bản tin). Kỳ vọng: kiểm trước khi nạp báo đúng file thiếu và không nạp. → Task 6 test `kiem_truoc_bao_file_thieu`.
4. **Còn đường dẫn cứng tới repo cũ** — job chạy code cũ dù tưởng đã chuyển. Kỳ vọng: CI chặn mọi chuỗi `Bots/gwt-discord-bot` ngoài `docs/`. → Task 5 test.
5. **Migration truy lĩnh khác định nghĩa đang chạy** — dựng lại từ 0 ra hàm khác live. Kỳ vọng: md5 thân hàm trong migration = md5 `pg_get_functiondef` live. → Task 3 bước đối chiếu.

---

### Task 1: Đưa bản đang chạy trên Mac mini về `origin/main` của gwt-discord-bot

**Files:** không tạo file; thao tác git ở `~/Coding Agent/gwt-discord-bot` (máy anh Dũng) và `~/Bots/gwt-discord-bot` (Mac mini).

**Interfaces:**
- Produces: `origin/main` của `GWT-VN/gwt-discord-bot` = HEAD đang chạy trên Mac mini (mốc dời cho Task 4).

- [ ] **Step 1: Ghi hiện trạng Mac mini**
  Run (từ máy anh Dũng): `ssh gwtai@bella-mac-mini.tail0de2dd.ts.net 'cd ~/Bots/gwt-discord-bot && git status -sb && git log --oneline origin/main..HEAD && git diff --stat'`
  Expected: `ahead 8`; 3 file sửa dở (`admin/bo-may/xet-duyet-chi-phi/scanner.mjs`, `test-parser.mjs`, `admin/so-quy/hoa-don.test.mjs`).
- [ ] **Step 2: Hỏi anh Dũng xử lý 3 file sửa dở** (commit trên Mac mini / bỏ / để nguyên). **Không tự commit.** Ghi câu trả lời vào commit message ở Step 4.
- [ ] **Step 3: Kéo nhánh Mac mini về máy anh Dũng qua ssh**
  Run: `cd ~/Coding\ Agent/gwt-discord-bot && git fetch ssh://gwtai@bella-mac-mini.tail0de2dd.ts.net/Users/gwtai/Bots/gwt-discord-bot main:mac-mini-main`
  Expected: nhánh `mac-mini-main` chứa 8 commit (`3fb7875 feat(bap): tin trả lời/báo … link Sheet` …).
- [ ] **Step 4: Đẩy lên origin**
  Run: `git push origin mac-mini-main:main` (fast-forward; nếu không fast-forward → dừng, dùng `superpowers:systematic-debugging`, không force).
- [ ] **Step 5: Kiểm khớp**
  Run: `ssh … 'cd ~/Bots/gwt-discord-bot && git rev-parse HEAD'` và `git rev-parse origin/main`
  Expected: hai mã giống nhau.

### Task 2: CI `db-reset` cho gwt-app (repo giữ schema GWT-SalesTracking)

Luật DB: repo giữ schema chưa có workflow → dựng theo khuôn GWT-Masterdata **trước** migration đầu tiên (Task 3).

**Files (gwt-app, worktree mới cắt từ `origin/main`, nhánh `chore/nen-tang-ci-db-reset`):**
- Create: `.github/workflows/db-reset.yml` — chép khuôn `GWT-Masterdata/.github/workflows/db-reset.yml`, đổi: thư mục làm việc là gốc repo (gwt-app có `supabase/` ở gốc), Node theo `apps/web` nếu CLI pin ở đó, bỏ các biến Google nếu `supabase/config.toml` không đọc chúng.
- Create: `scripts/smoke_local.py` — kiểm tối thiểu sau `db reset`: kết nối Postgres local; đếm bảng `public.tickets`, `public.cs_customers`, `public.sales_orders` tồn tại; hàm `public.kho_bot_ghi` và `public.kho_bot_ds_serial` (đã có migration) có trong `pg_proc`; sau Task 3 thêm 9 hàm bot vào danh sách kiểm; in `ALL OK`.
- Modify (nếu cần): `package.json` gốc hoặc `apps/web/package.json` pin `supabase` CLI.

**Interfaces:** Produces: job GitHub Actions tên `db-reset` chạy khi đổi `supabase/**`.

- [ ] **Step 1:** Viết `scripts/smoke_local.py` với hàm `main() -> int` trả 0 khi mọi kiểm OK, in `ALL OK`.
- [ ] **Step 2:** Viết `db-reset.yml` theo khuôn.
- [ ] **Step 3:** Push nhánh, chạy CI: `gh run watch` (hoặc `gh run list -w db-reset -b chore/nen-tang-ci-db-reset`). Expected: ✓, log có `ALL OK`. Đỏ vì baseline/migration cũ → ghi lại lỗi, sửa trong nhánh này, không bỏ bước.
- [ ] **Step 4:** Commit + PR vào `main` (review rồi merge theo luật repo).

### Task 3: Migration truy lĩnh 9 hàm bot trên GWT-SalesTracking

**Đích DB: GWT-SalesTracking `bwzmqfbcgouhvhoslmmm`.** Hàm cần hợp thức hoá (có trên live, không có trong `supabase/migrations/`): `bot_tao_ticket`, `bot_tao_ticket_phien_ban`, `bot_tra_ticket`, `bot_ds_don`, `bot_ds_don_app`, `bot_dong_bo_cts20_doc`, `bot_dong_bo_cts20_ghi`, `bot_dong_bo_cts20_phien_ban`, `bot__chuan_ghi_chu`. (Đã có migration: `kho_bot_*` ở `20261104110000_kho_bot_serial.sql` — không đụng.)

**Files (gwt-app, worktree nhánh `fix/db-hop-thuc-ham-bot`, cắt từ `origin/main` sau khi Task 2 merge):**
- Create: `supabase/migrations/<UTC yyyymmddHHMMSS>_cs_bot_ham_hop_thuc.sql`
- Tham khảo nguồn: `gwt-discord-bot/db/ticket/*.sql`, `db/sales/*.sql` (bản cuối: tao-ticket v2, cts20 v3).

**Interfaces:** Produces: 9 hàm có trong migration; ledger live có entry đúng tên file với `statements` đầy đủ.

- [ ] **Step 1: Gọi tên đích + đồng bộ repo.** Ghi "đích: GWT-SalesTracking bwzmq…"; `git -C gwt-app pull`.
- [ ] **Step 2: Lấy định nghĩa live (chỉ đọc)** qua MCP `execute_sql`:
  ```sql
  select p.proname, pg_get_functiondef(p.oid) as def,
         md5(pg_get_functiondef(p.oid)) as h,
         array(select grantee||':'||privilege_type from information_schema.routine_privileges r
               where r.specific_name = p.proname||'_'||p.oid) as grants
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname in ('bot_tao_ticket','bot_tao_ticket_phien_ban','bot_tra_ticket','bot_ds_don','bot_ds_don_app','bot_dong_bo_cts20_doc','bot_dong_bo_cts20_ghi','bot_dong_bo_cts20_phien_ban','bot__chuan_ghi_chu');
  ```
  Expected: 9 dòng (hàm quá tải tham số thì nhiều hơn — giữ tất cả). Thiếu hàm nào → dừng, báo anh Dũng.
- [ ] **Step 3: Viết migration** = `create or replace` **đúng nguyên văn `def` live** từng hàm, theo thứ tự phụ thuộc (`bot__chuan_ghi_chu` trước), + grant có rào: `do $$ begin if exists (select 1 from pg_roles where rolname='kho_bot_serial') then grant execute on function … to kho_bot_serial; end if; end $$;` + `revoke … from anon, authenticated` khớp grants live. Header: nguồn (gwt-discord-bot db/…), lý do (drift áp tay qua SQL Editor), **cách lùi**: "hàm đã có trên live; lùi = xoá file + entry ledger, không drop hàm".
- [ ] **Step 4: Đối chiếu md5** (Review Focus 5): dựng DB local (`npx supabase db reset` nếu có Docker, không thì bỏ qua và dựa CI), so `md5(pg_get_functiondef)` local với `h` ở Step 2. Expected: khớp 100%.
- [ ] **Step 5: Push, CI `db-reset` xanh** trên đúng commit chứa file (`gh run watch`).
- [ ] **Step 6: Áp live** bằng `apply_migration` (tên = tên file, không số hiệu) → SELECT `supabase_migrations.schema_migrations` → nếu `version` ≠ số hiệu file thì `execute_sql` update `version` cho khớp; kiểm `statements[1]` đủ nội dung.
- [ ] **Step 7:** `get_advisors` (security) → ERROR thì xử lý/giải trình; WARN thì báo.
- [ ] **Step 8:** Commit + PR + merge; ghi 1 dòng changelog `../GWT-SHARED/SYSTEM.md` (hàm bot là đồ dùng chung CSKH/Sales).

### Task 4: Tạo repo GWT-Agent-Team từ lịch sử bot + khung

**Files (repo mới `~/Coding Agent/GWT-Agent-Team`):**
- Create: `CLAUDE.md` — mục đích repo; luật **bắt buộc Superpowers** (chép bảng mục 10 thiết kế); luật DB GWT (trỏ `~/.claude/gwt-rules/supabase-mcp.md`); không commit bí mật; "bước 1: bố cục cũ giữ nguyên, khung mới chưa dùng"; Mac mini không push được GitHub.
- Create: `README.md` — một đoạn + link thiết kế (`../gwt-app/docs/rework/2026-11-18-gwt-agent-team-design.md`).
- Create: khung rỗng có `README.md` một dòng: `agents/`, `ket-noi/gwt-app/hop-dong/`, `ket-noi/{shopee,google,admin-portal,erp,discord,web}/`, `chay/phien/`, `chay/api/`, `dieu-phoi/`, `thu-vien/`, `tests/`.
- Create: `gwt.code-workspace` — mở `.` và `../gwt-app`.
- Create: `.github/workflows/ci.yml` — 3 job: `npm ci && npm test` trong `shopee/`, `admin/`, `tro-ly/` (giữ đúng lệnh `test` hiện có của từng `package.json`); job quét bí mật (chép `gwt-app/tools/scripts/scan_pii_secrets.py` + hook `pre-commit`); job "không đường dẫn cứng" (Task 5).
- Modify: `.gitignore` — giữ của repo cũ.

**Interfaces:** Consumes: `origin/main` của gwt-discord-bot (Task 1). Produces: `GWT-VN/GWT-Agent-Team` nhánh `main` có toàn bộ lịch sử cũ + khung.

- [ ] **Step 1: Chờ anh Dũng tạo repo** `GWT-VN/GWT-Agent-Team` (riêng tư, rỗng) trên GitHub.
- [ ] **Step 2:** `git clone ~/Coding\ Agent/gwt-discord-bot ~/Coding\ Agent/GWT-Agent-Team && cd … && git remote set-url origin https://github.com/GWT-VN/GWT-Agent-Team.git && git push -u origin main` — Expected: lịch sử đầy đủ trên repo mới (`git log --oneline | wc -l` bằng repo cũ).
- [ ] **Step 3:** Nhánh `chore/khung` (worktree): thêm các file trên; CI xanh; PR + merge.

### Task 5: Bỏ đường dẫn cứng tới repo cũ

Chuỗi `Bots/gwt-discord-bot` có trong: `bot-settings.json` (4), `kenh/bot-settings.json` (4), `scripts/day-gia-len-mac.sh` (2), `RUNBOOK.md` (9), test `admin/bot/cau-hinh.test.mjs`, `mac/cau-hinh.test.mjs`, các plist trong `mac/` và `admin/mac/`.

**Files:** Modify các file trên; Create `tests/khong-duong-dan-cung.test.mjs`.

**Interfaces:** Produces: mọi script tự tính gốc repo; biến `BAP_REPO` (đã có) là nguồn duy nhất cho đường dẫn tuyệt đối khi cần.

- [ ] **Step 1: Viết test hỏng trước**
  ```js
  test('khong_con_duong_dan_cung_ngoai_docs', () => {
    const hits = execSync("git grep -n 'Bots/gwt-discord-bot' -- . ':!docs' ':!RUNBOOK.md' ':!tests/khong-duong-dan-cung.test.mjs'", {encoding:'utf8'}).trim()
    assert.equal(hits, '')   // git grep thoát 1 khi không có → bắt và coi là ''
  })
  ```
- [ ] **Step 2:** `node --test tests/khong-duong-dan-cung.test.mjs` — Expected: FAIL liệt kê file.
- [ ] **Step 3:** Sửa: script shell lấy gốc bằng `REPO="$(cd "$(dirname "$0")/.." && pwd)"`; `bot-settings.json` (đường dẫn quyền Read/Grep) đổi sang `//Users/*/Bots/GWT-Agent-Team/...`; plist sinh từ mẫu với `__REPO__` thay lúc cài (`mac/cai-launchd.sh`, `admin/mac/cai-launchd.sh` thay `__REPO__` bằng `$REPO`); sửa 2 test cấu hình cho khớp; RUNBOOK đổi đường dẫn.
- [ ] **Step 4:** Chạy lại test + `npm test` ở `shopee/`, `admin/`, `tro-ly/` — Expected: PASS hết.
- [ ] **Step 5:** Commit `refactor: bỏ đường dẫn cứng tới repo cũ` (nhánh riêng, PR).

### Task 6: Bản đồ chuyển + script kiểm trước / chuyển / lùi

**Files (GWT-Agent-Team):**
- Create: `chay/phien/chuyen-nha/ban-do.json` — danh sách job và file trạng thái:
  ```json
  { "jobs": [ { "nhan": "com.gwt.bap.khonx", "dot": 4, "ghi": true, "plist_moi": "mac/com.gwt.bap.khonx.plist" } ],
    "trang_thai": [ { "duong_dan": "shopee/.trang-thai.json", "bat_buoc": true } ] }
  ```
  Đợt: **1** `wiki.dongbo`, `bap.khuyenmai`, `bap.gia`, `bap.ton`, `bap.tuan`, `bap.tondb` · **2** `bap.shopee` (bản tin) · **3** `admin.watchdog`, `admin.soquy`, `admin.soquy-bu`, `admin.chamcong` · **4** `bap.khonx` · **5** `bap.watchdog`, `bap.kenh`, `troly`, `pancake`. Gỡ hẳn: `bap.erp`. File trạng thái phải chép (gitignore trong repo cũ): `shopee/.bao-cao.json`, `.cach-giao.json`, `.cho-sua.json`, `.dinh-ky.json`, `.lich-ban-tin.json`, `.trang-thai.json`, `shopee/gia-plan.json`, `du-lieu/`, `admin/bo-may/credentials.json`, `admin/bo-may/token.json`, `admin/bo-may/token-script.json`, `admin/bot/mcp.json`, `.venv/` (tạo lại bằng `python -m venv` + requirements, không chép). Trạng thái nằm ngoài repo (`~/Bots/.state/`, `~/Bots/bap-kenh/`, `~/Bots/.secrets/`, `~/.claude/channels/`) **không đổi chỗ**.
- Create: `chay/phien/chuyen-nha/chuyen.mjs` với các hàm xuất:
  - `kiemTruoc({repoMoi, banDo}) -> {ok: boolean, thieu: string[]}` — mọi `trang_thai.bat_buoc` tồn tại ở repo mới; `node_modules` có ở `shopee/ admin/ tro-ly/`.
  - `banCuConChay(nhan) -> boolean` — `launchctl list` có nhãn **và** `ps` có tiến trình chạy từ đường dẫn repo cũ.
  - `chuyenJob(nhan, {repoCu, repoMoi}) -> void` — chép plist cũ sang `~/Bots/.chuyen-nha/backup/`, `launchctl bootout`, chờ `banCuConChay` = false (tối đa 60 giây, quá thì ném lỗi), cài plist mới (sinh từ mẫu, `__REPO__` = repo mới), `launchctl bootstrap`.
  - `lui(nhan) -> void` — `bootout` bản mới, nạp lại plist backup.
  - CLI: `node chuyen.mjs kiem | chuyen --dot N | lui --nhan X`.
- Test: `tests/chuyen-nha.test.mjs` (giả `launchctl`/`ps` bằng hàm tiêm vào).

**Interfaces:** Consumes: Task 5 (plist dạng mẫu `__REPO__`). Produces: `chuyen.mjs` dùng ở Task 7.

- [ ] **Step 1: Test hỏng trước** — ba test Review Focus:
  - `tu_choi_khi_ban_cu_con_chay`: `banCuConChay` luôn true → `chuyenJob` ném lỗi chứa nhãn, **không** gọi `bootstrap`.
  - `kiem_truoc_bao_file_thieu`: thiếu `shopee/gia-plan.json` → `{ok:false, thieu:['shopee/gia-plan.json']}`.
  - `con_tro_khong_lui`: chép `shopee/.trang-thai.json` (có `lan_cuoi`) → bản ở repo mới có `lan_cuoi` ≥ bản cũ; hàm `chepTrangThai(cu, moi)` từ chối ghi đè khi bản mới có `lan_cuoi` lớn hơn.
- [ ] **Step 2:** `node --test tests/chuyen-nha.test.mjs` — Expected: FAIL (chưa có hàm).
- [ ] **Step 3:** Viết `chuyen.mjs` (thêm `chepTrangThai(cu: string, moi: string) -> void`).
- [ ] **Step 4:** Chạy test — Expected: PASS.
- [ ] **Step 5:** Commit + PR.

### Task 7: Chuyển chạy thật trên Mac mini theo 5 đợt

**Files:** không sửa code; ghi kết quả vào `chay/phien/chuyen-nha/nhat-ky.md` (giờ, đợt, kiểm, kết quả).

**Interfaces:** Consumes: `chuyen.mjs` (Task 6), repo mới đã merge Task 4–6.

- [ ] **Step 1: Đưa repo mới lên Mac mini.** Anh Dũng thêm **deploy key chỉ đọc** của Mac mini vào `GWT-VN/GWT-Agent-Team`; rồi `ssh … 'git clone git@github.com:GWT-VN/GWT-Agent-Team.git ~/Bots/GWT-Agent-Team && cd ~/Bots/GWT-Agent-Team && (cd shopee && npm ci) && (cd admin && npm ci) && (cd tro-ly && npm ci)'`. Nếu chưa có deploy key: đẩy qua `git push ssh://gwtai@…/Users/gwtai/Bots/GWT-Agent-Team.git` từ máy anh Dũng (repo trần khởi tạo trước).
- [ ] **Step 2: Chép trạng thái** bằng `chepTrangThai` cho từng mục `ban-do.json`; chạy `node chay/phien/chuyen-nha/chuyen.mjs kiem` — Expected: `ok: true`.
- [ ] **Step 3: Đợt 1** (job chỉ đọc + ghi tồn Shopee, ban ngày): `chuyen --dot 1`. Kiểm sau 2 giờ: log mỗi job trong `logs/` có lượt chạy mới từ đường dẫn mới; `sales.shopee_stocks` có bản ghi mới ≤15 phút; kênh #e-com/#bắp-mkt nhận bản tin đúng giờ hôm sau.
- [ ] **Step 4: Đợt 2** (bản tin Shopee): `chuyen --dot 2`; kiểm bản tin giờ kế tiếp lên #e-com, không lặp tin (so `.trang-thai.json`).
- [ ] **Step 5: Đợt 3** (Admin, làm **sau 21:00**, ngoài giờ sổ quỹ): `chuyen --dot 3`; kiểm phiên tmux `admin` sống, `scanner --no-report` lượt kế tiếp chạy xong, 00:30 chấm công chạy; so số dòng sổ quỹ trên Sheet trước/sau = không đổi bất thường.
- [ ] **Step 6: Đợt 4** (`khonx`: kho NX + ticket + báo đơn + đơn app → Sheet + CTS20, làm **đêm**): ghi mốc giờ; `chuyen --dot 4`; sáng hôm sau đối chiếu (Review Focus 2):
  - số tin của 2 KTV ở kênh kho NX từ mốc ↔ số dòng `wh_master` mới (Masterdata) — khớp, không trùng `discord_msg_id`;
  - số tin #chăm-sóc-khách-hàng từ mốc ↔ số ticket có `discord_msg_id` mới (SalesTracking) — khớp;
  - 20:00 tin tổng kết doanh số lên #báo-cáo-doanh-thu.
- [ ] **Step 7: Đợt 5** (phiên Claude: `bap`, kênh, nhóm công việc, trợ lý, pancake): `chuyen --dot 5`; kiểm @Bắp trả lời ở #ai, phiên `kenh-bap-*` sống, trợ lý ERP trả lời một câu thử, Pancake báo bình thường.
- [ ] **Step 8:** Gỡ `com.gwt.bap.erp`; theo dõi **7 ngày**: mỗi sáng đối chiếu như Step 6 + đếm lỗi trong `logs/`. Lỗi → `lui --nhan …` trước, rồi `superpowers:systematic-debugging`.
- [ ] **Step 9:** `superpowers:verification-before-completion`: liệt kê bằng chứng 7 ngày trong `nhat-ky.md`.

### Task 8: Đóng băng repo cũ

**Files (gwt-discord-bot):** Modify `README.md`/`CLAUDE.md`/`RUNBOOK.md` đầu file: "ĐÃ CHUYỂN sang GWT-VN/GWT-Agent-Team từ <ngày>. Không sửa ở đây."

- [ ] **Step 1:** Commit + push thông báo (qua máy anh Dũng).
- [ ] **Step 2:** Sau 7 ngày ổn (Task 7 Step 8): anh Dũng **Archive** repo `GWT-VN/gwt-discord-bot` trên GitHub; Mac mini đổi tên `~/Bots/gwt-discord-bot` → `~/Bots/gwt-discord-bot.cu` (giữ 30 ngày rồi xoá).
- [ ] **Step 3:** Cập nhật memory/handoff: Bắp chạy từ `~/Bots/GWT-Agent-Team`.

## Thứ tự và song song

- Task 1 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8 (tuần tự).
- Task 2 → Task 3 chạy **song song** với nhánh trên (khác repo, khác file); Task 3 không chặn Task 7 (hàm đã có trên live, migration chỉ hợp thức hoá).

## Sau bước 1

Bước 2 (API gwt-app + bộ kết nối gwt-app, dời file vào `ket-noi/`) có kế hoạch riêng sau khi Task 7 ổn định 7 ngày.
