#!/usr/bin/env bash
# ============================================================================
# hook_tsc.sh — soát kiểu TypeScript NGAY sau khi Claude sửa file .ts/.tsx.
#
# Gắn ở PostToolUse (xem .claude/settings.json). Chạy nền (async) nên không
# làm chậm việc sửa file; nếu có lỗi thì thoát mã 2 để đánh thức Claude và
# đưa nguyên văn lỗi vào ngữ cảnh.
#
# Vì sao cần: trước đây lỗi kiểu chỉ lộ ra ở bước "tự kiểm trước khi gọi CEO",
# lúc đó đã sửa 10 file và không biết lỗi từ file nào.
#
# Chạy tay để thử:
#   echo '{"tool_input":{"file_path":"<đường dẫn tuyệt đối .ts>"}}' | bash tools/hook_tsc.sh
# ============================================================================
set -uo pipefail

DUONG_DAN="$(jq -r '.tool_response.filePath // .tool_input.file_path // empty' 2>/dev/null)"
[ -n "$DUONG_DAN" ] || exit 0

# Chỉ quan tâm TypeScript trong apps/web. File khác thoát ngay, không tốn giây nào.
case "$DUONG_DAN" in
  */node_modules/*) exit 0 ;;
  */apps/web/*.ts|*/apps/web/*.tsx) ;;
  *) exit 0 ;;
esac

# Suy ra thư mục apps/web TỪ ĐƯỜNG DẪN FILE, không dựa vào thư mục hiện hành —
# nhờ vậy hook chạy đúng ở mọi worktree.
GOC_WEB="${DUONG_DAN%%/apps/web/*}/apps/web"
[ -d "$GOC_WEB/node_modules/typescript" ] || exit 0   # worktree chưa npm install → im lặng
cd "$GOC_WEB" || exit 0

mkdir -p .next/cache
# --incremental: lần đầu ~6,6s, các lần sau ~1,3s (đo 26/08/2026 trên máy CEO).
KET_QUA="$(npx tsc --noEmit --incremental --tsBuildInfoFile .next/cache/hook-tsc.tsbuildinfo --pretty false 2>&1)"
[ $? -eq 0 ] && exit 0

TEN_TUONG_DOI="${DUONG_DAN#*/apps/web/}"
LOI_FILE_NAY="$(printf '%s\n' "$KET_QUA" | grep -F "$TEN_TUONG_DOI" | head -20)"
TONG="$(printf '%s\n' "$KET_QUA" | grep -cE '^[^ ].*error TS[0-9]+')"

{
  echo "tsc --noEmit thất bại ($TONG lỗi) sau khi sửa $TEN_TUONG_DOI"
  if [ -n "$LOI_FILE_NAY" ]; then
    echo "--- lỗi trong chính file vừa sửa ---"
    printf '%s\n' "$LOI_FILE_NAY"
  fi
  echo "--- toàn bộ (cắt còn 40 dòng) ---"
  printf '%s\n' "$KET_QUA" | head -40
} >&2

exit 2
