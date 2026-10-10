#!/bin/sh
# Installs the Falta system-wide hotkey (Ctrl+Shift+Y) for this user.
# Ubuntu on Wayland uses a GNOME shortcut plus ydotool.
# An X11 session starts a small listener at login.
# The program runs from this unzipped folder. Do not delete the folder.
# Remove it with uninstall-linux.sh.
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
SCRIPT="$ROOT/scripts/startup/falta-hotkey.py"
FLIP="$ROOT/scripts/startup/flip.mjs"
CORE="$ROOT/src/falta-core.js"
NODE_FILE="$ROOT/scripts/startup/falta-node.path"
AUTOSTART="${XDG_CONFIG_HOME:-$HOME/.config}/autostart"
CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/falta"

NODE_MSG='فلتة محتاجة برنامج Node عشان تقلب الحروف في أي برنامج.

نزّل Node 18 أو أحدث من:
https://nodejs.org

ثبّته، وبعدين شغّل المثبّت تاني:
sh scripts/startup/install-linux.sh

---

Falta needs Node to flip letters in every program.

Install Node 18 or newer from:
https://nodejs.org

Then run this installer again:
sh scripts/startup/install-linux.sh'

die() {
  printf '%s\n' "$1" >&2
  exit 1
}

install_pkgs() {
  if ! command -v sudo >/dev/null 2>&1 || ! command -v apt-get >/dev/null 2>&1; then
    return 1
  fi
  if sudo apt-get install -y "$@"; then
    return 0
  fi
  sudo apt-get update
  sudo apt-get install -y "$@"
}

