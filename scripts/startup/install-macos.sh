#!/bin/sh
# Installs a LaunchAgent that opens the Falta offline page at login.
# Remove it with uninstall-macos.sh.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
PAGE="$ROOT/web/index.html"
if [ ! -f "$PAGE" ]; then
  echo "Missing $PAGE" >&2
  exit 1
fi
DIR="$HOME/Library/LaunchAgents"
mkdir -p "$DIR"
PLIST="$DIR/io.github.if12is.falta.plist"
ESC=$(printf '%s' "$PAGE" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')
cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>io.github.if12is.falta</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/open</string>
    <string>${ESC}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>
EOF
echo "Installed: $PLIST"
echo "Opens: $PAGE"
echo "It runs at the next login."
