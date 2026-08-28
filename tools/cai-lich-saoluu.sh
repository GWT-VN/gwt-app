#!/usr/bin/env bash
# ============================================================================
# cai-lich-saoluu.sh — đặt lịch chạy tools/saoluu_dem.py mỗi tối.
#
# CEO không tắt máy, thường làm tới 21h → sao lưu lúc 22:00.
# Dùng launchd (không phải cron) vì launchd CHẠY BÙ khi máy vừa thức dậy nếu
# lỡ giờ hẹn — cron thì bỏ luôn lượt đó.
#
# ⚠️ VÌ SAO PHẢI CHÉP SCRIPT RA NGOÀI iCLOUD
#   macOS không cho tiến trình launchd đọc ~/Library/Mobile Documents (iCloud
#   Drive). Trỏ lịch thẳng vào repo là job chết ngay dòng đầu:
#     "can't open file …/tools/saoluu_dem.py: Operation not permitted"
#   Chạy tay trong Terminal vẫn chạy ngon (Terminal có quyền), nên cài xong
#   nhìn rất ổn. Thực tế nó câm 7 đêm liền 21–27/08/2026, log vẫn ghi đều,
#   không ai thấy — trong lúc cả khu Marketing chưa commit nằm trên ổ máy.
#   Vì thế: chép saoluu_dem.py + scan_pii_secrets.py sang ~/gwt-worktrees/_tools/
#   và cho launchd chạy bản đó.
#
#   ⇒ Sửa tools/saoluu_dem.py trong repo xong PHẢI chạy lại script này,
#     không thì đêm nay vẫn là bản cũ. (Job có tự cảnh báo khi thấy lệch.)
#
# DÙNG:
#   bash tools/cai-lich-saoluu.sh          # cài, chạy 22:00 hằng ngày
#   bash tools/cai-lich-saoluu.sh 21       # đổi sang 21:00
#   bash tools/cai-lich-saoluu.sh --go     # gỡ lịch
#   bash tools/cai-lich-saoluu.sh --chay   # chép lại rồi chạy thật một lượt
#   bash tools/cai-lich-saoluu.sh --thu    # chép lại rồi chạy thử (không commit)
#   bash tools/cai-lich-saoluu.sh --kiem   # kiểm bản đã cài, CHẠY ĐÚNG KIỂU launchd
#
# Nhật ký: ~/gwt-worktrees/_saoluu.log
# ============================================================================
set -uo pipefail

NHAN="vn.gwt.saoluu"
PLIST="$HOME/Library/LaunchAgents/$NHAN.plist"
# Lấy bản NGAY CẠNH script này — tức là bản của checkout đang chạy lệnh.
# ĐỪNG dùng `git rev-parse --git-common-dir`: từ worktree nó trỏ về kho gốc (main),
# nên chạy từ worktree lại đi cài bản main — sửa xong tưởng đã cài, thực ra chưa.
TOOLS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GOC="$(dirname "$TOOLS")"
NGUON="$TOOLS/saoluu_dem.py"
NGUON_PII="$TOOLS/scripts/scan_pii_secrets.py"
# Chỗ launchd chạy được — NGOÀI iCloud. Đừng đổi sang đường dẫn trong iCloud.
TRIEN="$HOME/gwt-worktrees/_tools"
SCRIPT="$TRIEN/saoluu_dem.py"
PY=/usr/bin/python3            # python hệ thống: ổn định nhất cho job nền
LOG="$HOME/gwt-worktrees/_saoluu.log"

# ── chép bản chạy nền ────────────────────────────────────────────────────────
trien_khai() {
  [ -f "$NGUON" ]     || { echo "⛔ Không thấy $NGUON"; exit 1; }
  [ -f "$NGUON_PII" ] || { echo "⛔ Không thấy $NGUON_PII (cửa quét PII, bắt buộc)"; exit 1; }
  case "$TRIEN" in
    *"Mobile Documents"*)
      echo "⛔ Chỗ triển khai đang nằm trong iCloud — launchd sẽ không đọc được."; exit 1 ;;
  esac
  mkdir -p "$TRIEN"
  cp "$NGUON" "$SCRIPT"
  cp "$NGUON_PII" "$TRIEN/scan_pii_secrets.py"
  cat > "$TRIEN/NGUON.txt" <<GHI
