# Bot Pancake về gwt-app — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Job mỗi phút trong gwt-app đọc tin fanpage qua Pancake, Claude phân loại, GPT soạn bằng công cụ tra chỉ-đọc, gửi thẳng
khách khi qua rào an toàn, báo một dòng Discord cho mỗi tin gửi / ca chuyển người.

**Architecture:** Một thư mục thuần TypeScript `apps/web/lib/chatbot/pancake/` (không phải code Next, không `server-only`),
import tương đối có đuôi `.ts`, chạy thẳng bằng Node 26 (gỡ kiểu sẵn có) trên Mac mini qua launchd. Mọi I/O (Pancake, Supabase
Masterdata, Claude, OpenAI, Discord) là phụ thuộc tiêm vào → vòng một lượt test được bằng đồ giả. Phần lớn là **chép có chọn lọc**
từ GWT-ERP `lib/chatbot/` (commit `c2f3719`) kèm test của nó; phần mới: gọi Claude/GPT bằng `fetch`, cổng tự gửi, dựng lời chào,
báo Discord gọn, vòng một lượt.

**Tech Stack:** Node ≥ 24 (dev) / 26 (Mac mini) chạy `.ts` trực tiếp · vitest (đã có) · `@supabase/supabase-js` (đã có) · `fetch`
cho Anthropic Messages API, OpenAI Chat Completions, Pancake public API, Discord webhook. **Không thêm dependency.**

**Spec:** `docs/specs/2026-11-25-chatbot-pancake-gwt-app-design.md` (đọc kèm; §5 luồng, §6 kỹ thuật, §7 rào R1–R11).

## Global Constraints

- Nhánh `feat/chatbot-pancake-tu-tra-loi` cắt từ `rework/v2.0.0`; PR vào `rework/v2.0.0`. Commit/push chỉ khi anh Dũng đồng ý.
- DB = Masterdata `qynpywysgltspmgnhhga`, schema `chatbot`, chỉ bảng/cột đã có (`pancake_conversations`, `pancake_sync_state`,
  `chunks`/RPC truy hồi, số liệu máy, `sales.shopee_stocks`). **Không migration. Không xoá dòng nào.**
- Phân loại: Claude, `PANCAKE_PHAN_LOAI_MODEL`, mặc định `claude-sonnet-5-5`. Soạn: GPT, `PANCAKE_TRA_LOI_MODEL`, **bắt buộc đặt**
  (thiếu → job thoát `loi: thiếu PANCAKE_TRA_LOI_MODEL`).
- Cửa gửi khách DUY NHẤT: `gui-khach.ts` (`reply_inbox`, không thử lại). Mọi file khác chỉ GET Pancake.
- Mọi tin bot kết bằng U+2063 (`DAU_BOT`). Câu giới thiệu: `Em là trợ lý ảo của máy lọc nước GE ạ.` (`Cháu là…` khi gọi cô/chú/
  bác/ông/bà); vẫn nhận câu cũ "trợ lý tự động của máy lọc nước GE" và "trợ lý tự động của GWT".
- Log file chỉ in số đếm và mã lỗi ngắn (`/^[A-Za-z][A-Za-z0-9_]{2,63}$/`) — không tin khách, không SĐT, không khoá.
- Không đọc/in nội dung file `.env` / `~/Bots/.secrets/*`. Tin gửi khách thật: chỉ sau khi anh Dũng duyệt đúng cấu hình đợt thử.
- Bot cũ `com.gwt.pancake` phải disabled + gỡ plist trước khi bật bản mới ở `bat`.

## Review Focus

- Khách gõ nhiều tin liền → bot chỉ trả lời khi khách yên 120 giây (trần 300 giây), một lượt cho cả khối — test ở Task 10.
- NV trả lời trong lúc bot đang soạn → đọc lại trước khi gửi, có tin NV mới hơn thì bỏ, không gửi — test ở Task 10.
- Pancake trả HTTP 200 với `success:false` → coi là gửi hỏng, không thử lại, dòng Discord ⚠️ — test ở Task 2.
- Model trả `arguments` công cụ không phải JSON → kết quả công cụ báo lỗi cho model, vòng không ném — test ở Task 6.
- Tên Facebook có emoji / số / link → chào không tên ("Chào anh/chị!") — test ở Task 7.

---

## File Structure (tất cả dưới `apps/web/lib/chatbot/pancake/` trừ khi ghi khác)

