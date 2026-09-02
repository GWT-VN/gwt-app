# Quy trình Claude Code cho GWT-App

> Dành cho **mọi phiên code** trong repo này — CEO lẫn dev thuê ngoài.
> Dựng 26/08/2026. Nguồn cảm hứng: Code with Claude (Boris Cherny — Claude Code
> tips; Mike Krieger — keynote). Đã lược bỏ những thứ không hợp repo này.
>
> `CLAUDE.md` là **luật**; file này là **cách vận hành luật đó**.

---

## 1. Năm phút đầu của một phiên

```bash
bash tools/wt.sh ds        # xem phiên khác đang giữ worktree nào — LUÔN chạy trước
```

Rồi gõ **`/giao-viec <khu> <việc>`** trong Claude Code. Ví dụ:

```
/giao-viec sales lọc đơn theo khoảng ngày
```

Lệnh này tự làm đủ: chọn tên nhánh đúng quy ước, tạo worktree ngoài iCloud, chọn
cổng theo khu, đọc backlog của khu đó. Trước đây mỗi phiên phải tự đọc `CLAUDE.md`
rồi nhớ 8 bước — và đã có phiên nhớ sai.

**Không sửa code ở thư mục gốc.** Gốc chỉ đứng ở `main` để đọc.

Xong việc thì gõ **`/xong`** — nó chạy đủ chuỗi: `tsc` → `test` → `build` →
tự review → đối chiếu DB (nếu đụng migration) → cập nhật backlog → push → mời CEO xem.

---

## 2. Cái tự chạy, không cần nhớ

Cấu hình ở `.claude/settings.json` (có commit, cả đội dùng chung).

### 2.1 Sửa file `.ts` → soát kiểu ngay

Mỗi khi Claude sửa một file `.ts`/`.tsx` trong `apps/web`, hook chạy `tsc --noEmit`
**chạy nền** rồi đánh thức Claude nếu có lỗi.

| | |
|---|---|
| Script | `tools/hook_tsc.sh` |
| Tốc độ | ~6,6s lần đầu · **~1,3s** các lần sau (`--incremental`) |
| Không chặn | `async: true` — bạn gõ tiếp bình thường, lỗi tới sau |
| File khác `.ts` | thoát trong 6ms, không tốn gì |

Vì sao cần: trước đây lỗi kiểu chỉ lộ ra ở bước "tự kiểm trước khi gọi CEO" —
lúc đó đã sửa 10 file và không biết lỗi từ file nào.

### 2.2 Chặn hai lệnh đã gây tai nạn thật

`tools/hook_chan_lenh_nguy.sh`, chạy trước mỗi lệnh Bash:

| Lệnh | Xử lý | Vì sao |
|---|---|---|
| `pkill -f "next dev"`, `killall node` | **CHẶN** | 20/08/2026: giết luôn dev server phiên khác vừa đưa CEO vào xem. CEO đang bấm thì trang chết. Thay bằng `lsof -ti :<cổng của bạn> \| xargs kill` |
| `git add -A`, `git add .` | **HỎI LẠI** | 19/08/2026: quét trúng file dang dở của phiên khác, suýt commit SĐT khách thật |

Luật viết trong `CLAUDE.md` thì phiên nào cũng có thể quên. Luật cài thành hook thì
không quên được. **Đây là cách đúng để một luật đã trả giá không tái phạm.**

> Muốn xem/tắt hook: gõ `/hooks` trong phiên Claude Code tương tác.

---

## 3. Lệnh tắt (`.claude/commands/`)

| Lệnh | Làm gì |
|---|---|
| `/giao-viec <khu> <việc>` | Mở phiên: worktree + nhánh + cổng + backlog của khu |
| `/xong` | Đóng việc: 3 cửa xanh → tự review → đối chiếu DB → backlog → push |
| `/doi-chieu-db` | So schema local với production, báo prod đang thiếu gì |

Thêm lệnh mới = thêm một file `.md` vào `.claude/commands/`. Có commit ⇒ cả đội dùng chung.

---

## 4. Đối chiếu DB local ↔ production

```bash
python3 tools/doi_chieu_db.py --sql          # in câu SQL để chạy trên prod
python3 tools/doi_chieu_db.py --prod prod.json
```

