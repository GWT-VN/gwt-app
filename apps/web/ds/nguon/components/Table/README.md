Dạng xem **Bảng** (shadcn `Table` + TanStack, dựng bằng token OpenAI — **mở rộng GWT**): so nhiều cột, tự sắp đặt cột, sửa tại ô — đã chốt 18/11/2026. Ảnh: nhóm asset **Mẫu màn — Ticket**.

## Cột
- Mặc định (ticket): Ưu tiên 76 · Loại lỗi 148 · Mã 104 · Khách 128 · Trạng thái 124 · Việc tiếp theo 124 · Hạn 100 · Chủ 60 (+ ô chọn 36) — vừa vùng 944px ở màn 1440. Ẩn sẵn: Máy·serial, Người làm, Số ngày mở, Nguồn (bật trong ⚙ → Cột hiển thị).
- `table-layout: fixed` + `colgroup` theo độ rộng; tràn thì cuộn ngang trong khung, trang không tràn.

## Nhãn cột: lọc + sắp xếp, hàng tab giữ sạch
- Nhãn cột là DS `ui-th-sort`; bấm → menu (DS `DropdownMenu`). Menu theo **bản chất dữ liệu của cột** (CEO nhắc 18/11 + 19/11):
  - **Cột nhãn/phân loại** (Loại lỗi, Trạng thái, Chủ, Khách, Nguồn) → **chỉ Lọc**: liệt kê đúng các tag/giá trị đang có (vẽ bằng `Badge` như trong ô, kể cả "Chưa phân loại"), tick nhiều, "Bỏ lọc cột này". **Không có Tăng dần/Giảm dần** — sắp nhãn theo chữ cái là vô nghĩa.
  - **Cột có thứ tự/số lượng** (Ưu tiên, Hạn, Số ngày mở, Thứ tự tạo) → **Sắp xếp**, nhãn nói nghĩa: "Gấp trước", "Gần hạn nhất trước", "Mở lâu nhất trước", "Mới tạo trước" — không ghi "Tăng dần/Giảm dần" (giống `NGHIA_SAP_XEP` trong app).
- Đang sắp: mũi tên ↑/↓ có nhãn đọc màn hình theo nghĩa ("gấp trước"); đang lọc: phễu + số giá trị đang chọn. Xem khối "Menu tiêu đề cột" trong preview.
- Code: tiêu đề cột nhận `kieu: 'sap' | 'loc'`; test chặn cột nhãn khai `sap`.
- **Một lớp hover**: cả ô tiêu đề sáng `alpha-04`, nút menu phủ kín ô, không nền riêng. Chữ tiêu đề **thẳng mép** nội dung ô; **không có icon tay cầm** — con trỏ `grab` khi rê là đủ báo kéo được.

## Kéo đổi chỗ & co dãn cột
- Kéo bất kỳ đâu trên ô tiêu đề (con trỏ grab). Cột nguồn: nền `alpha-05`, nội dung mờ 40%. Vạch thả: 2px `ring` suốt chiều cao bảng, bên trái/phải theo nửa ô đang rê. Bóng kéo: thẻ nhỏ tên cột (hairline + `shadow-300`, bo `radius-md`).
- Mép phải ô tiêu đề (8px) kéo để co dãn, tối thiểu 56px, nhấp đúp về mặc định; vạch `ring` hiện khi rê đúng mép.
- Cột người (Chủ, Người làm) hẹp < 112px thì chỉ hiện avatar.

## Mở bản ghi
- **Mặc định**: bấm dòng → trang chi tiết.
- **Thẻ xem nhanh** chỉ khi bật ở `DataViewToolbar`: thẻ nổi trong vùng nội dung (cách mép 8px, bo `radius-3xl`, `shadow-hairline` + `shadow-300`, rộng 440px), **vùng cuộn co lại nhường chỗ — không che bảng**; ↑↓ lướt, Esc đóng.
- **Nội dung trang chi tiết / thẻ xem nhanh: CHƯA CHỐT** — ảnh 4, 6 trong nhóm asset chỉ minh hoạ bố cục đẩy bảng.

