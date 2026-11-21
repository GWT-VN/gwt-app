# Chép shadcn về DS v2 — kế hoạch đợt

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development hoặc superpowers:executing-plans. Mỗi đợt = 1 agent.

**Goal:** Mọi component shadcn/ui có (bản **Radix**) phải nằm trong DS v2 với **đúng khung shadcn** (file, export, `data-slot`, cách nối Radix, tên prop), mặc **token ChatGPT**. Phần GWT thêm giữ lại như phần cộng thêm. Tuỳ biến sâu để sau.

**CEO chốt (21/11):** "Xem cái nào cần chép thì chép hết. Xong rồi mới gán token + màu sắc của chatgpt" · "Cứ lấy hết về gán lại token đã rồi sau đó sẽ customize sau" · "Radix tiếp tục đi".

**Nguồn sự thật:**
- Bảng đối chiếu + đợt + giấy phép: `docs/rework/2026-11-21-doi-chieu-shadcn.md` (mục 2 bảng, mục 4 đợt). **Đọc trước.**
- Mã gốc shadcn `new-york-v4` @ `45bbf9ba23c9c0f63d38887947e5fb06f59c7da3`, đã tải ở
  `C:\Users\Duncr\AppData\Local\Temp\claude\d2fa843791a29a0f\9d5dc202-19a7-43e4-bf9a-2b7a84a1d1c8\scratchpad\shadcn-goc\` (chỉ đọc).
- Luật DS: `apps/web/ds/NGUON.md`. Ghi công: `components/ui/THIRD-PARTY-NOTICES.md`.

## Quyết định (ruling) — thay Q1–Q4 của bảng đối chiếu

- **R18 — Radix**, không Base UI.
- **R19 — Tên/prop theo shadcn.** Export đủ các phần shadcn có, `data-slot` đúng shadcn, `variant`/`size` với đúng giá trị shadcn. Phần GWT
  (vd `color`, `soft`/`solid`, `phim`, `icon`, `MenuTimKiem`, `checked='indeterminate'`) là **cộng thêm** — không đổi tên phần shadcn để
  chứa nó. Luật NGUON "màu luôn `color`" sửa thành: shadcn `variant` trước, `color` là phần GWT thêm.
- **R20 — Tooltip:** export 4 phần như shadcn (`Tooltip` = Root). Hàm tiện GWT `<Tooltip content=…>` đổi tên **`TooltipNhanh`** (Đợt 3).
- **R21 — Combobox** giữ bản cmdk (chưa cài `@base-ui/react`), ghi "C có chủ đích" — hỏi lại CEO ở Đợt 7. **Form** chưa chép (tab Radix
  có `form.tsx` nhưng DS dùng FormLayout + server action) — hỏi lại khi có màn cần.
- **R22 — Tên file theo shadcn** (`input-group.tsx`, `sonner.tsx`, `empty.tsx`…). Tên khối `/ds` + cổng so khớp **giữ tên artifact**
  (InputAffix, Toast, EmptyState) để còn so với artifact — ghi ánh xạ trong README khối.
- **R23 — Không màn nghiệp vụ nào dùng DS v2** → chép lại thẳng, sửa mọi chỗ gọi trong `components/ui`, `app/ds`, `app/prototype` cùng đợt.

## Quy trình mỗi component (theo thứ tự, không đảo)

1. Chép **nguyên văn** file `new-york-v4` vào `components/ui/<ten-shadcn>.tsx`. Dòng đầu: `// Nguồn: shadcn/ui new-york-v4 @45bbf9b (MIT) — xem THIRD-PARTY-NOTICES.md`.
2. Đổi phần bắt buộc: `cn` (`@/lib/utils`), icon lucide → Phosphor, Portal → `container={useDsPortal()}`, z theo thang NGUON.
3. Gán token ChatGPT: thay class shadcn bằng class/giá trị DS hiện có (`*-styles.ts`, `bundle.css`). Cổng so khớp phải ra **cùng số** như
   trước khi chép.
4. Ghép lại phần GWT đang có (bảng đối chiếu cột "Chi tiết lệch"), như phần cộng thêm.
5. Sửa test, `ds/so-khop/<c>.json` (chọn phần tử theo `data-slot` mới), khối `/ds`, mọi chỗ gọi.
6. Component **mới** (DS chưa có): khối `app/ds/_khoi/khoi-<neo>.tsx` export `Khoi<Ten>` + `Khoi<Ten>Hang`, đăng ký ở file `dk-sc-<đợt>.ts`
   của đợt (người điều phối đã nối vào `khoi.ts`/`hang.ts`), README `ds/nguon/components/<Ten>/README.md` ghi "chưa có trong artifact —
   nguồn shadcn new-york-v4". Không có cổng so khớp (artifact chưa có) → đo `getComputedStyle` khớp token, ghi số vào báo cáo.

## Global Constraints

- Nhánh `rework/v2.0.0`, worktree `gwt-worktrees/rework-v2.0.0`, app `apps/web`. Không push, không merge `main`, không `stash`, không
  `git add -A`. Commit tiếng Việt có dấu, prefix conventional, kết `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Chỉ sửa file của đợt mình** (bảng mục 4 + file khối/test/so-khop đi kèm). File của đợt khác hoặc `khoi.ts`/`hang.ts`/`NGUON.md`/
  `package.json` → ghi báo cáo.
- Thư viện mới: **người điều phối cài**. Đã cài: `vaul` 1.1.2, `input-otp` 1.5.0.
- Môi trường: **không có Bash**, chỉ PowerShell 5.1 (không `&&`). git/node/npx/Chrome chạy với `dangerouslyDisableSandbox: true`, đầu lệnh
  `$env:PATH = [Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [Environment]::GetEnvironmentVariable('PATH','User')`.
- Dev server dùng chung `http://127.0.0.1:3401` — không bật server khác, không pkill, không đăng nhập. Script CDP mẫu:
  `…\scratchpad\task4\cdp.mjs` — chép sang thư mục scratchpad riêng của đợt.
- **Kiểm trước khi báo:** `npx tsc --noEmit` · `npx vitest run` cả bộ (nêu ca hỏng + có phải của đợt khác) · `npx eslint` file của mình ·
  cổng so khớp **mọi component đợt mình đụng** (`node ds/so-khop.mjs <C> --url http://127.0.0.1:3401`) thoát 0, `git diff ds/so-khop/*.md`
  trước commit · Chrome headless CDP bấm thật sáng/tối 1440/390, console 0 lỗi.
- Bẫy (NGUON): `outline-none` + `focus-visible:outline-*` mất vòng focus; `asChild` đè `data-state`; overlay phải `preventDefault` Esc;
  Radix Popper 0-size trong jsdom; `page.tsx` server không import giá trị từ file `'use client'`.
- Báo cáo: SHA · bảng component → mức (A/B/C) → đã làm → cổng (số khớp) · thứ shadcn có mà cố ý không chép + lý do · chỗ gọi đã sửa ·
  điều chưa kiểm.