Hoặc gọn hơn: `/doi-chieu-db` (Claude tự chạy phần prod qua Supabase MCP).

**Nó so object thật trong DB — hàm, bảng, view — chứ không so tên file migration.**
Lý do, đo ngày 26/08/2026:

- Sổ migration của prod ghi mốc thời gian **khác** tên file local cho cùng một
  migration (local `20260821090000_sales_khach…` ↔ prod `20260821062130`).
- Nhiều migration được áp bằng `execute_sql` thay vì `apply_migration` nên **không
  vào sổ**. `work_13`→`work_17` là ví dụ: cả 18 hàm đã có trên prod, sổ không ghi dòng nào.

So sổ ⇒ vừa báo động giả vừa bỏ sót. So object ⇒ đúng.

Đọc kết quả:

- 🔴 **PROD THIẾU** — local có, prod chưa. **Chặn merge.** Merge lúc này là đẩy code
  gọi một hàm chưa tồn tại lên cho nhân viên (đã suýt dính 20/08/2026 với `gop_khach`).
- 🟡 **LOCAL thiếu** — prod có, local chưa. Không chặn merge, nhưng máy bạn đang test
  trên schema cũ hơn prod ⇒ kết quả test local có thể sai.

---

## 5. Bản kiểm đêm (23:00)

```bash
bash tools/cai-lich-kiem-dem.sh        # cài lịch
bash tools/cai-lich-kiem-dem.sh --chay # chạy thử ngay
python3 tools/kiem_dem.py --nhanh      # chỉ phần đo bằng code, không gọi Claude
```

Báo cáo: `~/gwt-worktrees/_kiem_dem_<ngày>.md`. Chạy ~3 phút.

**Nguyên tắc thiết kế: đo bằng code, phán đoán bằng Claude.**

| Việc | Ai làm | Vì sao |
|---|---|---|
| Nhánh quá 3 ngày chưa merge | code | phép đếm git, không cần suy nghĩ |
| Commit chưa push | code | nt |
| Migration đặt sai thư mục | code | nt |
| Backlog lệch với code thật | `claude -p` | phải đọc hiểu ý mục backlog rồi so với diff |

Bản kiểm **chỉ đọc và chỉ báo cáo** — không sửa file, không commit, không đụng backlog.
Job chạy lúc không ai ngồi canh thì không được phép tự ý đổi gì.

23:00 chứ không 22:00 vì bản sao lưu chạy 22:00; kiểm trước thì báo nhầm "chưa push".

---

## 6. Ba cái bẫy đã trả giá khi dựng bộ này

Ghi lại vì cả ba đều thuộc loại "chạy trót lọt mà không làm gì" — không báo lỗi, chỉ im lặng sai.

1. **`git worktree list` liệt kê cả worktree đã bị xoá thư mục** (`prunable`).
   `cd` vào đó là `FileNotFoundError`. Chạy git từ kho gốc, đừng `cd` vào worktree.

2. **Mốc thời gian cố định trúng ngay commit tái cấu trúc** → 78 báo động giả.
   Hôm đó repo di chuyển ~60 file; git ghi nhận là "thêm mới".

3. **`git log --diff-filter=A -- <đường dẫn>` tính file di chuyển là "thêm mới".**
   Lọc theo đường dẫn khiến git không nhìn thấy phía nguồn của phép đổi tên.
   Phải xem diff toàn cây từng commit (`-M`) rồi mới lọc.
   *Và* pathspec phải khớp trọn đường dẫn file: `db/*/migrations` không khớp gì cả,
   phải là `db/*/migrations/*.sql`. Sai chỗ này thì vòng lặp chạy 0 lần và hàm
   vui vẻ báo "không có gì".

> Bài học chung: **một phép kiểm mới viết xong, phải cho nó thấy một lỗi bạn CỐ TÌNH
> tạo ra.** Nó im lặng báo "sạch" không có nghĩa là sạch.

---

## 7. Ba quyết định đã chốt (26/08/2026)

### 7.1 Pull Request — ✅ đang dùng

