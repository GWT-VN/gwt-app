# Notion — hành vi từng loại property (đo 27/11/2026)

> Mục đích: học **hành vi** (luồng, bàn phím, vị trí popup, cách hiện giá trị). Không chép giao diện (màu, vạch, cỡ chữ của Notion) vào DS GWT.
> Môi trường: Chrome riêng (CDP 9333), Notion web, theme tối. Đo bằng `getBoundingClientRect` / `getComputedStyle` (đơn vị px CSS).
> Trang thử: **"GWT — thử properties (xoá được)"** (Private) — https://app.notion.com/p/GWT-th-properties-xo-c-42550b60054380e0b1dccf5feaf6044a — 1 database inline "New database", 3 dòng "Việc thử A/B/C", 22 property.
> Ảnh: `C:\Users\Duncr\AppData\Local\Temp\claude\d2fa843791a29a0f\9d5dc202-19a7-43e4-bf9a-2b7a84a1d1c8\scratchpad\cdp\notion-props\` (gọi tắt `np/`). Thư mục tạm (scratchpad) — chép ảnh nào cần giữ sang chỗ bền.
>
> Lưu ý số đo: phần lớn đo ở viewport 1424×805 (bảng ở trái, side peek rộng 712 ở phải). Vài số đầu (Person ở bảng) đo lúc viewport 1920×945 — chỉ toạ độ khác, kích thước giống.

## 0. Khung chung (áp cho mọi property)

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Ô bảng — nghỉ | Ô không nền, không viền riêng; vạch lưới mờ | ô 200×37 (cột mặc định 200, Name 280) |
| Ô bảng — rê chuột | **Không đổi nền**, chỉ đổi con trỏ `pointer` | bg `transparent` khi hover (đo `elementFromPoint`) |
| Ô bảng — đã chọn (sau Esc) | Viền xanh trong ô + nền xanh rất nhạt + chấm kéo-điền góc dưới phải | `inset 0 0 0 2px rgb(39,131,222)`, bg `rgba(35,131,226,.07)`, bo 2; chấm 9×9 tròn |
| Bấm ô (editor dạng popup) | Popup **đè đúng lên ô**, mép trái-trên lệch **−1px** so với ô; rộng **tối thiểu 240** (Select/Multi 300), cao co theo nội dung | Person ô [740,475,200,38] → popup [739,474,240,104]; Select → 300×132; Status 240×288 |
| Hết chỗ phía dưới | **Lật lên trên**: đáy popup dính mép trên hàng; khi nội dung co/giãn thì **đáy giữ cố định, nở lên trên** | Status peek: hàng y=620 → popup [957,370,376,251] đáy 621; gõ lọc → popup còn [957,582,376,39] (đáy vẫn 621). Relation bảng: ô y=475 → popup đáy 474 |
| Popup quá cao (Date 500px) | Dời cho vừa viewport, chừa ~12px mép | Date ở ô y=475 → popup top=12; ở peek → [957,293,248,500] đáy 793 (viewport 805) |
| Popup chung | nền `#252525`, bo **6**, bóng `0 0 0 1px rgb(56,56,54), 0 14px 28px -6px …`; ô tìm ở đầu cao 39, ngăn dưới bằng `inset 0 -1px 0 rgba(255,255,235,.1)` | — |
| Tiêu đề nhóm trong popup | chữ 12px/500 xám `rgb(173,169,163)`; mục cao **28**, bo 6, hover/highlight `rgba(255,255,255,.055)` | — |
| Side peek — hàng thuộc tính | Nhãn trái 160px (icon 16 + tên 14px xám), giá trị phải 375px; **hàng cao 34** | nhãn pad `0 6`, bo 6; giá trị pad `7px 6px`, bo 4; "Empty" 14px màu `rgb(125,122,117)` |
| Side peek — rê nhãn | Nhãn có nền hover; **icon property biến thành tay nắm kéo ⋮⋮** (kéo đổi thứ tự) | bg `rgba(255,255,255,.055)`, cursor pointer |
| Side peek — rê giá trị | Gần như không nền; hiện nút phụ bên phải (URL/Phone: Comment + Copy) | xem từng loại |
| Side peek — bấm giá trị | Popup đè đúng ô giá trị, **rộng = rộng ô giá trị** (376) | Person peek: ô [954,439,379,34] → popup [1453,439,376,104] (đo ở 1920) |
| Đóng popup bằng Esc | Đóng, ô/ hàng còn **focus ring** (`0 0 0 2px #191919, #2383E2`) | — |
| **Esc khi không có popup trong peek** | **Đóng luôn side peek** (đã dính 2 lần khi đo) | — |
| **Tab trong popup ở peek** | Lưu + **mở editor của property kế tiếp**; Shift+Tab về property trước | Person → Tab → popup Nhãn mở ngay ở hàng dưới |
| Bảng — bàn phím | Esc sau popup: ô vẫn được chọn; **Enter mở lại editor**; ↑ lên hàng; Tab sang cột phải; Esc lần nữa bỏ chọn | (→ chưa thấy dời trong 1 lần thử — xem "chưa đo") |
| Thứ tự trong peek | Theo **tên property (so mã ký tự)**, không theo thứ tự cột bảng ("Ô tick", "Điện thoại" xuống cuối) | quan sát ở DB thử, chưa sắp xếp tay |
| Nút OPEN ở ô Name | Hiện khi rê dòng; khi dòng đang mở peek đổi thành **CLOSE** | nút 62×20 |
| Chọn dòng (checkbox trái) | Hiện **thanh hành động hàng loạt** trên đầu bảng: "1 selected · Người · Chọn · 🗑 · …" | `np/71-state.png` |

