Một lượt nói trong khung chat (ảnh đại diện + bong bóng + tên/giờ), và khung cuộn danh sách tin `MessageScroller`.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`message.tsx`, `message-scroller.tsx` @45bbf9b, MIT), thêm ở Đợt 8 chép shadcn (21/11/2026). `MessageScroller` dựng trên `@shadcn/react` 0.3.1 (primitive shadcn tự viết, không phải Radix; đòi React ≥ 19).

| Phần | Token | Giá trị |
| --- | --- | --- |
| `Message` | chữ 14/20 | khe 8 giữa ảnh và nội dung; `align="end"` đảo hàng (tin của mình) |
| `MessageAvatar` | `muted`, `--radius-full` | rộng tối thiểu 32, bám đáy; có `MessageFooter` thì nhích lên 32 cho thẳng bong bóng |
| `MessageHeader` / `MessageFooter` | chữ 12/18 `muted-foreground`, 500 | đệm ngang 12 (bong bóng ghost: 0) |
| `MessageGroup` | — | nhiều bong bóng liền nhau, khe 8 |
| `MessageScrollerViewport` | thanh cuộn mảnh alpha-30 | focus phím: outline 2 `ring` lùi vào 2px (như ScrollArea) |
| `MessageScrollerButton` | Button `secondary` `icon-sm` | 28 × 28, nền `background`, bóng `--shadow-200` + `--shadow-hairline`, rê nền `muted`; hiện/ẩn trượt + mờ 200/400ms |

## MessageScroller

- `MessageScrollerProvider` → `MessageScroller` → `MessageScrollerViewport` → `MessageScrollerContent` → `MessageScrollerItem` (mỗi tin, `messageId`); `MessageScrollerButton` là anh em của Viewport.
- Mở ra ở cuối (`defaultScrollPosition` mặc định end), giữ vị trí khi nạp thêm tin cũ phía trên, `autoScroll` bám đáy khi tin mới tới. Nút "Cuộn xuống cuối" chỉ hiện khi đã cuộn lên (`data-active`), ẩn thì `inert`.
- Viewport `role="region"`, tên mặc định "Tin nhắn" (primitive: "Messages") — màn đặt tên cụ thể ("Hội thoại với khách"). Content `role="log"`, `aria-relevant="additions"`: trình đọc màn hình đọc tin mới.
- Đặt chiều cao cố định cho khung chứa (vd `h-80`); Item dùng `content-visibility: auto` nên danh sách dài vẫn nhẹ.
- **Bỏ:** `scroll-fade-b` (utility trong gói CSS riêng của shadcn, DS không có) → đáy không mờ dần.
- Hook: `useMessageScroller` (cuộn tới cuối/đầu/tin), `useMessageScrollerScrollable`, `useMessageScrollerVisibility`.

**Code:** `components/ui/message.tsx`, `components/ui/message-scroller.tsx`. Khối `/ds#message`.
