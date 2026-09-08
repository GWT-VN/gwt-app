# Wiki Training Ingest — quét Discord training → đề xuất → duyệt → `/wiki`

Handoff gốc: `handoff-2026-09-08-wiki-training-ingest.md` (phiên GWT-Handbook). Grilling 08/09/2026
(Dũng): Q1–Q18 chốt **theo đề xuất**. Spec này là bản chốt để viết plan.

## 1. Mục tiêu

"Chạy định kỳ quét từ tin nhắn lần cuối quét được, sau đó đẩy lên wiki qua gwt-app." Nguồn: 3 kênh
training Discord. Đích: wiki nội bộ `/wiki`, **qua cửa duyệt** — không tự động lên thẳng.

## 2. Quyết định đã chốt

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Nội dung | Q&A đã lọc (không tin thô, không digest) |
| 2 | Nơi chạy quét | Cloud routine claude.ai, duplicate ai-digest làm khung |
| 3 | Cửa duyệt | Bắt buộc; bảng đề xuất trong app, người duyệt trong `/wiki` |
| 4 | Kênh | Cả 3 kênh training |
| 5 | Chỗ ở tính năng | Dồn hết vào gwt-app; bot `training-digest` ở Handbook giữ nguyên (legacy) |
| Q1 | Nhịp cron | 1 lần/ngày ~06:30 VN |
| Q2 | Watermark | DB gwt-app, routine hỏi qua `GET /api/wiki-ingest/watermark`; chỉ tăng sau POST 2xx |
| Q3 | LLM lọc | Trong routine; endpoint chỉ nhận Q&A đã chuẩn hoá, validate chặt, `khu` chỉ là gợi ý |
| Q4 | Ai duyệt | Lát 1: vai `admin` \| `ceo`; bảng có cột `khu` để bật duyệt-theo-khu sau |
| Q5 | PII | Routine che (regex + LLM) → app quét lại SĐT/email, còn thì **422 từ chối cả item**; tên khách giao người duyệt tick "đã rà PII" |
| Q6 | Chống trùng | unique `(channel_id, message_id)` của tin trả lời; upsert bỏ qua; đã duyệt/từ chối = routine không đụng |
| Q7 | Phân loại khu | Routine đoán 1/6 khu + độ tin cậy; người duyệt sửa. Q&A **về sản phẩm** không publish — đánh dấu `can_pkb`, PM đưa vào PKB Phần 6 theo `docs/wiki-cap-nhat.md` §2 |
| Q8 | "Publish" | Wiki hiện tĩnh (bake lúc build), app không ghi file → Q&A đã duyệt sống trong **DB**, `/wiki/<khu>/hoi-dap` đọc động. Không commit git, không deploy |
| Q9 | DB | Schema `wiki` mới, RPC `public.wiki_*` service_role-only, migration ở `gwt-app/supabase/migrations` (repo giữ schema `bwzmq…`), CI db-reset + smoke qua PostgREST |
| Q10 | Endpoint | `POST /api/wiki-ingest` bearer `WIKI_INGEST_SECRET`; ≤200 item/lô, body ≤1 MB; `GET …/watermark` |
| Q11 | Trang động | `/wiki/<khu>/hoi-dap` cho 5 khu tài liệu (không có cho `san-pham`) |
| Q12 | Màn duyệt | `/wiki/de-xuat`: pending theo khu, sửa inline, tick PII, Duyệt/Từ chối (lý do), tab đã duyệt/từ chối, gỡ = về rejected |
| Q13 | Mô hình | `wiki.proposals`, `wiki.watermarks`, `wiki.ingest_runs` (xem §4) |
| Q14 | Kênh→khu mặc định | `sales-cskh`→`sales`, `nhan-su-moi`→`cong-viec-chung`, `minh-anh-ctv-fanpage`→`cskh` (routine gửi, app không cứng) |
| Q15 | Lỗi routine | Chỉ log; màn duyệt hiện "lần quét cuối" từng kênh |
| Q16 | Secret | `WIKI_INGEST_SECRET` (Vercel + routine), `DISCORD_BOT_TOKEN` chỉ ở routine. Claude không cầm giá trị |
| Q17 | Môi trường | Xây tracer bullet 1–3 local (cắm prod), merge main, routine dựng SAU (trỏ production) |
| Q18 | Hạng | Mọi Q&A từ training = **hạng D**, hiện tên người trả lời (nội bộ) |