Ảnh: `np/31-person-cell-open.png`, `np/42-peek-person-open.png`, `np/70-status-peek-open.png`, `np/80-date-peek-open.png`, `np/200-table-hover-cell.png`.

---

## 1. Person ⭐

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Trống (bảng / peek) | Bảng: ô trắng; peek: "Empty" xám | 14px, `rgb(125,122,117)` |
| Có giá trị | Avatar tròn + tên, cắt `…` | avatar **20×20** tròn; tên 14px/21; khoảng avatar→tên **6px** |
| Bấm | Popup đè ô. Dòng đầu = ô tìm "Search for people or groups…"; dưới: nhóm **"Select as many as you like"** (12/500 xám) + danh sách người, mục 28 | bảng 240×104; peek = rộng ô (376×104) |
| ↑/↓ | Highlight mục (nền `rgba(255,255,255,.055)`) | — |
| Enter / bấm mục | **Popup ở lại**; người được chọn **chuyển thành chip trong dòng tìm** và **biến khỏi danh sách**; tiêu đề nhóm đổi thành "People" + nhóm "More → Invite people" | chip 20 cao: avatar 20 + tên + nút × 20×20 (bo 6), chip **không nền**; ô nhập lùi sang phải sau chip |
| Backspace khi ô tìm trống | **Xoá chip cuối**, người quay lại danh sách | — |
| Gõ lọc | Lọc không dấu/không hoa ("dun" → "Dũng") | — |
| Gõ không khớp | "No matches in <workspace>" + "Invite people" (không tạo mới được) | `np/34-person-nomatch.png` |
| Tab (peek) | Sang editor property kế | — |
| Esc | Đóng; giá trị hiện avatar + tên | `np/35-person-cell-value.png`, `np/43-peek-person-value.png` |
| Cấu hình | **Limit** (No limit / 1 person), **Default** (mặc định người), **Notifications** | `np/211-person-config.png` |

Ảnh: `np/31`, `np/32-person-picked.png`, `np/33-person-backspace.png`, `np/42-peek-person-open.png`.

