---
description: Mở phiên làm việc mới — worktree riêng, nhánh đúng tên, cổng theo khu
argument-hint: <cskh|sales|viec|nen-tang> <việc cần làm, viết ngắn>
---

# Mở phiên làm việc: $ARGUMENTS

## Đang có gì trên máy

Worktree các phiên khác đang giữ:
!`bash tools/wt.sh ds 2>&1`

Nhánh hiện tại: !`git branch --show-current` · Cây làm việc: !`git status --short | head -5 || echo "(sạch)"`

Cổng đang bị chiếm: !`lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk '$9 ~ /:3[1-4][0-9][0-9]$/ {print $9}' | sort -u | tr '\n' ' ' || echo "(không có)"`

## Việc bạn phải làm, theo đúng thứ tự

1. **Tách khu và việc** từ `$ARGUMENTS`. Từ đầu tiên là khu (`cskh` · `sales` · `viec` · `nen-tang`);
   phần còn lại là việc. Khu quyết định ba thứ:

   | Khu | Dải cổng | Backlog | Tiền tố nhánh |
   |---|---|---|---|
   | `cskh` | 3101–3103 | `backlog/cskh.md` | `<feat\|fix>/cskh-…` |
   | `sales` | 3201–3203 | `backlog/sales.md` | `<feat\|fix>/sales-…` |
   | `viec` | 3301–3303 | `backlog/viec.md` | `<feat\|fix>/work-…` |
   | `nen-tang` | 3401 | `backlog/nen-tang.md` | `chore/nen-tang-…` |

2. **Đọc backlog của khu đó** — việc CEO giao có thể đã nằm sẵn ở `🐞 LỖI` hoặc `📥 Ý TƯỞNG`.
   Nếu có, dùng đúng mô tả trong đó thay vì tự diễn giải lại.

3. **Đặt tên nhánh** `<loại>/<khu>-<việc-ngắn-không-dấu>`. Loại: `feat` việc mới ·
   `fix` sửa lỗi · `chore` hạ tầng/quy trình · `docs` tài liệu.

4. **Tạo worktree**: `bash tools/wt.sh moi <tên-nhánh>` rồi
   `npm --prefix apps/web install` trong đường dẫn nó in ra. **Không sửa code ở thư mục gốc.**

5. **Chọn cổng** trong dải của khu, tránh cổng đã bị chiếm ở trên. Nhớ số cổng đó — `/xong` sẽ cần.

6. **Chưa bật dev server.** Mặc định không phiên nào bật; chỉ bật lúc mời CEO xem
   (máy 32 GB, mỗi bản chạy thử ăn ~0,8–1,5 GB, tối đa 2 bản sống cùng lúc).

7. **Việc nhiều bước thì lập kế hoạch trước khi gõ code** — skill `superpowers:brainstorming`
   rồi `writing-plans`. Tính năng mới: `test-driven-development`. Sửa lỗi: `systematic-debugging`.

8. **Báo lại cho CEO một dòng**: nhánh gì, worktree ở đâu, cổng nào, định làm gì.
