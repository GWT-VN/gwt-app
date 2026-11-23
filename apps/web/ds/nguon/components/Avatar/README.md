Avatar chữ cái cho người phụ trách (chủ ticket, người làm…) — **bổ sung DS 18/11/2026**.

**Dùng:** `<span class="ui-avatar">KT</span>` (1–2 chữ cái đầu của tên, bỏ "anh/chị"); `data-size="sm"` khi ở thẻ Kanban/menu. Đứng một mình trong ô hẹp thì bọc trong nút có `title`/`aria-label` là tên đầy đủ.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Cỡ | `control-size-3xs` | 22px (sm 20px) |
| Nền / chữ | `alpha-08` / `muted-foreground` | 10px 600 (sm 9px) — chữ đạt AA cả hai theme: sáng 5.57:1, tối 5.81:1 (CEO chốt 20/11; `gray-600` tối chỉ 3.94:1) |
| Bo | `radius-full` | |

**Code:** shadcn `Avatar` + `AvatarFallback` (chữ cái); khi có ảnh dùng `AvatarImage`.

## Đổi khi chép khung shadcn (21–23/11/2026)

- `size` thêm `lg` (shadcn; artifact chưa có): 28px (`control-size-sm`), chữ 12px. `default` 22px và `sm` 20px giữ nguyên.
- Thêm `AvatarBadge` (chấm trạng thái góc dưới phải, nền `primary`, viền nền 2px; cỡ 6/8/10px theo `size` của Avatar, `sm` ẩn icon bên trong).
- Thêm `AvatarGroup` (chồng nhau lề âm 6px, mỗi avatar viền nền 2px, nền avatar được phủ đặc để chữ avatar dưới không lộ) và `AvatarGroupCount` (ô "+N" cuối nhóm, cỡ theo avatar trong nhóm).
- `data-slot` mới: `avatar-badge`, `avatar-group`, `avatar-group-count`; Root có `data-size` và chặn chọn chữ (`select-none`).
- `chuCaiDau(ten)` (lấy 1–2 chữ cái, bỏ "anh/chị/em") là phần GWT; export giữ tên `Avatar`, `AvatarImage`, `AvatarFallback`, `chuCaiDau`.