## 2. Select

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Có giá trị | Chip màu, **bo 4**, pad `0 6`, cao 20, chữ 14 | ví dụ Đỏ: bg `rgba(255,116,105,.525)` |
| Bấm | Popup 300 (bảng) / rộng ô (peek). Ô tìm "Search for an option..."; nhóm "Select an option or create one"; mỗi option: **⋮⋮ kéo** trái + chip + nút **…** phải (24×24, hiện khi rê) | mục 28 |
| Đang có giá trị | Chip nằm trong dòng tìm, **có × trong chip**; option đã chọn **vẫn ở danh sách** | — |
| ↑/↓ | Highlight, **quay vòng** (↓ ở cuối về đầu) | — |
| Enter / bấm | Chọn, **thay giá trị cũ và đóng popup** | — |
| Gõ chữ chưa có | Lọc mất hết, còn 1 mục **"Create <chữ>"** đã highlight → Enter tạo + chọn + đóng; **màu gán ngẫu nhiên** | `np/51-select-typed-create.png` |
| Backspace khi trống | Xoá giá trị, popup ở lại | — |
| Nút … của option | Popup con 220×418 cạnh phải: ô đổi tên, "Add description", Delete, nhóm **Colors** (10 màu, mục 28); chọn màu **không đóng** popup | `np/56-select-option-menu.png` |
| Cấu hình | Sort (Manual/…), danh sách Options, Generate with AI | `np/214-select-config.png` |

## 3. Multi-select

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Có giá trị (bảng) | Chip nối nhau, **xuống dòng** khi hẹp (bảng mặc định wrap) | khoảng cách chip **8** (peek), cao 20 |
| Bấm | Giống Select, nhưng **popup ở lại** sau mỗi lần chọn/tạo | — |
| Nhiều chip | Chip xếp trong vùng tìm, **wrap nhiều dòng**, ô nhập xuống dòng mới; vùng đầu cao 39 → 65 | chip cách nhau 6 trong popup |
| Bấm lại option đã chọn | **Không bỏ chọn** (giữ nguyên) — bỏ chỉ bằng × hoặc Backspace | — |
| Backspace khi trống | Xoá chip **cuối** | — |
| Gõ "vip" | Lọc không phân biệt hoa thường, mục khớp highlight đầu, **kèm "Create vip"** ở dưới | — |
| Thứ tự chip | Theo thứ tự chọn | — |

Ảnh: `np/60-multi-peek-3chips.png`, `np/61-multi-peek-value.png`.

## 4. Status

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Mặc định | Dòng mới **tự có "Not started"** (option DEFAULT) — không có trạng thái trống | — |
| Hiện | Chip **bo 10 (viên thuốc) + chấm màu 8×8** | pad `0 9 0 7`, cao 20 |
| Bấm | Popup chia **3 nhóm cố định** To-do / In progress / Complete, có vạch ngăn; chip hiện tại ở dòng đầu **không có ×** | peek 376×251; bảng 240×288 |
| Gõ chữ chưa có | **Không có "Create"** — list trống, popup co lại chỉ còn ô nhập | 39 cao |
| Backspace khi trống | **Không xoá** được trạng thái | — |
| ↑/↓ + Enter | Chọn + **đóng** | — |
| Cấu hình | Mỗi nhóm có "+" thêm option, ⋮⋮ kéo, nhãn **DEFAULT**; "Display as: Select / Checkbox" | `np/210-status-config.png` |