| File | Trách nhiệm | Nguồn |
|---|---|---|
| `loc.ts` | lọc tin: khách/NV/bot, `dangCho`, `tinKhachDangCho`, `lichSuHoiThoai`, `DAU_BOT`, `coCauBao` | chép ERP `kenh/pancake/loc.ts` + câu giới thiệu mới |
| `an-pii.ts`, `so-cuoc.ts` | che PII; sổ hội thoại (+ khoá `xung_ho`) | chép + sửa `so-cuoc.ts` |
| `doc.ts` | client Pancake chỉ đọc | chép |
| `gui-khach.ts` | cửa gửi duy nhất (chỉ tin chữ) | chép, bỏ ảnh |
| `kho.ts` | đọc/ghi `pancake_conversations`, `pancake_sync_state` | chép phần dùng |
| `cong-cu/*.ts` | công cụ tra: tài liệu, số liệu máy, bảng giá, tồn kho + truy hồi/nhúng | chép `db/cong-cu-tra.ts` và các file nó cần |
| `ho-tro.ts` | `timSdt`, `coYDinhGapNguoi` | chép từ `chat/ho-tro.ts` (chỉ 2 hàm + phụ thuộc) |
| `claude.ts` | `goiClaudeJson` — một lời gọi Messages API, đầu ra JSON theo schema | mới |
| `phan-loai.ts` | phân loại tin | chép, đổi `goi` |
| `openai.ts` | `goiGpt` — một lời gọi Chat Completions có tools | mới |
| `tu-tra.ts` | vòng GPT tự tra + lời dặn + kiểm căn cứ | chép + đổi sang OpenAI |
| `dung-tin.ts` | chào / giới thiệu / "Dạ <gọi> <tên>" / "ạ" / hotline / bubble / đậm Unicode | chép `tu-gui.ts` + sửa theo spec §6.6 |
| `cau-hinh.ts` | đọc + kiểm env, fail-closed | mới (lấy `docGioLam`, `docHotline`, `docDsTrang` của ERP) |
| `cong.ts` | rào R1–R7 (hàm thuần) | mới |
| `bao.ts` | dòng Discord gọn qua webhook kênh chữ | mới |
| `luot.ts` | `chayMotLuot` — vòng một lượt một page | mới |
| `README.md` | RUNBOOK | mới |
| `apps/web/scripts/pancake-luot.ts` | điểm vào job | mới |
| `apps/web/tsconfig.json` | thêm `"allowImportingTsExtensions": true` | sửa |

Test: `<file>.test.ts` cạnh file. Test chép từ ERP `tests/chatbot/pancake-<tên>.test.ts`, đổi import sang đường tương đối, bỏ ca của
phần đã bỏ (thẻ, ảnh, Bắp, Forum).

---

### Task 1: Khung chạy + module lọc tin thuần

**Files:**
- Modify: `apps/web/tsconfig.json` (compilerOptions: `"allowImportingTsExtensions": true`)
- Create: `loc.ts`, `an-pii.ts`, `so-cuoc.ts`, `ho-tro.ts` + `loc.test.ts`, `an-pii.test.ts`, `so-cuoc.test.ts`
- Create: `apps/web/lib/chatbot/pancake/chi-mot-cua-gui.test.ts` (chép ý `pancake-chi-doc.test.ts`)

**Interfaces — Produces:**
- `loc.ts`: như ERP (`laKhach`, `laNhanVien`, `laTinBot(t: TinPancake): boolean`, `dangCho`, `tinKhachDangCho(tin, pageId?, pageNgoai?, sau?)`,
  `lichSuHoiThoai`, `DAU_BOT`, `GIAN_DOAN`, `TOI_DA_ANH`) + `CAU_GIOI_THIEU = "Em là trợ lý ảo của máy lọc nước GE"` và
  `coCauBao(s)` nhận `CAU_GIOI_THIEU`, `"Em là trợ lý tự động của máy lọc nước GE"`, `"em là trợ lý tự động của GWT"`.
  Kiểu `TinPancake`, `HoiThoaiPancake` import từ `doc.ts` (Task 2) — Task 1 tạo `doc.ts` chỉ phần `export interface` trước.
- `so-cuoc.ts`: `type XungHo = { goi: Goi; xung: "em" | "chau" }`, `type Goi = "anh"|"chị"|"anh/chị"|"cô"|"chú"|"bác"|"ông"|"bà"|"em"`,
  `interface SoCuoc { nhu_cau: string; da_xong: string[]; con_mo: string[]; xung_ho?: XungHo }`, `chuanSoCuoc(x: unknown): SoCuoc | null`
  (giá trị `xung_ho` lạ → bỏ khoá), `giuDaXong` như ERP.
- `ho-tro.ts`: `timSdt(s: string): string | null`, `coYDinhGapNguoi(s: string, chiCumRo: boolean): boolean`.

