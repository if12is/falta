#!/bin/sh
# Installs an XDG autostart entry that opens the Falta offline page at login.
# Remove it with uninstall-linux.sh.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
PAGE="$ROOT/web/index.html"
if [ ! -f "$PAGE" ]; then
  echo "Missing $PAGE" >&2
  exit 1
fi
DIR="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
mkdir -p "$DIR"
DESKTOP="$DIR/falta.desktop"
SAFE=$(printf '%s' "$PAGE" | sed 's/"/\\"/g')
cat > "$DESKTOP" << EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Falta
Name[ar]=فلتة
Comment=Open the Falta offline page at login
Exec=xdg-open "${SAFE}"
Terminal=false
X-GNOME-Autostart-enabled=true
EOF
echo "Installed: $DESKTOP"
echo "Opens: $PAGE"
