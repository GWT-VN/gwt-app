# Issue tracker của repo này = hệ BACKLOG (KHÔNG phải GitHub Issues)

> File này để các skill Matt Pocock (`code-review`, `implement`, …) biết "ticket/spec ở đâu".
> Nó **thay** cho việc chạy `/setup-matt-pocock-skills` — repo GWT đã chốt sẵn câu trả lời.
> Luật đầy đủ: [`../../../GWT-SHARED/TOOLCHAIN-CLAUDE.md`](../../../GWT-SHARED/TOOLCHAIN-CLAUDE.md) §4c.

## Ticket ở đâu

Hàng đợi việc giữa CEO và Claude nằm ở **file Markdown trong repo, KHÔNG lên git**:

| File | Là gì |
|---|---|
| [`BACKLOG.md`](../../BACKLOG.md) | **Chỉ mục** — bảng đếm 4 khu + luật "việc này ghi vào đâu" |
| `backlog/cskh.md` · `backlog/viec.md` · `backlog/sales.md` · `backlog/nen-tang.md` | Hàng đợi thật, tách theo khu |

Năm mục trạng thái, theo đúng vòng làm việc:
`📥 Ý TƯỞNG` → `🔨 ĐANG LÀM` → `⏳ CHỜ TÔI CHECK` → (`🐞 LỖI CẦN SỬA`) → `✅ XONG`.

Cách dùng đầy đủ: [`../../../GWT-SHARED/HUONG-DAN-BACKLOG.md`](../../../GWT-SHARED/HUONG-DAN-BACKLOG.md).

## Spec / plan ở đâu

Ticket trong BACKLOG chỉ là một dòng việc. Tài liệu dài nằm ở:

| Thư mục | Chứa gì |
|---|---|
| `docs/specs/` | Spec thiết kế, đặt tên `YYYY-MM-DD-<viec>.md` |
| `docs/plans/` | Kế hoạch nhiều bước (sinh bởi `writing-plans`) |
| `docs/<khu>/` (`cs/`, `sales/`, `work/`) | Tài liệu riêng từng khu |
| `../GWT-SHARED/SYSTEM.md` | Nguồn sự thật chung: bảng dùng chung, khoá nối, tích hợp chéo module |

## Khi skill nói "fetch the relevant ticket"

Đọc mục tương ứng trong `backlog/<khu>.md`. Muốn biết khu nào → xem bảng "Ghi vào đâu"
trong [`BACKLOG.md`](../../BACKLOG.md). Có spec đi kèm thì tìm trong `docs/specs/` theo ngày + tên việc.

## Khi skill nói "publish to the issue tracker" → ⛔ DỪNG

**Không tự tạo ticket.** Chỉ CEO mới bỏ việc vào backlog (mục `📥 Ý TƯỞNG`), và chỉ CEO mới
đánh `✅ XONG`. Claude chỉ được:

- chuyển việc mình vừa làm xong sang `⏳ CHỜ TÔI CHECK`, ghi rõ **xem ở đâu** + **check gì**;
- ghi lỗi CEO báo vào `🐞 LỖI CẦN SỬA`;
- thêm nguyên văn ý tưởng CEO dump vào `📥 Ý TƯỞNG`.

Bốn skill sinh ticket — **`to-spec`, `to-tickets`, `triage`, `wayfinder`** — **không dùng ở repo này**.
Chúng cần một issue tracker thật (GitHub Issues hoặc `.scratch/`); cho chạy là đẻ ra hàng đợi
thứ hai song song với BACKLOG, đúng thứ hệ BACKLOG sinh ra để dẹp.
GitHub Issues của `GWT-VN/gwt-app` đang **rỗng** (kiểm 26/08/2026) — đừng bắt đầu dùng nó
mà không hỏi CEO.

## ⚠️ PII

Backlog là ghi chú việc — **không ghi tên / SĐT / địa chỉ khách** vào. Cần trỏ tới khách cụ thể
thì dùng **mã KH** hoặc **mã ticket**. Git hook của repo chặn PII ở cửa commit, nhưng
`BACKLOG.md` + `backlog/` **nằm ngoài git** nên hook **không soi tới** — chỗ này chỉ có kỷ luật.

## PRs as a request surface

**Off.** PR bên ngoài không phải nguồn việc của repo này.