## Token
| Phần | Token | Giá trị |
| --- | --- | --- |
| Header | `muted-foreground` | cao 36px, chữ `text-xs` 12/18, dính đầu khi cuộn, kẻ dưới `alpha-08` |
| Dòng | | cao 44px, padding ngang 10px, kẻ dưới `alpha-05`, hover `alpha-02` |
| Dòng đã chọn | `color-background-info-soft-alpha` | |
| Số liệu | | căn phải, `tabular-nums`, dấu chấm hàng nghìn (vi-VN) |
| Mã | `font-sans` + `tabular-nums` | `text-xs` 12/18 `color-text-tertiary` (không mono) |
| Chữ | thang DS | chỉ dùng `heading-*` / `text-*` của DS — không cỡ lẻ (13px, 11px…), không line-height/letter-spacing tự đặt |
| Thanh cuộn | | ẩn ở vùng bảng |

**Trạng thái bắt buộc:** đang tải (khung + header + 3–5 dòng skeleton, `aria-busy`) · rỗng do lọc (gợi ý bỏ điều kiện + "Xoá bộ lọc") · rỗng thật (cách tạo bản ghi đầu) · lỗi (`Alert` danger + "Thử lại", giữ dữ liệu cũ và nói rõ có thể đã cũ). Chọn nhiều dòng → thanh thao tác hàng loạt nổi đáy màn.

## Bàn phím & a11y
`aria-sort` trên `th` cột sắp được; tay cầm co dãn `role="separator"` `aria-orientation="vertical"` có nhãn; đổi chỗ cột phải làm được bằng bàn phím (dnd-kit KeyboardSensor) — prototype mới hỗ trợ chuột.

## Code
- TanStack Table v8: `columnOrder`, `columnSizing` + `enableColumnResizing` (`columnResizeMode: 'onChange'`), `columnVisibility`, `sorting`, `columnFilters`, `grouping` — state đồng bộ URL/saved view.
- Đổi chỗ cột: `@dnd-kit/sortable` (trục ngang, có bàn phím) — **đề xuất thay** HTML5 drag của prototype.
- Menu nhãn cột: shadcn `DropdownMenu` (Radix tự portal/lật/khử va chạm — prototype phải tự viết `Noi` vì thiếu thứ này: menu bị vùng cuộn cắt).
- Logic lọc/sắp: gói `apps/web/bang/` (`TieuDeCotSapXep`…), chuẩn `docs/CHUAN-FILTER.md`.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`BangCot`, `COT`, `ManTicket`) + `chung.tsx` (`DauCot`, `useBang`, `Noi`) + `bang.css`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- Mới `TableCaption`: chú thích dưới bảng, 14/20 muted, cách trên 16 (bảng `caption-bottom`).
- `Table` đứng ngoài `TableWrap` tự bọc `div[data-slot=table-container]` cuộn ngang, thanh cuộn ẩn (như shadcn); nằm trong `TableWrap` thì không bọc thêm (giữ tiêu đề dính).
- Căn ô tick: Checkbox DS hoặc `input type=checkbox` của `bang/` là con TRỰC TIẾP của `th`/`td` → bỏ độ dời 1px, tâm ô tick đúng tâm dòng (trước thấp hơn chữ 2–3px). Ô tick trong nhóm flex (NotificationMatrix) chỉ bỏ độ dời. Không dùng `translate-y-[2px]` của shadcn.
- `TableRow conTro` mới → `data-con-tro`: dòng đang trỏ (phím tắt theo dòng áp vào nó), nền `alpha-04`, thắng hover, thua "đã chọn"; focus phím có vòng 2px `ring` lùi vào. Roving `tabIndex` do màn đặt; chọn nhiều Ctrl/⇧ + bấm qua `bang/ChonDong.tsx` (R16).
- `TableRow` nhận `data-state` từ ngoài (`ContextMenuTrigger asChild`), `chon` thắng.
- Không chép của shadcn: kẻ viền trên `tr` (DS kẻ trên ô, `border-separate`), `pr-0` cho ô checkbox.
- Giữ: `variant` `du-lieu` / `thuong`, `layout="fixed"`, `TableWrap vien`, `BangTrangThai`.