Bản chép để job launchd chạy được (launchd không đọc được iCloud Drive).
KHÔNG sửa trực tiếp ở đây — sửa trong repo rồi chạy: bash tools/cai-lich-saoluu.sh

nguồn : $NGUON
chép  : $(date '+%d/%m/%Y %H:%M:%S')
sha256: $(shasum -a 256 "$NGUON" | awk '{print $1}')
GHI
  echo "   Đã chép : $SCRIPT"
}

# ── chạy thử ĐÚNG KIỂU launchd (đây mới là bằng chứng job đêm sẽ chạy) ───────
tu_kiem() {
  local NHANT="$NHAN.thu"
  local PT="$HOME/Library/LaunchAgents/$NHANT.plist"
  local LT="$HOME/gwt-worktrees/_saoluu_thu.log"
  rm -f "$LT"
  cat > "$PT" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$NHANT</string>
  <key>ProgramArguments</key>
  <array><string>$PY</string><string>$SCRIPT</string><string>--thu</string></array>
  <key>EnvironmentVariables</key><dict><key>GWT_SAOLUU_LOG</key><string>$LT</string></dict>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$LT</string>
  <key>StandardErrorPath</key><string>$LT</string>
</dict></plist>
PL
  launchctl bootout "gui/$UID/$NHANT" 2>/dev/null
  launchctl bootstrap "gui/$UID" "$PT" 2>/dev/null
  local i
  for i in $(seq 1 40); do
    grep -q '^XONG' "$LT" 2>/dev/null && break
    /bin/sleep 0.25
  done
  launchctl bootout "gui/$UID/$NHANT" 2>/dev/null
  rm -f "$PT"

  # Chạy đến cuối là chưa đủ — job vẫn có thể chạy xong mà không sao lưu nổi gì.
  if grep -q '^XONG' "$LT" 2>/dev/null && ! grep -q '⛔' "$LT"; then
    echo "✅ Tự kiểm: job chạy được dưới launchd VÀ mở được kho git."
    grep -E '^(⚠️|⛔|──|XONG)' "$LT" | sed 's/^/      /'
    rm -f "$LT"
    return 0
  fi
  echo "⛔ TỰ KIỂM THẤT BẠI — job đêm sẽ KHÔNG chạy. Nhật ký thử:"
  sed 's/^/      /' "$LT" 2>/dev/null || echo "      (không có gì trong $LT)"
  return 1
}

case "${1:-}" in
  --go)
    launchctl bootout "gui/$UID/$NHAN" 2>/dev/null
    rm -f "$PLIST"
    echo "✅ Đã gỡ lịch sao lưu. (Bản chép ở $TRIEN vẫn còn, xoá tay nếu muốn.)"
    exit 0 ;;
  --chay)
    trien_khai
    echo "Chạy một lượt ngay bây giờ…"
    exec "$PY" "$SCRIPT" ;;
  --thu)
    trien_khai
    echo "Chạy thử (không commit, không push)…"
    exec "$PY" "$SCRIPT" --thu ;;
  --kiem)
    [ -f "$SCRIPT" ] || { echo "⛔ Chưa cài. Chạy: bash tools/cai-lich-saoluu.sh"; exit 1; }
    tu_kiem; exit $? ;;
esac

GIO="${1:-22}"
if ! [ "$GIO" -ge 0 ] 2>/dev/null || [ "$GIO" -gt 23 ]; then
  echo "Giờ không hợp lệ: $GIO (phải 0–23)"; exit 1
fi

mkdir -p "$HOME/Library/LaunchAgents" "$(dirname "$LOG")"
trien_khai

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
  echo "✅ Đã đặt lịch sao lưu $GIO:00 hằng ngày."
else
  echo "⛔ launchctl bootstrap thất bại. Thử: launchctl load -w \"$PLIST\""
  exit 1
fi
echo "   Cài từ    : $GOC"
echo "   Chạy      : $PY $SCRIPT"
echo "   Nhật ký   : $LOG"
echo "   Gỡ lịch   : bash tools/cai-lich-saoluu.sh --go"
echo "   Chạy thử  : bash tools/cai-lich-saoluu.sh --thu"
tu_kiem