## 5. Date

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Bấm ô trống | Popup lịch 248×500, ô nhập trên cùng **điền sẵn hôm nay & bôi đen** (gõ đè được) | ô ngày **32×32**; tiêu đề thứ 12px |
| Bấm ngày | Cập nhật giá trị, **popup ở lại** | — |
| Hôm nay | Vòng tròn đỏ | — |
| End date (công tắc) | Ô nhập tách đôi (bắt đầu │ kết thúc), lịch tô **dải** từ đầu → cuối | `np/82-date-range.png` |
| Include time | Thêm ô giờ cạnh mỗi ngày (mặc định 9:00 AM); hiện Time format, **Timezone (GMT+7)**; nút "Today" → "Now"; popup **nở lên trên** | `np/83-date-range-time.png` |
| Gõ ngày sai | Viền đỏ ô nhập + tooltip **"Invalid date"** bên trái | `np/85-date-typed.png` |
| Gõ đầu > cuối | Tooltip **"Invalid range"** | `np/86-date-typed-ok.png` |
| Enter trong ô nhập (hợp lệ) | Lưu + **đóng** | — |
| Date format (menu con, mở sang phải) | Full date · Short date · Month/Day/Year · **Day/Month/Year** · Year/Month/Day · Relative | `np/84-date-format-menu.png` |
| Hiện giá trị | `01/11/2026 → 25/11/2026` (mũi tên), 14px | — |
| Chân popup | Remind, Clear, "Learn about reminders" | — |
| Cấu hình | Date format, Time format, Notifications | `np/213-date-config.png` |

## 6. Relation ⭐ (chọn nhiều kiểu danh sách)

| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Tạo | Panel "Related to" bên phải: ô tìm nguồn + danh sách DB; chọn xong: Related to, **Limit (No limit/1 page)**, "Add related property" (công tắc), nút **Add relation** | `np/20`, `np/21-relation-config2.png` |
| Bấm | Popup **rộng 560** (rộng hơn ô, tràn sang trái đè cả cột nhãn, chừa ~12 mép phải). Dòng đầu: ô "Link or create a page…" + phạm vi **"In <DB>"** | mục **32** cao, icon trang 20 |
| Danh sách | Nhóm "Select a page" + "…" (Customize shown properties); mục đầu highlight sẵn; rê mục hiện nút **+** (Link page) | — |
| Chọn 1 | Mục **dời lên nhóm "1 selected"** trên cùng với nút **—** (Unlink); phần còn lại ở **"Select more"**; popup ở lại | `np/91-relation-linked1.png` |
| Gõ tìm | Có trạng thái **skeleton** khi đang tìm (tìm phía server); không khớp → mục "New <chữ> in <DB>" ở cuối + "Give search feedback" | `np/92`, `np/93` |
| Hiện giá trị | **Danh sách dọc**: mỗi trang 1 dòng 32 cao, icon + tên (500, gạch chân), cắt `…` | — |
| Self-relation | Liên kết A→B làm B cũng hiện A trong cùng cột (đối xứng) | `np/204-table-values-4.png` |

## 7. Checkbox
| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Hiện | Ô vuông 16×16, bo 3; tick nền xanh `rgb(39,131,222)` | peek pad `9px 6px` |
| Bấm | **Đổi ngay**, không popup | — |

## 8. Text
| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Bấm | Popup editor đè ô (peek 376×38, bảng 240×39), **cao dần** theo chữ | — |
| Shift+Enter | Xuống dòng | — |
| Enter | Lưu + đóng | — |
| Hiện | `pre-wrap` — hiện đủ, **xuống dòng** (bảng: hàng cao lên ~120) | `np/111-text-peek-value.png`, `np/202-table-values-2.png` |

## 9. Number
| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Bấm | Popup ô nhập (240×38); **gõ chữ "abc" không bị chặn** | `np/120-number-abc.png` |
| Hiện | Bảng **căn phải**, peek căn trái; "Number" hiện `1234567,891`; VND hiện `₫1.234.568` (làm tròn) | — |
| Cấu hình | Number format (menu con 45 định dạng, có ô **"Filter formats…"**), Decimal places, **Show as: Number / Bar / Ring** | `np/122`, `np/123` |

