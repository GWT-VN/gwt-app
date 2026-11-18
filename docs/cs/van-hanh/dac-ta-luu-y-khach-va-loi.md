---
loai: dac-ta
trang-thai: cho-code
ngay: 2026-11-17
---

# Đặc tả CSKH: lưu ý khách · việc tiếp theo · báo cáo tự sinh · đóng vòng lỗi

**Cho ai:** dev được giao code khu CSKH. **Thứ tự: Đợt 1 → Đợt 2 → Đợt 3** (CEO chốt 17/11/2026).
Việc từng đợt và người nhận ghi ở hàng đợi `backlog/cskh.md` (nằm ngoài git, xem `docs/agents/issue-tracker.md`).

**File này không có số liệu** (số khách, số ticket, tỷ lệ lỗi) vì repo công khai. Số đo hiện trạng và mockup có số thật: hỏi CEO.

**Nguyên tắc:** xây tiếp trên GWT App, không mua CRM, không dựng app mới. Code theo luật repo (`CLAUDE.md`: worktree riêng, chạy local trước, CEO duyệt rồi mới merge).
Hệ thống xoay quanh **khách → máy → ticket → phiếu việc KT**. Ba thứ khác nhau:
*ticket* là vấn đề của khách · *phiếu việc* là một chuyến đi · *mã lỗi* là nhóm hiện tượng dùng chung cho nhiều máy.

