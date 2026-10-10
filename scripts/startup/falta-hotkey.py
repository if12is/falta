#!/usr/bin/env python3
"""Falta system-wide hotkey.

Ctrl+Shift+Y copies the selection, flips it with the Arabic 101 converter,
pastes it back, and restores the clipboard. If nothing is selected, the
clipboard is restored and nothing is pasted.
"""

import ast
import json
import os
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FLIP = os.path.join(HERE, "flip.mjs")
NODE_FILE = os.path.join(HERE, "falta-node.path")

# Linux evdev codes. X11 keycodes are these plus 8.
KEY_Y = 21
KEY_LEFTCTRL = 29
KEY_LEFTSHIFT = 42
KEY_C = 46
KEY_V = 47
KEY_RIGHTSHIFT = 54
KEY_LEFTALT = 56
KEY_RIGHTCTRL = 97
KEY_RIGHTALT = 100
KEY_LEFTMETA = 125
KEY_RIGHTMETA = 126

_gtk_ready = False
_lock_handle = None


def session_is_wayland():
    kind = os.environ.get("XDG_SESSION_TYPE", "")
    if kind == "wayland":
        return True
    if kind == "x11":
        return False
    return bool(os.environ.get("WAYLAND_DISPLAY"))


def node_path():
    if os.path.isfile(NODE_FILE):
        with open(NODE_FILE, encoding="utf-8") as handle:
            saved = handle.read().strip()
        if saved and os.path.isfile(saved) and os.access(saved, os.X_OK):
            return saved
    return shutil.which("node")


def ensure_gtk():
    global _gtk_ready
    if _gtk_ready:
        return True
    try:
        import gi
        gi.require_version("Gtk", "3.0")
        from gi.repository import Gtk
        ok = Gtk.init_check()
        if isinstance(ok, tuple):
            ok = ok[0]
        if not ok:
            return False
    except Exception:
        return False
    _gtk_ready = True
    return True


def _gtk_clipboard():
    from gi.repository import Gdk, Gtk
    return Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)


def clipboard_get_text():
    if ensure_gtk():
        text = _gtk_clipboard().wait_for_text()
        return text or ""
    return clipboard_get_text_cli()


def clipboard_set_text(text):
    if ensure_gtk():
        board = _gtk_clipboard()
        board.set_text(text, -1)
        try:
            board.store()
        except Exception:
            pass
        return True
    return clipboard_set_text_cli(text)


def clipboard_snapshot():
    snap = {"text": None, "had_text": False, "image": None}
    if not ensure_gtk():
        text = clipboard_get_text_cli()
        if text:
            snap["text"] = text
            snap["had_text"] = True
        return snap
    board = _gtk_clipboard()
    text = board.wait_for_text()
    if text:
        snap["text"] = text
        snap["had_text"] = True
    try:
        image = board.wait_for_image()
        if image is not None:
            snap["image"] = image
    except Exception:
        pass
    return snap


def clipboard_restore(snap):
    if not ensure_gtk():
        if snap.get("had_text"):
            clipboard_set_text_cli(snap.get("text") or "")
        return
    board = _gtk_clipboard()
    image = snap.get("image")
    if image is not None and not snap.get("had_text"):
        board.set_image(image)
    elif snap.get("had_text"):
        board.set_text(snap.get("text") or "", -1)
    else:
        board.clear()
    try:
        board.store()
    except Exception:
        pass


def clipboard_get_text_cli():
    if os.environ.get("WAYLAND_DISPLAY") and shutil.which("wl-paste"):
        result = subprocess.run(["wl-paste"], capture_output=True, timeout=2)
        if result.returncode != 0:
            return ""
        return result.stdout.decode("utf-8", "replace")
    if shutil.which("xclip"):
        result = subprocess.run(
            ["xclip", "-selection", "clipboard", "-o"],
            capture_output=True,
            timeout=2,
        )
        if result.returncode != 0:
            return ""
        return result.stdout.decode("utf-8", "replace")
    return ""


