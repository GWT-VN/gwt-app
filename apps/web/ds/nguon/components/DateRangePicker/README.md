Chọn **khoảng ngày** — **kiểu Airbnb** (Dũng chốt 18/11/2026), dựng trên `DatePicker` (cùng ô ngày tròn, cùng trigger).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Đầu bảng — trái | `heading-sm` | "18 ngày" (đủ 2 đầu) / "Chọn ngày bắt đầu" / "Chọn ngày kết thúc" 18/26 600 (`aria-live`) + dòng `ui-caption` "01/11/2026 – 18/11/2026" |
| Đầu bảng — phải | `input` viền, `radius-lg` | 2 ô **Từ ngày / Đến ngày** (nhãn 10/14 600 in hoa, giá trị 14/20); ô đang chọn viền 2px `foreground`; bấm "Từ ngày" = chọn lại từ đầu, "Đến ngày" = giữ ngày đầu, chọn lại ngày cuối |
| 2 tháng | | cách nhau 40px; tháng trái chỉ có ‹, tháng phải chỉ có › |
| Đầu / cuối | `color-background-primary-solid` | hình tròn đặc; **nửa dải xám** phía trong nối vào khoảng |
| Giữa khoảng | `alpha-05` | dải liền, vuông, không bo |
| Xem trước | | đã có ngày đầu, **rê chuột** lên ngày sau → dải xám tới ô đang rê + ô đó viền tròn |
| Mốc nhanh | `Button outline sm` (pill) | Hôm nay · Tuần này · Tháng này · 30 ngày — lấy từ **`PRESETS`/`khoangPreset()` của `apps/web/bang/ngay.ts`**; mốc đang khớp viền 2px `foreground` + nền `alpha-04` |
| Chân | | trái "Xoá ngày" (`ghost sm`, gạch chân) · phải Huỷ (`outline sm`) · Áp dụng (`sm`, tắt khi chưa đủ 2 đầu) |
| Điện thoại ≤ 640px | | đầu bảng xếp dọc, ô Từ/Đến full ngang; **1 tháng** (tháng chứa ngày cuối) đủ ‹ › |

**Như `DatePicker`:** trigger đọc tên = nhãn + khoảng đang chọn; bảng nổi trần cao theo chỗ trống + cuộn trong bảng; `min`/`max` kẹp tháng mở và ‹ ›.

**Hành vi:** bấm lần 1 = ngày đầu, lần 2 = ngày cuối (bấm trước ngày đầu → làm lại ngày đầu). Giá trị chỉ đổi khi **Áp dụng**; Huỷ/Esc giữ giá trị cũ. Phím đưa focus ra ngoài tháng đang xem → tự lật tháng.

**Mốc "30 ngày"** = `homNay − 30` → hôm nay, tức **31 ngày** tính cả hai đầu — giữ nguyên theo `ngay.ts` (Dũng chốt 18/11/2026), không sửa.

**Code:** shadcn `Calendar mode="range" numberOfMonths={2}` (`range_start`/`range_end` tròn đặc + nửa dải, `range_middle` dải `alpha-05`) + đầu bảng và chip tự làm; URL lọc vẫn `ngtu`/`ngden` như `LocNgay`.
Prototype: nhánh `prototype/v2-khung`, route `/prototype/form` (`apps/web/app/prototype/form/_form/FormDemo.tsx`); CSS ở khối `BỔ SUNG DS FORM` cuối `khung/_proto/ui.css`.
