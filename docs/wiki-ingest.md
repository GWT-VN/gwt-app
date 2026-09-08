# Wiki Training Ingest — Q&A từ Discord training vào `/wiki`

Spec: `docs/specs/2026-09-08-wiki-training-ingest-design.md` · Plan lát 1:
`docs/plans/2026-09-08-wiki-training-ingest-lat-1.md`. Quy trình wiki nói chung: `docs/wiki-cap-nhat.md`.

## Hình (3 khúc)

```
Discord 3 kênh training ──(routine cloud claude.ai, mỗi sáng)──▶ lọc Q&A + che PII
        │ GET /api/wiki-ingest/watermark  (bearer)
        │ POST /api/wiki-ingest            (bearer)  → wiki.proposals (pending)
        ▼
/wiki/de-xuat (admin|ceo) sửa · tick "đã rà PII" · Duyệt / Từ chối
        ▼
/wiki/<khu>/hoi-dap  (trang ĐỘNG, mọi nhân sự)  — Q&A đã duyệt, hạng D
```

- **App không ghi file, không commit**: Q&A đã duyệt sống trong DB (`wiki.proposals.status = approved`).
  Bài tĩnh `content/wiki/` vẫn theo flow `sync:wiki` cũ.
- **Q&A về sản phẩm** (`khu = san-pham`, `can_pkb = true`) **không duyệt được** ở màn này — PM đưa vào
  PKB Phần 6 của máy theo `docs/wiki-cap-nhat.md` §2 (một bản sự thật). Người duyệt có thể đổi khu
  nếu routine đoán sai.

## DB

Schema `wiki` (migration `20260908080000_wiki_00_de_xuat.sql`), 3 bảng `proposals` · `watermarks` ·
`ingest_runs`; RLS bật, 0 policy; app đi qua 11 RPC `public.wiki_*` (service_role-only). Gác:
`wiki.nv` (mọi nhân sự hoạt động — đọc, đếm) và `wiki.nv_duyet` (`admin|ceo` — duyệt/sửa/từ chối).
Smoke: `tools/scripts/smoke_local.py` khối "Khu Wiki ingest" (CI `db-reset`).

## Endpoint (cho routine)

| | |
|---|---|
| Auth | `Authorization: Bearer <WIKI_INGEST_SECRET>` — so timing-safe; thiếu env → 503, sai → 401 |
| `GET /api/wiki-ingest/watermark` | `{ "<kenh_id>": "<last_message_id>" }` — routine gọi trước, rồi Discord `after=` |
| `POST /api/wiki-ingest` | body xem dưới; ≤ 200 item, ≤ 1 MB; 400 shape sai (không lưu gì) |
| Trả về | `{ them, bo_qua_trung, tu_choi_pii: [message_id…] }` |

```json
{ "kenh_id": "1484057657043189860", "watermark_moi": "1486224918499692656",
  "items": [{ "message_id": "1486224918499692654", "thread_id": null,
              "cau_hoi": "…", "tra_loi": "…", "nguoi_tra_loi": "Minh Ánh",
              "tra_loi_luc": "2026-09-07T03:10:00Z",
              "jump_link": "https://discord.com/channels/<guild>/<channel>/<message>",
              "nguon_ids": ["…"], "khu_goi_y": "sales", "do_tin_cay": 0.82 }] }
```

Luật xử lý (`apps/web/lib/wiki-ingest/`): validate tay (`kiem-tra.ts`, không zod) → item còn **SĐT VN /
email** bị loại, không lưu, trả trong `tu_choi_pii` → `wiki_ingest_nhan` (unique `(kênh, message_id)`,
trùng → `bo_qua_trung`) → **chỉ khi lô đã vào** mới `wiki_watermark_set` → `wiki_ingest_run_ghi`.
POST lỗi giữa chừng → watermark giữ nguyên, lần sau quét lại, khoá `message_id` chặn trùng.

`proxy.ts` miễn đăng nhập prefix `/api/wiki-ingest` (route tự gác bearer, không có session).

`khu_goi_y` hợp lệ: `cong-viec-chung` · `sales` · `cskh` · `van-hanh` · `tai-chinh` · `kien-thuc-nen` ·
`san-pham`; khác/thiếu → app đặt `cong-viec-chung`, người duyệt sửa.

## Secret & env (Dũng làm, Claude không cầm giá trị)