def clipboard_set_text_cli(text):
    data = text.encode("utf-8")
    if os.environ.get("WAYLAND_DISPLAY") and shutil.which("wl-copy"):
        result = subprocess.run(["wl-copy"], input=data, timeout=2)
        return result.returncode == 0
    if shutil.which("xclip"):
        result = subprocess.run(
            ["xclip", "-selection", "clipboard"],
            input=data,
            timeout=2,
        )
        return result.returncode == 0
    return False


def ydotool_env():
    env = os.environ.copy()
    if env.get("YDOTOOL_SOCKET"):
        return env
    for sock in ("/tmp/.ydotool_socket", "/run/ydotoold/socket"):
        if os.path.exists(sock):
            env["YDOTOOL_SOCKET"] = sock
            break
    return env


def ydotool_key(sequence):
    env = ydotool_env()
    attempts = [
        ["ydotool", "key", "--key-delay", "8", *sequence],
        ["ydotool", "key", *sequence],
    ]
    for args in attempts:
        result = subprocess.run(args, capture_output=True, timeout=5, env=env)
        if result.returncode == 0:
            return True
    return False


def ydotool_ctrl(letter):
    ups = [
        f"{KEY_LEFTCTRL}:0",
        f"{KEY_RIGHTCTRL}:0",
        f"{KEY_LEFTSHIFT}:0",
        f"{KEY_RIGHTSHIFT}:0",
        f"{KEY_LEFTALT}:0",
        f"{KEY_RIGHTALT}:0",
        f"{KEY_LEFTMETA}:0",
        f"{KEY_RIGHTMETA}:0",
    ]
    chord = [f"{KEY_LEFTCTRL}:1", f"{letter}:1", f"{letter}:0", f"{KEY_LEFTCTRL}:0"]
    return ydotool_key(ups + chord)


def convert_text(text):
    node = node_path()
    if not node:
        return None
    temp = tempfile.mkdtemp(prefix="falta-")
    try:
        src = os.path.join(temp, "in.txt")
        dst = os.path.join(temp, "out.txt")
        with open(src, "w", encoding="utf-8", newline="") as handle:
            handle.write(text)
        result = subprocess.run([node, FLIP, src, dst], capture_output=True, timeout=15)
        if result.returncode != 0 or not os.path.isfile(dst):
            return None
        with open(dst, "r", encoding="utf-8", newline="") as handle:
            return handle.read()
    finally:
        shutil.rmtree(temp, ignore_errors=True)


def flip_selection(send_copy, send_paste):
    snap = clipboard_snapshot()
    sentinel = "\x01FALTA-" + uuid.uuid4().hex
    if not clipboard_set_text(sentinel):
        clipboard_restore(snap)
        return
    time.sleep(0.06)
    send_copy()
    copied = None
    deadline = time.time() + 0.9
    while time.time() < deadline:
        time.sleep(0.04)
        current = clipboard_get_text()
        if current and current != sentinel:
            copied = current
            break
    if not copied:
        clipboard_restore(snap)
        return
    flipped = convert_text(copied)
    if flipped is None:
        clipboard_restore(snap)
        return
    if not clipboard_set_text(flipped):
        clipboard_restore(snap)
        return
    time.sleep(0.05)
    send_paste()
    time.sleep(0.28)
    clipboard_restore(snap)


