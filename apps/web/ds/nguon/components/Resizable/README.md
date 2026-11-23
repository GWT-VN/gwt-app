Chia vùng có vạch kéo đổi cỡ — danh sách + xem nhanh, trang chi tiết nhiều cột.

**Chưa có trong artifact** — nguồn shadcn new-york-v4 (`resizable.tsx` @45bbf9b, MIT) trên `react-resizable-panels` 4.24.1,
thêm ở Đợt 6 chép shadcn (21/11/2026).

| Phần | Nguồn | Ghi chú |
| --- | --- | --- |
| `ResizablePanelGroup` | `Group` | `orientation` horizontal / vertical; `defaultLayout` + `onLayoutChanged` để nhớ bố cục |
| `ResizablePanel` | `Panel` | cỡ: SỐ = px, CHUỖI = % (`defaultSize="40%"`, `minSize="25%"`); `collapsible` |
| `ResizableHandle` | `Separator` | vạch 1px `--border`, vùng bấm 4px; `withHandle` = tay nắm 12 × 16 nền `--border` bo xs |

- Bàn phím (thư viện): Tab tới vạch (`role="separator"`, `aria-valuenow`), ← → (dọc: ↑ ↓) đổi cỡ, Home / End về nhỏ nhất /
  lớn nhất, Enter thu / mở panel `collapsible`. Focus = outline 2 ring cách 1.
- Vạch nên có `aria-label` nói hai vùng nó chia ("Đổi cỡ danh sách và xem nhanh").
- Điện thoại (≤ 767px): xếp chồng thay vì chia cột — đặt `orientation="vertical"` hoặc bỏ Resizable.

**Code:** `components/ui/resizable.tsx`. Khối `/ds#resizable`.
