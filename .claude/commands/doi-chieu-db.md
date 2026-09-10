---
description: Đối chiếu schema local ↔ production, báo prod đang thiếu hàm/bảng/view nào
allowed-tools: Bash(python3 tools/doi_chieu_db.py*), Bash(mkdir *), Write
---

# Đối chiếu DB local ↔ production

Câu SQL cần chạy trên prod:
!`python3 tools/doi_chieu_db.py --sql`

## Làm theo đúng 4 bước

1. Chạy **nguyên văn** câu SQL trên qua Supabase MCP `execute_sql`,
   project `bwzmqfbcgouhvhoslmmm`. Đây là câu **chỉ đọc** (`pg_proc`,
   `information_schema`) — không đụng dữ liệu.

2. Ghi kết quả trả về thành file JSON trong thư mục nháp của phiên,
   giữ nguyên dạng `[{"ket_qua": [...]}]`.

3. Chạy `python3 tools/doi_chieu_db.py --prod <file vừa ghi>`.

4. **Đọc kết quả cho đúng** — hai nhóm KHÁC HẲN nhau về mức nghiêm trọng:

   - 🔴 **PROD THIẾU** = local có, prod chưa. Merge lúc này là đẩy code gọi
     một hàm chưa tồn tại lên cho nhân viên. **Phải áp migration lên prod trước
     khi merge.** (20/08/2026 đã suýt dính đúng chuyện này với `gop_khach`.)
   - 🟡 **LOCAL thiếu** = prod có, local chưa. Không chặn merge, nhưng nghĩa là
     máy bạn đang test trên schema cũ hơn prod — kết quả test local có thể sai.
     Chạy `supabase migration up`, và kiểm xem migration đó có nằm trong
     `supabase/migrations/` không (nếu nó nằm ở `db/*/migrations/` thì sai chỗ,
     xem `db/MIGRATIONS-CONVENTION.md`).

Báo lại cho CEO gọn: có chặn merge được không, và thiếu đúng cái gì.