- [ ] **Step 1:** Chép test ERP `pancake-loc`, `pancake-an-pii`, `pancake-so-cuoc` sang cạnh file, đổi import. Thêm vào `loc.test.ts`:
  `expect(coCauBao("Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ."))toBe(true)` và cùng thế cho hai câu cũ.
  Thêm vào `so-cuoc.test.ts`: `chuanSoCuoc({nhu_cau:"x",da_xong:[],con_mo:[],xung_ho:{goi:"cô",xung:"chau"}})?.xung_ho` → `{goi:"cô",xung:"chau"}`;
  `xung_ho:{goi:"sếp",xung:"em"}` → không có khoá `xung_ho`.
- [ ] **Step 2:** Viết `chi-mot-cua-gui.test.ts`: đọc mọi `*.ts` trong thư mục (trừ test), chỉ `gui-khach.ts` được chứa `reply_inbox`
  hoặc `method: "POST"` tới `pages.fm`. Và: không file nào trong thư mục import `"server-only"`.
- [ ] **Step 3:** `npx --prefix apps/web vitest run lib/chatbot/pancake` → FAIL (chưa có module).
- [ ] **Step 4:** Chép module (ghi dòng đầu `// chép từ GWT-ERP <đường dẫn> @c2f3719`), import tương đối có `.ts`, bỏ `import "server-only"`.
- [ ] **Step 5:** Chạy lại → PASS. Kiểm Node chạy thẳng: `node -e "import('./apps/web/lib/chatbot/pancake/loc.ts').then(m=>console.log(typeof m.laTinBot))"` → `function`.
  `npx --prefix apps/web tsc --noEmit` sạch.
- [ ] **Step 6:** Commit `feat(chatbot): khung bot Pancake + lọc tin (chép ERP)`.

### Task 2: Client Pancake — đọc và cửa gửi duy nhất

**Files:** Create `doc.ts`, `gui-khach.ts`, `doc.test.ts`, `gui-khach.test.ts` (chép ERP `pancake-doc`, `pancake-gui-khach`, bỏ ca ảnh).

**Interfaces — Produces:**
- `doc.ts`: `taoPancake(pageId: string, token: string, fetchImpl?: typeof fetch): { dsHoiThoai(o: {since: number; until: number; truocId?: string}): Promise<HoiThoaiPancake[]>; tinNhan(id: string, o?: {trang?: number}): Promise<TinPancake[]> }`, `PancakeError { status: number | null; code: string }`.
- `gui-khach.ts`: `taoGuiKhach(pageId: string, token: string, fetchImpl?: typeof fetch): { gui(conversationId: string, message: string): Promise<string> }`,
  `class GuiKhachError extends Error { code: string }` — viết `code` là trường gán trong constructor (Node gỡ kiểu không nhận parameter property).

- [ ] **Step 1:** Chép test; giữ ca: 200 + `success:false` + `message_code:"X"` → ném `GUI_KHACH_X`; mạng hỏng → `GUI_KHACH_MANG`; không thử lại (fetch giả gọi đúng 1 lần).
- [ ] **Step 2:** Chạy → FAIL. **Step 3:** Chép code (bỏ `guiAnh`, `taiLenAnh`, `TepGui`). **Step 4:** PASS + `tsc` sạch.
- [ ] **Step 5:** Commit `feat(chatbot): client Pancake đọc + cửa gửi chữ`.

### Task 3: Kho Masterdata

**Files:** Create `kho.ts`, `kho.test.ts` (chép ERP `pancake-kho`, giữ ca của các hàm dưới).

**Interfaces — Produces:** `taoKhoPancake(sb: SupabaseClient): KhoPancake` với
`docTrangThai`, `giuKhoa(pageId, now): Promise<boolean>`, `nhaKhoa(pageId, patch)`, `docHoiThoai(pageId, ids): Promise<Map<string, DongHoiThoai>>`,
`luuHoiThoai(d: DongLuu)`, `danhDauXuLy(pageId, ids)`, `dsCho(pageId): Promise<DongHoiThoai[]>`, `ghiBaoLuc(pageId, id, luc: string)` (ghi `discord_bao_luc` + `cap_nhat_luc`),
`ghiSoCuoc(pageId, id, so: SoCuoc)`, `hetHanCho(pageId, truoc: Date)` (như ERP **và** `so_cuoc = null` cho mọi dòng của page có `tin_khach_luc < truoc`).
`DongHoiThoai` như ERP (gồm `tenKhach`, `tinKhach`, `tinKhachLuc`, `coSdt`, `nhom`, `gap`, `tomTat`, `maMay`, `discordBaoLuc`, `soCuoc`). Client `sb` tạo ở script với `db: { schema: "chatbot" }`.
Không có `xoaCu`, `dsCanDong`, `ghiDiscord` đầy đủ.

