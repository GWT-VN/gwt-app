---
description: Đóng một việc — soát kiểu, test, build, tự review, cập nhật backlog, đẩy lên
---

# Đóng việc

Trạng thái hiện tại:
- Nhánh: !`git branch --show-current`
- Thay đổi chưa commit: !`git status --short | wc -l | tr -d ' '` file
- Đã commit mà chưa đẩy: !`git log --oneline @{upstream}..HEAD 2>/dev/null | wc -l | tr -d ' '` commit
- Tuổi nhánh: !`git log -1 --format=%cr $(git merge-base HEAD origin/main 2>/dev/null) 2>/dev/null || echo "?"`

## Chạy đủ 7 bước, KHÔNG bỏ bước nào

1. **Ba cửa xanh đã.** Chạy trong `apps/web` và dán nguyên văn kết quả:
   ```
   npx tsc --noEmit
   npm run test
   npm run build
   ```
   Còn đỏ thì dừng ở đây, sửa, chạy lại. **Chưa xanh thì chưa được gọi CEO.**

2. **Tự review trước khi CEO nhìn.** Gọi skill `code-review`. Lỗi đúng thì sửa;
   lỗi bạn cho là sai thì nói rõ vì sao, đừng im lặng bỏ qua.

3. **Có đụng `db/` hay `supabase/migrations/` không?** Có thì chạy `/doi-chieu-db`
   để chắc prod đã có đủ hàm/bảng. Local xanh KHÔNG có nghĩa prod chạy được —
   20/08/2026 đã suýt đẩy một nút hỏng lên cho nhân viên vì đúng chuyện này.

4. **Cập nhật backlog của khu** (`backlog/<khu>.md`): chuyển mục vừa làm sang
   `## ⏳ CHỜ TÔI CHECK`, ghi rõ **xem ở đâu** (đường dẫn màn hình) + **check cái gì** + commit.
   **Tuyệt đối không tự đánh ✅** — chỉ CEO xác nhận mới là xong.
   Cập nhật lại bảng đếm ở đầu `BACKLOG.md` nếu con số đổi.

5. **Commit + đẩy.** `git add` **đúng file của mình** (đừng `git add -A`, repo này
   nhiều worktree song song). Rồi `git push -u origin <nhánh>`.
   Commit chỉ lưu vào máy — **chỉ push mới là sao lưu**.

6. **Mời CEO xem trên máy, KHÔNG đẩy sang preview.** Trỏ DB local
   (`npm run env:local`), bật dev server ở **cổng của phiên này**, chờ dòng `Ready in`,
   rồi đưa CEO **đúng đường dẫn `http://localhost:31xx/...`** của màn cần xem.
   Tài khoản local cố định: `dev.admin@gwt.vn` / `gwtlocal123`.

7. **CEO OK rồi mới merge.** Merge xong thì dọn:
   `bash tools/wt.sh xong <nhánh>` và tắt **đúng cổng của mình**
   (`lsof -ti :<cổng> | xargs kill`) — **không bao giờ** `pkill -f "next dev"`.