class X11Keys:
    def __init__(self):
        self.display = None
        self.x11 = None
        self.xtst = None
        self.ctrl = KEY_LEFTCTRL + 8
        self.shift = KEY_LEFTSHIFT + 8
        self.alt = KEY_LEFTALT + 8
        self.meta = KEY_LEFTMETA + 8
        self.c = KEY_C + 8
        self.v = KEY_V + 8
        self.y = KEY_Y + 8

    def open(self):
        import ctypes
        self.x11 = ctypes.CDLL("libX11.so.6")
        self.xtst = ctypes.CDLL("libXtst.so.6")
        self.x11.XOpenDisplay.argtypes = [ctypes.c_char_p]
        self.x11.XOpenDisplay.restype = ctypes.c_void_p
        self.x11.XCloseDisplay.argtypes = [ctypes.c_void_p]
        self.x11.XFlush.argtypes = [ctypes.c_void_p]
        self.x11.XSync.argtypes = [ctypes.c_void_p, ctypes.c_int]
        self.x11.XDefaultScreen.argtypes = [ctypes.c_void_p]
        self.x11.XDefaultScreen.restype = ctypes.c_int
        self.x11.XRootWindow.argtypes = [ctypes.c_void_p, ctypes.c_int]
        self.x11.XRootWindow.restype = ctypes.c_ulong
        self.x11.XGrabKey.argtypes = [
            ctypes.c_void_p, ctypes.c_int, ctypes.c_uint, ctypes.c_ulong,
            ctypes.c_int, ctypes.c_int, ctypes.c_int,
        ]
        self.xtst.XTestFakeKeyEvent.argtypes = [
            ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong,
        ]
        handler_type = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_void_p, ctypes.c_void_p)
        self._error_handler = handler_type(lambda _display, _event: 0)
        self.x11.XSetErrorHandler.argtypes = [handler_type]
        self.x11.XSetErrorHandler(self._error_handler)
        self.display = self.x11.XOpenDisplay(None)
        return bool(self.display)

    def close(self):
        if self.display and self.x11:
            self.x11.XCloseDisplay(self.display)
            self.display = None

    def _tap(self, keycode, down):
        self.xtst.XTestFakeKeyEvent(self.display, keycode, 1 if down else 0, 0)

    def release_modifiers(self):
        for key in (
            KEY_LEFTSHIFT, KEY_RIGHTSHIFT, KEY_LEFTCTRL, KEY_RIGHTCTRL,
            KEY_LEFTALT, KEY_RIGHTALT, KEY_LEFTMETA, KEY_RIGHTMETA,
        ):
            self._tap(key + 8, False)
        self.x11.XFlush(self.display)

    def ctrl_letter(self, keycode):
        self.release_modifiers()
        time.sleep(0.04)
        self._tap(self.ctrl, True)
        time.sleep(0.02)
        self._tap(keycode, True)
        time.sleep(0.02)
        self._tap(keycode, False)
        self._tap(self.ctrl, False)
        self.x11.XFlush(self.display)

    def grab(self):
        import ctypes
        screen = self.x11.XDefaultScreen(self.display)
        root = self.x11.XRootWindow(self.display, screen)
        control, shift, lock, mod2 = 4, 1, 2, 16
        base = control | shift
        async_mode = 1
        for extra in (0, lock, mod2, lock | mod2):
            self.x11.XGrabKey(self.display, self.y, base | extra, root, 0, async_mode, async_mode)
        self.x11.XSync(self.display, 0)

    def listen(self):
        import ctypes

        class XKeyEvent(ctypes.Structure):
            _fields_ = [
                ("type", ctypes.c_int),
                ("serial", ctypes.c_ulong),
                ("send_event", ctypes.c_int),
                ("display", ctypes.c_void_p),
                ("window", ctypes.c_ulong),
                ("root", ctypes.c_ulong),
                ("subwindow", ctypes.c_ulong),
                ("time", ctypes.c_ulong),
                ("x", ctypes.c_int),
                ("y", ctypes.c_int),
                ("x_root", ctypes.c_int),
                ("y_root", ctypes.c_int),
                ("state", ctypes.c_uint),
                ("keycode", ctypes.c_uint),
                ("same_screen", ctypes.c_int),
            ]

        class XEvent(ctypes.Union):
            _fields_ = [
                ("type", ctypes.c_int),
                ("xkey", XKeyEvent),
                ("pad", ctypes.c_long * 24),
            ]

        self.x11.XNextEvent.argtypes = [ctypes.c_void_p, ctypes.POINTER(XEvent)]
        event = XEvent()
        last = 0.0
        while True:
            self.x11.XNextEvent(self.display, ctypes.byref(event))
            if event.type != 2 or event.xkey.keycode != self.y:
                continue
            now = time.time()
            if now - last < 0.6:
                continue
            last = now
            flip_selection(
                lambda: self.ctrl_letter(self.c),
                lambda: self.ctrl_letter(self.v),
            )