## 3. Sự thật nền (agent tra 08/09)

- gwt-app **giữ schema** `bwzmqfbcgouhvhoslmmm` (82 migration, CI `db-reset` replay từ 0).
- `/wiki` **tĩnh** 100%; app không ghi file lúc chạy; DB duy nhất đọc lúc chạy là Supabase Marketing (project khác).
- Bộ quét PII repo (`tools/scripts/scan_pii_secrets.py`) là Python CLI, bắt SĐT VN + secret — app cần bộ quét TS riêng.
- Chưa có endpoint bearer/cron; `proxy.ts` chỉ miễn đăng nhập `/login`, `/auth` → phải thêm `/api/wiki-ingest`.
- `/wiki` gác `requireNhanSu()`; vai có `admin`, `ceo`; không có gate theo khu wiki.

## 4. Dữ liệu — schema `wiki`

```
wiki.proposals
  id bigint identity pk
  channel_id text not null            -- id kênh Discord
  message_id text not null            -- id tin TRẢ LỜI (khoá chống trùng)
  thread_id text
  question text not null
  answer text not null
  answered_by text                    -- tên hiển thị Discord (nhân viên/CTV)
  answered_at timestamptz             -- thời điểm tin trả lời
  jump_link text not null
  source_ids jsonb not null default '[]'   -- mọi message id gộp thành Q&A này
  khu_goi_y text                      -- routine đoán
  khu text not null                   -- người duyệt chốt (mặc định = khu_goi_y)
  confidence numeric(3,2)
  can_pkb boolean not null default false   -- Q&A về sản phẩm → không publish, chờ PM đưa vào PKB
  status text not null default 'pending' check in ('pending','approved','rejected')
  pii_checked boolean not null default false
  reviewed_by uuid references public.staff(id)
  reviewed_at timestamptz
  reject_reason text
  created_at, updated_at timestamptz
  unique (channel_id, message_id)
wiki.watermarks (channel_id text pk, last_message_id text not null, updated_at)
wiki.ingest_runs (id, channel_id, received int, inserted int, skipped int, rejected int, at timestamptz)
```

`khu` ∈ {`cong-viec-chung`,`sales`,`cskh`,`van-hanh`,`tai-chinh`,`kien-thuc-nen`,`san-pham`} — check constraint;
`san-pham` bắt buộc `can_pkb = true`.

RLS bật, 0 policy; chỉ service_role (khuôn `accounting`). RPC `public.wiki_*` security definer,
`search_path = ''`, chỉ service_role execute:

| RPC | Gọi từ | Việc |
|---|---|---|
| `wiki_ingest_nhan(p_kenh_id, p_items jsonb)` | endpoint | upsert `on conflict do nothing`; trả `{them, bo_qua}` |
| `wiki_watermark_get()` / `wiki_watermark_set(p_kenh_id, p_message_id)` | endpoint | |
| `wiki_ingest_run_ghi(p_kenh_id, p_received, p_inserted, p_skipped, p_rejected)` | endpoint | |
| `wiki_de_xuat_list(p_email, p_status)` | màn duyệt | gác `wiki.nv_duyet` (admin\|ceo) |
| `wiki_de_xuat_sua(p_email, p_id, p_question, p_answer, p_khu, p_pii_checked)` | màn duyệt | chỉ khi `pending`/`approved` |
| `wiki_de_xuat_duyet(p_email, p_id)` | màn duyệt | pending→approved; đòi `pii_checked`; `can_pkb` thì lỗi |
| `wiki_de_xuat_tu_choi(p_email, p_id, p_ly_do)` | màn duyệt | pending/approved→rejected |
| `wiki_de_xuat_dem(p_email)` | sidebar | số pending (mọi nhân sự đọc được số) |
| `wiki_hoi_dap(p_email, p_khu)` | trang động | approved, mới nhất trước; gác `wiki.nv` (mọi nhân sự) |
| `wiki_lan_quet(p_email)` | màn duyệt | watermark + run cuối từng kênh |

