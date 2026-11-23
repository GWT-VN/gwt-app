Bảng chọn bản ghi khi sửa tại ô (khách, máy, đơn…): mỗi dòng phải **đủ thông tin để phân biệt** hai bản ghi trùng hay na ná tên — đã chốt 18/11/2026.

## Cấu tạo
1. Ô tìm (focus sẵn): placeholder nói rõ tìm được gì — "Tên, mã KH, 4 số cuối SĐT, serial…".
2. Dòng đếm: "22 khách" / "3 khách khớp" · "Enter chọn dòng đầu".
3. Danh sách (tự cuộn, tối đa 340px), mỗi mục 3 dòng:
   - **Tên** (500) + cờ lưu ý đỏ · bên phải "N ticket mở" / "không ticket mở"; ✓ nếu đang chọn.
   - Mã KH · Cá nhân/Doanh nghiệp · khu vực · SĐT •••4 số cuối.
   - Máy · serial đang dùng.
4. Chân (luôn thấy): "+ Tạo khách mới "<chữ đang gõ>"".

## Thông số
Rộng 400px (tối đa 100vw − 32); dòng 1 14px, dòng 2–3 12/16 `muted-foreground`; khung + ô tìm + mục là DS `DropdownMenu` (`ui-menu`, `ui-menu-search`, `ui-menu-item`); mục đang chọn nền `alpha-04`.

## Hành vi
- Tìm không dấu trên mọi trường hiển thị (tên, mã, SĐT, khu vực, serial).
- Chọn khách → cập nhật ticket + cờ lưu ý theo khách mới; toast Hoàn tác.
- Không hiện SĐT đầy đủ — chỉ 4 số cuối (đủ phân biệt, không lộ PII trên màn danh sách).

## Bàn phím & a11y
Ô tìm `aria-label`; danh sách `role="listbox"`, mục `role="option"` + `aria-selected`; ↑↓ di chuyển, Enter chọn, Esc đóng.

## Code
- shadcn `Popover` + `Command` (cmdk) — tìm phía server khi bảng khách lớn (debounce, giới hạn N, nói rõ khi cắt bớt — xem `Combobox`).
- Dữ liệu từ bảng khách dùng chung (`customers`, khoá `customer_code`) — đọc `GWT-SHARED/SYSTEM.md` trước khi nối.
- Prototype: nhánh `prototype/v2-khung`, `apps/web/app/prototype/bang/_bang/``PhuongAn.tsx` (`MenuKhach`, `DS_KHACH` — dữ liệu giả).

## Đổi khi chép khung shadcn (21–23/11/2026)

- API và hình giữ nguyên.
- Ruột dựng trên `Command` / `CommandInput` / `CommandList` / `CommandItem` của DS (`command.tsx`, R21) thay cmdk trần; `data-slot` `record-picker`, `record-picker-search`, `record-picker-ds` giữ (`CommandInput wrapperSlot`).
- Vòng xoay "Đang tìm…" mang `aria-hidden` (chữ đi kèm đã đọc).