def take_lock():
    global _lock_handle
    folder = os.path.expanduser("~/.local/share/falta")
    os.makedirs(folder, exist_ok=True)
    handle = open(os.path.join(folder, "hotkey.lock"), "w", encoding="utf-8")
    try:
        import fcntl
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        return False
    handle.write(str(os.getpid()))
    handle.flush()
    _lock_handle = handle
    return True


def run_once():
    # The desktop shortcut fires while Ctrl and Shift may still be down.
    time.sleep(0.28)
    if session_is_wayland() or not os.environ.get("DISPLAY"):
        flip_selection(lambda: ydotool_ctrl(KEY_C), lambda: ydotool_ctrl(KEY_V))
        return 0
    keys = X11Keys()
    try:
        if keys.open():
            flip_selection(lambda: keys.ctrl_letter(keys.c), lambda: keys.ctrl_letter(keys.v))
            return 0
    except OSError:
        pass
    finally:
        keys.close()
    flip_selection(lambda: ydotool_ctrl(KEY_C), lambda: ydotool_ctrl(KEY_V))
    return 0


FALTA_BIND_PATH = "/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings/falta/"
_tray_lock = None
_indicator = None


def config_home():
    base = os.environ.get("XDG_CONFIG_HOME")
    if base:
        return base
    return os.path.join(os.path.expanduser("~"), ".config")


def settings_path():
    return os.path.join(config_home(), "falta", "settings.json")


