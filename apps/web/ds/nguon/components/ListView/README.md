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

**Mở bản ghi chỉ qua tên (`moKhi="ten"`, CEO 25/11 màn Việc):** tên là `NutMoTen` (chữ thường, rê gạch chân, focus vòng ring); chỉ bấm tên hoặc mã mới mở thẻ xem nhanh, bấm chỗ trống của dòng không làm gì (dòng không con trỏ tay); Enter trên dòng vẫn mở. Đổi tên ở thẻ (bút chì cạnh tiêu đề), không sửa tại ô.

## Bàn phím & a11y
`role="table"`/`row`/`columnheader`; dòng `tabIndex=0`, Enter mở bản ghi, phím Menu/Shift+F10 mở menu thao tác.

## Code
- Dựng bằng CSS grid (không `<table>`) trên dữ liệu TanStack Table (dùng chung model với `Table`, chỉ khác cách vẽ); ảo hoá dòng (`@tanstack/react-virtual`) khi > ~200 dòng.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`DanhSach`, `gom`) + `bang.css` (`.b-ds*`, `.b-ticket`, `.b-nhan-dau`).

**Chọn dòng (thêm 23/11/2026):** dòng ListView chọn được bằng `OChonO` (bang/) đặt ĐẦU ô đầu tiên, trong `KhungChon` + `ThanhDaChon` như Table; cùng luật ô chọn ẩn chờ rê (README Table). Bấm ô chọn không mở bản ghi. **Từ 768 ô chọn nằm ở lề trái NGOÀI dòng** (CEO 25/11/2026, như cột chọn của Table): đặt tuyệt đối `right: 100%` của dòng (dòng `relative`), mép phải ô tick cách mép nội dung (mép dòng) 10, trùng cột chọn Table, căn tâm dòng — nội dung dòng không bị ô tick xô vào; < 768 ô chọn ở trong dòng.

## Tạo tại chỗ — dòng "+ Mới" (`DongThem`, CEO chốt 25/11/2026)
Thay hộp "Tạo …": cuối danh sách / bảng (Kanban: chân mỗi cột, trừ cột cuối "Xong") có dòng **"+ <tên bản ghi> mới"** — DS `Button` ghost xs + icon `Plus`, chữ `color-text-tertiary`, icon thẳng mép chữ của dạng xem (ListView đệm 16 · Table 6 · Kanban 8; lề âm = đệm nút, như nút thêm của `PropertyList`).
- **Bấm → hiện HẲN MỘT HÀNG TRỐNG** (CEO 25/11: "không dùng form kiểu này", "ra hẳn một hàng trống"): dòng nháp cùng lưới cột, cao bằng dòng thật (ListView 50 · Table 44), nền `alpha-05`, các ô khác để trống, ô tên là ô gõ trơn 14/20 (không viền, gợi ý tertiary) — `ListView dongNhap` / `BangViec dongNhap` + `useDongMoi`; Kanban: một thẻ trống trong cột. Nút "+" ẩn khi đang có hàng nháp.
- **Enter = tạo ngay** chỉ với tên (trường bắt buộc duy nhất) — thuộc tính khác sửa tại ô (`InlineEdit`) trên dòng vừa hiện; tạo xong ô xoá trắng, GIỮ mở để gõ tiếp; Esc / rời ô khi trống = đóng, rời ô khi đã gõ = giữ chữ. Đang gửi: ô chỉ đọc (không disabled — giữ focus), chặn Enter lặp. Lỗi: toast, giữ chữ.
- Nút chính thanh công cụ ("+ <tên> mới") mở dòng này (`ref.mo()`, focus lại nếu đã mở). Nhiều dòng trên một màn (cột Kanban) → `nhanDoc` ghép tên cột ("Việc mới — Đang làm").
- **Chỉ đặt dòng ở chỗ bản ghi vừa tạo sẽ hiện**: tab mặc định, KHÔNG lọc / từ khoá (Việc: tab Đang mở / Mọi việc). Đang lọc thì không có dòng; bấm nút chính = về tab mặc định + bỏ lọc rồi mở dòng. Kanban ở chỗ được thêm luôn vẽ đủ cột kể cả chưa có bản ghi.
- Code: `components/ui/dong-them.tsx`, `KanbanBoard chanCot`.
