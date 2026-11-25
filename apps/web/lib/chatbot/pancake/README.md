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

Env: `ENV_FILE` được nạp vào `process.env`; biến đặt inline (`PANCAKE_TU_GUI=thu node …`) hoặc từ launchd THẮNG file; trùng khoá trong file thì dòng SAU thắng.
Thư mục sổ đếm không ghi được → `{"loi":"DEM_DIR_HONG"}`, thoát 1 (không chạy, để trần/ngày không mở toang).

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

Hai bot cùng chạy = khách nhận tin đôi. Plist `com.gwt.pancake` do `GWT-Agent-Team/mac/cai-launchd.sh --chi com.gwt.pancake` cài (không phải từ GWT-ERP `scripts/chatbot/mac/`).
**Tắt = CẢ HAI lệnh** (chỉ `bootout` thì lần chạy `cai-launchd.sh` sau nạp lại):

```bash
launchctl bootout gui/$(id -u)/com.gwt.pancake
launchctl disable gui/$(id -u)/com.gwt.pancake
```

Rồi gỡ `com.gwt.pancake` khỏi danh sách nhãn của `cai-launchd.sh`. Kiểm:

```bash
launchctl print gui/$(id -u)/com.gwt.pancake          # phải báo "Could not find service"
launchctl print-disabled gui/$(id -u) | grep pancake  # com.gwt.pancake => disabled
```

Nhãn mới `com.gwt.pancake.app` tắt theo đúng cách: `bootout` + `disable` (bật lại: `enable` + `bootstrap`).

## Quay về bot cũ

Không bao giờ bật cả hai cùng lúc — tắt bản mới TRƯỚC:
1. `launchctl bootout gui/$(id -u)/com.gwt.pancake.app` rồi `launchctl disable gui/$(id -u)/com.gwt.pancake.app` (và đặt `PANCAKE_TU_GUI=tat`).
2. Thêm lại `com.gwt.pancake` vào danh sách nhãn của `cai-launchd.sh`, rồi `launchctl enable gui/$(id -u)/com.gwt.pancake` và `bash GWT-Agent-Team/mac/cai-launchd.sh --chi com.gwt.pancake` (bootstrap).
3. Hội thoại bản mới đã `da_xu_ly` nên bot cũ không trả lại tin cũ.

## Kiểm bằng SQL

```sql
select page_id, count(*) as da_bao
from chatbot.pancake_conversations
where discord_bao_luc > now() - interval '1 day'
group by 1 order by 2 desc;
```

## Model GPT soạn trả lời

Chọn **gpt-6.1-terra**: `PANCAKE_TRA_LOI_MODEL=gpt-6.1-terra`. Bot gọi `/v1/responses` (không phải chat/completions) vì gpt-5.6+/6.x từ chối function tools trên chat/completions.

Đo 25/11/2026 trên 30 câu khách thật; "câu có ý không căn cứ" do gpt-5.5-pro chấm đối chiếu kết quả tool.

| model | số câu | tự gửi được | câu có ý không căn cứ / ý | token vào/ra | giây/câu |
|---|---|---|---|---|---|
| gpt-6.1-terra (CHỌN) | 30 | 26 | 0 / 0 | 428k / 20k | 15,9 |
| gpt-5.5 | 30 | 25 | 1 / 5 | 447k / 32k | 13,6 |
| gpt-5.6-terra | 30 | 26 | 2 / 4 | 392k / 23k | 9,8 |
| gpt-6.2-sol | 30 | 26 | 1 / 5 | 470k / 19k | 13,8 |
| gpt-5.4-mini (đo trước khi sửa lỗi giá KM) | 30 | 23 | — (4 câu bị rào "căn cứ không khớp") | 399k / 17k | 3,5 |
