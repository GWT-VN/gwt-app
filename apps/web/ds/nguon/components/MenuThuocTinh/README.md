**Mẫu ghép** (pattern, không phải component mới): menu thuộc tính kiểu Linear trên bảng — đổi trạng thái, người làm, ưu tiên, nhãn, hạn của một hoặc nhiều dòng.

**Lên artifact 23/11/2026** — nguồn là prototype `/prototype/menu-thuoc-tinh`, CEO duyệt 20/11/2026; thêm ở repo lát 7. Ghép hoàn toàn từ component DS sẵn có, màn không tự ghép primitive Radix.

| Phần | Component DS | Ghi chú |
| --- | --- | --- |
| Bảng | `Table` + `TableRow conTro` | dòng đang trỏ nền `alpha-04`, vòng focus; roving `tabIndex` (0 dòng trỏ, −1 dòng khác) do màn đặt |
| Chọn nhiều | `Checkbox` + `chonTheoBam` (`bang/ChonDong.tsx`) | tick cột đầu, Ctrl/⌘ + bấm (thêm/bớt), ⇧ + bấm (dải từ neo) |
| Menu | `ContextMenu` (chuột phải dòng) + `DropdownMenu` (nút … cuối dòng) | CÙNG một nội dung menu cho cả hai — chọn bộ component theo nơi mở (khác context Radix) |
| Mục mở menu con | `*SubTrigger icon phim` | icon · nhãn · Kbd phím tắt · ▸ |
| Giá trị | `*RadioGroup` / `*RadioItem` | ✓ ở giá trị chung của các dòng đích; lệch nhau → không ✓ mục nào |
| Nhãn | `*CheckboxItem` | ✓ có hết · – (`checked="indeterminate"`, `aria-checked="mixed"`) có một phần · bấm giữ menu mở |
| Người làm | `MenuTimKiem` | > 10 người → ô gõ để tìm ở đầu menu con (CHUAN-FILTER) |
| Hạn | `DateTimePicker gon open onOpenChange` | "Đặt hạn…" mở pop NGAY TẠI ô Hạn của dòng; chỉ lưu khi Xong |
| Thông báo | `thongBao.xong(chu, { hoanTac })` | mỗi lần đổi một toast, nút "Hoàn tác" |

**Phím tắt chuẩn** (khai `aria-keyshortcuts` trên dòng): **S** trạng thái · **A** người làm · **P** ưu tiên · **L** nhãn (mở thẳng menu con) · **⇧D** hạn · **↑/↓** đổi dòng · **Esc** bỏ chọn · **⇧F10** / phím Menu = chuột phải. Trên dòng: `usePhimTat(ban, { vung: thanBang })` — chỉ bắn khi focus trong thân bảng, nhường ô gõ và bộ gõ đang ghép chữ (IME). Trong menu đang mở: khung menu bắt cùng các phím (pha capture) để nhảy sang menu con khác; ô tìm giữ phím để gõ.

**Ba cách mở, một menu:** chuột phải dòng · nút … · phím khi đang trỏ dòng (menu neo nút … của dòng). Mở menu con bằng phím → focus vào ô tìm, không có thì mục đang ✓, không có thì mục đầu. → mở menu con, ← về mục cha, Esc đóng hết và focus về DÒNG (phím tắt chạy tiếp được ngay).

**Luật chọn nhiều:** menu mở trên dòng NẰM TRONG vùng chọn (≥ 2 dòng) → đầu menu "N ticket", áp cả vùng; dòng NGOÀI vùng → chỉ dòng đó (vùng chọn giữ nguyên). Bấm thường chỉ dời con trỏ, không đổi vùng chọn.

**Hoàn tác:** chụp giá trị cũ của TỪNG dòng đích trước khi đổi; "Hoàn tác" trả mỗi dòng về đúng giá trị của nó (3 dòng Cao/Vừa/Khẩn đổi hết sang Thấp → hoàn tác về lại Cao/Vừa/Khẩn), không gán một giá trị chung.

**"Đặt hạn…":** chọn mục → menu đóng hẳn rồi mới mở pop hạn (trong `onCloseAutoFocus`, để focus không tranh nhau giữa menu và pop); pop neo ô Hạn của dòng đã mở menu, lưu cho cả vùng đích. Esc / Huỷ / bấm ra ngoài = không lưu.

**Màn hẹp:** v1 chỉ đảm bảo menu con không tràn ngang (R14). Kiểu "drill-in" (menu con thay chỗ menu cha) đang mở.

**Code:** khối `/ds#menu-thuoc-tinh` — `app/ds/_khoi/khoi-menu-thuoc-tinh.tsx` (+ dữ liệu demo `khoi-menu-thuoc-tinh-du-lieu.ts`).
