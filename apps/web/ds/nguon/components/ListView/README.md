Dạng xem **Danh sách** — mặc định của màn dữ liệu: mỗi bản ghi đúng **một dòng**, đọc lướt nhanh, sửa ngay tại ô — đã chốt 18/11/2026.

## Cấu tạo một dòng (ticket)
`[Ưu tiên][Loại lỗi]  mã  Tên khách (!lưu ý ↻hỏi lại)` · `Việc tiếp theo` · `Trạng thái ▾` · `Hạn` · `Chủ (avatar)`
- Nhãn đầu dòng theo thứ tự **Ưu tiên → Loại lỗi** (DS `Badge`, xem `InlineEdit`), khung nhãn rộng cố định 190px (ưu tiên 60 + 6 + nhóm lỗi dài nhất "Chất lượng nước" 123) để mã + tên khách thẳng cột.
- Không icon đầu dòng, không nút ⋯ cuối dòng (thao tác bằng chuột phải — `ContextMenu`).
- Danh sách chỉ có **một** nhãn đầu (vd ưu tiên của Việc — không có loại lỗi): khung nhãn ôm chữ, `.b-nhan-dau[data-gon]` (thêm 23/11/2026, CEO chốt trên màn Work). Code: `<NhanDau gon>`. Nhãn ưu tiên vẫn rộng tối thiểu 60px nên mã/tên vẫn thẳng cột.

## Thông số
| Phần | Token | Giá trị |
| --- | --- | --- |
| Lưới cột | | `minmax(0,2.4fr) minmax(0,1fr) 140px 88px 40px`, gap 12 |
| Dòng | `radius-xl` | cao ≥ 50px, padding 4/16; kẻ dưới `alpha-05` (ẩn khi dòng kề đang hover) |
| Hover / focus | | nền `alpha-05` bo 12px; focus phím: inset 2px `ring` |
| Đầu cột | `text-xs` | 12/18 `muted-foreground`; bấm mở menu theo bản chất cột (xem `Table`). Đầu cột gộp "Ticket" ghi rõ đang sắp theo gì ("· ưu tiên gấp trước"); menu của nó: Sắp xếp (ưu tiên / thứ tự tạo) + Lọc (ưu tiên, **loại lỗi theo tag**) — loại lỗi không bao giờ là khoá sắp xếp |
| Nhãn trong dòng | DS `Badge` | cao 22px = phần tử cao nhất (avatar); ưu tiên rộng tối thiểu 60px; loại lỗi lấp phần còn lại của khung 190px |
| Lề trang | | `36px clamp(24px,6vw,112px) 112px`, tối đa 1584px — **dùng chung mọi dạng xem** |
| Mép trái (kiểu Notion) | `b-ds` | **không lề âm** — nền rê/chọn của dòng thẳng mép nội dung trang (tiêu đề, nền tab, ô thêm nhanh); chữ đầu cột, nhãn nhóm, nội dung dòng thụt 16 (đệm dòng) = thẳng chữ trong tab. CEO 25/11/2026 (trước lề −8: nền thò ra 8, chữ lệch 8) |

## Responsive (container query trên vùng trang)
- ≤ 860px (vd. đang mở thẻ xem nhanh): vẫn 1 dòng; ẩn Việc tiếp theo, Chủ, mã và nhãn loại lỗi để tên khách đủ chỗ (xem trong thẻ).
- ≤ 480px (điện thoại): 2 dòng — tên + hạn / việc + trạng thái; ẩn loại lỗi.

## Hành vi
- Bấm **ô** → sửa tại chỗ (`InlineEdit`); bấm **chỗ trống của dòng** hoặc mã → mở bản ghi (trang chi tiết, hoặc thẻ xem nhanh nếu đang bật).
- Hiện hết danh sách đang lọc — không phân trang 10/20 dòng.
- Nhóm theo (từ ⚙): tiêu đề nhóm = nhãn + số lượng. **Nhãn nhóm là chữ trơn đậm vừa (500), KHÔNG Badge** (CEO 25/11/2026): Badge dành cho thuộc tính của dòng — nhóm vẽ bằng Badge trùng hệt nhãn trong dòng (vd nhóm "Không có hạn" ngay trên ưu tiên "Thường"). Cần nhấn thì đổi màu chữ ("Quá hạn" = `color-text-danger`). Danh sách rỗng → chỉ `EmptyState`, không vẽ hàng đầu cột.

## Bàn phím & a11y
`role="table"`/`row`/`columnheader`; dòng `tabIndex=0`, Enter mở bản ghi, phím Menu/Shift+F10 mở menu thao tác.

## Code
- Dựng bằng CSS grid (không `<table>`) trên dữ liệu TanStack Table (dùng chung model với `Table`, chỉ khác cách vẽ); ảo hoá dòng (`@tanstack/react-virtual`) khi > ~200 dòng.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`DanhSach`, `gom`) + `bang.css` (`.b-ds*`, `.b-ticket`, `.b-nhan-dau`).

**Chọn dòng (thêm 23/11/2026):** dòng ListView chọn được bằng `OChonO` (bang/) đặt ĐẦU ô đầu tiên, trong `KhungChon` + `ThanhDaChon` như Table; cùng luật ô chọn ẩn chờ rê (README Table). Bấm ô chọn không mở bản ghi. **Từ 768 ô chọn nằm ở lề trái NGOÀI dòng** (CEO 25/11/2026, như cột chọn của Table): đặt tuyệt đối `right: 100%` của dòng (dòng `relative`), mép phải ô tick cách mép nội dung (mép dòng) 10, trùng cột chọn Table, căn tâm dòng — nội dung dòng không bị ô tick xô vào; < 768 ô chọn ở trong dòng.
