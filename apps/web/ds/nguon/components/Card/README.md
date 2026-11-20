shadcn `Card` mặc áo OpenAI: bề mặt nhóm một cụm nội dung — viền 1px `border`, bo 12px, nền `card`, đệm 16px, không bóng. **Mới 20/11/2026.**

**Dùng khi** một cụm thông tin cần đứng riêng trên trang: thẻ tóm tắt bản ghi, khối cài đặt, form ngắn trên trang Tổng quan, khung bọc FormLayout. Danh sách nhiều dòng cùng loại → `Table`/`ListView`, không xếp chồng thẻ. Số liệu chính màn Tổng quan → `StatCard`. Thẻ kéo được trên bảng việc → thẻ của `KanbanBoard`.
**Người dùng cung cấp:** tiêu đề ngắn (danh từ), mô tả một dòng tuỳ chọn, nội dung; hành động tuỳ chọn ở góc phải header (một nút `outline` sm hoặc nút ⋯); chân tuỳ chọn với nút phụ `outline` trước, nút chính sau.

| Phần | Class | Giá trị |
| --- | --- | --- |
| Khung | `ui-card` + `ui-card-pad` | viền 1px `border`, bo `radius-xl` 12px, nền `card` (`color-surface`), chữ `card-foreground`, đệm 16px; **không bóng** — thẻ tách khỏi trang bằng viền |
| Khoảng cách phần | `ui-card-header` / `ui-card-content` / `ui-card-footer` | phần đứng sau phần tử khác cách trên 16px (= đệm); đệm nằm ở khung, phần không đệm riêng |
| Header | `ui-card-header` | lưới; có `ui-card-action` → 2 cột `1fr auto`, cách 16px |
| Tiêu đề | `ui-card-title` | `heading-xs` 16/24 600 — như tiêu đề khối form |
| Mô tả | `ui-card-desc` | 14/20 `muted-foreground`, cách tiêu đề 4px — như mô tả Dialog |
| Hành động | `ui-card-action` | cột 2, phủ dòng tiêu đề + mô tả, căn trên, sát phải |
| Chân | `ui-card-footer` | hàng nút căn phải, gap 8px — như chân form/Dialog |

- Khác shadcn có chủ đích: shadcn đệm 24px ở từng phần (`py-6` khung, `px-6` phần) và bóng `shadow-sm`; DS đệm 16px ở khung (mật độ OpenAI, khớp `ui-card-pad`) để con bất kỳ — `FormLayout`, `Table` — đặt thẳng vào vẫn có lề, và bỏ bóng. Chân shadcn để nút bên trái; DS dồn phải như mọi chân nút khác.
- Thẻ là khối thường (không flex): đặt `<form>` trong thẻ thì các phần là con của form, vẫn cách nhau 16px.

**a11y:** `CardTitle` là `div` (như shadcn v4) — thẻ là một mục của trang thì thêm `role="heading"` + `aria-level` đúng cấp (thường 3, dưới tiêu đề trang). Thẻ bấm được cả khối → KHÔNG bọc cả thẻ bằng `<a>`/`<button>` khi trong thẻ còn nút; đặt link ở tiêu đề. Trang có nhiều thẻ → nút hành động ở header mang `aria-label` nói rõ đối tượng, bắt đầu bằng đúng chữ đang hiện ("Sửa máy nén khí GA-37" cho nút "Sửa").

**Code:** shadcn `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` — `components/ui/card.tsx`.

```tsx
<Card>
  <CardHeader>
    <CardTitle role="heading" aria-level={3}>Máy nén khí GA-37</CardTitle>
    <CardDescription>Lắp đặt 03/2025 · Kho Bình Dương</CardDescription>
    <CardAction><Button variant="outline" size="sm" aria-label="Sửa máy nén khí GA-37">Sửa</Button></CardAction>
  </CardHeader>
  <CardContent>Lần bảo dưỡng gần nhất: 12/11/2026.</CardContent>
  <CardFooter>
    <Button variant="outline">Xem trước</Button>
    <Button>Xuất Excel</Button>
  </CardFooter>
</Card>
```
