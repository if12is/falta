#!/bin/sh
# Removes the Falta hotkey. Leaves the unzipped folder where it is.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
AUTOSTART="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
if [ -x /usr/bin/python3 ]; then
  py=/usr/bin/python3
else
  py=$(command -v python3 || true)
fi

rm -f "$AUTOSTART/falta.desktop" "$AUTOSTART/falta-ydotoold.desktop"

if command -v systemctl >/dev/null 2>&1; then
  systemctl --user disable --now falta-ydotoold.service >/dev/null 2>&1 || true
fi
rm -f "$HOME/.config/systemd/user/falta-ydotoold.service"
if command -v systemctl >/dev/null 2>&1; then
  systemctl --user daemon-reload >/dev/null 2>&1 || true
fi

if [ -n "$py" ]; then
  "$py" - << 'PY' || true
import ast, subprocess
path = "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/falta/"
try:
    raw = subprocess.check_output(
        ["gsettings", "get", "org.gnome.settings-daemon.plugins.media-keys", "custom-keybindings"],
        text=True,
    ).strip()
except Exception:
    raise SystemExit(0)
if raw in ("@as []", "[]"):
    items = []
else:
    items = list(ast.literal_eval(raw))
items = [item for item in items if item != path]
literal = "[" + ", ".join("'" + item + "'" for item in items) + "]"
subprocess.check_call([
    "gsettings", "set",
    "org.gnome.settings-daemon.plugins.media-keys",
    "custom-keybindings",
    literal,
])
PY
fi

pkill -f "falta-hotkey.py" >/dev/null 2>&1 || true
pkill -x ydotoold >/dev/null 2>&1 || true

APPS="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
rm -f "$APPS/falta-settings.desktop"
rm -f "${XDG_CONFIG_HOME:-$HOME/.config}/falta/settings.json"

if command -v sudo >/dev/null 2>&1 && [ -f /etc/udev/rules.d/99-falta-uinput.rules ]; then
  sudo rm -f /etc/udev/rules.d/99-falta-uinput.rules || true
fi

printf '%s\n' 'فلتة اتشالت من تسجيل الدخول. المجلد لسه مكانه.

---

Falta no longer starts at login. The folder is still there.'