**Tài liệu cùng thư mục** (đang ở PR #19, chưa merge): `chinh-sach-bao-hanh.md` · `danh-sach-loi-theo-model.md`.
Danh sách lỗi theo model là nguồn cho cây chẩn đoán Đợt 2 — đọc ở đó, file này không chép lại.

---

## 0. Luật vận hành mà code phải theo (CEO chốt 17/11/2026)

- **CSKH không có hạn mức tự quyết về tiền.** Mọi khoản miễn phí, tặng, giảm giá: CSKH chỉ **đề xuất**, **CEO duyệt**. Người trực thay và CTV ca tối cũng vậy.
  ⇒ Lưu ý loại 🤝 *Cam kết đã hứa* chỉ ghi **sau khi** CEO duyệt. Trong lúc chưa có luồng duyệt riêng, đề xuất và kết quả duyệt ghi ở **nhật ký ticket** (xem câu Q6, mục 8).
- **Mức ưu tiên theo nhóm lỗi** (CEO đồng ý): `an toàn` → **P1** · `nghiêm trọng` → **P2** · `thường` → **P3** · `nhẹ` / `không lỗi` → **P4**.
  Thời hạn phản hồi từng mức nằm ở Khung vận hành CSKH (tài liệu nội bộ), **chưa công bố cho khách** — đừng in ra màn hình phía khách.
- **Nhiều người trực, mỗi ticket vẫn một chủ:** ca ngày (CSKH chính) · trực thay khi CSKH nghỉ · CTV ca tối và cuối tuần.
  ⇒ Màn *Việc hôm nay* và bàn giao ca phải dùng được cho cả người trực thay và CTV. Kiểm tài khoản CTV có đủ quyền tạo ticket, ghi nhật ký, đọc Thẻ lưu ý (phân quyền hiện có ở `docs/cs/CS-ma-tran-quyen-manager.md`).

---

## 1. Đã có gì (đọc code / DB ngày 17/11/2026)

| Phần | Màn | Bảng / cột | Tình trạng |
|---|---|---|---|
| Danh mục lỗi chuẩn | `/danh-muc-loi` | `loi_danh_muc` | Mã, nhóm, cách ghi, model, dấu hiệu, hướng xử lý, `trang_thai`. **Phần lớn mã chưa có hướng xử lý** |
| Nhóm lỗi + mức độ | `/nhom-loi` | `issue_group` | 5 mức: an toàn · nghiêm trọng · thường · nhẹ · không lỗi |
| Máy trong ticket | `/ticket/[mã]` | `ticket_may` | Mỗi máy một dòng, tự gợi ý mã lỗi + hướng xử lý; tạo được khi chưa có serial |
| Lần lỗi 2+ | `/ticket/[mã]` | `ticket_lan_loi` | Cặp *khách báo ↔ xử lý* theo từng lần |
| Người phụ trách | `/ticket/[mã]` | `tickets.cs_phu_trach`, `.ky_thuat` | Sửa nhanh được ở đầu trang ticket. **Chưa có** việc tiếp theo, hạn, lý do chờ |
| Trạng thái ticket | | `tickets.state` | Chỉ `Open / Done / Cancel` |
| Nhật ký trao đổi | `/ticket/[mã]` | | Có, đính kèm ảnh / video / PDF |
| Báo cáo tần suất | `/bao-cao-loi` | view tần suất | Theo nhóm × model × tháng, có số máy bán |
| Ghi chú khách | hồ sơ khách | `cs_customers.notes` | **1 ô chữ tự do**, rất ít khách có ghi |
| Kết quả đo nước | `/bao-tri`, `/nuoc` | `maintenance_visit` | Có — nguồn cho báo cáo sau bảo trì |

---

## 2. Thẻ lưu ý khách (Đợt 1)

Học từ *hồ sơ khách* (顧客カルテ) của dịch vụ Nhật: ai chạm vào khách cũng thấy cùng một thẻ, đọc 10 giây là biết phải cẩn thận điều gì. **Cả CSKH lẫn KT đều ghi.**

### Một lưu ý gồm

| Trường | Giá trị |
|---|---|
| **Loại** | 📞 Liên lạc (giờ gọi, kênh, ai là người dùng / người trả tiền) · 🏠 Vào nhà & công trình · 🔧 Điều kiện kỹ thuật · 🤝 Cam kết đã hứa (chỉ ghi sau khi CEO duyệt) · ⚠️ Rủi ro / cần theo dõi · 🙂 Cách phục vụ khách thích |
| **Mức** | 🔴 **Phải đọc** trước khi liên hệ · 🟡 Nên biết · ⚪ Thông tin |
| **Nội dung** | 1 câu, **ghi hành vi cụ thể, không phán xét**: ✅ *"Khách muốn xác nhận chi phí bằng tin nhắn trước khi làm"* · ❌ *"Khách khó tính"* |
| **Ai cần thấy** | CSKH · Kỹ thuật · Sales. Freelancer chỉ thấy lưu ý KT của **việc được giao** |
| **Hết hạn / ngày rà lại** | Tuỳ chọn — *"Đang sửa nhà tới 30/11"* tự ẩn sau ngày đó |
| **Ghi bởi · ngày · nguồn** | Tự lấy từ phiên đăng nhập; nguồn = CSKH / KT / Sales / khách nói |

### Lưu ý tự động (máy sinh, không ai phải gõ)

- 🔴 Đang có **khiếu nại** mở · 🔴 Máy **hỏng lại** trong 30 ngày
- 🔴 Máy đã **bảo hành 2 lần cùng lỗi** — lần 3 không khắc phục được là phải đổi máy hoặc hoàn tiền (Luật Bảo vệ quyền lợi người tiêu dùng 2023, Điều 30)
- 🟡 Lõi **quá hạn** N ngày · 🟡 Bảo hành **hết sau** ≤ 30 ngày · 🟡 Lần trước chấm **≤ 3 sao** · 🟡 Bảo trì quá hạn · 🟡 Muối sắp hết (*chỉ khi có số liệu tiêu hao*)
- ⭐ Khách **VIP** (theo nhãn VIP khu Sales đang dùng — lấy luật từ khu Sales, đừng tự đặt) hoặc có **lọc tổng** · ⭐ Đã **giới thiệu** khách mới
- 🟡 Khách mua qua **đối tác / đại lý** — ghi nguồn để biết ai bán, ai bảo hành

### Hiện ở đâu

1. **Đầu hồ sơ khách** — đủ thẻ, sửa được.
2. **Đầu trang ticket** — chỉ 🔴 và 🟡.
3. **Lúc tạo ticket / tra SĐT** — bật lên, bấm "Đã đọc" mới đi tiếp.
4. **Phiếu việc của KT** — lưu ý 🏠 🔧 🔴; KT đọc trước khi đi.
5. **Việc hôm nay / bảng điều phối** — biểu tượng ⚠️ trên việc có lưu ý đỏ.
6. **KT đóng phiếu** → ô *"Có gì cần nhớ cho lần sau?"* → thành lưu ý mới.

### Luật giữ thẻ gọn

- Tối đa **3 lưu ý đỏ** đang hiệu lực / khách *(đề xuất — chờ chốt, câu Q1)*.
- Không sửa đè: sửa = gỡ cái cũ + ghi cái mới (giữ lịch sử).
- Không ghi: giấy tờ tuỳ thân, tài khoản ngân hàng, chuyện riêng không liên quan dịch vụ (Luật Bảo vệ dữ liệu cá nhân 91/2025).

```sql
create table public.khach_luu_y (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.cs_customers(id) on delete cascade,
  serial      text references public.installed_base(serial),   -- null = cả khách
  loai        text not null check (loai in ('lien_lac','vao_nha','ky_thuat','cam_ket','rui_ro','phuc_vu')),
  muc         text not null default 'vang' check (muc in ('do','vang','xam')),
  noi_dung    text not null check (length(btrim(noi_dung)) between 3 and 300),
  cho_ai      text[] not null default '{cs,kt,sales}',
  het_han     date,
  nguon       text not null default 'cs' check (nguon in ('cs','kt','sales','khach')),
  tao_boi     text, created_at timestamptz not null default now(),
  go_boi      text, go_luc timestamptz            -- gỡ = ẩn, không xoá
);
-- + view v_khach_canh_bao (lưu ý tự động) · RLS staff-only như các bảng CS khác
```

`cs_customers.notes` cũ: chuyển các ghi chú đang có sang thẻ (loại 🙂, mức ⚪), giữ cột cũ chỉ đọc một thời gian.

---

## 3. Việc tiếp theo + hạn — cơ chế chống quên (Đợt 1)

**Mọi ticket đang mở bắt buộc có 4 trường:** `Chủ ticket · Việc tiếp theo · Người đang phải làm · Hạn`.

- Thêm vào `tickets`: `viec_tiep` (text), `nguoi_lam` (staff), `han_tiep` (timestamptz), `ly_do_cho` (khách · KT · vật tư · hãng · duyệt).
  `ly_do_cho = duyệt` dùng cho đề xuất miễn phí / tặng / giảm giá đang chờ CEO.
- Trạng thái mở rộng: `Mới → Đang xử lý → Chờ → Chờ khách xác nhận → Đóng` · kết quả riêng `Huỷ` / `Trùng`. Map dữ liệu cũ: `Open` → *Đang xử lý*, giữ `Done` / `Cancel`.
- **Lời hứa:** bảng nhỏ `ticket_hua` (nội dung, hạn, giữ / trễ) — sinh chỉ số *giữ lời*.
- **Khách nhắc:** nút "Khách hỏi lại" trên ticket → đếm *số lần khách phải nhắc*.
- **Màn "Việc hôm nay"** (`/hom-nay`): ca khẩn · việc tiếp theo quá hạn · lời hứa đến hạn · lịch KT hôm nay · việc *Chờ* tới ngày xem lại · **danh sách bàn giao ca** (việc tạo trong ca tối / cuối tuần, việc đến hạn ca sau).
- Không cho lưu ticket mở thiếu 4 trường. Ticket cũ: bắt buộc ngay hay điền dần — chờ chốt (câu Q4).

---

## 4. Báo cáo sau dịch vụ tự sinh (Đợt 2)

Yêu cầu (17/11): báo cáo sau bảo trì làm và gửi tự động; người chỉ kiểm tra, xác nhận để gửi; thông tin lấy từ phần kỹ thuật cập nhật về.

1. **KT đóng phiếu** trên điện thoại: việc đã làm (chọn), ảnh trước / sau, chỉ số nước trước / sau, lõi / linh kiện đã thay, muối đã đổ, phí đã thu, ghi chú cho khách.
2. **App soạn báo cáo** theo mẫu từng loại việc (lắp đặt · bảo trì lọc tổng · thay lõi · sửa chữa): lời chào, đã làm gì, bảng chỉ số nước có giải thích ngắn, ảnh, lần tới khi nào, hotline.
3. **CSKH xem** → sửa câu chữ nếu cần → bấm **Gửi Zalo**. App chặn gửi nếu thiếu ảnh hoặc chỉ số bắt buộc.
4. Bản đã gửi lưu vào ticket / lượt bảo trì; app đặt **kỳ tiếp theo** và gửi kèm nút **chấm sao**.
5. Gửi qua Zalo OA / ZNS cần đăng ký mẫu tin với Zalo; bước đầu có thể **chép sang Zalo cá nhân của CSKH** (nút "Chép báo cáo") trong lúc chờ duyệt mẫu.

Luôn có người duyệt hay cho tự gửi một số loại — chờ chốt (câu Q3).

---

## 5. Chẩn đoán từ xa (Đợt 2)

Thêm vào mỗi mã lỗi trong `/danh-muc-loi`:

| Trường mới | Ví dụ — *CTS20 rò nước đáy* |
|---|---|
| **Mức ưu tiên** (mặc định theo nhóm, mục 0; sửa được) | P3 (thành vũng → P2) |
| **Các bước hỏi / hướng dẫn** | ① Giọt đọng hay thành vũng? · ② Đang bật lạnh / phòng ẩm? · ③ Lau khô, tắt lạnh 24 giờ — còn ướt? · ④ Ảnh đáy + đèn — có đèn đỏ? |
| **Kết quả mỗi nhánh** | Hết ướt → *xong từ xa, hẹn gọi lại* · còn ướt / đèn đỏ → *cử KT* |
| **Vật tư mang theo** | Khay hứng nước, cảm biến rò dự phòng, cút nối nhanh 1/4", băng tan |
| **Video hướng dẫn** | Link video 60 giây |
| **Phiên bản · người duyệt · ngày hiệu lực** | KT trưởng duyệt |

Trong ticket: CSKH bấm qua từng bước, app ghi lại khách đã làm gì → ra chỉ số **"xử lý xong từ xa"**. Cử KT thì phiếu việc tự điền vật tư.
CSKH chỉ hướng dẫn thao tác đã duyệt; việc dính điện, nước nóng, tháo máy là của KT.

**Nội dung cây hỏi** do KT trưởng viết cho các mã hay gặp; nguồn sẵn là `danh-sach-loi-theo-model.md` (PR #19). Mã mới từ danh sách đó nhập vào `loi_danh_muc` ở `cho_duyet`, CEO duyệt mới dùng.

---

## 6. Đóng vòng lỗi (Đợt 3)

Ở mỗi dòng máy của ticket (`ticket_may`), khi đóng:

- **Nguyên nhân thật** (chọn 1): linh kiện hỏng · lắp đặt · nước nguồn · khách dùng sai · vận chuyển · không lỗi (hiện tượng bình thường).
- **Đã làm gì** (chọn 1+): thay linh kiện (ghi tên) · chỉnh / siết · vệ sinh · hướng dẫn · đổi máy.
- **Xử lý từ xa?** · **Hỏng lại ≤ 30 ngày** (app tự tính).
- Mã lỗi hiển thị trên máy (E4, đèn đỏ) **không phải** nguyên nhân — tách hai trường.

Cách tách *triệu chứng · nguyên nhân · cách xử lý* theo hệ mã **IRIS** của ngành điện gia dụng (tiêu chuẩn Trung Quốc GB/T 24822 tham chiếu IRIS), bản rút gọn cho đội nhỏ, đủ để gửi hãng.

**Đếm cho đúng:** *số ca* đo khối lượng việc · *số máy bị ảnh hưởng* đo phạm vi lỗi · *tỷ lệ* = máy bị ảnh hưởng ÷ máy đang chạy của model đó. Một máy báo 5 lần là 1 máy lỗi.

⇒ `/bao-cao-loi` thêm: **Pareto** · máy bị ảnh hưởng / model · hỏng lại · nút **xuất báo cáo tháng cho hãng** (kèm ảnh, serial, linh kiện đề nghị hoàn).
Báo cáo này có số liệu thật → chỉ hiện trong app cho nhân viên, không xuất vào repo.

---

## 7. Thứ tự làm

| Đợt | Gồm | Cần trước |
|---|---|---|
| **1** | Thẻ lưu ý khách · 4 trường bắt buộc + trạng thái mới · màn Việc hôm nay (kèm bàn giao ca) · chuyển ghi chú cũ sang thẻ | CEO duyệt mockup · trả lời Q1, Q2, Q4 |
| **2** | Báo cáo sau dịch vụ tự sinh · chẩn đoán từ xa trong danh mục lỗi | Đợt 1 · mẫu báo cáo CEO duyệt · trả lời Q3 · KT trưởng viết cây hỏi · đăng ký mẫu tin Zalo · PR #19 đã merge |
| **3** | Nguyên nhân / đã làm / hỏng lại · Pareto theo máy · xuất cho hãng | Đợt 2 |

Mỗi đợt một nhánh riêng theo luật đặt tên (`feat/cskh-<việc>`), một PR, CEO duyệt trên local rồi mới merge.

---

## 8. Câu còn mở — hỏi CEO trước khi code phần liên quan

| # | Câu | Ảnh hưởng |
|---|---|---|
| Q1 | Sáu loại lưu ý + ba mức đã đủ chưa? Giữ luật tối đa 3 lưu ý đỏ? | Đợt 1 — `khach_luu_y.loai`, `.muc` |
| Q2 | KT ghi lưu ý là hiện ngay, hay CSKH duyệt trước? | Đợt 1 — có cần cột trạng thái duyệt |
| Q3 | Báo cáo sau dịch vụ luôn có người duyệt, hay sau một thời gian ổn thì cho tự gửi loại "thay lõi"? | Đợt 2 |
| Q4 | Bắt buộc 4 trường cho ticket cũ ngay, hay điền dần trong chiến dịch gọi lại? | Đợt 1 — ràng buộc khi lưu ticket cũ |
| Q5 | Mockup 9 màn (riêng tư, có số thật nên không để trong repo) đã duyệt chưa? | Đợt 1 |
| Q6 | Đề xuất miễn phí / tặng / giảm giá có cần nút duyệt riêng cho CEO trong app, hay ghi ở nhật ký ticket là đủ? | Đợt 1 hoặc sau |

---

## 9. Trước khi code (luật repo GWT-App)

- `khach_luu_y` là bảng mới của CSKH, nhưng **Sales cũng đọc** → báo phiên Sales, ghi Changelog `../GWT-SHARED/SYSTEM.md`.
- Đổi `tickets.state` đụng view `v_tickets` và các màn đang lọc theo `Open` → rà hết trước khi đổi.
- Đối chiếu migration local vs prod trước khi merge (`CLAUDE.md` mục "Trước khi merge").
- Không commit dữ liệu khách; git author theo `CLAUDE.md`.