## 5. Endpoint

`POST /api/wiki-ingest` — header `Authorization: Bearer <WIKI_INGEST_SECRET>` (so sánh timing-safe;
thiếu env → 503). Body:

```json
{ "kenh_id": "1484057657043189860", "watermark_moi": "1486224918499692654",
  "items": [{ "message_id": "…", "thread_id": null, "cau_hoi": "…", "tra_loi": "…",
              "nguoi_tra_loi": "Minh Ánh", "tra_loi_luc": "2026-09-07T03:10:00Z",
              "jump_link": "https://discord.com/channels/g/c/m", "nguon_ids": ["…"],
              "khu_goi_y": "sales", "do_tin_cay": 0.82 }] }
```

Xử lý: validate shape (tự viết, không thêm dep) → quét PII từng item (SĐT VN `0[35789]\d{8}`,
`+84…`, email) → item có PII vào `tu_choi_pii` (không lưu) → `wiki_ingest_nhan` → nếu có
`watermark_moi` và không lỗi → `wiki_watermark_set` → `wiki_ingest_run_ghi`. Trả 200
`{ them, bo_qua_trung, tu_choi_pii: [message_id…] }`. 401 sai secret; 400 shape sai (không lưu gì);
413 quá 200 item/1 MB.

`GET /api/wiki-ingest/watermark` — cùng bearer → `{ "<kenh_id>": "<last_message_id>" }`.

`proxy.ts`: thêm `/api/wiki-ingest` vào `DUONG_CONG_KHAI` (route tự gác bằng bearer).

## 6. Màn hình

- `/wiki/de-xuat` (chỉ `admin`\|`ceo`; người khác → `/wiki?loi=khong_du_quyen`): tab Chờ duyệt / Đã duyệt / Đã
  từ chối; bảng: khu (chọn), câu hỏi, trả lời, người trả lời, link Discord, cờ `can_pkb`, tick PII;
  nút Lưu · Duyệt · Từ chối (lý do). Đầu trang: "Lần quét cuối" từng kênh. Sidebar mọi khu có mục
  "Đề xuất từ training" + badge pending (chỉ hiện cho người duyệt).
- `/wiki/<khu>/hoi-dap` (5 khu tài liệu): `dynamic = 'force-dynamic'`, mọi nhân sự; mỗi Q&A: câu hỏi,
  trả lời (markdown), người trả lời · ngày · link Discord; banner hạng D. Sidebar khu có mục
  "Hỏi–đáp từ training".

## 7. Ngoài phạm vi lát 1

Routine cloud (dựng sau merge, có tài liệu hướng dẫn trong `docs/wiki-ingest.md`); duyệt theo khu;
đưa Q&A sản phẩm vào PKB; thông báo lỗi routine ra Discord/email; sửa Q&A sau publish có lịch sử.

## 8. Bẫy đã biết

- PostgREST `safeupdate`: mọi UPDATE/DELETE trong RPC phải có WHERE; smoke gọi qua `/rest/v1/rpc`.
- Action nào có `try` phải `await` gác trước `try` (không nuốt redirect).
- Route `[khu]/[slug]` động: `hoi-dap` phải là route tĩnh `[khu]/hoi-dap/page.tsx` để thắng.
