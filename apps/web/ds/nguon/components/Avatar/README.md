Avatar chữ cái cho người phụ trách (chủ ticket, người làm…) — **bổ sung DS 18/11/2026**.

**Dùng:** `<span class="ui-avatar">KT</span>` (1–2 chữ cái đầu của tên, bỏ "anh/chị"); `data-size="sm"` khi ở thẻ Kanban/menu. Đứng một mình trong ô hẹp thì bọc trong nút có `title`/`aria-label` là tên đầy đủ.

| Phần | Token | Giá trị |
| --- | --- | --- |
| Cỡ | `control-size-3xs` | 22px (sm 20px) |
| Nền / chữ | `alpha-08` / `muted-foreground` | 10px 600 (sm 9px) — chữ đạt AA cả hai theme: sáng 5.57:1, tối 5.81:1 (CEO chốt 20/11; `gray-600` tối chỉ 3.94:1) |
| Bo | `radius-full` | |

**Code:** shadcn `Avatar` + `AvatarFallback` (chữ cái); khi có ảnh dùng `AvatarImage`.