def read_layout():
    try:
        with open(settings_path(), encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return "windows"
    if isinstance(data, dict) and data.get("layout") == "mac":
        return "mac"
    return "windows"


def write_layout(layout):
    value = "mac" if layout == "mac" else "windows"
    path = settings_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write('{"layout":"' + value + '"}\n')


def state_dir():
    return os.path.expanduser("~/.local/share/falta")


def pid_alive(pid):
    if not pid or pid <= 0:
        return False
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    return True


def listener_pid():
    raw = os.environ.get("FALTA_LISTENER_PID", "").strip()
    if raw:
        try:
            pid = int(raw)
        except ValueError:
            return None
        return pid if pid_alive(pid) else None
    path = os.path.join(state_dir(), "hotkey.lock")
    try:
        with open(path, encoding="utf-8") as handle:
            pid = int(handle.read().strip())
    except (OSError, ValueError):
        return None
    return pid if pid_alive(pid) else None


def autostart_file(name):
    return os.path.join(config_home(), "autostart", name)


def once_command():
    script = os.path.abspath(__file__).replace("\\", "\\\\").replace('"', '\\"')
    return sys.executable + ' "' + script + '" --once'


def gsettings_items():
    raw = subprocess.check_output(
        ["gsettings", "get", "org.gnome.settings-daemon.plugins.media-keys", "custom-keybindings"],
        text=True,
    ).strip()
    if raw in ("@as []", "[]"):
        return []
    return list(ast.literal_eval(raw))


def set_gsettings_items(items):
    literal = "[" + ", ".join("'" + item + "'" for item in items) + "]"
    subprocess.check_call([
        "gsettings", "set",
        "org.gnome.settings-daemon.plugins.media-keys",
        "custom-keybindings",
        literal,
    ])


def gnome_bound():
    return FALTA_BIND_PATH in gsettings_items()


def bind_gnome():
    if not shutil.which("gsettings"):
        raise RuntimeError("gsettings missing")
    items = gsettings_items()
    if FALTA_BIND_PATH not in items:
        items.append(FALTA_BIND_PATH)
    set_gsettings_items(items)
    base = "org.gnome.settings-daemon.plugins.media-keys.custom-keybinding:" + FALTA_BIND_PATH
    subprocess.check_call(["gsettings", "set", base, "name", "Falta"])
    subprocess.check_call(["gsettings", "set", base, "command", once_command()])
    subprocess.check_call(["gsettings", "set", base, "binding", "<Control><Shift>y"])


def unbind_gnome():
    if not shutil.which("gsettings"):
        return
    try:
        items = [item for item in gsettings_items() if item != FALTA_BIND_PATH]
        set_gsettings_items(items)
    except (OSError, subprocess.SubprocessError, ValueError, SyntaxError):
        pass


def ydotoold_unit():
    return os.path.expanduser("~/.config/systemd/user/falta-ydotoold.service")


def ydotoold_enabled():
    if os.path.isfile(autostart_file("falta-ydotoold.desktop")):
        return True
    if not shutil.which("systemctl") or not os.path.isfile(ydotoold_unit()):
        return False
    result = subprocess.run(
        ["systemctl", "--user", "is-enabled", "falta-ydotoold.service"],
        capture_output=True,
        text=True,
    )
    return result.returncode == 0


def ensure_ydotoold():
    daemon = shutil.which("ydotoold")
    if not daemon:
        raise RuntimeError("ydotoold missing")
    unit = ydotoold_unit()
    os.makedirs(os.path.dirname(unit), exist_ok=True)
    if not os.path.isfile(unit):
        with open(unit, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(
                "[Unit]\n"
                "Description=Falta typing helper\n\n"
                "[Service]\n"
                "ExecStart=" + daemon + "\n"
                "Restart=on-failure\n\n"
                "[Install]\n"
                "WantedBy=default.target\n"
            )
    if shutil.which("systemctl"):
        subprocess.run(["systemctl", "--user", "daemon-reload"], check=False)
        result = subprocess.run(
            ["systemctl", "--user", "enable", "--now", "falta-ydotoold.service"],
            check=False,
        )
        if result.returncode == 0:
            try:
                os.remove(autostart_file("falta-ydotoold.desktop"))
            except FileNotFoundError:
                pass
            return
    desktop = autostart_file("falta-ydotoold.desktop")
    os.makedirs(os.path.dirname(desktop), exist_ok=True)
    with open(desktop, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(
            "[Desktop Entry]\n"
            "Type=Application\n"
            "Version=1.0\n"
            "Name=Falta typing helper\n"
            "Comment=Lets Falta type the flipped text\n"
            "Exec=" + daemon + "\n"
            "Terminal=false\n"
            "X-GNOME-Autostart-enabled=true\n"
        )


def disable_ydotoold():
    if shutil.which("systemctl"):
        subprocess.run(["systemctl", "--user", "disable", "falta-ydotoold.service"], check=False)
    try:
        os.remove(autostart_file("falta-ydotoold.desktop"))
    except FileNotFoundError:
        pass


def x11_autostart_enabled():
    path = autostart_file("falta.desktop")
    if not os.path.isfile(path):
        return False
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    return "X-GNOME-Autostart-enabled=false" not in text


def write_x11_autostart():
    path = autostart_file("falta.desktop")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    script = os.path.abspath(__file__)
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(
            "[Desktop Entry]\n"
            "Type=Application\n"
            "Version=1.0\n"
            "Name=Falta\n"
            "Name[ar]=فلتة\n"
            "Comment=Flip selected text with Ctrl+Shift+Y\n"
            'Exec=' + sys.executable + ' "' + script + '" --listen\n'
            "Terminal=false\n"
            "X-GNOME-Autostart-enabled=true\n"
        )


def wayland_login_enabled():
    try:
        bound = gnome_bound()
    except (OSError, subprocess.SubprocessError, ValueError, SyntaxError):
        return False
    return bound and ydotoold_enabled()


def login_enabled():
    if session_is_wayland():
        return wayland_login_enabled()
    return x11_autostart_enabled()


def set_login(on):
    if session_is_wayland():
        if on:
            ensure_ydotoold()
            bind_gnome()
        else:
            unbind_gnome()
            disable_ydotoold()
        return
    if on:
        write_x11_autostart()
    else:
        try:
            os.remove(autostart_file("falta.desktop"))
        except FileNotFoundError:
            pass


def status_note():
    if session_is_wayland():
        try:
            bound = gnome_bound()
        except (OSError, subprocess.SubprocessError, ValueError, SyntaxError):
            bound = False
        if bound:
            return "الاختصار متسجل في جنوم"
        return "الاختصار مش متسجل"
    if listener_pid():
        return "فلتة شغالة"
    return "فلتة مش شغالة"


def session_note():
    if session_is_wayland():
        return "على واي لاند مفيش أيقونة في الشريط. الإعدادات من قائمة البرامج، والاختصار ثابت من جنوم."
    return "الأيقونة في شريط الحالة لو الجلسة بتظهرها. لو مش ظاهرة، افتح فلتة من قائمة البرامج."


def login_note():
    if session_is_wayland():
        return "إلغاء العلامة يوقف اختصار جنوم دلوقتي، ومش هيرجع لما تسجّل دخول."
    return "إلغاء العلامة ما يقفلش البرنامج دلوقتي. خروج من الأيقونة يوقفه."


def open_settings_process():
    subprocess.Popen(
        [sys.executable, os.path.abspath(__file__), "--settings"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def load_appindicator():
    import gi
    for name, version in (("AyatanaAppIndicator3", "0.1"), ("AppIndicator3", "0.1")):
        try:
            gi.require_version(name, version)
            repository = __import__("gi.repository", fromlist=[name])
            return getattr(repository, name)
        except (ImportError, ValueError, AttributeError):
            continue
    return None


def take_tray_lock():
    global _tray_lock
    folder = state_dir()
    os.makedirs(folder, exist_ok=True)
    handle = open(os.path.join(folder, "tray.lock"), "w", encoding="utf-8")
    try:
        import fcntl
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        handle.close()
        return False
    handle.write(str(os.getpid()))
    handle.flush()
    _tray_lock = handle
    return True


def spawn_tray():
    if session_is_wayland():
        return
    env = os.environ.copy()
    env["FALTA_LISTENER_PID"] = str(os.getpid())
    subprocess.Popen(
        [sys.executable, os.path.abspath(__file__), "--tray"],
        env=env,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def run_tray():
    global _indicator
    if session_is_wayland():
        sys.stderr.write("على واي لاند مفيش أيقونة في الشريط. افتح «فلتة» من قائمة البرامج.\n")
        return 0
    if not take_tray_lock():
        return 0
    if not ensure_gtk():
        sys.stderr.write("فلتة ما لقتش أيقونة شريط. الإعدادات من قائمة البرامج.\n")
        return 0
    indicator_mod = load_appindicator()
    if indicator_mod is None:
        sys.stderr.write("فلتة ما لقتش أيقونة شريط. الإعدادات من قائمة البرامج.\n")
        return 0
    from gi.repository import GLib, Gtk

    menu = Gtk.Menu()
    running = Gtk.MenuItem.new_with_label(status_note())
    running.set_sensitive(False)
    menu.append(running)
    shortcut = Gtk.MenuItem.new_with_label("الاختصار: Ctrl+Shift+Y")
    shortcut.set_sensitive(False)
    menu.append(shortcut)
    settings_item = Gtk.MenuItem.new_with_label("الإعدادات")
    settings_item.connect("activate", lambda *_args: open_settings_process())
    menu.append(settings_item)
    quit_item = Gtk.MenuItem.new_with_label("خروج")

    def on_quit(_item):
        pid = listener_pid()
        if pid and pid != os.getpid():
            try:
                os.kill(pid, signal.SIGTERM)
            except OSError:
                pass
        Gtk.main_quit()

    quit_item.connect("activate", on_quit)
    menu.append(quit_item)
    menu.show_all()

    icon_dir = os.path.join(ROOT, "extension", "icons")
    icon_file = os.path.join(icon_dir, "icon128.png")
    indicator = indicator_mod.Indicator.new(
        "falta",
        "icon128",
        indicator_mod.IndicatorCategory.APPLICATION_STATUS,
    )
    if hasattr(indicator, "set_icon_theme_path"):
        indicator.set_icon_theme_path(icon_dir)
    indicator.set_icon("icon128")
    if hasattr(indicator, "set_icon_full") and os.path.isfile(icon_file):
        indicator.set_icon_full(icon_file, "فلتة")
    if hasattr(indicator, "set_title"):
        indicator.set_title("فلتة")
    indicator.set_status(indicator_mod.IndicatorStatus.ACTIVE)
    indicator.set_menu(menu)
    _indicator = indicator

    def watch():
        if listener_pid() is None:
            Gtk.main_quit()
            return False
        return True

    GLib.timeout_add_seconds(2, watch)
    Gtk.main()
    return 0


def run_settings():
    if not ensure_gtk():
        sys.stderr.write("فلتة محتاجة GTK عشان تفتح الإعدادات.\n")
        return 1
    from gi.repository import Gtk

    win = Gtk.Window(title="فلتة — الإعدادات")
    win.set_default_size(460, 420)
    win.set_resizable(False)
    win.set_position(Gtk.WindowPosition.CENTER)
    win.set_direction(Gtk.TextDirection.RTL)
    win.connect("destroy", Gtk.main_quit)
    icon_file = os.path.join(ROOT, "extension", "icons", "icon128.png")
    if os.path.isfile(icon_file):
        try:
            win.set_icon_from_file(icon_file)
        except Exception:
            pass
    try:
        provider = Gtk.CssProvider()
        provider.load_from_data(b"window { background-color: #f7f3ec; } label { color: #241c16; }")
        Gtk.StyleContext.add_provider_for_screen(
            win.get_screen(),
            provider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
        )
    except Exception:
        pass

    box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
    box.set_margin_top(16)
    box.set_margin_bottom(16)
    box.set_margin_start(16)
    box.set_margin_end(16)
    win.add(box)

    def add_label(text):
        label = Gtk.Label(label=text)
        label.set_xalign(1)
        label.set_line_wrap(True)
        label.set_max_width_chars(42)
        label.set_justify(Gtk.Justification.RIGHT)
        box.pack_start(label, False, False, 0)
        return label

    status = add_label(status_note())
    add_label("الاختصار: Ctrl+Shift+Y")
    add_label("الاختصار ثابت ومش بيتغيّر من هنا.")
    add_label(session_note())
    add_label("لوحة الكيبورد")

    layout = read_layout()
    windows_btn = Gtk.RadioButton.new_with_label_from_widget(None, "عربي ١٠١")
    mac_btn = Gtk.RadioButton.new_with_label_from_widget(windows_btn, "عربي الماك")
    if layout == "mac":
        mac_btn.set_active(True)
    else:
        windows_btn.set_active(True)
    box.pack_start(windows_btn, False, False, 0)
    box.pack_start(mac_btn, False, False, 0)
    add_label("عربي ١٠١ لويندوز ولينكس ولوحة Arabic - PC. عربي الماك للوحة Arabic الأصلية. الصف السفلي هو اللي بيتغير. التغيير يشتغل من القلب الجاي.")

    def on_layout(button, value):
        if button.get_active():
            write_layout(value)

    windows_btn.connect("toggled", on_layout, "windows")
    mac_btn.connect("toggled", on_layout, "mac")

    login = Gtk.CheckButton.new_with_label("تشغيل مع تسجيل الدخول")
    login.set_active(login_enabled())
    box.pack_start(login, False, False, 0)
    add_label(login_note())
    error = add_label("")

    def on_login(button):
        try:
            set_login(button.get_active())
            error.set_text("")
            status.set_text(status_note())
        except Exception as exc:
            sys.stderr.write(str(exc) + "\n")
            button.handler_block(login_handler)
            button.set_active(login_enabled())
            button.handler_unblock(login_handler)
            error.set_text("ما اتسجلش التغيير.")

    login_handler = login.connect("toggled", on_login)

    close = Gtk.Button(label="إغلاق")
    close.connect("clicked", lambda *_args: win.destroy())
    box.pack_start(close, False, False, 0)
    win.show_all()
    Gtk.main()
    return 0


def listen():
    if session_is_wayland():
        return 0
    if not take_lock():
        return 0
    keys = X11Keys()
    if not keys.open():
        sys.stderr.write("Falta could not open the X11 display.\n")
        return 1
    keys.grab()
    try:
        spawn_tray()
    except Exception:
        pass
    keys.listen()
    return 0


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "--once"
    if command == "--listen":
        return listen()
    if command == "--once":
        return run_once()
    if command == "--tray":
        return run_tray()
    if command == "--settings":
        return run_settings()
    sys.stderr.write("usage: falta-hotkey.py --listen|--once|--settings|--tray\n")
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as exc:
        sys.stderr.write(str(exc) + "\n")
        sys.exit(1)
