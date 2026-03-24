#!/bin/bash
# Installs Mela daemon as a macOS launchd service
# It will auto-start on login and restart if it crashes
# Usage: bash scripts/install-daemon.sh

NODE=$(which node 2>/dev/null || echo "$HOME/.nvm/versions/node/v24.14.0/bin/node")
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/com.mela.daemon.plist"
LOG_DIR="$DIR/logs"

mkdir -p "$LOG_DIR"

cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.mela.daemon</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$DIR/scripts/daemon.mjs</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$DIR</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/daemon.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/daemon-error.log</string>
  <key>ThrottleInterval</key>
  <integer>30</integer>
</dict>
</plist>
EOF

# Load it
launchctl unload "$PLIST" 2>/dev/null
launchctl load "$PLIST"

echo ""
echo "✅ Mela daemon installed and running!"
echo ""
echo "Commands:"
echo "  View logs:    tail -f $LOG_DIR/daemon.log"
echo "  Stop daemon:  launchctl unload $PLIST"
echo "  Start daemon: launchctl load $PLIST"
echo "  Status:       launchctl list | grep mela"
echo ""
