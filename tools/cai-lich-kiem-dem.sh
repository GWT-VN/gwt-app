#!/usr/bin/env bash
# ============================================================================
# cai-lich-kiem-dem.sh — đặt lịch chạy tools/kiem_dem.py mỗi tối 23:00.
#
# 23:00 chứ không 22:00: bản sao lưu chạy 22:00, bản kiểm phải đọc trạng thái
# SAU khi sao lưu đã commit/push xong, nếu không nó báo nhầm "chưa push".
#
# Khác cron ở chỗ launchd CHẠY BÙ khi máy vừa thức dậy nếu lỡ giờ hẹn.
#
# DÙNG:
#   bash tools/cai-lich-kiem-dem.sh          # cài, chạy 23:00 hằng ngày
#   bash tools/cai-lich-kiem-dem.sh 7        # đổi sang 7:00 sáng
#   bash tools/cai-lich-kiem-dem.sh --go     # gỡ lịch
#   bash tools/cai-lich-kiem-dem.sh --chay   # chạy ngay một lượt
#
# Báo cáo: ~/gwt-worktrees/_kiem_dem_<ngày>.md
# ============================================================================
set -uo pipefail

NHAN="vn.gwt.kiemdem"
PLIST="$HOME/Library/LaunchAgents/$NHAN.plist"
CHUNG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && git rev-parse --git-common-dir)"
GOC="$(cd "$(dirname "$CHUNG")" && pwd)"
SCRIPT="$GOC/tools/kiem_dem.py"
PY=/usr/bin/python3
LOG="$HOME/gwt-worktrees/_kiem_dem.log"

case "${1:-}" in
  --go)
    launchctl bootout "gui/$UID/$NHAN" 2>/dev/null
    rm -f "$PLIST"
    echo "✅ Đã gỡ lịch kiểm đêm."
    exit 0 ;;
  --chay)
    echo "Chạy một lượt ngay bây giờ…"
    exec "$PY" "$SCRIPT" ;;
esac

GIO="${1:-23}"
if ! [ "$GIO" -ge 0 ] 2>/dev/null || [ "$GIO" -gt 23 ]; then
  echo "Giờ không hợp lệ: $GIO (phải 0–23)"; exit 1
fi
[ -f "$SCRIPT" ] || { echo "Không thấy $SCRIPT"; exit 1; }
command -v claude >/dev/null || echo "⚠️  Không thấy lệnh 'claude' trên PATH — job sẽ chạy được phần đo bằng code, nhưng bỏ phần đối chiếu backlog."

mkdir -p "$HOME/Library/LaunchAgents" "$(dirname "$LOG")"

# launchd cho job một PATH rất hẹp; `claude`, `git`, `docker` nằm ngoài đó.
# Không set PATH thì phần gọi claude -p im lặng thất bại.
cat > "$PLIST" <<PLIST_HET
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$NHAN</string>
  <key>ProgramArguments</key>
  <array>
    <string>$PY</string>
    <string>$SCRIPT</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>$GIO</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST_HET

launchctl bootout "gui/$UID/$NHAN" 2>/dev/null
if launchctl bootstrap "gui/$UID" "$PLIST" 2>/dev/null; then
  echo "✅ Đã đặt lịch kiểm đêm $GIO:00 hằng ngày."
else
  echo "⛔ launchctl bootstrap thất bại. Thử: launchctl load -w \"$PLIST\""
  exit 1
fi
echo "   Kho git  : $GOC"
echo "   Báo cáo  : $HOME/gwt-worktrees/_kiem_dem_<ngày>.md"
echo "   Gỡ lịch  : bash tools/cai-lich-kiem-dem.sh --go"
echo "   Chạy thử : bash tools/cai-lich-kiem-dem.sh --chay"
launchctl print "gui/$UID/$NHAN" 2>/dev/null | grep -E "state|program" | head -3
