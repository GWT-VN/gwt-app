# Nội dung Product Wiki — khuôn chung cho mọi sản phẩm

Mỗi sản phẩm là **một thư mục**, trong đó có đúng 2 file bắt buộc:

```
<ma-san-pham>/
  san-pham.json    ← thẻ định danh (app đọc để dựng danh sách + trang chủ sản phẩm)
  pkb.md           ← Product Knowledge Base — MỘT file, 10 Phần theo khuôn
```

Ví dụ đang có: [`ush10/`](ush10/).
Khuôn để copy khi thêm máy mới: [`_khuon-mau/`](_khuon-mau/).

## Vì sao MỘT file `pkb.md` chứ không tách 10 file

PKB là tài liệu có **quy trình cập nhật lan toả**: sửa một dữ kiện ở Phần 1 thì phải rà
tiếp Phần 2 → 3 → 5 → 6 → 7 → 9 (xem mục 0.5 trong chính file PKB). Người soạn làm việc
**xuyên phần**, nên tách ra 10 file chỉ tổ làm hỏng tham chiếu chéo và đẻ ra 10 chỗ để
quên. App **tự tách** lúc build — người viết vẫn chỉ sửa một file.

## Thêm một sản phẩm mới

```bash
cp -r apps/web/content/wiki/san-pham/_khuon-mau apps/web/content/wiki/san-pham/<ma-moi>
# sửa san-pham.json + viết pkb.md theo khuôn
npm --prefix apps/web run sync:wiki      # tách phần + bóc bảng dữ kiện + nhúng thành TS
```

Không cần đụng vào code: app quét thư mục, thấy thư mục mới là tự hiện.

## Hợp đồng khuôn — app dựa vào đúng mấy thứ này

App **tự tách** `pkb.md` bằng các mốc dưới đây. Sai khuôn thì phần đó không hiện.

| Thứ | Khuôn bắt buộc | App dùng để làm gì |
|---|---|---|
| Ranh giới phần | Dòng `# PHẦN <N> — <TÊN>` ở đầu dòng (N = 0…9) | Cắt thành 10 trang riêng |
| Bảng dữ kiện | Bảng markdown trong **Phần 1**, cột đầu là mã ` \`F-xxx\` ` | Bóc thành dữ liệu để trang **Tra cứu** lọc được |
| Nhóm dữ kiện | Dòng `## <CHỮ>. <TÊN NHÓM>` trong Phần 1 (A…M) | Nhóm trong trang Tra cứu |
| Nhãn công bố | 🟢 🟡 🔵 🔴 trong ô "Công bố" | Tô màu + lọc theo quyền công bố |
| Hạng tin cậy | A · B · C · D · E · X trong ô "Hạng" | Lọc theo độ tin cậy |

### HTML thô — cứ viết bình thường, script tự dọn

Trình render **không hiểu HTML thô**, để nguyên là nó in `<a id="q26"></a>` lù lù ra giữa
trang. Nên script dọn sẵn trước khi giao cho web — viết PKB cứ viết như thường:

| Bạn viết trong `pkb.md` | Trên web thành |
|---|---|
| `<a id="q26"></a>` đặt trên một tiêu đề | Bị gỡ; link `](#q26)` tự đổi sang slug của tiêu đề đó, bấm vẫn nhảy đúng |
| `<a id="x"></a>` không có tiêu đề theo sau | Bị gỡ; link trỏ tới nó thành chữ thường (bỏ link, giữ chữ) |
| `<br>` trong ô bảng | Đổi thành ` · ` (markdown không xuống dòng được trong ô bảng) |

⚠️ Slug tiêu đề do `slugTieuDe()` sinh ra, và hàm này có **hai bản phải khớp nhau**:
`tools/scripts/sync-wiki-sanpham.mjs` và `components/marketing/Markdown.tsx`. Sửa một bên
mà quên bên kia là mọi link mục lục trỏ vào hư không — có test chốt ở `lib/wiki/wiki.test.ts`.

10 Phần chuẩn — **giữ nguyên số và thứ tự**, máy nào chưa có nội dung thì để phần đó
trống kèm một dòng ghi rõ *"chưa có dữ liệu"*:

| Phần | Tên | Nhóm thông tin |
|---|---|---|
| 0 | Chỉ dẫn sử dụng, nguồn dữ liệu & quy tắc | Quản lý sản phẩm |
| 1 | Bảng sự thật nguyên tử (fact table) | **Xương sống — hiện ở cả 3 nhóm** |
| 2 | Quy tắc claim — cấm nói / thận trọng / được nói | Truyền thông |
| 3 | Hướng dẫn khách hàng — sử dụng · vệ sinh · thay lõi | Kỹ thuật |
| 4 | Safety database | Kỹ thuật |
| 5 | Lỗi thường gặp & cách xử lý | Kỹ thuật |
| 6 | Bộ hỏi–đáp đã kiểm chứng | Thông tin sản phẩm |
| 7 | Nguyên liệu marketing đã duyệt nguồn | Truyền thông |
| 8 | Ma trận đối chiếu nguồn & sổ mâu thuẫn | Quản lý sản phẩm |
| 9 | Đào tạo & kiểm tra | Thông tin sản phẩm |

## Ba nhóm thông tin — ai đọc gì

Chia theo **người đọc**, không phải theo chủ đề. Một người có thể thuộc nhiều nhóm.

| Nhóm | Dành cho | Gồm Phần |
|---|---|---|
| 🔧 **Kỹ thuật** | Kỹ thuật · CSKH | 3 · 4 · 5 |
| 📦 **Thông tin sản phẩm** | Sales · CSKH · Marketing | 1 · 6 · 9 |
| 📣 **Truyền thông** | Sales · Marketing | 2 · 7 |
| 🗂️ **Quản lý sản phẩm** | PM · người soạn PKB | 0 · 8 |

**Phần 1 cố ý hiện ở cả ba nhóm.** Nó là "nguồn chân lý duy nhất" — mọi câu nói về sản
phẩm phải truy được về một mã `F-xxx` trong đó. Cắt nó ra làm ba thì hỏng đúng cái luật
gốc của tài liệu.

## Quyền xem

Wiki nằm sau `requireNhanSu()` — **mọi nhân sự đang hoạt động đều đọc được hết**, kể cả
dòng 🔵 nội bộ và 🔴 cấm. Cố ý như vậy: đây là tài liệu **sự thật**, giấu bớt thì nhân
viên không tra được và sẽ tự bịa — đúng cái mà PKB sinh ra để chặn. Thay vì giấu, mỗi
dòng có **nhãn màu** nói rõ được nói với khách tới đâu.

⚠️ Nhãn 🔵/🔴 là luật **phát ngôn với khách**, không phải luật xem nội bộ.
