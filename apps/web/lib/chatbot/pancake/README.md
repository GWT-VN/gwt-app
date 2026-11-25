# Bot Pancake tự trả lời — RUNBOOK

Mỗi lượt: `launchd` gọi script → đọc hội thoại mới → phân loại (Claude) → soạn (GPT) → gửi / chuyển người, báo Discord.
Thiết kế: `docs/specs/2026-11-25-chatbot-pancake-gwt-app-design.md`.

## Chạy

```bash
# dùng bản gwt-app riêng của job trên Mac mini (vd ~/Bots/gwt-app-pancake), Node ≥ 24
ENV_FILE=~/Bots/.secrets/gwtapp-pancake.env \
  node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON apps/web/scripts/pancake-luot.ts        # theo PANCAKE_TU_GUI
# thêm --kho: chạy khô — ép chế độ "thu" (không gửi gì cho khách), webhook Discord nhận dòng ✉️ THỬ
```

Stdout: đúng một dòng JSON mỗi page `{"trang":…,"viec":…,"gui":…}`; thoát 1 nếu có `loi`. Không in chữ khách / SĐT / khoá.

Biến env (xem `.env.example`): `PANCAKE_TU_GUI` `PANCAKE_PAGES` `PANCAKE_PAGE_TOKEN_<id>` `PANCAKE_TU_GUI_TRANG` `PANCAKE_GIO_LAM`
`PANCAKE_GIO_BOT` `PANCAKE_TRAN_NGAY` `PANCAKE_DEM_DIR` `PANCAKE_HOTLINE` `PANCAKE_PHAN_LOAI_MODEL` `PANCAKE_TRA_LOI_MODEL`
`PANCAKE_PING_KHIEU_NAI` `DISCORD_WEBHOOK_PANCAKE_BAO` `SUPABASE_URL` `SUPABASE_SERVICE_ROLE_KEY` `ANTHROPIC_API_KEY` `OPENAI_API_KEY`.
Sai / thiếu biến nào → in `{"loi":"…"}` (chỉ nêu tên biến) và thoát 1, không gửi gì.

## Bật / tắt

Sửa `PANCAKE_TU_GUI` trong file env (lượt sau có hiệu lực, không cần khởi động lại):
- `tat` — không làm gì. · `thu` — phân loại + soạn + báo Discord nhưng KHÔNG gửi khách. · `bat` — tự gửi.

Khi nghi ngờ: đặt `tat` trước, tìm nguyên nhân sau.

## Đổi page

`PANCAKE_PAGES` (JSON id + tên ≤ 14 ký tự) + `PANCAKE_PAGE_TOKEN_<id>`; page nào được tự gửi thì có id trong `PANCAKE_TU_GUI_TRANG`.
Page Zalo cá nhân (`pzl_`) và Shopee (`spo_`) không bao giờ được tự gửi. Thêm page mới: chạy `thu` một thời gian rồi mới đưa vào `PANCAKE_TU_GUI_TRANG`.

## Đổi giờ

- `PANCAKE_GIO_LAM` (mặc định `1-6 08:00-18:00`, giờ VN): trong giờ này bot im, nhân viên làm.
- `PANCAKE_GIO_BOT` (vd `18:00-22:00`): bot chỉ chạy trong khung này; bỏ trống = mọi giờ ngoài giờ làm.
- `PANCAKE_TRAN_NGAY` (mặc định 20): trần số hội thoại bot gửi mỗi page mỗi ngày. Sổ đếm ở `~/Bots/state/pancake-app-dem-<pageId>.json`
  (đổi thư mục bằng `PANCAKE_DEM_DIR`); xoá file = đếm lại từ 0 trong ngày.

## Log

`~/Bots/logs/pancake-app.log` (stdout + stderr của launchd). Mỗi lượt vài dòng JSON như trên. Lỗi là mã ngắn (`PANCAKE_HTTP_429`, `CLAUDE_HTTP_529`…).

## Bot cũ phải tắt

Hai bot cùng chạy = khách nhận tin đôi. Kiểm trước khi bật bản mới:

```bash
launchctl print gui/$(id -u)/com.gwt.pancake    # phải báo "Could not find service" hoặc disabled
launchctl print-disabled gui/$(id -u) | grep pancake
```

## Quay về bot cũ

1. Đặt `PANCAKE_TU_GUI=tat` (hoặc gỡ nhãn `com.gwt.pancake.app`): `launchctl bootout gui/$(id -u)/com.gwt.pancake.app`.
2. Bật lại bot cũ: `launchctl enable gui/$(id -u)/com.gwt.pancake` rồi nạp lại plist của nó (repo GWT-ERP `scripts/chatbot/mac/`).
3. Hội thoại bản mới đã `da_xu_ly` nên bot cũ không trả lại tin cũ.

## Kiểm bằng SQL

```sql
select page_id, count(*) as da_bao
from chatbot.pancake_conversations
where discord_bao_luc > now() - interval '1 day'
group by 1 order by 2 desc;
```

## Model GPT soạn trả lời

Chưa chọn — điền sau khi đo trên ~30 câu khách thật (chạy `soanTuTra`, chỉ giữ kết quả trong bộ nhớ). Đặt vào `PANCAKE_TRA_LOI_MODEL`.

| model | số câu | chanTuGui rỗng/tổng | token |
|---|---|---|---|
| | | | |
