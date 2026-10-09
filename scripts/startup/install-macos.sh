#!/bin/sh
# Installs the Falta system-wide hotkey (Command+Shift+Y) as a login item.
# The program runs from this unzipped folder. Do not delete or move the folder.
# Remove it with uninstall-macos.sh.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
SRC="$ROOT/scripts/startup/falta-hotkey.swift"
BIN="$ROOT/scripts/startup/FaltaHotkey"
FLIP="$ROOT/scripts/startup/flip.mjs"
CORE="$ROOT/src/falta-core.js"
NODE_FILE="$ROOT/scripts/startup/falta-node.path"
PLIST="$HOME/Library/LaunchAgents/io.github.if12is.falta.plist"

NODE_MSG='فلتة محتاجة برنامج Node عشان تقلب الحروف في أي برنامج.

نزّل Node 18 أو أحدث من:
https://nodejs.org

ثبّته، وبعدين شغّل المثبّت تاني:
scripts/startup/install-macos.command

---

Falta needs Node to flip letters in every program.

Install Node 18 or newer from:
https://nodejs.org

Then run this installer again:
scripts/startup/install-macos.command'

CLT_MSG='فلتة محتاجة أدوات سطر أوامر أبل عشان تبني البرنامج الصغير.

هتفتح نافذة التثبيت. اضغط Install واستنى لحد ما تخلص، وبعدين شغّل المثبّت تاني.

---

Falta needs Apple'"'"'s command line tools to build the small helper.

An install window will open. Click Install, wait until it finishes, then run this installer again.'

tell() {
  printf '%s\n' "$1"
  osascript -e 'on run argv' -e 'display dialog (item 1 of argv) buttons {"OK"} default button 1 with title "Falta"' -e 'end run' "$1" >/dev/null 2>&1 || true
}

die() {
  tell "$1" >&2
  exit 1
}

xml_escape() {
  printf '%s' "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'
}

resolve_node() {
  node_bin=""
  if command -v node >/dev/null 2>&1; then
    node_bin=$(command -v node)
  fi
  if [ -z "$node_bin" ] || [ ! -x "$node_bin" ]; then
    for candidate in /opt/homebrew/bin/node /usr/local/bin/node "$HOME/.local/bin/node"; do
      if [ -x "$candidate" ]; then
        node_bin=$candidate
        break
      fi
    done
  fi
  if [ -z "$node_bin" ] || [ ! -x "$node_bin" ]; then
    if [ -d "$HOME/.nvm/versions/node" ]; then
      for candidate in "$HOME/.nvm/versions/node"/*/bin/node; do
        if [ -x "$candidate" ]; then
          node_bin=$candidate
        fi
      done
    fi
  fi
}

for need in "$SRC" "$FLIP" "$CORE"; do
  if [ ! -f "$need" ]; then
    die "Missing $need"
  fi
done

resolve_node
if [ -z "$node_bin" ] || [ ! -x "$node_bin" ]; then
  die "$NODE_MSG"
fi
major=$("$node_bin" -p "parseInt(process.versions.node, 10)" 2>/dev/null || true)
case "$major" in
  ''|*[!0-9]*) die "$NODE_MSG" ;;
esac
if [ "$major" -lt 18 ]; then
  die "$NODE_MSG"
fi
printf '%s\n' "$node_bin" > "$NODE_FILE"

swiftc_bin=""
if command -v swiftc >/dev/null 2>&1; then
  swiftc_bin=$(command -v swiftc)
elif command -v xcrun >/dev/null 2>&1; then
  swiftc_bin=$(xcrun --find swiftc 2>/dev/null || true)
fi
if [ -z "$swiftc_bin" ]; then
  xcode-select --install >/dev/null 2>&1 || true
  die "$CLT_MSG"
fi

"$swiftc_bin" -O -framework Cocoa -framework Carbon -o "$BIN" "$SRC"
chmod +x "$BIN"
if command -v codesign >/dev/null 2>&1; then
  codesign --force --sign - "$BIN" >/dev/null 2>&1 || true
fi

mkdir -p "$HOME/Library/LaunchAgents"
UID_NUM=$(id -u)
launchctl bootout "gui/${UID_NUM}/io.github.if12is.falta" >/dev/null 2>&1 || true

ESC_BIN=$(xml_escape "$BIN")
ESC_NODE=$(xml_escape "$node_bin")
ESC_ROOT=$(xml_escape "$ROOT")
cat > "$PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>io.github.if12is.falta</string>
  <key>ProgramArguments</key>
  <array>
    <string>${ESC_BIN}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${ESC_ROOT}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>FALTA_NODE</key>
    <string>${ESC_NODE}</string>
    <key>FALTA_ROOT</key>
    <string>${ESC_ROOT}</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>LimitLoadToSessionType</key>
  <string>Aqua</string>
  <key>ProcessType</key>
  <string>Interactive</string>
</dict>
</plist>
EOF

if ! launchctl bootstrap "gui/${UID_NUM}" "$PLIST"; then
  launchctl kickstart -k "gui/${UID_NUM}/io.github.if12is.falta" || true
fi

open "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_Accessibility" >/dev/null 2>&1 || \
  open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility" >/dev/null 2>&1 || true

OK_MSG='تمام. فلتة اتثبتت.

أول مرة، الماك هيطلب إنك تسمح لـ FaltaHotkey في:
System Settings → Privacy & Security → Accessibility

علّم أي نص في أي برنامج واضغط Command+Shift+Y.
هتشتغل لما تسجّل دخول.

ما تحذفش المجلد ده وما تنقلوش من مكانه.

---

Falta is installed.

The first time, macOS asks you to allow FaltaHotkey in:
System Settings → Privacy & Security → Accessibility

Select text in any program and press Command+Shift+Y.
It starts when you log in.

Do not delete this folder, and do not move it.'
tell "$OK_MSG"