- [ ] **Step 1:** Test `hetHanCho` (đồ giả ghi lại lệnh): phát hai UPDATE — `trang_thai cho→da_xu_ly` và `so_cuoc=null`, cả hai lọc `tin_khach_luc < truoc` và `page_id`.
- [ ] **Step 2–4:** FAIL → chép/viết → PASS. **Step 5:** Commit `feat(chatbot): kho Pancake trên Masterdata (bảng có sẵn)`.

### Task 4: Công cụ tra chỉ-đọc

**Files:** Create `cong-cu/cong-cu-tra.ts` + các file nó kéo theo (theo ERP: `retrieval/retrieve.ts`, `retrieval/embedding.ts`,
`retrieval/text-normalize.ts`, `db/masterdata.ts` phần `docSoLieuMay`, `chat/so-lieu-chu.ts` (`khoiSoLieu`, `traLoiGiaDanhMuc`),
`chat/danh-muc.ts`, `chat/chuan-dau.ts`, `kenh/pancake/ton-kho.ts`, `config.ts` phần EMBED_* / TOP_K) đặt phẳng trong `cong-cu/`.
Test: chép `pancake-ton-kho` + test so-lieu-chu/danh-muc của ERP nếu có.

**Interfaces — Produces:** `type NhomGia = "de_ban"|"am_tu"|"loc_tong"|"tat_ca"`, `interface CongCuTra { timTaiLieu(cau): Promise<{tieuDe; noiDung}[]>; traMay(ma): Promise<string>; bangGia(nhom: NhomGia): Promise<string>; tonKho(ma): Promise<string> }`,
`taoCongCuTra(sb: SupabaseClient): CongCuTra` (một client Masterdata cho cả RPC chatbot, số liệu máy, `sales.shopee_stocks`). Bỏ `giaDanhMuc` (chỉ cho thẻ).

- [ ] **Step 1:** Test `traMay` máy ngừng bán có dòng `LƯU Ý: máy … đã NGỪNG BÁN`; `tonKho` khi `schema` lỗi → ném `TON_KHO_DOC`; `timTaiLieu` cắt câu 300 ký tự và trả ≤ 6 đoạn (rpc giả).
- [ ] **Step 2–4:** FAIL → chép → PASS + `tsc`. Chạy thử thật một lần (đọc, máy dev, env Masterdata): `traMay("CTS20")` có giá. **Step 5:** Commit.

### Task 5: Phân loại bằng Claude

**Files:** Create `claude.ts`, `phan-loai.ts`, `claude.test.ts`, `phan-loai.test.ts` (chép ERP `pancake-phan-loai`).

**Interfaces — Produces:**
- `goiClaudeJson(o: { apiKey: string; model: string; system: string; user: string; schema: Record<string, unknown>; maxTokens: number; fetchImpl?: typeof fetch }): Promise<{ text: string; truncated: boolean }>` —
  POST `https://api.anthropic.com/v1/messages` (`anthropic-version: 2023-06-01`); dạng body đầu ra có cấu trúc chép từ nhánh Claude của ERP `chat/llm.ts`. HTTP lỗi → ném `CLAUDE_HTTP_<status>`.
- `phanLoai(tin: string, coSdt: boolean, lichSu: string[], goi: (system: string, user: string) => Promise<{text: string; truncated: boolean}>): Promise<PhanLoai>` — lời dặn, `SCHEMA_PHAN_LOAI`, `luatCungGap`, `NHOM`, `NHOM_GAP` y như ERP. Không bao giờ ném.

- [ ] **Step 1:** Test: JSON hợp lệ → đúng nhóm; `truncated` → `nhom:null`; `goi` ném → `nhom:null`, `gap` theo `luatCungGap`; `claude.ts` gửi đúng header + model (fetch giả).
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit `feat(chatbot): phân loại tin Pancake bằng Claude`.

### Task 6: GPT tự tra

**Files:** Create `openai.ts`, `tu-tra.ts`, `openai.test.ts`, `tu-tra.test.ts` (chép ca `kiemCanCu`, `tuHenLich`, `huaBaoLai`, `tuTuyetDoi`, `moiSdtCuoi`, `boDaLap` từ ERP `pancake-tu-tra*.test.ts` nếu có, không thì viết).