resolve_node() {
  node_bin=""
  if command -v node >/dev/null 2>&1; then
    node_bin=$(command -v node)
  fi
  if [ -z "$node_bin" ] || [ ! -x "$node_bin" ]; then
    for candidate in /usr/local/bin/node /usr/bin/node "$HOME/.local/bin/node"; do
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

for need in "$SCRIPT" "$FLIP" "$CORE"; do
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

if [ -x /usr/bin/python3 ]; then
  py=/usr/bin/python3
elif command -v python3 >/dev/null 2>&1; then
  py=$(command -v python3)
else
  die 'فلتة محتاجة Python 3.

شغّل: sudo apt install python3
وبعدين شغّل المثبّت تاني.

---

Falta needs Python 3.

Run: sudo apt install python3
Then run this installer again.'
fi

if ! "$py" -c 'import gi; gi.require_version("Gtk", "3.0"); from gi.repository import Gtk' >/dev/null 2>&1; then
  install_pkgs python3-gi gir1.2-gtk-3.0 || true
fi
if ! "$py" -c 'import gi; gi.require_version("Gtk", "3.0"); from gi.repository import Gtk' >/dev/null 2>&1; then
  die 'فلتة محتاجة مكتبات GTK الخاصة ببايثون.

شغّل:
sudo apt install python3-gi gir1.2-gtk-3.0

وبعدين شغّل المثبّت تاني.

---

Falta needs the Python GTK libraries.

Run:
sudo apt install python3-gi gir1.2-gtk-3.0

Then run this installer again.'
fi

session=${XDG_SESSION_TYPE:-}
if [ -z "$session" ] && [ -n "${WAYLAND_DISPLAY:-}" ]; then
  session=wayland
fi
if [ -z "$session" ] && [ -n "${DISPLAY:-}" ]; then
  session=x11
fi
if [ "$session" != "wayland" ] && [ "$session" != "x11" ]; then
  die 'شغّل المثبّت من جلسة سطح المكتب (أوبونتو)، مش من جلسة من غير شاشة.

---

Run the installer from the Ubuntu desktop session, not from a session without a display.'
fi

mkdir -p "$AUTOSTART" "$CONFIG"
rm -f "$AUTOSTART/falta.desktop"

bind_gnome() {
  script_esc=$(printf '%s' "$SCRIPT" | sed 's/\\/\\\\/g; s/"/\\"/g')
  FALTA_BIND_PATH="/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/falta/"
  FALTA_BIND_CMD="$py \"$script_esc\" --once"
  export FALTA_BIND_PATH FALTA_BIND_CMD
  "$py" - << 'PY'
import ast, os, subprocess
path = os.environ["FALTA_BIND_PATH"]
cmd = os.environ["FALTA_BIND_CMD"]
raw = subprocess.check_output(
    ["gsettings", "get", "org.gnome.settings-daemon.plugins.media-keys", "custom-keybindings"],
    text=True,
).strip()
if raw in ("@as []", "[]"):
    items = []
else:
    items = list(ast.literal_eval(raw))
if path not in items:
    items.append(path)
literal = "[" + ", ".join("'" + item + "'" for item in items) + "]"
subprocess.check_call([
    "gsettings", "set",
    "org.gnome.settings-daemon.plugins.media-keys",
    "custom-keybindings",
    literal,
])
base = "org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:" + path
subprocess.check_call(["gsettings", "set", base, "name", "Falta"])
subprocess.check_call(["gsettings", "set", base, "command", cmd])
subprocess.check_call(["gsettings", "set", base, "binding", "<Control><Shift>y"])
PY
}

unbind_gnome() {
  if ! command -v gsettings >/dev/null 2>&1; then
    return 0
  fi
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
}

setup_ydotoold() {
  if ! command -v ydotool >/dev/null 2>&1; then
    printf '%s\n' 'هثبّت أداة ydotool. ممكن الجهاز يطلب كلمة السر.

---

Installing ydotool. The computer may ask for your password.'
    install_pkgs ydotool || true
  fi
  if ! command -v ydotool >/dev/null 2>&1; then
    die 'على أوبونتو (واي لاند) فلتة محتاجة أداة ydotool عشان تكتب في البرامج.

شغّل:
sudo apt install ydotool

وبعدين شغّل المثبّت تاني.

---

On Ubuntu (Wayland), Falta needs ydotool to type into programs.

Run:
sudo apt install ydotool

Then run this installer again.'
  fi

  if [ ! -e /dev/uinput ]; then
    sudo modprobe uinput || true
  fi
  if command -v sudo >/dev/null 2>&1; then
    printf '%s\n' 'KERNEL=="uinput", SUBSYSTEM=="misc", TAG+="uaccess", MODE="0660"' | sudo tee /etc/udev/rules.d/99-falta-uinput.rules >/dev/null || true
    sudo udevadm control --reload || true
    sudo udevadm trigger --name-match=uinput || true
    if command -v setfacl >/dev/null 2>&1; then
      sudo setfacl -m "u:${USER}:rw" /dev/uinput || true
    fi
    if [ ! -w /dev/uinput ]; then
      sudo chmod a+rw /dev/uinput || true
    fi
  fi

  daemon=$(command -v ydotoold || true)
  if [ -z "$daemon" ]; then
    die 'ydotool اتثبت من غير ydotoold. شغّل المثبّت تاني بعد: sudo apt install ydotool

---

ydotool is installed without ydotoold. Run: sudo apt install ydotool
Then run this installer again.'
  fi

  unit_dir="$HOME/.config/systemd/user"
  mkdir -p "$unit_dir"
  cat > "$unit_dir/falta-ydotoold.service" << EOF
[Unit]
Description=Falta typing helper

[Service]
ExecStart=$daemon
Restart=on-failure

[Install]
WantedBy=default.target
EOF
  if command -v systemctl >/dev/null 2>&1 && systemctl --user daemon-reload && systemctl --user enable --now falta-ydotoold.service; then
    rm -f "$AUTOSTART/falta-ydotoold.desktop"
  else
    cat > "$AUTOSTART/falta-ydotoold.desktop" << EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Falta typing helper
Comment=Lets Falta type the flipped text
Exec=$daemon
Terminal=false
X-GNOME-Autostart-enabled=true
EOF
    if ! pgrep -f "$daemon" >/dev/null 2>&1; then
      "$daemon" >/dev/null 2>&1 &
    fi
  fi
  sleep 0.4
  if ! ydotool key 29:0 >/dev/null 2>&1 && ! ydotool key --key-delay 8 29:0 >/dev/null 2>&1; then
    die 'أداة الكتابة ydotool لسه مش قادرة تكتب. اخرج من الحساب وادخل تاني، وبعدين شغّل المثبّت مرة كمان.

---

ydotool still cannot type. Log out and back in, then run this installer again.'
  fi
  if ! pgrep -f ydotoold >/dev/null 2>&1; then
    die 'خدمة الكتابة (ydotoold) ما اشتغلتش.

اخرج من الحساب وادخل تاني، وبعدين شغّل المثبّت مرة كمان.

---

The typing helper (ydotoold) did not start.

Log out and back in, then run this installer again.'
  fi
}

if [ "$session" = "wayland" ]; then
  if ! command -v gsettings >/dev/null 2>&1 || ! gsettings list-schemas 2>/dev/null | grep -qx "org.gnome.settings-daemon.plugins.media-keys"; then
    die 'المثبّت ده لأوبونتو بواجهة جنوم. لو داخل على Xorg، ادخل من أيقونة الترس واختار Ubuntu on Xorg وبعدين شغّل المثبّت تاني.

---

This installer supports Ubuntu GNOME. If you can, sign in with Ubuntu on Xorg from the gear menu and run the installer again.'
  fi
  setup_ydotoold
  bind_gnome || die 'ما قدرناش نسجّل الاختصار في إعدادات جنوم.

---

Could not register the shortcut in GNOME settings.'
else
  if ! "$py" -c 'import ctypes; ctypes.CDLL("libX11.so.6"); ctypes.CDLL("libXtst.so.6")' >/dev/null 2>&1; then
    install_pkgs libx11-6 libxtst6 || true
  fi
  if ! "$py" -c 'import ctypes; ctypes.CDLL("libX11.so.6"); ctypes.CDLL("libXtst.so.6")' >/dev/null 2>&1; then
    die 'فلتة محتاجة مكتبة libxtst عشان تبعت Ctrl+C.

شغّل:
sudo apt install libxtst6

وبعدين شغّل المثبّت تاني.

---

Falta needs libxtst to send Ctrl+C.

Run:
sudo apt install libxtst6

Then run this installer again.'
  fi
  if ! "$py" -c 'import gi
ns = None
try:
    gi.require_version("AyatanaAppIndicator3", "0.1")
    ns = "AyatanaAppIndicator3"
except ValueError:
    pass
if ns is None:
    gi.require_version("AppIndicator3", "0.1")
' >/dev/null 2>&1; then
    install_pkgs gir1.2-ayatanaappindicator3-0.1 || install_pkgs gir1.2-appindicator3-0.1 || true
  fi
  unbind_gnome
  rm -f "$AUTOSTART/falta-ydotoold.desktop"
  cat > "$AUTOSTART/falta.desktop" << EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=Falta
Name[ar]=فلتة
Comment=Flip selected text with Ctrl+Shift+Y
Exec=$py "$SCRIPT" --listen
Terminal=false
X-GNOME-Autostart-enabled=true
EOF
  if pgrep -f "falta-hotkey.py --listen" >/dev/null 2>&1 || pgrep -f "falta-hotkey.py --tray" >/dev/null 2>&1; then
    pkill -f "falta-hotkey.py --listen" || true
    pkill -f "falta-hotkey.py --tray" || true
    sleep 0.3
  fi
  "$py" "$SCRIPT" --listen >/dev/null 2>&1 &
fi

APPS="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mkdir -p "$APPS"
cat > "$APPS/falta-settings.desktop" << EOF
[Desktop Entry]
Type=Application
Version=1.0
Name=فلتة
Name[en]=Falta
Comment=إعدادات فلتة
Exec=$py "$SCRIPT" --settings
Icon=$ROOT/extension/icons/icon128.png
Terminal=false
Categories=Utility;
StartupNotify=false
EOF

printf '%s\n' "$session" > "$CONFIG/session"

OK_MSG='تمام. فلتة اتثبتت.

علّم أي نص في أي برنامج واضغط Ctrl+Shift+Y.
هتشتغل لما تسجّل دخول.

ما تحذفش المجلد ده، لأن البرنامج بيشتغل منه.
لو الاختصار ما اشتغلش بعد إعادة التشغيل، اخرج من الحساب وادخل تاني مرة واحدة.

---

Falta is installed.

Select text in any program and press Ctrl+Shift+Y.
It starts when you log in.

Do not delete this folder. The program runs from it.
If the shortcut does not work after a restart, log out and back in once.'
printf '%s\n' "$OK_MSG"
if [ "$session" = "wayland" ]; then
  printf '\n%s\n' 'على واي لاند مفيش أيقونة في الشريط. الإعدادات من قائمة البرامج: فلتة.

---

On Wayland there is no tray icon. Settings are in the app menu, under فلتة.'
else
  printf '\n%s\n' 'أيقونة فلتة في شريط الحالة لو الجلسة بتظهرها. لو مش ظاهرة، الإعدادات من قائمة البرامج.

---

Falta adds a status icon when the session can show one. If it is hidden, settings are in the app menu.'
fi
