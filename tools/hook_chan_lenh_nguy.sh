#!/usr/bin/env bash
# ============================================================================
# hook_chan_lenh_nguy.sh — chặn trước vài lệnh đã từng gây tai nạn thật ở repo này.
#
# Gắn ở PreToolUse/Bash (xem .claude/settings.json).
#
#   1. pkill/killall next|node  → CHẶN HẲN.
#      20/08/2026: một phiên chạy `pkill -f "next dev"`, giết luôn dev server
#      mà phiên khác vừa đưa CEO vào xem. CEO đang bấm thì trang chết.
#      Tắt đúng cổng của mình:  lsof -ti :3401 | xargs kill
#
#   2. git add -A / git add .   → HỎI LẠI.
#      19/08/2026 suýt commit SĐT khách thật vì `git add -A` quét file của
#      phiên khác. Không chặn hẳn vì đôi khi thật sự cần.
#
# Chạy tay để thử:
#   echo '{"tool_input":{"command":"pkill -f \"next dev\""}}' | bash tools/hook_chan_lenh_nguy.sh
# ============================================================================
set -uo pipefail

LENH="$(jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$LENH" ] || exit 0

quyet_dinh() {   # $1 = allow|deny|ask   $2 = lý do
  jq -nc --arg qd "$1" --arg ly_do "$2" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$qd,permissionDecisionReason:$ly_do}}'
  exit 0
}

if printf '%s' "$LENH" | grep -Eq '(^|[;&|])[[:space:]]*(pkill|killall)([[:space:]]|$)[^;&|]*(next|node)'; then
  quyet_dinh deny "$(cat <<'LY_DO'
CHẶN: pkill/killall sẽ giết dev server của MỌI phiên Claude đang chạy, kể cả
server mà phiên khác vừa đưa CEO vào xem (đã xảy ra thật 20/08/2026).
Thay bằng: tắt đúng cổng của mình —  lsof -ti :<cổng của bạn> | xargs kill
hoặc dừng đúng tiến trình nền mà chính bạn đã khởi chạy.
LY_DO
)"
fi

if printf '%s' "$LENH" | grep -Eq '(^|[;&|])[[:space:]]*git[[:space:]]+add[[:space:]]+(-A|--all|\.)([[:space:]]|$)'; then
  quyet_dinh ask "$(cat <<'LY_DO'
HỎI LẠI: repo này thường có nhiều worktree song song; `git add -A` từng quét
trúng file dang dở của phiên khác và suýt commit SĐT khách thật (19/08/2026).
Nên: git add <đúng file của mình>. Chỉ đồng ý nếu bạn chắc cây làm việc sạch.
LY_DO
)"
fi

exit 0