**Interfaces — Consumes:** `CongCuTra` (Task 4), `SoCuoc`/`XungHo` (Task 1).
**Produces:**
- `goiGpt(o: { apiKey: string; model: string; messages: unknown[]; tools: unknown[]; fetchImpl?: typeof fetch }): Promise<{ message: { content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] }; finish: string }>` — POST `https://api.openai.com/v1/chat/completions`, `tool_choice:"auto"`. HTTP lỗi → ném `GPT_HTTP_<status>`.
- `interface LuongTra { cauHoi: string; khachDaNoi: string[]; lichSu: string[]; maMay: string | null; daCoSdt: boolean; soCuoc: SoCuoc | null }`
- `interface KetQuaTra { traLoi: string; canNv: boolean; khongTraLoi: boolean; lyDo: string; chanTuGui: string[]; xungHo: XungHo | null; soCuoc: SoCuoc | null }` — `chanTuGui` = lý do không được tự gửi (căn cứ không khớp, tự hẹn lịch, hứa báo lại không chuyển NV, nói quá nguồn); rỗng = được.
- `soanTuTra(l: LuongTra, o: { congCu: CongCuTra; goi: (messages: unknown[], tools: unknown[]) => ReturnType<typeof goiGpt>; hotline: string }): Promise<KetQuaTra>` — tối đa 5 vòng; hết vòng → ném `TU_TRA_QUA_VONG`; trả lời rỗng → ném `TU_TRA_RONG`.

Lời dặn = `dungLoiDanTuTra` của ERP **bỏ**: phần thẻ, ảnh khách, quảng cáo, câu "soạn NHÁP; nhân viên sẽ xem trước"; **thêm**: "KHÔNG tự chào, không tự giới thiệu — hệ thống tự thêm lời chào"; "ghi `xung_ho`: cách gọi khách suy từ hội thoại theo luật GIỌNG". Tin đầu (`dungTinTuTra` của ERP) giữ khối SỔ CUỘC CHAT và thêm dòng `Cách gọi khách đã biết: <goi>/<xung>` khi `soCuoc.xung_ho` có. Công cụ `chot_tra_loi` = `chot_nhap` của ERP bỏ `the`, `the_tin`, `may_trong_anh`, thêm `xung_ho: {goi: enum Goi, xung: enum ["em","chau"]}`; tool `strict: true`. `arguments` không parse được → trả tool result `is_error`-tương đương ("Đối số không đọc được, gọi lại.") và tiếp vòng.

- [ ] **Step 1:** Test với `goi` giả: (a) gọi `tra_may` rồi `chot_tra_loi` có căn cứ đúng → `chanTuGui=[]`; (b) số "12.990.000" không có câu trích → `chanTuGui` chứa `số 12.990.000 không có câu trích`; (c) `arguments:"{hỏng"` ở vòng 1 → vòng 2 vẫn chạy; (d) `khong_tra_loi:true` + `tra_loi:""` → `khongTraLoi:true`, không ném; (e) 5 vòng toàn gọi công cụ → ném `TU_TRA_QUA_VONG`.
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit `feat(chatbot): GPT tự tra cho bot Pancake`.

### Task 7: Dựng tin gửi khách

**Files:** Create `dung-tin.ts`, `dung-tin.test.ts` (chép ca `tachDoan`, `inDamUnicode`, `tenGoi`, `coHotline` từ ERP `pancake-tu-gui`/`pancake-bubble`).

**Interfaces — Produces:** `type KieuMo = "gioi_thieu" | "chao" | "da"`,
`kieuMo(tin: TinPancake[], now: Date, soCuoc: SoCuoc | null): KieuMo` — chưa có câu giới thiệu trong hội thoại (`coCauBao`) hoặc `soCuoc` null vì hết hạn → `gioi_thieu`; tin GWT/bot gần nhất cũ hơn 6 giờ → `chao`; còn lại `da`.
`dungTinGui(traLoi: string, o: { kieu: KieuMo; xungHo: XungHo | null; tenKhach: string | null; hotline: string; hoiSo: boolean }): string[]`.

Luật (spec §6.6): tin đầu mở bằng `Chào <Gọi> <tên>! <Xưng> là trợ lý ảo của máy lọc nước GE ạ. ` (gioi_thieu) / `Chào <Gọi> <tên>! ` (chao) / `Dạ <gọi> <tên>, ` (da);
không tên → `Chào <Gọi>!` / `Dạ <gọi>, `; câu chào GPT lỡ viết ở đầu (`/^(dạ\s*,?\s*)?(chào|xin chào)[^.!?\n]*[.!?]\s*/i`) bị bỏ; mỗi tin không kết "ạ" (trước `. ? !` cuối) → thêm " ạ" trước dấu cuối (không dấu thì thêm " ạ."); lượt `gioi_thieu` thêm tin cuối `CAU_HO_TRO` của ERP (đổi "anh/chị" theo `goi`) trừ khi câu trả lời đã có hotline; `**…**` → đậm Unicode; mỗi tin + U+2063.