| Biến | Ở đâu | Ghi chú |
|---|---|---|
| `WIKI_INGEST_SECRET` | Vercel (production) **và** routine | chuỗi ngẫu nhiên ≥ 32 ký tự, cùng giá trị hai nơi; local dùng giá trị khác trong `.env.local` |
| `DISCORD_BOT_TOKEN` | chỉ routine | bot cần View Channel + Read Message History trên 3 kênh |

Routine **không** giữ Supabase key.

## Dựng routine (SAU khi merge `main` — endpoint phải tồn tại trên production trước)

1. Duplicate routine **ai-digest** (thừa hưởng env mở network + cron + GitHub App). Cron ~06:30 VN.
2. Env phải là loại **mở network** (không Trusted mặc định). Nếu allowlist: thêm host Vercel của gwt-app
   (production). Không cần host Supabase (routine không gọi DB).
3. Secrets: `WIKI_INGEST_SECRET`, `DISCORD_BOT_TOKEN`. Kênh: 3 id trong `channels.json` của bot
   `training-digest` (repo GWT-Handbook). Ánh xạ khu mặc định: `sales-cskh`→`sales`,
   `nhan-su-moi`→`cong-viec-chung`, `minh-anh-ctv-fanpage`→`cskh`.
4. Prompt routine (tóm tắt): với mỗi kênh: `GET watermark` → Discord `GET /channels/{id}/messages?after=<wm>&limit=100`
   (phân trang tới hết, kể cả thread) → gom cặp hỏi–đáp kỹ thuật/nghiệp vụ (bỏ chit-chat, bỏ tin không có
   trả lời) → **che PII** (SĐT, email, tên khách → `[khách]`) → chuẩn hoá theo shape trên, `message_id` =
   tin trả lời, `nguon_ids` = mọi tin gộp, `khu_goi_y` + `do_tin_cay` → POST theo lô ≤ 200,
   `watermark_moi` = id tin mới nhất **đã đọc** (kể cả tin không thành Q&A) → log `{them, bo_qua_trung,
   tu_choi_pii}`. Lỗi Discord/endpoint → dừng kênh đó, không dời watermark, log.
5. Nghiệm thu: routine chạy tay 1 lần → 2xx → `/wiki/de-xuat` hiện pending + "Lần quét cuối" → duyệt 1
   dòng → thấy ở `/wiki/<khu>/hoi-dap`.

## Màn hình

- `/wiki/de-xuat` — `admin|ceo`; tab Chờ duyệt / Đã duyệt / Đã từ chối; mỗi dòng: sửa câu hỏi, trả lời
  (markdown), khu; tick "đã rà PII"; **Lưu** · **Duyệt & đăng** (tự lưu trước) · **Từ chối/Gỡ khỏi wiki**
  (lý do). Badge số pending ở sidebar (chỉ người duyệt thấy).
- `/wiki/<khu>/hoi-dap` — 5 khu tài liệu; banner hạng D; mỗi Q&A có người trả lời, ngày, link Discord.

## Bẫy đã gặp / lưu ý

- Route động `[khu]/[slug]` nuốt mọi slug → `hoi-dap` phải là segment tĩnh `[khu]/hoi-dap/page.tsx`.
- Nhánh này đặt **trên** `feat/ke-toan-hoa-don` vì CI `db-reset` + smoke + bộ migration hợp thức hoá chưa
  lên `main` — merge Kế toán trước.
- Dev local trên Windows: `next dev --webpack` (Turbopack từ chối `node_modules` junction), cổng **3000**
  (Supabase Auth chỉ cho Google quay về `localhost:3000`).

## Việc treo sau lát 1

a. Duyệt theo khu (vai `sales_manager` duyệt sales…) — bảng đã có `khu`, chỉ cần đổi `wiki.nv_duyet`.
b. Sửa Q&A sau publish có lịch sử (hiện sửa đè, không log).
c. Thông báo lỗi routine ra Discord/email (hiện chỉ "Lần quét cuối").
d. Đưa Q&A `can_pkb` vào PKB có công cụ (hiện làm tay).
e. Tìm kiếm wiki (`search-index`) chưa gồm Q&A động.
f. 2 item `[THỬ NGHIỆM]` nạp 08/09 trên production để CEO xem màn duyệt — từ chối sau khi xem.
