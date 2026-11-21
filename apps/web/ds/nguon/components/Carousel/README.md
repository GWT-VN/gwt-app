Băng chuyền: lướt ngang (hoặc dọc) qua một dãy thẻ/ảnh, có nút trước/sau và phím ←/→.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`carousel.tsx` @45bbf9b, MIT) trên Embla Carousel 8.6.0, thêm ở Đợt 8 chép shadcn (21/11/2026).

| Phần | Token | Giá trị |
| --- | --- | --- |
| Nút trước/sau | Button `outline` `icon` | 32 × 32 (control-size-md), bo pill, viền trong 1px `input`, icon Phosphor 18 |
| Vị trí nút | ngoài mép | cách mép 48 (`-left-12` / `-right-12`), giữa chiều cao |
| Khe giữa mục | đệm trái mục 16 | `CarouselContent` lề âm 16 bù lại |

- Nút tự tắt ở hai đầu (Embla `canScrollPrev/Next`). Focus trong vùng (kể cả trên nút): ← / → chuyển mục.
- Vùng `role="region"` + `aria-roledescription="băng chuyền"`, mục `role="group"` + `aria-roledescription="trang"` (shadcn: carousel / slide); nút đọc "Mục trước" / "Mục sau". **Màn truyền `aria-label`** cho `Carousel` và mỗi `CarouselItem` ("2 / 5").
- Muốn báo vị trí: `setApi` → `api.selectedScrollSnap()`, hiện "Mục x / n" trong vùng `aria-live="polite"` (khối /ds có mẫu).
- **Khối chứa chừa lề ≥ 48 mỗi bên** cho nút (vd `px-12`), không thì tràn ngang ở 390.
- **GWT sửa:** trạng thái nút đọc thẳng từ Embla bằng `useSyncExternalStore` (shadcn gọi setState trong effect — lint React Compiler chặn — và quên gỡ nghe `reInit`).
- Export thêm `useCarousel` (bản `bases/radix` của shadcn có; `new-york-v4` không).
- Dùng ít: chỉ cho ảnh sản phẩm / thẻ gợi ý. Danh sách dữ liệu dùng bảng hoặc lưới, không giấu trong băng chuyền.

**Code:** `components/ui/carousel.tsx`. Khối `/ds#carousel`.