## 10. URL · Email · Phone
| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Bấm vùng trống của ô | Popup ô nhập 240×39 | — |
| Hiện URL | Tự thêm `http://`; **tên miền sáng + đường dẫn xám rút gọn giữa** (`example.com/mot…c-tinh`) | — |
| Email | **Không kiểm định dạng** ("khong-phai-email" vẫn lưu), thành `mailto:` | — |
| Phone | Lưu nguyên chữ, link `tel:` bỏ khoảng trắng | — |
| Rê | Hiện nút **Copy to Clipboard** (24×20) + Comment ở mép phải ô | `np/130-url-hover.png` |

## 11. Files & media
| Bấm | Popup **dưới ô** (không đè), 300×120, tab Upload / Link, nút "Upload file" xanh, "or Ctrl+V to paste an image" | `np/140-files-peek-open.png` (chỉ quan sát, không tải) |

## 12. Formula
| Trạng thái | Notion làm gì | Số đo |
|---|---|---|
| Bấm giá trị (peek) | Không làm gì (chỉ đọc) | — |
| Bấm ô (bảng) | Mở **trình sửa công thức** | 740×541 |
| Trình sửa | Ô AI, ô công thức (gõ `prop("Số")` tự thành token "# Số"), **xem trước trực tiếp** + chọn dòng xem trước + kiểu kết quả, Debug mode, danh sách property/hàm kèm ví dụ | `np/151`, `np/152-formula-typed.png` |
| Đóng (Esc) | **Tự lưu**; có "Discard all changes" | — |

## 13. Rollup
| Bấm ô trống | Mở thẳng cấu hình 215×212: Relation → Property (ô tìm) → Calculate (Show original/unique/Count/Percent/More options: Sum, Average, Median, Min, Max, Range) | `np/162`, `np/163` |
| Hiện | Kế thừa định dạng property gốc (₫) | — |

## 14. Created time · Created by · Last edited time · Last edited by · ID
| Hiện | Tự điền; ID số xám; ngày dạng "November 27, 2026 5:31 PM"; người = avatar + tên | — |
| Bấm | **Không làm gì** (chỉ đọc) | — |
| ID | **Không tái dùng số** (một dòng bị huỷ giữa chừng → dòng sau là 4, không phải 3); cấu hình **Prefix** ("TSK-1, TSK-2…") | `np/212-id-config.png` |

## 15. Button
| Hiện | Nút viền nhỏ mang tên property ("Nút") | — |
| Cấu hình | Type · Property access · **Edit automation** — KHÔNG mở/chạy | `np/170-button-config.png` |

## 16. Place
| Bấm | Popup đè ô 376×73: ô "Search for a location..." + "Current Location"; gõ → spinner, chân "Results may be limited" | `np/180`, `np/182` |

## 17. Menu cột & menu nhãn
- Bấm **tên cột** (bảng): popup 237×498: ô đổi tên + Edit property / Property access / Change type / AI Autofill / Filter / Sort / Group / Calculate / Freeze / Hide / Unwrap content / Insert left/right / Duplicate / Delete; mục 28. "Edit property" mở **menu con bên phải** chứa cấu hình riêng của loại. `np/16-colheader-menu-select.png`
- Bấm **nhãn** trong peek: Rename / Edit property / Comment / Property visibility / Duplicate / Delete / Customize layout (211×217).
- Menu chọn loại (Add property): ô tên property đè lên đầu cột, lưới **2 cột** 22 loại, nhóm "AI Autofill" trên; chọn loại là **thêm ngay + đóng**, không có bước xác nhận. `np/10-addprop.png`

---

## Chưa đo được / còn mở

