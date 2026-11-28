# AGENTS.md — GWT App (cho Codex và agent khác ngoài Claude)

Codex đọc file này, không đọc `CLAUDE.md`. Luật dưới đây BẮT BUỘC. Chi tiết và lý do nằm ở các file trỏ tới — đọc
trước khi làm.

## Đọc trước khi đụng code

1. [`CLAUDE.md`](CLAUDE.md) — luật repo: worktree, nhánh, cổng, sao lưu, quy trình giao việc local.
2. [`HANDOFF.md`](HANDOFF.md) — bản đồ module, route, phân quyền, DB, bẫy đã gặp.
3. [`docs/agents/domain.md`](docs/agents/domain.md) · [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
4. Checklist tự kiểm của CEO: `C:/Users/Duncr/.claude/gwt-rules/tu-kiem-truoc-khi-giao.md` (máy Windows) — áp
   nguyên văn trước khi báo "xong".
5. Việc đụng DB: `../GWT-Masterdata/rules/supabase-mcp.md` + [`AGENTS.md` của GWT-Masterdata](../GWT-Masterdata/AGENTS.md).
6. Viết lọc / tìm / sắp xếp / ô chọn: [`docs/CHUAN-FILTER.md`](docs/CHUAN-FILTER.md).

## Luật cứng

- **Một việc = một worktree riêng = một nhánh** (`<feat|fix|chore|docs>/<khu>-<việc>`), cắt từ `origin/main` mới nhất
  (hoặc từ nhánh được giao, vd `rework/v2.0.0`). Không làm trong thư mục gốc `gwt-app` (chỉ đứng `main` để đọc).
  Không làm trong worktree đang có phiên khác (`git worktree list`, thấy file `M` lạ → hỏi).
- **Git:** không `git add -A` / `git add .`, không `git stash`, không `git push --force`, không đổi nhánh của worktree
  người khác. Commit đúng file của mình (`git commit -- <file>`), message tiếng Việt có dấu + prefix conventional
  (`feat(cskh): …`), author `ai@gwt.vn`. **Không push / merge / tạo PR khi CEO chưa bảo.**
- **Tiến trình:** không `pkill` / `killall node` / `taskkill /im node.exe`. Chỉ tắt đúng PID / cổng mình bật.
  Dev server theo dải cổng của khu (CLAUDE.md "Nhánh · cổng · sao lưu"); cổng đang có người dùng thì chọn cổng khác.
- **PII:** không đưa SĐT, tên, địa chỉ khách thật vào commit, test, seed, log. Dữ liệu thật chỉ ở `data/` (gitignore).
- **UI chỉ dựng từ component có sẵn:** nhánh v2 (`rework/v2.0.0`) = design system `apps/web/components/ui/*` + token
  `--*` (nguồn DS: `apps/web/ds/nguon/`); nhánh v1 (`main`) = component trong `apps/web/components/` và gói
  `apps/web/bang/`. Cấm vẽ tay (`<button>/<select>/<input>` trần khi đã có component, hex / px lẻ, class tự bịa).
  Thiếu component → dừng, hỏi. Không sửa `components/ui/*` và `ds/nguon/` khi chưa được giao rõ.
- **DB:** không chạy DDL lên DB thật, không áp migration live, không gọi Supabase MCP ghi. Migration mới cho
  GWT-App v2 viết ở repo GWT-Masterdata (theo AGENTS.md bên đó). Không bật `CSKH_NGUON=md` ngoài máy dev.
- **Không tự đăng nhập** app / Supabase / GitHub; cần đăng nhập thì dừng, nhờ CEO.
- **Chỉ làm đúng phạm vi brief.** Thấy chỗ đáng sửa ngoài phạm vi → ghi vào report mục "Ngoài phạm vi", không tự sửa.
- Câu trả lời / report bằng **tiếng Việt**, ngắn, bảng hoặc gạch đầu dòng.

## Kiểm trước khi báo xong (chạy trong `apps/web`)

```bash
npx vitest run          # CẢ BỘ, không chỉ file vừa sửa — báo đúng số pass/fail
npx tsc --noEmit
npx eslint <các file đã đổi>
```

Việc đụng UI: test DOM cho hành vi mới (viết test trước, thấy fail, rồi mới sửa). Không tự xem trình duyệt được thì
ghi rõ "chưa soát trình duyệt" — Claude sẽ soát ở 1440 / 900 / 390, sáng + tối.

## Giao việc qua lại với Claude (Claude review mọi việc Codex làm)

Thư mục trao đổi (NGOÀI repo, không commit): `E:/01_WORKS/03_GWT/10. Claude-workspace/_review-codex/<tên-nhánh>/`
(thay `/` trong tên nhánh bằng `-`).

| File | Ai viết | Nội dung |
|---|---|---|
| `task-N-brief.md` | Claude | Yêu cầu, giá trị chính xác, ràng buộc — làm đúng, không tự mở rộng |
| `task-N-report.md` | **Codex** | Xem khuôn dưới |
| `review-N.md` | Claude | Lỗi theo mức (Critical / Important / Minor) + `file:dòng` |
| `fix-N-R.md` | **Codex** | Vòng sửa R: lỗi nào đã sửa, commit, test đã chạy lại |

Khuôn `task-N-report.md`:

```markdown
# Task N — <tên>
Trạng thái: XONG | XONG_CÓ_LƯU_Ý | KẸT (lý do)
Nhánh / worktree: …   Commit: <sha> (dải <base>..<head>)
## Đã đổi
- `đường/dẫn/file` — làm gì
## Test đã chạy (dán phần cuối output thật)
- vitest: …  · tsc: …  · eslint: …
## Lệch so với brief (nếu có) + lý do
## Ngoài phạm vi thấy được (không sửa)
## Chưa kiểm được
```

Mỗi task một (hoặc vài) commit riêng, không gộp nhiều task vào một commit. Không sửa lại commit cũ (`--amend`,
rebase) sau khi đã ghi report — sửa bằng commit mới để Claude review đúng dải.
