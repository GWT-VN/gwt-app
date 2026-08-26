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

## 7. Chưa làm — hai việc chờ CEO quyết

### 7.1 `@claude` trên GitHub Actions

Cho phép nhắc `@claude` ngay trong một Pull Request hoặc Issue trên GitHub; Claude
chạy **trên máy chủ GitHub** (không phải máy CEO), tự sửa code rồi commit vào nhánh đó.

Muốn dùng phải có ba thứ, và mỗi thứ là một quyết định:

1. **Bắt đầu dùng Pull Request.** Hiện repo commit thẳng vào `main` — 30 commit gần
   nhất, 0 PR. Không có PR thì không có chỗ để nhắc `@claude`.
2. **Đặt khoá API Anthropic vào GitHub Secrets.** Tốn tiền theo lượt chạy, và ai có
   quyền ghi vào repo là kích hoạt được.
3. **Chốt phạm vi.** Repo này cắm vào DB production có PII khách thật. Tối thiểu phải
   chặn: không đọc `.env*`, không chạy migration, không gọi Supabase MCP prod.

Đề nghị: nếu làm thì bắt đầu hẹp — chỉ cho `@claude` **sửa test và tài liệu**, không
cho đụng `apps/web/app/**` và `db/**`. Nới dần sau.

### 7.2 Đưa Claude vào chính sản phẩm

Hiện GWT-App có 268 file TS, 40k dòng, **0 dòng gọi Anthropic API**. Nghĩa là ta *dùng*
Claude để viết app, nhưng app không có tính năng AI nào cho nhân viên.

Ba ứng viên, xếp theo mức đau thật của công ty:

| Việc | Dùng năng lực gì | Ghi chú |
|---|---|---|
| **Gộp khách trùng** (Sales đang có 826 dòng `customers`, 127 mối nối CSKH trỏ hồ sơ chết) | LLM so khớp thực thể: "Nguyễn Văn A / 0901…" vs "NGUYEN VAN A / 84901…" | Đau nhất hiện nay. **Phải che PII trước khi gửi đi** |
| **Phân nhóm lỗi ticket** | phân loại văn bản | đã có `bao_cao_nhom_loi.py` làm bằng regex; LLM xử được ca regex chịu thua |
| **Hỏi dữ liệu bằng tiếng Việt** ("tháng này khách nào quá hạn bảo trì") | sinh SQL + chạy code | Claude viết SQL, app chạy trên view chỉ-đọc |

⚠️ **Chốt chặn bắt buộc:** gửi SĐT/địa chỉ/tên khách sang API là **đưa dữ liệu khách ra
ngoài công ty**. Trước khi viết dòng code nào, CEO phải quyết: che PII trước khi gửi,
hay chấp nhận gửi thật. Không tự quyết thay.

---

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
