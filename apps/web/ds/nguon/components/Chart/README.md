Khung biểu đồ: màu chuỗi theo cấu hình, chữ trục, lưới, tooltip, chú giải — biểu đồ vẽ bằng Recharts bên trong.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`chart.tsx` @45bbf9b, MIT) trên Recharts 3.8.0 (bản registry shadcn ghim), thêm ở Đợt 8 chép shadcn (21/11/2026).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Khung | `data-slot="chart"` | chữ 12/18 (text-xs DS), mặc định tỉ lệ 16:9 — màn đặt `aspect-auto h-60 w-full` |
| Chữ trục | `muted-foreground` | sáng #5d5d5d · tối #afafaf |
| Lưới | `--color-border-subtle` | alpha-05 sáng · alpha-06 tối |
| Tooltip | `popover` + `--shadow` + `--shadow-hairline` | bo 10 (radius-lg), đệm 6/10, chữ 12/18, số `tabular-nums` |
| Ô màu chú thích | `--radius-2xs` | 2px |
| Màu chuỗi | ramp token (dưới) | `var(--color-<khoá>)` sinh từ `config` |

## Màu chuỗi

DS **chưa có** `--chart-1..5` (artifact không khai). Tạm gọi thẳng ramp token theo thứ tự cố định — **không đặt hex trần**:

| Thứ tự | Token | Hex |
| --- | --- | --- |
| 1 | `--blue-400` | #0285ff |
| 2 | `--orange-500` | #e25507 |
| 3 | `--pink-600` | #ba437a |
| 4 | `--purple-400` | #924ff7 |
| 5 | `--green-600` | #008635 |

Đã chạy bộ kiểm dataviz (`validate_palette.js`, 21/11) trên nền sáng #ffffff và tối #212121: cả 5 token qua **cả hai theme** — dải sáng, độ bão hoà ≥ 0.10, khác biệt mù màu cặp kề ΔE ≥ 15.5 (mục tiêu 8), mắt thường ≥ 15.6 (sàn 15), tương phản với nền ≥ 3:1. Một bộ dùng chung hai theme → `config` chỉ cần `color`, không cần `theme`.

- Gán màu theo **thứ tự chuỗi**, không theo hạng; lọc bớt chuỗi không đổi màu chuỗi còn lại. Quá 5 chuỗi → gộp "Khác" hoặc tách biểu đồ.
- Màu trạng thái (thành công/lỗi/cảnh báo) không dùng làm màu chuỗi thường; chuỗi mang nghĩa tốt/xấu thì dùng token trạng thái + nhãn.
- Đề xuất mở: thêm `--chart-1..5` vào artifact (trỏ đúng 5 token trên) để màn gọi `var(--chart-1)` như shadcn.

## Cách dùng

- Một trục tung. Cột: đầu cột bo 4 (`radius` 4 4 0 0), hai cột cạnh nhau cách 2 (`barGap` 2); cột chồng: khe 2 màu nền (`stroke` = `var(--background)`, `strokeWidth` 2), chỉ khúc trên cùng bo. Đường: nét 2, không chấm, chấm 4 khi rê.
- ≥ 2 chuỗi luôn có chú giải. **Recharts 3 tự xếp chú giải theo tên** → truyền `itemSorter` = `null` cho `ChartLegend` để giữ thứ tự chuỗi.
- Tooltip luôn có (`ChartTooltip` + `ChartTooltipContent`); `indicator` dot / line / dashed. Recharts 3 bật `accessibilityLayer` sẵn: focus biểu đồ, ←/→ đi qua từng điểm.
- Màn nghiệp vụ phải có bảng số liệu đi kèm (hoặc nút xem bảng) — màu không phải kênh duy nhất.
- **GWT sửa:** shadcn chọn chữ trục qua thẻ `text` trong `.recharts-cartesian-axis-tick`; Recharts 3.8 đổi cấu trúc → không khớp, chữ trục giữ #666. DS chọn `.recharts-cartesian-axis-tick-value`.
- Theme tối của `config.theme`: selector `[data-ds="v2"][data-theme="dark"]` (shadcn: `.dark`).

**Code:** `components/ui/chart.tsx`. Khối `/ds#chart`.