| Mục | Vì sao |
|---|---|
| Person **nhiều người thật** (thứ tự chip, giới hạn, nhóm/Groups) | Workspace chỉ có 1 thành viên; không được mời người |
| Files — sau khi có file (thumbnail, nhiều file, xoá) | Theo luật không tải file |
| Button — hành động khi bấm | Theo luật không chạy |
| Place — danh sách kết quả, giá trị sau chọn | Tìm "Ho Chi Minh" chỉ quay spinner, không ra kết quả trong thời gian đo; không bấm "Current Location" (xin vị trí) |
| Relation — tạo trang mới từ popup, Limit=1 | Không bấm "New …" để khỏi đẻ trang |
| Bảng: phím → | 1 lần thử chưa thấy dời ô; ↑ và Tab đã xác nhận |
| Số đo hover giá trị trong peek | Đo nền = trong suốt; không thấy khác biệt rõ trên ảnh |
| Theme sáng, khổ 390 | Không đổi theme/khổ của Chrome người dùng |
| Thứ tự peek theo tên | Mới quan sát ở 1 DB; chưa thử kéo đổi thứ tự |

---

## Bài học cho GWT (xếp ưu tiên)

1. **Chọn người nhiều vai = mô hình Person của Notion**: ô tìm ở đầu, người đã chọn **thành chip ngay trong dòng tìm và biến khỏi danh sách**; popup **ở lại** để chọn tiếp; Backspace ở ô trống xoá chip cuối; × trên chip bỏ từng người. Với "nhiều vai" (phụ trách / theo dõi / duyệt): mỗi vai = 1 property Person riêng, **Tab** nhảy sang vai kế tiếp mà không đóng — nhập liệu liên tục bằng bàn phím. Cấu hình mỗi vai: Limit (1 người / không giới hạn) + Default.
2. **Một luật đặt popup cho mọi ô**: đè đúng lên ô (−1px), rộng ≥ ô (tối thiểu 240, chọn option 300), **thiếu chỗ thì lật lên và giữ đáy cố định** khi lọc làm list co lại; popup quá cao thì kẹp trong viewport chừa 12px.
3. **Hai kiểu "chọn nhiều"** rõ ràng: (a) nhãn ngắn (Person, Multi-select) → chip trong dòng tìm; (b) bản ghi dài (Relation) → nhóm **"N selected" ở đầu danh sách** với nút gỡ "—", còn lại "Select more". GWT nên dùng (b) cho liên kết khách/máy/đơn.
4. **Single vs multi khác nhau ở hành động sau chọn**: Select/Status chọn xong **đóng**; Multi/Person/Relation **ở lại**. Hành vi này nên là prop của component chung, không mỗi màn tự viết.
5. **Gõ để tạo**: Select/Multi gõ chữ chưa có → 1 mục "Create …" đã highlight, Enter là xong. Status **không cho tạo** ở ô (tạo ở cấu hình) — hợp cho trạng thái quy trình GWT (cố định 3 nhóm To-do / Doing / Done, có DEFAULT, không rỗng).
6. **Bàn phím đủ**: ↑/↓ quay vòng, Enter chọn, Esc đóng (ô vẫn được chọn), Enter mở lại; Tab/Shift+Tab đi giữa property trong panel chi tiết. Lưu ý bẫy: Esc khi không có popup đóng cả panel.
7. **Date**: điền sẵn hôm nay & bôi đen để gõ đè; kiểm lỗi tại chỗ ("Invalid date", "Invalid range") bằng viền đỏ + tooltip; công tắc End date / Include time; định dạng Day/Month/Year chọn ở property.
8. **Hiển thị giá trị thông minh**: URL rút gọn giữa (domain sáng + path xám), số căn phải trong bảng, tiền tệ có định dạng, relation dạng danh sách dọc, text wrap đủ. Nút Copy hiện khi rê cho URL/Email/Phone.
9. **Trường chỉ đọc không giả vờ sửa được**: Created/Edited/ID/Formula bấm không mở gì; ID không tái dùng số + có prefix (gợi ý mã phiếu GWT dạng `TK-123`).
10. **Option có ⋮⋮ kéo + "…" sửa** (đổi tên, màu, xoá) ngay trong popup chọn — người dùng không phải vào trang cấu hình.

Không học: màu/bóng/bo cụ thể của Notion, lưới 2 cột menu chọn loại, AI Autofill.
