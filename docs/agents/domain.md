# Domain docs — đọc gì trước khi đụng code

> File này để các skill Matt Pocock biết "nguồn sự thật về nghiệp vụ ở đâu".
> Repo này là **single-context**: một Next.js app, một Postgres, nhiều khu nghiệp vụ.

## Đọc trước khi khám phá code

Theo thứ tự:

1. **[`../../../GWT-SHARED/SYSTEM.md`](../../../GWT-SHARED/SYSTEM.md)** — nguồn sự thật chung
   giữa các module: bảng dùng chung (`staff`, `customers`, `dim_channel`, catalog), khoá nối
   (`customer_code`, `internal_code`), tích hợp chéo module, Changelog thay đổi bảng dùng chung.
   **Đây là `CONTEXT.md` của repo này**, chỉ khác chỗ đứng (nằm ở `GWT-SHARED/` vì dùng chung
   với repo `Sales Tracking`).
2. **[`../../HANDOFF.md`](../../HANDOFF.md)** — bàn giao toàn app: module, route, phân quyền,
   DB, bản đồ nhánh + worktree, việc đang mở, bẫy đã trả giá.
3. **`docs/<khu>/`** — tài liệu riêng khu mình đang đụng (`cs/`, `sales/`, `work/`, `ke-toan/`).
4. **`docs/specs/`** và **`docs/plans/`** — spec/kế hoạch của chính việc đang làm.

Chưa có `docs/adr/`. Chưa có `CONTEXT.md` ở gốc repo. Thiếu thì **đi tiếp, đừng dừng lại
than phiền, đừng tự dựng lên**. `domain-modeling` sẽ đẻ ra khi thật sự cần chốt một thuật ngữ.

## ⚠️ Schema thật = query DB, không tin doc

Mô tả cột trong tài liệu cũ **hay sai**. Schema và dữ liệu thật:
**query Supabase project `bwzmqfbcgouhvhoslmmm`** (Supabase MCP), hoặc `codegraph explore`
cho phần code.

Cùng lý do, **local xanh không có nghĩa prod chạy được**: đụng `db/*/migrations/` thì phải
đối chiếu hàm/bảng mới đã có trên prod chưa TRƯỚC khi merge (bẫy đã dính 20/08/2026 —
migration 46 `gop_khach`).

## Dùng đúng từ vựng của dự án

Tài liệu và giao diện repo này viết **tiếng Việt**. Tên khu là **CSKH · Việc · Sales · Nền tảng ·
Kế toán** — không phải "Customer Support / Work / Platform / Accounting". Đặt tên biến, tên test, tiêu đề việc thì
bám từ đang dùng trong `SYSTEM.md` và trong khu tương ứng, đừng tự chế từ đồng nghĩa.

Gặp khái niệm chưa có tên chung → đó là tín hiệu: hoặc đang bịa ra khái niệm dự án không dùng
(nghĩ lại), hoặc có lỗ hổng thật (ghi lại cho `domain-modeling`).

## Đổi bảng dùng chung → báo trước

Đụng bảng dùng chung thì ghi 1 dòng Changelog trong `SYSTEM.md` **và báo module kia TRƯỚC khi
chạy migration**. Đây là luật, không phải gợi ý.
