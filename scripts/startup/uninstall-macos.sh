#!/bin/sh
# Removes the Falta login hotkey. Leaves the unzipped folder where it is.
set -eu

PLIST="$HOME/Library/LaunchAgents/io.github.if12is.falta.plist"
UID_NUM=$(id -u)
launchctl bootout "gui/${UID_NUM}/io.github.if12is.falta" >/dev/null 2>&1 || true
pkill -x FaltaHotkey >/dev/null 2>&1 || true
if [ -f "$PLIST" ]; then
  rm -f "$PLIST"
  printf '%s\n' "Removed: $PLIST"
else
  printf '%s\n' "No LaunchAgent at $PLIST"
fi
printf '%s\n' 'فلتة اتشالت من تسجيل الدخول. المجلد لسه مكانه.

---

Falta no longer starts at login. The folder is still there.'
