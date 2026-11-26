# Bảng DS theo Twenty — đặc tả (26/11/2026)

**CEO chốt 26/11:** "Chép y Twenty luôn làm prototype. Menu nav giữ nguyên, phần bảng làm y hệt họ" + "tiêu đề cột y hệt
Twenty, kể cả dưới chuẩn tương phản" → prototype `/ticket?variant=T` (`app/ticket/_prototype/ds-t.tsx` +
`ds-t.module.css`) chép đúng số đo cột "Twenty" dưới đây (cả #999 tiêu đề). Cột "Đề xuất" (giữ AA) chưa áp — chờ duyệt
prototype rồi mới quyết đưa vào Table DS.

Nguồn: mã nguồn Twenty (clone nông, commit `63ba48a`, ngoài repo — AGPL-3.0, chỉ học số đo, không chép code):
`packages/twenty-ui/src/theme/constants/Theme{Light,Dark}.ts`, `packages/twenty-front/src/modules/object-record/record-table/**`.
Số DS hiện tại đo `getComputedStyle` trên `/ticket?variant=F` (1440, sáng/tối).

## Twenty đo được

| | Sáng | Tối | Dùng ở bảng |
|---|---|---|---|
| `font.color.primary` | #333 | #EBEBEB | chữ ô, tên dòng đầu |
| `secondary` | #666 | #B3B3B3 | dòng hành động ("+ Add New") |
| `tertiary` | #999 | #818181 | **tiêu đề cột**, icon cột, nhãn dòng tổng |
| `light` | #B3B3B3 | #666 | ô trống / chữ gợi ý |
| `extraLight` | #CCC | #4D4D4D | viền rê ô |
| viền `border.light` | #F1F1F1 | — | kẻ dưới + **kẻ phải mọi ô** (lưới) |
| Chữ | Inter 13px; tiêu đề cột 13/500 + icon kiểu dữ liệu, khoảng 4 | | |
| Kích thước | dòng **32**, đệm trái ô 8, cột tick 28, cột tối thiểu 104, "+" thêm cột 32 | | |
| Dòng cuối | "+ Add New" (secondary) · dòng **tổng** dính đáy: "Count all 5", "Empty of X 100%" (nhãn tertiary, số primary) | | |

## DS hiện tại

Chữ ô #0D0D0D 14px · tiêu đề cột 12/400 #5D5D5D · dòng 44 · đệm 10 · chỉ kẻ ngang (th alpha-08, td alpha-05).

## Đề xuất (giữ chuẩn AA — Twenty #999 trên trắng chỉ 2,8:1, không chép)

| | Hiện tại | Đề xuất | Tương phản trên nền (sáng) |
|---|---|---|---|
| Chữ ô | `foreground` #0D0D0D | `gray-300` #303030 sáng · `gray-900` #EDEDED tối | 13,6:1 |
| Tiêu đề cột | 12/400 #5D5D5D | **13/500** `gray-550` #767676 sáng · `gray-650` #9F9F9F tối | 4,54:1 (AA) |
| Mã, ô trống | `color-text-tertiary` #8F8F8F | `gray-550` (cùng tiêu đề) | 4,54:1 |
| Cỡ chữ ô | 14 | **13** | — |
| Cao dòng | 44 | **36** (32 của Twenty quá sát cho ô có badge 22 + avatar) | — |
| Đệm ngang ô | 10 | **8** | — |
| Kẻ | ngang | ngang alpha-05 + **dọc alpha-05** (lưới như Twenty) | — |
| Dòng tổng | không có | `TableFooter` dạng Twenty: nhãn mờ + số (đếm, % trống) — tuỳ màn bật | — |

Phạm vi: vẻ bảng dữ liệu `.b-bang` (Table mặc định, ListView không đổi). Bảng thường (`variant="thuong"`) giữ nguyên.

## Ảnh hưởng

- Mọi màn dùng Table mặc định (Work, CSKH, Sales…) đổi cùng lúc.
- Cổng so khớp Table với artifact sẽ lệch → đồng bộ lên artifact (bundle.css `.b-bang*`) sau khi duyệt trên app.