- [ ] **Step 1:** Test đúng các câu mẫu spec §6.6 (tên giả): `gioi_thieu` + `{goi:"anh",xung:"em"}` + tên "Hùng" → tin 1 bắt đầu `Chào anh Hùng! Em là trợ lý ảo của máy lọc nước GE ạ. `; `{goi:"cô",xung:"chau"}` tên "Lan" → `Chào cô Lan! Cháu là trợ lý ảo…`; tên `"Hùng 😎 0912"` → `Chào anh/chị! Em là…` khi xungHo null; `chao` → `Chào chị Mai! `; `da` → `Dạ anh Hùng, lõi CFNC thay sau 12 tháng ạ.`⁣; tin "Giá CTS20 là 12.990.000đ" → kết `12.990.000đ ạ.`; GPT viết "Chào anh! Dạ…" → không còn hai câu chào; mọi tin kết U+2063.
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit `feat(chatbot): dựng tin gửi — chào, giới thiệu, ạ, hotline`.

### Task 8: Cấu hình + cổng tự gửi (R1–R7)

**Files:** Create `cau-hinh.ts`, `cong.ts`, `cau-hinh.test.ts`, `cong.test.ts`.

**Interfaces — Produces:**
- `docCauHinh(env: Record<string, string | undefined>): { ch: CauHinh } | { loi: string }` — lỗi chỉ nêu TÊN biến.
  `CauHinh = { cheDo: "tat"|"thu"|"bat"; trang: { id: string; ten: string; token: string }[]; trangGui: Set<string>; gioLam: GioLam; gioBot: { tu: number; den: number } | null; hotline: string; tranNgay: number; modelPhanLoai: string; modelTraLoi: string; webhook: string; pingKhieuNai?: string; demDir: string }`.
  Biến: `PANCAKE_TU_GUI` (mặc định `tat`), `PANCAKE_PAGES` + `PANCAKE_PAGE_TOKEN_<id>` (khuôn ERP `_trang.mjs`), `PANCAKE_TU_GUI_TRANG`, `PANCAKE_GIO_LAM` (mặc định `1-6 08:00-18:00`), `PANCAKE_GIO_BOT` (tuỳ chọn `HH:MM-HH:MM` mỗi ngày, vd `18:00-22:00`), `PANCAKE_HOTLINE`, `PANCAKE_TRAN_NGAY` (mặc định 20), `PANCAKE_PHAN_LOAI_MODEL` (mặc định `claude-sonnet-5-5`), `PANCAKE_TRA_LOI_MODEL` (bắt buộc), `DISCORD_WEBHOOK_PANCAKE_BAO`, `PANCAKE_PING_KHIEU_NAI`, `PANCAKE_DEM_DIR` (mặc định `~/Bots/state`), cộng `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `EMBED_MODEL`.
  Trang `pzl_…` hoặc `spo_…` trong `PANCAKE_TU_GUI_TRANG` → `loi` (R1: không bao giờ).
- `trongGioBot(now: Date, ch: Pick<CauHinh,"gioLam"|"gioBot">): boolean` — ngoài giờ làm (giờ VN) VÀ (gioBot null hoặc trong gioBot).
- `NHOM_DUOC_GUI = new Set(["tu_van","loi_loc","hoi_gia"])`.
- `chanTruocSoan(o: { nhom: Nhom | null; gap: boolean; coAnh: boolean; nvTrong24h: boolean; botLuotHomNay: number; daGuiHomNay: number; tranNgay: number; tinKhach: string }): string | null` — lý do chuyển người hoặc null. Thứ tự: nhóm ngoài `NHOM_DUOC_GUI` hoặc null → `nhom_<x>`; `gap` → `gap`; `coAnh` → `khach_gui_anh`; `nvTrong24h` → `nv_dang_xu_ly`; `botLuotHomNay >= 3` → `qua_3_luot`; `daGuiHomNay >= tranNgay` → `qua_tran_ngay`; tin khách khớp `/khuyến m[ãạ]i|giảm|quà|trả góp|bớt|rẻ hơn|giá tốt/i` VÀ nhóm `hoi_gia` → `hoi_km_quà_trả_góp`.
- `chanSauSoan(k: KetQuaTra): string | null` — `khongTraLoi` → `khong_tra_loi`; `canNv` → `can_nv`; `chanTuGui[0]`; `tachDoan(traLoi).length > 6` → `qua_6_doan`; câu trả lời khớp regex quà/trả góp ở trên → `tra_loi_nhac_qua`; rỗng → `rong`.

- [ ] **Step 1:** Test mỗi rào một ca (R1 `pzl_x` trong trang gửi → `loi`; R2 thứ 2 10:00 VN → false, thứ 2 19:00 → true, CN 10:00 → true, `gioBot 18:00-22:00` + 23:00 → false; R3–R7 mỗi lý do một ca); thiếu `PANCAKE_TRA_LOI_MODEL` → `loi` nêu tên biến.
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit `feat(chatbot): cấu hình + rào tự gửi Pancake`.

### Task 9: Báo Discord gọn

**Files:** Create `bao.ts`, `bao.test.ts`.

**Interfaces — Produces:** `taoBao(webhook: string, fetchImpl?: typeof fetch): { daGui(o: {kenh: string; nhom: string; tomTat: string; tin: string[]; thu: boolean}): Promise<void>; chuyenNguoi(o: {kenh: string; nhom: string; lyDo: string; tomTat: string; khieuNai: boolean; ping?: string}): Promise<void>; loi(o: {kenh: string; ma: string}): Promise<void> }`.
Một POST webhook mỗi lần (`allowed_mentions` chỉ role `ping`), nội dung ≤ 2000 ký tự (cắt): `✉️ <kenh> · <nhom> · <tomTat>` (thu: `✉️ THỬ — chưa gửi · …`) rồi các tin (bỏ U+2063); `🙋 <kenh> · <nhom> · <lyDo> · <tomTat>` (khiếu nại thêm `🔴` + `<@&ping>`); `⚠️ <kenh> · gửi hỏng <ma> — NV trả lời giúp`. HTTP lỗi → ném `DISCORD_HTTP_<status>`.

- [ ] **Step 1:** Test chuỗi gửi đúng 3 dạng, cắt 2000, không có U+2063 trong nội dung Discord.
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit.

### Task 10: Vòng một lượt

**Files:** Create `luot.ts`, `luot.test.ts`.

**Interfaces — Consumes:** Task 1–9. **Produces:**
`chayMotLuot(p: { pageId: string; tenKenh: string; pancake: ReturnType<typeof taoPancake>; gui?: (cid: string, msg: string) => Promise<string>; kho: KhoPancake; phanLoai: (tin, coSdt, lichSu) => Promise<PhanLoai>; soan: (l: LuongTra) => Promise<KetQuaTra>; bao: ReturnType<typeof taoBao>; ch: CauHinh; dem: { doc(): number; tang(): void }; now: () => Date; nghi?: (ms: number) => Promise<unknown> }): Promise<KetQua>`
với `KetQua = { viec: "bo_qua_khoa"|"ngoai_gio"|"tat"|"xong"|"loi"; phanLoai: number; gui: number; thu: number; chuyen: number; boQuaCu: number; loi?: string }`. Không ném.

Luồng = spec §5 bước 0–10, hai pha như ERP `chay.ts`:
- `ch.cheDo === "tat"` → `tat`; ngoài `trongGioBot` → `ngoai_gio` (không đọc gì).
- Pha A: giữ khoá → `dsHoiThoai` từ `max(lanChayCuoi − 5 phút, now − 30 phút)` (≤ 5 trang) → mỗi hội thoại INBOX, không nhóm, `dangCho`, có động tĩnh mới: `tinNhan` → `tinKhachDangCho`; không còn tin chờ → `danhDauXuLy`; còn → `phanLoai` → `luuHoiThoai` (`trang_thai 'cho'`).
- Pha B: `dsCho` lọc `discordBaoLuc` rỗng hoặc < `tinKhachLuc`, khách yên ≥ 120 giây (hoặc ≥ 300 giây từ tin đầu khối); tin khách cũ hơn 30 phút → bỏ, `boQuaCu++`; tối đa 5 lượt gửi/lượt chạy. Mỗi dòng: GET tin → `chanTruocSoan` → `soan` → `chanSauSoan` → **GET tin lần nữa**, có tin NV/bot mới hơn `tinKhachLuc` → bỏ (không báo) → `dungTinGui` → `thu`: `bao.daGui({thu:true})` / `bat`: gửi từng tin (nghỉ 1 giây; tin sau hỏng thì dừng) → `bao.daGui` → `ghiSoCuoc` (kèm `xung_ho`) → `danhDauXuLy`. Bị chặn → `bao.chuyenNguoi`. Mọi nhánh cuối: `ghiBaoLuc(max(now, tinKhachLuc))`. Gửi hỏng tin đầu → `bao.loi`. 3 lần gửi hỏng trong lượt → thôi gửi page đó tới lượt sau.
- Sổ đưa vào `soan` / `kieuMo` chỉ khi lần khách nhắn trước (dòng DB cũ) trong 7 ngày; quá → coi như null (phòng bước dọn chưa chạy).
- `hetHanCho(now − 7 ngày)` mỗi lượt; nhả khoá + `lanChayCuoi`.

- [ ] **Step 1:** Test với đồ giả (không mạng): (a) khách hỏi giá CTS20, yên 3 phút, chế độ `bat` → `gui` gọi đủ tin, `bao.daGui` 1 lần, `ghiBaoLuc` 1 lần; (b) cùng ca nhưng lần GET thứ hai có tin NV mới hơn → `gui` 0 lần, `bao` 0 lần; (c) khách gõ tin 40 giây trước → không xử lý lượt này; (d) `khieu_nai` → `chuyenNguoi` 1 lần, lượt sau (cùng `tinKhachLuc`) không báo lại; (e) `thu` → `gui` 0 lần, `bao.daGui({thu:true})` 1 lần; (f) tin khách 45 phút trước → `boQuaCu=1`, không báo; (g) `gui` ném lần đầu → `bao.loi` 1 lần, không thử lại.
- [ ] **Step 2–4:** FAIL → viết → PASS. **Step 5:** Commit `feat(chatbot): vòng một lượt bot Pancake`.

### Task 11: Script, chọn model GPT, RUNBOOK

**Files:** Create `apps/web/scripts/pancake-luot.ts`, `apps/web/lib/chatbot/pancake/README.md`; Modify `apps/web/.env.example` (tên biến, không giá trị).

**Interfaces — Produces:** `node apps/web/scripts/pancake-luot.ts [--kho]` — đọc `ENV_FILE` (parser `KEY=VALUE` như ERP `_env.mjs`), `docCauHinh`, dựng phụ thuộc thật, chạy lần lượt từng page, in MỘT dòng JSON mỗi page (`{trang, ...KetQua}`), thoát 1 nếu có `loi`. `--kho`: ép chế độ `thu` bất kể env (chạy khô).

- [ ] **Step 1:** Chạy khô trên máy dev với env Masterdata + khoá (anh Dũng cung cấp file env riêng, không in): `node apps/web/scripts/pancake-luot.ts --kho` ngoài giờ làm → dòng JSON `viec:"xong"`, webhook Discord thử nhận dòng `✉️ THỬ`.
- [ ] **Step 2:** Chọn model GPT: liệt kê model khả dụng của khoá (`GET /v1/models`, chỉ in id), chạy `soanTuTra` trên ~30 câu khách thật lấy từ `pancake_conversations` (chỉ trong bộ nhớ, không ghi file commit), đếm `chanTuGui` rỗng / tổng và chi phí token; ghi kết quả + model chọn vào README. Báo anh Dũng chọn.
- [ ] **Step 3:** README (RUNBOOK): bật/tắt (`PANCAKE_TU_GUI`), đổi page, đổi giờ, xem log `~/Bots/logs/pancake-app.log`, kiểm bot cũ tắt, quay về bot cũ, câu SQL kiểm (`select … from chatbot.pancake_conversations where discord_bao_luc > now() - interval '1 day'`).
- [ ] **Step 4:** `npx --prefix apps/web tsc --noEmit` + `npm --prefix apps/web run test` + `npm --prefix apps/web run build` sạch. **Step 5:** Commit; push nhánh + mở PR vào `rework/v2.0.0` khi anh Dũng đồng ý.

### Task 12: Mac mini — đợt thử

**Files:** GWT-Agent-Team: Modify `mac/cai-launchd.sh`, `mac/chay-dinh-ky.sh`; Create `mac/pancake-app.sh` (nhánh riêng, PR riêng ở repo đó).

- [ ] **Step 1:** `pancake-app.sh`: `cd ~/Bots/gwt-app-pancake && ENV_FILE=~/Bots/.secrets/gwtapp-pancake.env exec /opt/homebrew/bin/node apps/web/scripts/pancake-luot.ts "$@"`. Nhãn `com.gwt.pancake.app` mỗi 60 giây vào `cai-launchd.sh` (cả hai vòng `for n`, như các nhãn khác) và `chay-dinh-ky.sh`.
- [ ] **Step 2:** Trên Mac mini: clone gwt-app vào `~/Bots/gwt-app-pancake`, checkout nhánh đã merge; anh Dũng tạo file env (600) và webhook kênh báo; `launchctl print-disabled` xác nhận `com.gwt.pancake` disabled, gỡ plist của nó.
- [ ] **Step 3:** Bật `PANCAKE_TU_GUI=thu`, `PANCAKE_TU_GUI_TRANG=214555728409778`, `PANCAKE_GIO_BOT=18:00-22:00`, 1–2 đêm. Gửi anh Dũng + anh Như tổng số và 10 câu "SẼ gửi".
- [ ] **Step 4:** Gửi anh Dũng đúng file cấu hình đợt thử (tên biến + giá trị không bí mật) → **chờ anh đồng ý** → đổi `bat`. Theo dõi đêm đầu trên kênh Discord.
- [ ] **Step 5:** Ghi RUNBOOK đợt thử (ngày bật, cấu hình) vào README; báo kết quả.
