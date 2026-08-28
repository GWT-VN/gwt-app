# Cập nhật wiki — hướng dẫn cho CEO

Wiki nội bộ ở **`/wiki`** trên app. Tài liệu này trả lời đúng một câu hỏi: *muốn thêm hoặc
sửa nội dung wiki thì làm gì.*

> **Bản rút gọn:** thả file vào `data/wiki-nhap/<khu>/` → nhắn Claude *"có file mới trong
> `data/wiki-nhap/<khu>`, đưa lên wiki giúp anh"* → xong. Không cần đúng định dạng, không
> cần đặt tên theo quy tắc.

---

## 1. File gốc để ở đâu

**`data/wiki-nhap/`** — có sẵn 6 thư mục con theo khu, kèm `DOC-TRUOC.md` nhắc lại luật.

```
data/wiki-nhap/
  san-pham/              HDSD, spec, chứng nhận, giá, tài liệu NSX
  marketing-video/       kịch bản đã quay, transcript, tài liệu cách làm video
  cong-viec-chung/       quy trình chung toàn công ty
  sales/                 đào tạo sale, quy trình bán, bảng giá, mẫu hợp đồng
  cskh/                  đào tạo CSKH, kịch bản tổng đài, quy trình ticket
  _chua-biet-khu-nao/    không chắc thuộc đâu — Claude phân loại
```

Nhận `.md` `.docx` `.pdf` `.xlsx` `.txt`, ảnh, hoặc link Google Docs dán vào file `.txt`.

**Vì sao là `data/` chứ không phải chỗ khác:** `.gitignore` chặn toàn bộ `data/`. File gốc
hay có PII khách, giá vốn, tài liệu NSX đóng dấu *"không được phát tán"* — để ở đây thì
không có đường nào lọt lên GitHub. Claude chỉ đưa **phần đã lọc** lên wiki.

---

## 2. Luật quan trọng nhất: nội dung sản phẩm luôn về khu Sản phẩm

Kể cả khi nó phục vụ marketing.

Mỗi máy có **một** hồ sơ PKB duy nhất, trong đó **Phần 7 — Nguyên liệu marketing đã duyệt
nguồn** chính là chỗ dành cho góc bán hàng, câu chữ quảng cáo, beat kịch bản. Còn **Phần 2**
là luật được nói gì / cấm nói gì.

Nên: *"thêm nội dung về các sản phẩm khác vào wiki Marketing"* → thực ra là **viết PKB cho
máy đó**, và phần marketing nằm sẵn trong PKB.

Để tài liệu sản phẩm ở khu Marketing là đẻ ra bản sự thật thứ hai. Rồi hai bản lệch nhau,
rồi sale đọc bản cũ. Đó đúng là thứ PKB sinh ra để chặn — xem ba nguyên tắc gốc đầu mỗi PKB.

Khu Marketing video giữ đúng phạm vi của nó: **cách làm video**, không phải **máy nào có gì**.

---

## 3. Ba việc hay gặp

### 3.1. Thêm một máy mới vào khu Sản phẩm

Thả toàn bộ hồ sơ máy vào `data/wiki-nhap/san-pham/` rồi nhắn Claude. Claude sẽ:

1. Chép khuôn `content/wiki/san-pham/_khuon-mau/` thành thư mục máy mới.
2. Viết `pkb.md` theo đúng 10 Phần chuẩn, mỗi dữ kiện một mã `F-xxx` có nguồn và nhãn công bố.
3. Chạy `npm --prefix apps/web run sync:wiki` để tách phần + bóc bảng tra cứu.

Máy mới tự hiện trong wiki, **không phải sửa code**.

Hợp đồng khuôn (mốc nào bắt buộc, chữ cái nhóm dữ kiện A–M, cách viết bảng) ghi ở
[`apps/web/content/wiki/san-pham/README.md`](../apps/web/content/wiki/san-pham/README.md).

> ⚠️ Việc tốn công nhất **không phải** dựng trang, mà là **truy nguồn từng dữ kiện**. PKB
> USH10 mất 16 tài liệu nguồn mới ra 184 dữ kiện, và vẫn còn sổ mâu thuẫn mở. Máy mới nếu
> hồ sơ mỏng thì PKB sẽ mỏng — đó là kết quả đúng, không phải lỗi. Thà thiếu còn hơn sai.

### 3.2. Sửa một dữ kiện đã có

