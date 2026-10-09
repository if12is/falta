#!/usr/bin/env python3
"""Falta system-wide hotkey.

Ctrl+Shift+Y copies the selection, flips it with the Arabic 101 converter,
pastes it back, and restores the clipboard. If nothing is selected, the
clipboard is restored and nothing is pasted.
"""

import os
import shutil
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
    keys.listen()
    return 0


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "--once"
    if command == "--listen":
        return listen()
    if command == "--once":
        return run_once()
    sys.stderr.write("usage: falta-hotkey.py --listen|--once\n")
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(0)
    except Exception as exc:
        sys.stderr.write(str(exc) + "\n")
        sys.exit(1)