Từ 26/08 mọi việc vào `main` qua PR, không commit thẳng nữa. `/xong` tự mở PR.
PR đầu tiên của repo: [#1](https://github.com/GWT-VN/gwt-app/pull/1).

### 7.2 `@claude` trên GitHub Actions — ⏸️ để dành

Nhắc `@claude` trong một PR, Claude chạy **trên máy chủ GitHub** rồi commit vào nhánh đó.

**Không làm bây giờ.** Nó cần API trả theo lượt (tách khỏi gói subscription), và chỉ mua thêm
đúng hai thứ mà GWT chưa đau: bấm việc từ điện thoại, và người khác kích hoạt Claude mà không
cần máy CEO. Phần cộng tác thì PR ở 7.1 đã cho không.

| Model | Một lượt sửa PR | 3 lượt/ngày |
|---|---|---|
| Opus 5 | ~1–3 $ | ~100–200 $/tháng |
| Sonnet 5 | ~0,5–1,2 $ | ~45–90 $/tháng |

Xét lại khi có dev thứ hai.

### 7.3 Đưa Claude vào sản phẩm — ✅ làm, bắt đầu từ gộp khách trùng

**Gói subscription không chạy được sản phẩm.** Pro/Max là cho một người dùng Claude trực tiếp;
app phục vụ nhân viên phải dùng API, hoá đơn riêng.

Chi phí thật ở khối lượng của GWT — **cả ba dưới 10 $/tháng**, nên chi phí *không* phải lý do
để chọn model:

| Tính năng | Khối lượng | Haiku 4.5 | Sonnet 5 | Trạng thái |
|---|---|---|---|---|
| Gộp khách trùng | ~300 cặp, chạy từng đợt | ~0,24 $ | ~0,48 $ | **làm trước** |
| Phân nhóm lỗi ticket | ~600 ticket/tháng | ~0,9 $/th | ~1,9 $/th | quyết sau |
| Hỏi dữ liệu bằng tiếng Việt | ~40 câu/ngày | — | ~5 $/th | quyết sau |

Chọn model theo chất lượng tiếng Việt và theo **giá của một lần sai**, không theo giá token.
Gộp nhầm hai khách thật là hỏng dữ liệu ⇒ dùng model mạnh cho việc này.

**Ba luật bắt buộc cho mọi tính năng AI trong sản phẩm:**

1. **LLM chỉ được đề xuất; người bấm nút mới được ghi.** Không cho nó tự `update`/`merge`
   vào `customers`. (24/08/2026: một nút tự đánh số lại toàn bộ mã khách, `customers` phình
   398→826 dòng, 127 mối nối CSKH trỏ hồ sơ chết.)
2. **Che PII trước khi gửi.** Chuẩn hoá SĐT bằng SQL rồi chỉ gửi 3 số cuối hoặc mã băm —
   đủ để biết hai số có trùng không mà không đưa số thật ra ngoài. Địa chỉ: gửi tỉnh, bỏ số nhà.
3. **Ghi lại mọi lượt gọi** (đầu vào đã che, đầu ra, người duyệt) để còn truy được khi sai.

> ⚠️ Vì sao luật 2 quan trọng: một dev thỉnh thoảng nhìn dữ liệu là chuyện nội bộ. Một tính năng
> gửi dữ liệu khách đi **đều đặn, hàng loạt, vĩnh viễn** thì thành hoạt động *chuyển dữ liệu cá
> nhân ra nước ngoài* — Nghị định 13/2023/NĐ-CP có yêu cầu về thông báo, đồng ý và hồ sơ đánh giá
> tác động. Cần luật sư xác nhận, đây không phải ý kiến pháp lý.
>
> Về phía nhà cung cấp thì không phải vấn đề: Anthropic không dùng dữ liệu API để huấn luyện model.

## 8. Có gì ở đâu

```
.claude/settings.json          cấu hình chung cả đội (hook, quyền) — CÓ commit
.claude/settings.local.json    cấu hình riêng bạn — KHÔNG commit
.claude/commands/*.md          lệnh tắt dùng chung
tools/hook_tsc.sh              soát kiểu sau mỗi lần sửa file
tools/hook_chan_lenh_nguy.sh   chặn pkill / hỏi lại git add -A
tools/doi_chieu_db.py          so schema local ↔ prod
tools/kiem_dem.py              bản kiểm đêm
tools/cai-lich-kiem-dem.sh     đặt lịch bản kiểm đêm
tools/wt.sh                    quản lý worktree
tools/saoluu_dem.py            sao lưu tự động 22:00
```