Nhắn thẳng, kiểu: *"F-C17 sai rồi, ngưỡng lõi màng là …"*. Claude sửa `pkb.md`, chạy lại
sync, và **rà lan toả** — vì sửa Phần 1 thì thường phải sửa tiếp Phần 2 → 3 → 5 → 6 → 7 → 9
(quy trình này ghi trong mục 0.5 của chính PKB).

Đừng sửa tay `apps/web/lib/wiki/data/san-pham.ts` — file đó do máy sinh, lần sync sau ghi đè.

### 3.3. Thêm kịch bản đã quay vào kho dữ liệu Marketing

Thả file kịch bản vào `data/wiki-nhap/marketing-video/`. Cần nói thêm cho Claude ba thứ,
vì kịch bản không tự nói ra được:

| Cần biết | Vì sao |
|---|---|
| Quay cho **máy nào / chiến dịch nào** | Để đối chiếu ngược về PKB máy đó |
| **Đã đăng chưa**, kết quả ra sao | Kho case WIN/FAIL chấm theo kết quả thật |
| Bản **đã quay** hay bản **nháp** | Bản đã quay là dữ liệu; bản nháp là ý tưởng |

---

## 4. Thêm một khu wiki mới

Danh sách khu ở [`apps/web/lib/wiki/nav.ts`](../apps/web/lib/wiki/nav.ts). Khu chưa có nội
dung vẫn hiện trên web (mờ, không bấm được) — cố ý, để mọi người thấy chỗ đó đã có người
nhận, thay vì lại đẻ thêm một file Google Docs nữa.

Hiện có: **Sản phẩm** · **Marketing video** · Công việc chung · Sales · CSKH · Vận hành ·
Tài chính. Hai khu đầu đã có nội dung.

**Đào tạo không tách thành khu riêng.** Đào tạo sale nằm trong khu Sales, đào tạo CSKH nằm
trong khu CSKH. Tách ra thì cùng một quy trình bán hàng lại có hai bản — một bản "để làm",
một bản "để dạy" — rồi hai bản lệch nhau.

Muốn mở một khu: thả tài liệu vào thư mục khu đó rồi nhắn Claude. Claude thêm route và bật
khu lên.

---

## 5. Ai xem được gì

Wiki nằm sau `requireNhanSu()` — **mọi nhân sự đang hoạt động đọc được hết**, kể cả dòng
🔵 nội bộ và 🔴 cấm.

Cố ý như vậy: đây là tài liệu **sự thật**. Giấu bớt thì nhân viên không tra được và sẽ tự
bịa — đúng cái mà wiki sinh ra để chặn. Thay vì giấu, mỗi dữ kiện có **nhãn màu** nói rõ
được nói với khách tới đâu:

| Nhãn | Nghĩa |
|---|---|
| 🟢 | Được nói với khách, được lên hình, lên landing page |
| 🟡 | Nói được nhưng phải đúng câu chữ quy định ở Phần 2 |
| 🔵 | Nội bộ — biết để tư vấn, không đưa lên tài liệu xuất bản, không đọc số cho khách |
| 🔴 | Cấm nói dưới mọi hình thức |

⚠️ Nhãn này là luật **phát ngôn với khách**, không phải luật xem nội bộ.

---

## 6. Ghi chú kỹ thuật (cho phiên Claude sau)

- Nội dung khu **Sản phẩm** nằm trong repo này: `apps/web/content/wiki/san-pham/<mã>/`.
  Một file `pkb.md` cho mỗi máy, app tự cắt 10 Phần lúc build.
- Nội dung khu **Marketing video** (`rules/*.md`, `Work GWT/Quy trình/*.md`) vẫn thuộc repo
  **GWT Marketing Kit**. Sửa bên đó rồi chạy `npm --prefix apps/web run sync:marketing`.
  Kế hoạch gộp về một chỗ: `backlog/marketing.md`.
- Cả hai đường đều **nhúng thành TS** chứ không đọc `fs` lúc chạy — Turbopack không truy vết
  được `fs.readFileSync` nên không có gì bảo đảm file `.md` lên được Vercel. Local chạy ngon
  mà production trắng trơn. Đã trả giá đúng chỗ này rồi.
- `slugTieuDe()` có **hai bản phải khớp nhau** (`tools/scripts/sync-wiki-sanpham.mjs` và
  `components/marketing/Markdown.tsx`). Lệch là link mục lục trong PKB trỏ vào hư không.
  Có test chốt ở `apps/web/lib/wiki/wiki.test.ts`.
